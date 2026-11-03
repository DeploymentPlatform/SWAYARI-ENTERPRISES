import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Migration 0009 replaced the sample catalogue with the owner's real God Frames range.
// The behaviour tests were written against that sample catalogue (demo items, ₹49–₹99 frames),
// so `legacyFixtures` puts it back after every migration has run. The real catalogue is
// checked separately with `createMockD1()` (see the "God Frames catalogue" tests).
const LEGACY_SNAPSHOT_BEFORE = '0009';

export function createMockD1({ legacyFixtures = false } = {}) {
  const db = new DatabaseSync(':memory:');

  // Dynamically apply all migrations in sorted numerical order
  const migrationsDir = path.join(projectRoot, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  let snapshot = null;
  for (const file of migrationFiles) {
    if (legacyFixtures && !snapshot && file >= LEGACY_SNAPSHOT_BEFORE) {
      snapshot = {
        categories: db.prepare('SELECT * FROM categories').all(),
        products: db.prepare('SELECT * FROM products').all(),
        banners: db.prepare('SELECT * FROM campaign_banners').all()
      };
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
  }

  if (snapshot) {
    db.exec('DELETE FROM products; DELETE FROM categories; DELETE FROM campaign_banners;');
    for (const [table, rows] of Object.entries({ categories: snapshot.categories, products: snapshot.products, campaign_banners: snapshot.banners })) {
      for (const row of rows) {
        const cols = Object.keys(row);
        db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => row[c]));
      }
    }
  }

  function wrapStatement(sql, params = []) {
    return {
      sql,
      params,
      bind(...newParams) {
        return wrapStatement(sql, newParams);
      },
      async first() {
        const stmt = db.prepare(sql);
        const result = stmt.get(...params);
        return result || null;
      },
      async all() {
        const stmt = db.prepare(sql);
        const results = stmt.all(...params);
        return { results, success: true };
      },
      async run() {
        const stmt = db.prepare(sql);
        const info = stmt.run(...params);
        return {
          success: true,
          meta: { changes: info.changes, last_row_id: Number(info.lastInsertRowid) }
        };
      }
    };
  }

  return {
    _rawDb: db,
    prepare(sql) {
      return wrapStatement(sql);
    },
    async batch(statements) {
      db.exec('BEGIN TRANSACTION;');
      try {
        const results = [];
        for (const s of statements) {
          const stmt = db.prepare(s.sql);
          const info = stmt.run(...s.params);
          results.push({
            success: true,
            meta: { changes: info.changes, last_row_id: Number(info.lastInsertRowid) }
          });
        }
        db.exec('COMMIT;');
        return results;
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }
    }
  };
}
