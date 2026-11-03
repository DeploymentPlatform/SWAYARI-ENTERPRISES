import { jsonResponse, errorResponse, requireAdminAuth } from '../../_utils.js';
import fs from 'node:fs';
import path from 'node:path';

// Primary devotional product photographs available in catalogue.
const FALLBACK = [
  { path: '/assets/products/gf-venkateswara-studio.webp', name: 'Sri Venkateswara — studio', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-venkateswara-lifestyle.webp', name: 'Sri Venkateswara — in use', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-padmavathi-srinivasa-studio.webp', name: 'Padmavathi Srinivasa — studio', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-padmavathi-srinivasa-lifestyle.webp', name: 'Padmavathi Srinivasa — in use', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-sai-baba-studio.webp', name: 'Shirdi Sai Baba — studio', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-sai-baba-lifestyle.webp', name: 'Shirdi Sai Baba — in use', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-radha-krishna-studio.webp', name: 'Radha Krishna — studio', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-radha-krishna-lifestyle.webp', name: 'Radha Krishna — in use', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-bal-krishna-studio.webp', name: 'Bal Krishna — studio', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-bal-krishna-lifestyle.webp', name: 'Bal Krishna — in use', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-ram-darbar-studio.webp', name: 'Ram Darbar — studio', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-ram-darbar-lifestyle.webp', name: 'Ram Darbar — in use', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-hanuman-studio.webp', name: 'Sanjeevani Hanuman — studio', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-hanuman-lifestyle.webp', name: 'Sanjeevani Hanuman — in use', category: 'products', type: 'image/webp' },
  { path: '/assets/products/gf-back-stand.webp', name: 'Frame back — table stand and wall hook', category: 'products', type: 'image/webp' },
  { path: '/assets/editorial/hero-god-frames-desktop.webp', name: 'Hero — god frames on display', category: 'editorial', type: 'image/webp' },
  { path: '/assets/editorial/hero-return-gifts-desktop.webp', name: 'Hero — wedding return gifts', category: 'editorial', type: 'image/webp' },
  { path: '/assets/editorial/hero-bulk-order-desktop.webp', name: 'Hero — bulk order packing', category: 'editorial', type: 'image/webp' },
];

function label(filename) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/-(\d+)$/, '')
    .replace(/-photo$/, ' — as photographed')
    .replace(/[-_]/g, ' ');
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
    let manifestData = null;

    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(new URL('/assets/manifest.json', request.url));
      if (res.ok) {
        manifestData = await res.json();
      }
    }

    if (!manifestData && typeof process !== 'undefined' && process.cwd) {
      const localManifest = path.join(process.cwd(), 'public', 'assets', 'manifest.json');
      if (fs.existsSync(localManifest)) {
        manifestData = JSON.parse(fs.readFileSync(localManifest, 'utf-8'));
      }
    }

    if (manifestData && Array.isArray(manifestData.assets)) {
      const files = manifestData.assets.filter(a => a.category === 'products' || a.category === 'demo');
      const best = new Map();
      for (const a of files) {
        if (!/\.(jpe?g|png|webp)$/i.test(a.filename)) continue;
        const key = a.path.replace(/-\d+\.(jpg|webp)$/, '');
        const width = Number((a.filename.match(/-(\d+)\.(jpg|webp)$/) || [])[1] || 0);
        const prev = best.get(key);
        if (!prev || width > prev.width) best.set(key, { width, asset: a });
      }
      assets = [...best.values()].map(({ asset }) => ({
        path: asset.path,
        name: asset.category === 'demo' ? `${asset.label} (original photo)` : label(asset.filename),
        category: asset.category,
        type: asset.filename.endsWith('.png') ? 'image/png' : asset.filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
      }));
    }
  } catch {
    assets = FALLBACK;
  }

  return jsonResponse({ success: true, assets });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let buffer;
    let filename = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const rawData = body.data || body.base64Data;
      if (!rawData || typeof rawData !== 'string') {
        return errorResponse('Valid image data URL or base64 string is required', 400);
      }
      const match = rawData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        buffer = Buffer.from(match[2], 'base64');
      } else {
        buffer = Buffer.from(rawData, 'base64');
      }
      filename = String(body.filename || body.fileName || 'god-frame');
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file.arrayBuffer !== 'function') {
        return errorResponse('Valid image file is required', 400);
      }
      const rawBuf = await file.arrayBuffer();
      buffer = Buffer.from(rawBuf);
      filename = String(file.name || 'god-frame');
    } else {
      return errorResponse('Unsupported media content type. Use multipart/form-data or application/json', 415);
    }

    // Validate size: 5MB ceiling
    const MAX_SIZE = 5 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return errorResponse(`File size (${Math.round(buffer.length / 1024)} KB) exceeds the 5MB upload limit`, 400);
    }
    if (buffer.length < 16) {
      return errorResponse('Uploaded file is empty or corrupted', 400);
    }

    // Validate magic bytes
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebp = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
                   buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    if (!isJpeg && !isPng && !isWebp) {
      return errorResponse('Invalid image file format: magic bytes do not match authentic JPEG, PNG or WebP', 400);
    }

    // The saved name comes only from a cleaned base name plus the extension the file bytes prove.
    const ext = isPng ? 'png' : isWebp ? 'webp' : 'jpg';
    const baseName = filename
      .replace(/\.[^.]*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'god-frame';
    filename = `${baseName}-${Date.now()}.${ext}`;

    // Free-first durable storage:
    // Write to canonical public/assets/products/ directory and synchronize to portal origins
    const rootDir = typeof process !== 'undefined' && process.cwd ? process.cwd() : '.';
    const targetDir = path.join(rootDir, 'public', 'assets', 'products');
    fs.mkdirSync(targetDir, { recursive: true });
    const targetFile = path.join(targetDir, filename);
    fs.writeFileSync(targetFile, buffer);

    // Sync to storefront and admin
    const sfDir = path.join(rootDir, 'apps', 'storefront', 'public', 'assets', 'products');
    const admDir = path.join(rootDir, 'apps', 'admin', 'public', 'assets', 'products');
    try {
      if (fs.existsSync(sfDir)) fs.copyFileSync(targetFile, path.join(sfDir, filename));
      if (fs.existsSync(admDir)) fs.copyFileSync(targetFile, path.join(admDir, filename));
    } catch {}

    const assetPath = `/assets/products/${filename}`;
    return jsonResponse({
      success: true,
      path: assetPath,
      filename,
      sizeBytes: buffer.length
    }, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(`Upload failed. Please try again.`, 500);
  }
}
