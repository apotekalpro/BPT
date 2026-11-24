#!/usr/bin/env node
/**
 * Crawls Indonesian health news and saves to public/news-data.json
 * Runs in GitHub Actions (no proxy restrictions).
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ── Helpers ──────────────────────────────────────────────────────────────────

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml,application/rss+xml,*/*',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      },
      timeout: 12000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        res.resume();
        return fetchUrl(loc, maxRedirects - 1).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, url }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractCDATA(str) {
  return (str || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function decodeEntities(str) {
  return (str || '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&thinsp;/g, ' ').replace(/&ensp;/g, ' ').replace(/&emsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));
}

function stripHtml(html) {
  const decoded = decodeEntities(html || '');
  return decoded.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseXmlText(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? extractCDATA(m[1]).trim() : '';
}

function parseItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = stripHtml(extractCDATA(parseXmlText(block, 'title')));
    const link = (() => {
      const lm = block.match(/<link>([^<]+)<\/link>/i) ||
                 block.match(/<link\s+[^>]*href="([^"]+)"/i);
      return lm ? lm[1].trim() : '';
    })();
    const pubDate = parseXmlText(block, 'pubDate');
    const rawDesc = extractCDATA(parseXmlText(block, 'description'));
    // Google News RSS embeds the real article URL in description's first <a href>
    const actualLink = (() => {
      const ahref = rawDesc.match(/<a[^>]+href="(https?:\/\/[^"]+)"/i);
      return (ahref && !ahref[1].includes('news.google.com')) ? ahref[1].trim() : null;
    })();
    const summary = stripHtml(rawDesc)
      .replace(/\s{2,}\S+\.(com|id|co\.id|net|org)\s*$/i, '')
      .trim().slice(0, 300);
    let image = (() => {
      const enc = block.match(/<enclosure[^>]+url="([^"]+)"/i);
      if (enc) return enc[1];
      const med = block.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/i);
      if (med) return med[1];
      const img = rawDesc.match(/<img[^>]+src="([^"]+)"/i);
      if (img) return img[1];
      return null;
    })();
    const sourceTag = block.match(/<source[^>]*>([^<]+)<\/source>/i);
    const source = sourceTag ? sourceTag[1].trim() : null;
    const finalUrl = actualLink || link; // prefer real article URL over Google News redirect
    if (title && finalUrl && finalUrl.startsWith('http')) {
      items.push({ title, url: finalUrl, image, summary, pubDate, source });
    }
  }
  return items;
}

// ── Google News URL decoder ───────────────────────────────────────────────────
// Google News RSS links are news.google.com/rss/articles/CBMi... where the
// base64 blob is a protobuf that embeds the real article URL as plain ASCII.
function decodeGoogleNewsUrl(gnUrl) {
  try {
    const match = gnUrl.match(/\/articles\/(CB[A-Za-z0-9_+/=-]+)/);
    if (!match) return null;
    let b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    b64 += '==='.slice((b64.length + 3) % 4);
    const bytes = Buffer.from(b64, 'base64');
    const str = bytes.toString('latin1');
    const start = str.indexOf('https://');
    if (start < 0) return null;
    let url = '';
    for (let i = start; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c < 32 || c > 126) break;
      url += str[i];
    }
    return url || null;
  } catch { return null; }
}

// ── OG data fetching ──────────────────────────────────────────────────────────

function isGoogleUrl(url) {
  try { return /(?:^|\.)google\.com$/.test(new URL(url).hostname); } catch { return false; }
}

// Google News intermediate pages JS-redirect to the real article.
// Extract that target URL from the page HTML so we can fetch it directly.
let _htmlDumped = false;
function extractFromGooglePage(html) {
  // Log first 2000 chars of one Google page to understand format
  if (!_htmlDumped) {
    _htmlDumped = true;
    console.log('[Crawl] Google page HTML sample (first 2000 chars):\n' + html.slice(0, 2000));
  }

  // JS redirect: window.location.href = '...', location.replace('...')
  const jsRedir =
    html.match(/window\.location(?:\.href)?\s*=\s*["'](https?:\/\/[^"']+)["']/i) ||
    html.match(/location\.replace\s*\(\s*["'](https?:\/\/[^"']+)["']/i);
  if (jsRedir && !isGoogleUrl(jsRedir[1])) return jsRedir[1].trim();

  // Meta-refresh redirect
  const metaRedir =
    html.match(/<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=(https?:\/\/[^"'&; ]+)/i) ||
    html.match(/<meta[^>]+content=["'][^"']*url=(https?:\/\/[^"'&; ]+)[^>]+http-equiv=["']refresh["']/i);
  if (metaRedir && !isGoogleUrl(metaRedir[1])) return metaRedir[1].trim();

  // Any <a href> pointing to a non-Google domain (noscript fallback / article card link)
  const allLinks = [...html.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']{20,})["']/gi)];
  for (const m of allLinks) {
    if (!isGoogleUrl(m[1])) return m[1].trim();
  }

  // og:url pointing to actual article
  const ogUrl =
    html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i);
  if (ogUrl && !isGoogleUrl(ogUrl[1]) && ogUrl[1].startsWith('http')) return ogUrl[1].trim();

  // canonical href
  const canon =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (canon && !isGoogleUrl(canon[1]) && canon[1].startsWith('http')) return canon[1].trim();

  // JSON field patterns
  for (const key of ['url','articleUrl','originalUrl','targetUrl','redirectUrl']) {
    const m = html.match(new RegExp(`"${key}"\\s*:\\s*"(https?:\\/\\/(?![^"]*google\\.com)[^"]{30,})"`, 'i'));
    if (m && !isGoogleUrl(m[1])) return m[1].trim();
  }

  return null;
}

function extractOGFromBody(body) {
  const imgM = body.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
               body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
               body.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
               body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
  const descM = body.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
                body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const image = imgM ? imgM[1].trim() : null;
  const rawDesc = descM ? decodeEntities(descM[1]).trim() : null;
  const badImg = image && (
    image.includes('google.com') || image.includes('gstatic.com') || image.includes('googleusercontent.com')
  );
  const googleDesc = /liputan berita terbaru yang komprehensif|comprehensive.*up-to-date news|google berita/i;
  const description = rawDesc && !googleDesc.test(rawDesc) ? rawDesc.slice(0, 300) : null;
  return { image: badImg ? null : image, description };
}

let _ogGoogleLanded = 0, _ogResolved = 0, _ogFailed = 0;

async function fetchOGData(url) {
  try {
    const r1 = await fetchUrl(url);

    // If HTTP redirects left us on a Google page, look for the real article URL in the HTML
    if (isGoogleUrl(r1.url)) {
      _ogGoogleLanded++;
      const realUrl = extractFromGooglePage(r1.body);
      if (realUrl) {
        try {
          const r2 = await fetchUrl(realUrl);
          if (!isGoogleUrl(r2.url)) {
            _ogResolved++;
            return extractOGFromBody(r2.body);
          }
        } catch { /* fall through */ }
      } else {
        _ogFailed++;
      }
      return { image: null, description: null };
    }

    return extractOGFromBody(r1.body);
  } catch {
    return { image: null, description: null };
  }
}

function summaryLooksLikeTitle(summary, title) {
  if (!summary || !title) return true;
  const s = summary.trim(); const t = title.trim();
  if (s.length < 30) return true;
  if (s === t) return true;
  if (s.startsWith(t.substring(0, Math.min(50, t.length)))) return true;
  if (t.startsWith(s.substring(0, Math.min(50, s.length)))) return true;
  return false;
}

// ── Source colors ─────────────────────────────────────────────────────────────

const SOURCE_COLORS = {
  detik: '#e63a2e', kompas: '#c0392b', liputan: '#e67e22', tribun: '#d35400',
  tempo: '#2c3e50', cnbc: '#0056b3', republika: '#1a7c47', halodoc: '#00b4d8',
  kemenkes: '#2d6a4f', antara: '#2980b9',
};

function colorFor(src) {
  if (!src) return '#6c757d';
  const s = src.toLowerCase();
  for (const [k, c] of Object.entries(SOURCE_COLORS)) if (s.includes(k)) return c;
  return '#6c757d';
}

// ── Sources ───────────────────────────────────────────────────────────────────

const GNEWS_QUERIES = [
  { q: 'berita+kesehatan+terbaru+indonesia',                           label: 'Berita Kesehatan', trending: true },
  { q: 'site:health.detik.com+OR+site:detik.com+kesehatan',           label: 'Detik Health'     },
  { q: 'site:kompas.com+OR+site:liputan6.com+kesehatan',              label: 'Kompas & Liputan6'},
  { q: 'site:tribunnews.com+OR+site:tempo.co+kesehatan',              label: 'Tribun & Tempo'   },
  { q: 'penyakit+obat+tips+sehat+apotek+indonesia',                   label: 'Tips & Penyakit'  },
];

async function crawlDetikRSS() {
  const { body } = await fetchUrl('https://health.detik.com/rss');
  return parseItems(body).map(item => ({
    title: item.title, url: item.url, image: item.image,
    summary: item.summary, publishedAt: item.pubDate,
    source: 'Detik Health', color: '#e63a2e',
  }));
}

async function crawlGNews(query) {
  const url = `https://news.google.com/rss/search?q=${query.q}&hl=id&gl=ID&ceid=ID:id`;
  const { body } = await fetchUrl(url);
  return parseItems(body).map((item, idx) => {
    const srcName = item.source || '';
    const title = srcName
      ? item.title.replace(new RegExp(' - ' + srcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '').trim()
      : item.title;
    return {
      title, url: item.url, image: item.image || null,
      summary: item.summary, publishedAt: item.pubDate,
      source: srcName || 'Google News', color: colorFor(srcName),
      trending: query.trending && idx < 5 ? true : undefined,
    };
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[Crawl] Starting at', new Date().toISOString());

  const tasks = [
    crawlDetikRSS()
      .then(a => { console.log(`  Detik RSS: ${a.length}`); return a; })
      .catch(e => { console.error(`  Detik RSS failed: ${e.message}`); return []; }),
    ...GNEWS_QUERIES.map(q =>
      crawlGNews(q)
        .then(a => { console.log(`  GNews "${q.label}": ${a.length}`); return a; })
        .catch(e => { console.error(`  GNews "${q.label}" failed: ${e.message}`); return []; })
    ),
  ];

  const results = await Promise.all(tasks);

  // Deduplicate by title — preserve trending:true from any duplicate
  const seen = new Map(); // title → index in articles[]
  const articles = [];
  for (const batch of results) {
    for (const a of batch) {
      if (!a.title) continue;
      if (!seen.has(a.title)) {
        seen.set(a.title, articles.length);
        articles.push(a);
      } else if (a.trending) {
        articles[seen.get(a.title)].trending = true; // propagate flag to whichever version won
      }
    }
  }

  // Filter out non-health articles
  const HEALTH_KW = [
    'sehat','kesehatan','penyakit','obat','dokter','rumah sakit','medis','klinik',
    'nutrisi','gizi','vitamin','vaksin','virus','bakteri','kanker','diabetes',
    'hipertensi','jantung','stroke','apotek','farmasi','bpjs','diet','kalori',
    'lemak','gula darah','tulang','kulit','mata','gigi','hamil','bayi','balita',
    'lansia','imun','infeksi','demam','flu','batuk','asma','alergi','mental',
    'depresi','stres','tidur','olahraga','fitness','sanitasi','hygiene',
    'detik health','kesehatan.kompas','liputan6.com/health','halodoc','alodokter',
  ];
  const healthArticles = articles.filter(a => {
    const text = ((a.title||'') + ' ' + (a.summary||'') + ' ' + (a.source||'')).toLowerCase();
    return HEALTH_KW.some(kw => text.includes(kw));
  });
  console.log(`[Crawl] Health filter: ${healthArticles.length} of ${articles.length} articles kept`);

  // Sort newest first, then filter to last 7 days
  healthArticles.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = healthArticles.filter(a => {
    if (!a.publishedAt) return false;
    return new Date(a.publishedAt).getTime() >= cutoff;
  });
  console.log(`[Crawl] 7-day filter: ${recent.length} of ${healthArticles.length} articles kept`);

  // Fetch OG image+description for articles missing images OR with bad (title-like) descriptions
  const needsOG = recent.filter(a => !a.image || summaryLooksLikeTitle(a.summary, a.title));
  if (needsOG.length > 0) {
    const toFetch = needsOG.slice(0, 100);
    console.log(`[Crawl] Fetching OG data for ${toFetch.length} articles (${recent.filter(a=>!a.image).length} no-image, ${recent.filter(a=>summaryLooksLikeTitle(a.summary,a.title)).length} bad-desc)...`);
    const BATCH = 10;
    for (let i = 0; i < toFetch.length; i += BATCH) {
      await Promise.allSettled(toFetch.slice(i, i + BATCH).map(async a => {
        const { image, description } = await fetchOGData(a.url);
        if (image && !a.image) a.image = image;
        if (description && description.length > 30 && summaryLooksLikeTitle(a.summary, a.title)) {
          a.summary = description;
        }
      }));
    }
    const got = recent.filter(a => a.image).length;
    const goodDesc = recent.filter(a => !summaryLooksLikeTitle(a.summary, a.title)).length;
    console.log(`[Crawl] OG fetch done — ${got} articles with images, ${goodDesc} with real descriptions`);
    console.log(`[Crawl] Google redirect stats — landed: ${_ogGoogleLanded}, resolved: ${_ogResolved}, no-pattern: ${_ogFailed}`);
  }

  const output = {
    crawledAt: new Date().toISOString(),
    count: recent.length,
    articles: recent,
  };

  const outPath = path.join(__dirname, '..', 'public', 'news-data.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`[Crawl] Done — ${recent.length} articles saved`);
}

main().catch(e => { console.error('[Crawl] Fatal:', e); process.exit(1); });
