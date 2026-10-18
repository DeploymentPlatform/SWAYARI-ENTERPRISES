import { jsonResponse, requireAdminAuth } from '../../_utils.js';

// Product photographs available to attach to catalogue entries. Read from the deployed
// /assets/manifest.json (generated from public/assets at build time); editorial stock
// photography is excluded because it must never be presented as a product.
const FALLBACK = [
  'radha-krishna-frame', 'bala-krishna-frame', 'venkateswara-frame', 'hanuman-frame'
].flatMap(slug => [
  { path: `/assets/products/${slug}-960.jpg`, name: `${slug} — studio`, category: 'products', type: 'image/jpeg' }
]);

function label(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/-(\d+)$/, '').replace(/-photo$/, ' — as photographed').replace(/[-_]/g, ' ');
}

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  let assets = FALLBACK;
  try {
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(new URL('/assets/manifest.json', request.url));
      if (res.ok) {
        const manifest = await res.json();
        const files = (manifest.assets || []).filter(a => a.category === 'products' || a.category === 'demo');
        // Offer one entry per prepared image: the largest JPEG of each product variant, plus originals.
        const best = new Map();
        for (const a of files) {
          if (!/\.(jpe?g|png)$/i.test(a.filename)) continue;
          const key = a.category === 'products' ? a.path.replace(/-\d+\.jpg$/, '') : a.path;
          const width = Number((a.filename.match(/-(\d+)\.jpg$/) || [])[1] || 0);
          const prev = best.get(key);
          if (!prev || width > prev.width) best.set(key, { width, asset: a });
        }
        assets = [...best.values()].map(({ asset }) => ({
          path: asset.path,
          name: asset.category === 'demo' ? `${asset.label} (original photo)` : label(asset.filename),
          category: asset.category,
          type: asset.filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
        }));
      }
    }
  } catch {
    assets = FALLBACK;
  }

  return jsonResponse({ success: true, assets });
}
