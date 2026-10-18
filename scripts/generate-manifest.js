import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'public', 'assets');
const manifestPath = path.join(assetsDir, 'manifest.json');

const KNOWN_LABELS = {
  'brand_card.jpeg': 'SWAYARI Official Brand Artwork (Burgundy & Gold)',
  'swayari-logo.svg': 'SWAYARI Scalable Vector Logo Wordmark',
  'favicon.svg': 'SWAYARI Lotus Crest Favicon',
  'sample_product_1.jpeg': 'Radha Krishna Embossed Silver Plaque Frame (Preview Demo)',
  'sample_product_2.jpeg': 'Bala Krishna Makhan Chor Embossed Silver Frame (Preview Demo)',
  'sample_product_3.jpeg': 'Sri Venkateswara Balaji Embossed Silver Frame (Preview Demo)',
  'sample_product_4.jpeg': 'Sri Hanuman Embossed Silver Frame (Preview Demo)'
};

function scanDir(dir, baseDir = '') {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    if (item.name.startsWith('.') || item.name === 'manifest.json') continue;
    const fullPath = path.join(dir, item.name);
    const relPath = path.join(baseDir, item.name);
    if (item.isDirectory()) {
      results = results.concat(scanDir(fullPath, relPath));
    } else if (/\.(jpg|jpeg|png|webp|svg|gif)$/i.test(item.name)) {
      const stats = fs.statSync(fullPath);
      const urlPath = '/assets/' + relPath.split(path.sep).join('/');
      const label = KNOWN_LABELS[item.name] || item.name.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '');
      results.push({
        id: relPath.replace(/[^a-zA-Z0-9-_]/g, '_'),
        filename: item.name,
        path: urlPath,
        category: relPath.split(path.sep)[0] || 'general',
        label: label,
        sizeBytes: stats.size,
        updatedAt: stats.mtime.toISOString()
      });
    }
  }
  return results;
}

const assets = scanDir(assetsDir);
const manifest = {
  generatedAt: new Date().toISOString(),
  totalAssets: assets.length,
  assets: assets
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`✅ Asset manifest generated with ${assets.length} items at ${manifestPath}`);
