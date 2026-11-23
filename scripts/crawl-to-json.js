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
    const summary = stripHtml(rawDesc)
      .replace(/\s{2,}\S+\.(com|id|co\.id|net|org)\s*$/i, '')  // strip trailing "  Source.com" (Google News)
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
    if (title && link && link.startsWith('http')) {
      items.push({ title, url: link, image, summary, pubDate, source });
    }
  }
  return items;
}

// ── OG data fetching ──────────────────────────────────────────────────────────

async function fetchOGData(url) {
  try {
    const { body } = await fetchUrl(url);
    const imgM = body.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                 body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const descM = body.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                  body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    return {
      image: imgM ? imgM[1].trim() : null,
      description: descM ? decodeEntities(descM[1]).trim().slice(0, 300) : null,
    };
  } catch {
    return { image: null, description: null };
  }
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

  // Fetch OG image+description for articles missing images (up to 60, in parallel batches)
  const needsOG = recent.filter(a => !a.image);
  if (needsOG.length > 0) {
    const toFetch = needsOG.slice(0, 60);
    console.log(`[Crawl] Fetching OG data for ${toFetch.length} articles...`);
    const BATCH = 10;
    for (let i = 0; i < toFetch.length; i += BATCH) {
      await Promise.allSettled(toFetch.slice(i, i + BATCH).map(async a => {
        const { image, description } = await fetchOGData(a.url);
        if (image) a.image = image;
        if (description && (!a.summary || a.summary.length < 30)) a.summary = description;
      }));
    }
    const got = recent.filter(a => a.image).length;
    console.log(`[Crawl] OG fetch done — ${got} articles now have images`);
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
