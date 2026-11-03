// Creates 480px-wide WebP thumbnails for product photos in public/assets/products/thumbs/.
// Product cards use them on phones and tablets instead of the full 800–960px photographs.
// Existing thumbnails are kept unless the source photo is newer. Safe to run repeatedly.
//
// Usage: node scripts/generate-thumbnails.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsDir = path.join(projectRoot, 'public', 'assets', 'products');
const thumbsDir = path.join(productsDir, 'thumbs');
export const THUMB_WIDTH = 480;

let sharp;
try {
  sharp = createRequire(import.meta.url)('sharp');
} catch {
  console.warn('⚠️  sharp is not installed; skipping thumbnail generation (committed thumbnails are used).');
  process.exit(0);
}

fs.mkdirSync(thumbsDir, { recursive: true });
let created = 0;
for (const file of fs.readdirSync(productsDir)) {
  if (!/\.(webp|jpe?g|png)$/i.test(file)) continue;
  const source = path.join(productsDir, file);
  // One thumbnail per photograph: name.webp and name.jpg share name.webp.
  const target = path.join(thumbsDir, file.replace(/\.(webp|jpe?g|png)$/i, '.webp'));
  if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) continue;
  await sharp(source)
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 74, effort: 6, smartSubsample: true })
    .toFile(target);
  created++;
}
console.log(`✅ Product thumbnails up to date (${created} created) in public/assets/products/thumbs`);
