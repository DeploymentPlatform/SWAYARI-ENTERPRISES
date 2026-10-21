import { jsonResponse, errorResponse, requireAdminAuth } from '../../_utils.js';
import fs from 'node:fs';
import path from 'node:path';

// Primary devotional product photographs available in catalogue.
const FALLBACK = [
  { path: '/assets/products/venkateswara-frame-960.webp', name: 'Sri Venkateswara Frame — studio (960px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/bala-krishna-frame-960.webp', name: 'Bala Krishna Frame — studio (960px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/radha-krishna-frame-960.webp', name: 'Radha Krishna Frame — studio (960px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/hanuman-frame-960.webp', name: 'Veera Hanuman Frame — studio (960px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/ganesha-frame-800.webp', name: 'Lord Ganesha Temple Frame (800px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/lakshmi-frame-800.webp', name: 'Goddess Lakshmi Blessings Frame (800px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/saraswati-frame-800.webp', name: 'Goddess Saraswati Wisdom Frame (800px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/shiva-parvati-frame-800.webp', name: 'Shiva Parvati Kalyanam Frame (800px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/murugan-frame-800.webp', name: 'Lord Murugan Vel Frame (800px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/sai-baba-frame-800.webp', name: 'Shirdi Sai Baba Frame (800px)', category: 'products', type: 'image/webp' },
  { path: '/assets/products/placeholder-devotional-frame.webp', name: 'Neutral Devotional Frame Placeholder', category: 'products', type: 'image/webp' }
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
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
        const baseName = (body.filename || body.fileName || 'devotional-frame')
          .replace(/\.[^.]+$/, '')
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '-');
        filename = `${baseName}-${Date.now()}.${ext}`;
      } else {
        buffer = Buffer.from(rawData, 'base64');
        const ext = (body.filename || body.fileName || '').endsWith('.png') ? 'png' : (body.filename || body.fileName || '').endsWith('.webp') ? 'webp' : 'jpg';
        filename = `upload-${Date.now()}.${ext}`;
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file.arrayBuffer !== 'function') {
        return errorResponse('Valid image file is required', 400);
      }
      const rawBuf = await file.arrayBuffer();
      buffer = Buffer.from(rawBuf);
      const safeName = (file.name || 'devotional-frame.jpg')
        .toLowerCase()
        .replace(/[^a-z0-9_.-]/g, '-');
      filename = `upload-${Date.now()}-${safeName}`;
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
    return errorResponse(`Upload failed: ${err.message}`, 500);
  }
}
