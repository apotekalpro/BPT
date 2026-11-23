const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'news.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        image TEXT,
        summary TEXT,
        source TEXT NOT NULL,
        published_at TEXT,
        crawled_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_crawled ON articles(crawled_at DESC);
      CREATE INDEX IF NOT EXISTS idx_source ON articles(source);
    `);
  }
  return db;
}

function upsertArticles(articles) {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO articles (title, url, image, summary, source, published_at, crawled_at)
    VALUES (@title, @url, @image, @summary, @source, @publishedAt, @crawledAt)
  `);
  const now = new Date().toISOString();
  const insertMany = db.transaction(items => {
    let inserted = 0;
    for (const item of items) {
      const info = insert.run({ ...item, crawledAt: now });
      if (info.changes > 0) inserted++;
    }
    return inserted;
  });
  return insertMany(articles);
}

function getArticles({ source, limit = 50, offset = 0 } = {}) {
  const db = getDb();
  let query = 'SELECT * FROM articles';
  const params = [];
  if (source) {
    query += ' WHERE source = ?';
    params.push(source);
  }
  query += ' ORDER BY crawled_at DESC, id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  return db.prepare(query).all(...params);
}

function getStats() {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as count FROM articles').get();
  const bySource = db.prepare('SELECT source, COUNT(*) as count FROM articles GROUP BY source').all();
  const lastCrawl = db.prepare('SELECT MAX(crawled_at) as ts FROM articles').get();
  return { total: total.count, bySource, lastCrawl: lastCrawl.ts };
}

function pruneOld(keepDays = 7) {
  const db = getDb();
  const cutoff = new Date(Date.now() - keepDays * 86400000).toISOString();
  const info = db.prepare('DELETE FROM articles WHERE crawled_at < ?').run(cutoff);
  return info.changes;
}

module.exports = { upsertArticles, getArticles, getStats, pruneOld };
