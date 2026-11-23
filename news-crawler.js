const axios = require('axios');
const cheerio = require('cheerio');

// Source-specific thumbnail placeholders by outlet
const OUTLET_COLORS = {
  'detik': '#e63a2e', 'kompas': '#c0392b', 'liputan6': '#e67e22',
  'tribun': '#d35400', 'tempo': '#2c3e50', 'cnbc': '#0056b3',
  'republika': '#1a7c47', 'kumparan': '#ff6b35', 'antara': '#2980b9',
  'default': '#1a7c47'
};

// Google News RSS queries targeting Indonesian health news
const GNEWS_QUERIES = [
  { q: 'berita+kesehatan+terbaru+indonesia', label: 'Berita Kesehatan' },
  { q: 'site:health.detik.com+OR+site:detik.com+kesehatan', label: 'Detik Health' },
  { q: 'site:kompas.com+OR+site:liputan6.com+kesehatan', label: 'Kompas & Liputan6' },
  { q: 'site:tribunnews.com+OR+site:tempo.co+kesehatan', label: 'Tribun & Tempo' },
  { q: 'penyakit+obat+tips+sehat+indonesia', label: 'Tips & Penyakit' },
];

const DETIK_RSS = 'https://health.detik.com/rss';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
};

function outletColor(source) {
  if (!source) return OUTLET_COLORS.default;
  const s = source.toLowerCase();
  for (const [key, color] of Object.entries(OUTLET_COLORS)) {
    if (s.includes(key)) return color;
  }
  return OUTLET_COLORS.default;
}

function extractCDATA(str) {
  if (!str) return '';
  return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function parseRssItems(xml) {
  const $ = cheerio.load(xml, { xmlMode: true });
  const items = [];
  $('item').each((i, el) => {
    const $el = $(el);
    const title = extractCDATA($el.find('title').text());
    const link = $el.find('link').text().trim() || $el.find('link').next().text().trim();
    const pubDate = $el.find('pubDate').text().trim();
    const description = extractCDATA($el.find('description').text());
    const summary = stripHtml(description).slice(0, 300);
    // Extract image from description HTML or enclosure
    let image = null;
    const encUrl = $el.find('enclosure').attr('url') || $el.find('media\\:content, media\\:thumbnail').attr('url');
    if (encUrl) image = encUrl;
    if (!image) {
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) image = imgMatch[1];
    }
    if (title && link && link.startsWith('http')) {
      items.push({ title, url: link, image, summary, pubDate });
    }
  });
  return items;
}

async function crawlDetik() {
  const res = await axios.get(DETIK_RSS, { headers: HEADERS, timeout: 15000 });
  const items = parseRssItems(res.data);
  return items.map(item => ({
    title: item.title,
    url: item.url,
    image: item.image,
    summary: item.summary,
    publishedAt: item.pubDate,
    source: 'Detik Health',
    sourceColor: '#e63a2e',
  }));
}

async function crawlGnewsQuery(query) {
  const url = `https://news.google.com/rss/search?q=${query.q}&hl=id&gl=ID&ceid=ID:id`;
  const res = await axios.get(url, { headers: HEADERS, timeout: 15000 });
  const $ = cheerio.load(res.data, { xmlMode: true });
  const items = [];
  $('item').each((i, el) => {
    const $el = $(el);
    // Title format: "Article Title - Source Name"
    const rawTitle = extractCDATA($el.find('title').text());
    const sourceName = $el.find('source').text().trim();
    // Strip " - SourceName" from title end
    const title = sourceName
      ? rawTitle.replace(new RegExp(' - ' + sourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'), '').trim()
      : rawTitle;
    // Google News redirect link - keep as-is for now
    const link = $el.find('link').text().trim();
    const pubDate = $el.find('pubDate').text().trim();
    const description = extractCDATA($el.find('description').text());
    // Extract the real source URL from description anchor
    const srcUrlMatch = description.match(/href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
    const realUrl = srcUrlMatch ? srcUrlMatch[1].replace(/&amp;/g, '&') : link;
    if (title && link) {
      items.push({
        title,
        url: realUrl,
        image: null, // Google News doesn't include images
        summary: stripHtml(description).slice(0, 300),
        publishedAt: pubDate,
        source: sourceName || 'Google News',
        sourceColor: outletColor(sourceName),
      });
    }
  });
  return items;
}

async function crawlAll() {
  console.log('[Crawler] Starting crawl at', new Date().toISOString());
  const tasks = [
    crawlDetik().then(a => { console.log(`[Crawler] Detik: ${a.length}`); return a; }).catch(e => { console.error('[Crawler] Detik failed:', e.message); return []; }),
    ...GNEWS_QUERIES.map(q =>
      crawlGnewsQuery(q).then(a => { console.log(`[Crawler] GNews "${q.label}": ${a.length}`); return a; }).catch(e => { console.error(`[Crawler] GNews "${q.label}" failed:`, e.message); return []; })
    )
  ];
  const results = await Promise.allSettled(tasks);
  const all = [];
  const seen = new Set();
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const article of r.value) {
        if (article.title && !seen.has(article.title)) {
          seen.add(article.title);
          all.push(article);
        }
      }
    }
  }
  // Sort by pubDate descending
  all.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });
  console.log(`[Crawler] Total unique articles: ${all.length}`);
  return all;
}

module.exports = { crawlAll };
