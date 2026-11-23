#!/usr/bin/env node
/**
 * Crawls Indonesian health news and saves to public/news-data.json
 * Designed to run in GitHub Actions (no proxy restrictions).
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Helpers ──────────────────────────────────────────────────────────────────

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'id-ID,id;q=0.9',
      },
      timeout: 15000,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractCDATA(str) {
  return (str || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
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
    const title = extractCDATA(parseXmlText(block, 'title'));
    const link = (() => {
      // try <link> (may need CDATA extraction or be between tags)
      const lm = block.match(/<link>([^<]+)<\/link>/i) ||
                 block.match(/<link\s+[^>]*href="([^"]+)"/i);
      return lm ? lm[1].trim() : '';
    })();
    const pubDate = parseXmlText(block, 'pubDate');
    const description = extractCDATA(parseXmlText(block, 'description'));
    const summary = stripHtml(description).slice(0, 280);
    // Image from enclosure or media:content or img in description
    let image = (() => {
      const enc = block.match(/<enclosure[^>]+url="([^"]+)"/i);
      if (enc) return enc[1];
      const med = block.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/i);
      if (med) return med[1];
      const img = description.match(/<img[^>]+src="([^"]+)"/i);
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

// ── Crawl sources ─────────────────────────────────────────────────────────────

const GNEWS_QUERIES = [
  { q: 'berita+kesehatan+terbaru+indonesia',                           label: 'Berita Kesehatan' },
  { q: 'site:health.detik.com+OR+site:detik.com+kesehatan',           label: 'Detik Health'     },
  { q: 'site:kompas.com+OR+site:liputan6.com+kesehatan',              label: 'Kompas & Liputan6'},
  { q: 'site:tribunnews.com+OR+site:tempo.co+kesehatan',              label: 'Tribun & Tempo'   },
  { q: 'penyakit+obat+tips+sehat+apotek+indonesia',                   label: 'Tips & Penyakit'  },
];

async function crawlDetikRSS() {
  const { status, body } = await fetchUrl('https://health.detik.com/rss');
  if (status !== 200) throw new Error(`Detik RSS status ${status}`);
  return parseItems(body).map(item => ({
    title: item.title,
    url: item.url,
    image: item.image,
    summary: item.summary,
    publishedAt: item.pubDate,
    source: 'Detik Health',
    color: '#e63a2e',
  }));
}

async function crawlGNews(query) {
  const url = `https://news.google.com/rss/search?q=${query.q}&hl=id&gl=ID&ceid=ID:id`;
  const { status, body } = await fetchUrl(url);
  if (status !== 200) throw new Error(`GNews status ${status}`);
  return parseItems(body).map(item => {
    // Strip " - SourceName" from title
    const srcName = item.source || '';
    const title = srcName
      ? item.title.replace(new RegExp(' - ' + srcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '').trim()
      : item.title;
    return {
      title,
      url: item.url,
      image: item.image || null,
      summary: item.summary,
      publishedAt: item.pubDate,
      source: srcName || 'Google News',
      color: colorFor(srcName),
    };
  });
}

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
  const seen = new Set();
  const articles = [];
  for (const batch of results) {
    for (const a of batch) {
      if (a.title && !seen.has(a.title)) {
        seen.add(a.title);
        articles.push(a);
      }
    }
  }

  // Sort newest first, then filter to last 14 days
  articles.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });

  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recent = articles.filter(a => {
    if (!a.publishedAt) return false;
    return new Date(a.publishedAt).getTime() >= cutoff;
  });
  console.log(`[Crawl] Filtered to last 14 days: ${recent.length} of ${articles.length} articles`);

  const output = {
    crawledAt: new Date().toISOString(),
    count: recent.length,
    articles: recent,
  };

  const outPath = path.join(__dirname, '..', 'public', 'news-data.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`[Crawl] Done — ${articles.length} articles saved to public/news-data.json`);
}

main().catch(e => { console.error('[Crawl] Fatal:', e); process.exit(1); });
