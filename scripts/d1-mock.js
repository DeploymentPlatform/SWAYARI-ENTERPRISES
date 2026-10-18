import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

export function createMockD1() {
  const db = new DatabaseSync(':memory:');

  // Dynamically apply all migrations in sorted numerical order
  const migrationsDir = path.join(projectRoot, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    db.exec(sql);
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
