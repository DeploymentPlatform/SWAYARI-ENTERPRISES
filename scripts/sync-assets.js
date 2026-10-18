// Copies the canonical Git-tracked assets in public/assets/ into each portal's Vite public dir.
//
// - Storefront receives brand, products, demo and editorial photography.
// - Admin receives brand, products and demo only (product thumbnails must resolve on the admin
//   origin too); editorial lifestyle photography is customer-site only.
//
// Usage: node scripts/sync-assets.js [storefront|admin|all]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(projectRoot, 'public', 'assets');

const TARGETS = {
  storefront: { dir: 'apps/storefront/public/assets', folders: ['brand', 'products', 'demo', 'editorial'] },
  admin: { dir: 'apps/admin/public/assets', folders: ['brand', 'products', 'demo'] }
};

function copyFolder(from, to) {
  if (!fs.existsSync(from)) return 0;
  fs.mkdirSync(to, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) {
      count += copyFolder(src, dest);
    } else {
      fs.copyFileSync(src, dest);
      count++;
    }
  }
  return count;
}

const requested = process.argv[2] || 'all';
const names = requested === 'all' ? Object.keys(TARGETS) : [requested];

for (const name of names) {
  const target = TARGETS[name];
  if (!target) {
    console.error(`Unknown target "${name}". Use storefront, admin or all.`);
    process.exit(1);
  }
  const destRoot = path.join(projectRoot, target.dir);
  let total = 0;
  for (const folder of target.folders) {
    total += copyFolder(path.join(source, folder), path.join(destRoot, folder));
  }
  const manifest = path.join(source, 'manifest.json');
  if (fs.existsSync(manifest)) fs.copyFileSync(manifest, path.join(destRoot, 'manifest.json'));
  console.log(`✅ Synced ${total} asset files into ${target.dir}`);
}
