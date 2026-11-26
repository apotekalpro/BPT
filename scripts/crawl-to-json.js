#!/usr/bin/env node
/**
 * Crawls Indonesian health news and saves to public/news-data.json
 * Runs in GitHub Actions.
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// One Google News query per health section; Google's result order is used as the "hotness" rank.
const SOURCES = [
  { source: 'Detik Health',   color: '#e63a2e', query: 'site:health.detik.com', rss: 'https://health.detik.com/rss' },
  { source: 'Kompas.com',     color: '#c0392b', query: 'site:health.kompas.com' },
  { source: 'Liputan6.com',   color: '#e67e22', query: 'site:liputan6.com kesehatan OR penyakit OR dokter', healthFilter: true },
  { source: 'Tribunnews.com', color: '#d35400', query: 'site:tribunnews.com/kesehatan' },
  { source: 'Tempo.co',       color: '#2c3e50', query: 'site:tempo.co kesehatan OR penyakit OR dokter', healthFilter: true },
];
const TOTAL_CAP = 40;
const TREND_PER_SOURCE = 2;

const HEALTH_RX = /\b(sehat|kesehatan|penyakit|obat|dokter|rumah sakit|rsud|puskesmas|medis|klinik|pasien|gizi|nutrisi|vitamin|vaksin|imunisasi|virus|bakteri|kanker|tumor|diabetes|hipertensi|jantung|stroke|ginjal|paru|apotek|farmasi|bpjs|jkn|kemenkes|bpom|diet|kalori|kolesterol|gula darah|tulang|kulit|gigi|hamil|kehamilan|bayi|balita|stunting|lansia|imun|infeksi|demam|flu|batuk|asma|alergi|mental|depresi|stres|psikolog|tidur|olahraga|vape|rokok|genom)\b/i;

// ── Helpers ──────────────────────────────────────────────────────────────────

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml,application/rss+xml,*/*',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        res.resume();
        return fetchUrl(new URL(res.headers.location, url).href, maxRedirects - 1).then(resolve).catch(reject);
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
  return decodeEntities(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
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
    const title = stripHtml(parseXmlText(block, 'title'));
    const lm = block.match(/<link>([^<]+)<\/link>/i);
    const link = lm ? lm[1].trim() : '';
    const rawDesc = extractCDATA(parseXmlText(block, 'description'));
    const image = (() => {
      const enc = block.match(/<enclosure[^>]+url="([^"]+)"/i);
      if (enc) return enc[1];
      const med = block.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/i);
      if (med) return med[1];
      const img = rawDesc.match(/<img[^>]+src="([^"]+)"/i);
      return img ? img[1] : null;
    })();
    const sourceTag = block.match(/<source[^>]*>([^<]+)<\/source>/i);
    if (title && link.startsWith('http')) {
      items.push({
        title, url: link, image,
        summary: stripHtml(rawDesc).slice(0, 300),
        pubDate: parseXmlText(block, 'pubDate'),
        source: sourceTag ? sourceTag[1].trim() : null,
      });
    }
  }
  return items;
}

function isGoogleUrl(url) {
  try { return /(?:^|\.)google\.com$/.test(new URL(url).hostname); } catch { return false; }
}

function normTitle(t) {
  return (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
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

// ── Crawling ─────────────────────────────────────────────────────────────────

async function crawlGNews(query) {
  const q = encodeURIComponent(`${query} when:7d`);
  const { body } = await fetchUrl(`https://news.google.com/rss/search?q=${q}&hl=id&gl=ID&ceid=ID:id`);
  return parseItems(body)
    .map(item => {
      const title = item.source ? item.title.replace(/\s*-\s*[^-]*$/, s => s.includes(item.source) ? '' : s).trim() : item.title;
      return { ...item, title };
    })
    .filter(item => item.title.length >= 15); // Google returns blank titles for index/tag pages
}

async function crawlSource(cfg) {
  const [gnews, rss] = await Promise.all([
    crawlGNews(cfg.query).catch(e => { console.error(`  GNews "${cfg.source}" failed: ${e.message}`); return []; }),
    cfg.rss
      ? fetchUrl(cfg.rss).then(r => parseItems(r.body)).catch(e => { console.error(`  RSS "${cfg.source}" failed: ${e.message}`); return []; })
      : Promise.resolve([]),
  ]);

  // Direct RSS items carry real URLs + images; use them to enrich the matching Google News items.
  const rssByTitle = new Map(rss.map(r => [normTitle(r.title), r]));
  const base = gnews.length ? gnews : rss;

  let articles = base.map((item, rank) => {
    const direct = rssByTitle.get(normTitle(item.title));
    return {
      title: item.title,
      url: direct ? direct.url : item.url,
      image: direct ? direct.image : item.image,
      summary: direct ? direct.summary : item.summary,
      publishedAt: item.pubDate || (direct && direct.pubDate),
      source: cfg.source,
      color: cfg.color,
      rank,
    };
  });

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  articles = articles.filter(a => a.publishedAt && new Date(a.publishedAt).getTime() >= cutoff);
  if (cfg.healthFilter) articles = articles.filter(a => HEALTH_RX.test(a.title));

  console.log(`  ${cfg.source}: gnews ${gnews.length}, rss ${rss.length}, usable ${articles.length}`);
  return articles;
}

// ── Thumbnails via headless Chrome ───────────────────────────────────────────
// Google News links only reach the publisher after the page's JavaScript runs,
// and some publishers sit behind a JS firewall challenge — so a real browser is needed.

async function enrichWithBrowser(articles) {
  if (!articles.length) return;
  let chromium;
  try { ({ chromium } = require('playwright-core')); }
  catch { console.log('[Browser] playwright-core not installed — skipping thumbnails'); return; }

  let browser;
  try { browser = await chromium.launch({ channel: 'chrome' }); }
  catch (e) { console.log(`[Browser] launch failed: ${e.message.split('\n')[0]}`); return; }

  const context = await browser.newContext({ userAgent: BROWSER_UA, locale: 'id-ID' });
  await context.route('**/*', route =>
    ['image', 'media', 'font', 'stylesheet'].includes(route.request().resourceType())
      ? route.abort() : route.continue());

  const queue = [...articles];
  let ok = 0, failLogged = 0;

  const readMeta = (page) => page.evaluate(() => {
    const meta = sel => (document.querySelector(sel) || {}).content || null;
    return {
      image: meta('meta[property="og:image"]') || meta('meta[name="twitter:image"]'),
      description: meta('meta[property="og:description"]') || meta('meta[name="description"]'),
    };
  });

  const worker = async () => {
    const page = await context.newPage();
    while (queue.length) {
      const a = queue.shift();
      try {
        await page.goto(a.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        if (isGoogleUrl(page.url())) {
          await page.waitForURL(u => !isGoogleUrl(u.href), { waitUntil: 'domcontentloaded', timeout: 15000 });
        }
        let og = null;
        for (let attempt = 0; attempt < 2 && !(og && og.image); attempt++) {
          try {
            await page.waitForSelector('meta[property="og:image"], meta[name="twitter:image"]', { state: 'attached', timeout: 12000 });
            og = await readMeta(page);
          } catch { await page.waitForLoadState('domcontentloaded').catch(() => {}); }
        }
        a.url = page.url();
        if (og && og.image) { a.image = og.image; ok++; }
        if (og && og.description && og.description.length > 30 && summaryLooksLikeTitle(a.summary, a.title)) {
          a.summary = og.description.slice(0, 300);
        }
        if (!(og && og.image) && failLogged++ < 5) console.log(`  [Browser] no og:image — ${a.source} — ${page.url().slice(0, 100)}`);
      } catch (e) {
        if (failLogged++ < 5) console.log(`  [Browser] error — ${a.source} — ${e.message.split('\n')[0]}`);
      }
    }
    await page.close();
  };

  await Promise.all(Array.from({ length: 6 }, worker));
  await browser.close();
  console.log(`[Browser] thumbnails found for ${ok} of ${articles.length} articles`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[Crawl] Starting at', new Date().toISOString());

  const perSource = await Promise.all(SOURCES.map(crawlSource));

  // Round-robin by rank: 8 hottest per source, backfilling from others if one runs short.
  const lists = perSource.map(list => [...list].sort((a, b) => a.rank - b.rank));
  const seen = new Set();
  const picked = [];
  for (let i = 0; picked.length < TOTAL_CAP && lists.some(l => i < l.length); i++) {
    for (const list of lists) {
      const a = list[i];
      if (!a || picked.length >= TOTAL_CAP) continue;
      const key = normTitle(a.title);
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(a);
    }
  }

  // Top 10 trending: each source's top-ranked picks, #1s first, then #2s.
  const trendCandidates = [];
  for (const cfg of SOURCES) {
    picked.filter(a => a.source === cfg.source)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, TREND_PER_SOURCE)
      .forEach((a, pos) => trendCandidates.push({ a, pos }));
  }
  trendCandidates.sort((x, y) => x.pos - y.pos).forEach(({ a }, i) => {
    a.trending = true;
    a.trendRank = i + 1;
  });

  const needsBrowser = picked.filter(a => !a.image || isGoogleUrl(a.url) || summaryLooksLikeTitle(a.summary, a.title));
  console.log(`[Crawl] Picked ${picked.length}; opening ${needsBrowser.length} in headless Chrome for thumbnails...`);
  await enrichWithBrowser(needsBrowser);

  picked.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  const articles = picked.map(({ rank, ...a }) => a);

  const counts = {};
  articles.forEach(a => { counts[a.source] = (counts[a.source] || 0) + 1; });
  console.log(`[Crawl] Sources: ${Object.entries(counts).map(([s, c]) => `${s}:${c}`).join(', ')}`);
  console.log(`[Crawl] With thumbnail: ${articles.filter(a => a.image).length} of ${articles.length}`);

  const outPath = path.join(__dirname, '..', 'public', 'news-data.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({
    crawledAt: new Date().toISOString(),
    count: articles.length,
    articles,
  }, null, 2), 'utf8');
  console.log(`[Crawl] Done — ${articles.length} articles saved`);
}

main().catch(e => { console.error('[Crawl] Fatal:', e); process.exit(1); });
