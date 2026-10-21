import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMockD1 } from './d1-mock.js';

// Storefront handlers
import * as sfProductsList from '../apps/storefront/functions/api/products/index.js';
import * as sfProductSlug from '../apps/storefront/functions/api/products/[slug].js';
import * as sfCategoriesList from '../apps/storefront/functions/api/categories/index.js';
import * as sfOrdersIndex from '../apps/storefront/functions/api/orders/index.js';
import * as sfOrderDetails from '../apps/storefront/functions/api/orders/[id].js';
import * as sfAuthMe from '../apps/storefront/functions/api/auth/me.js';
import * as sfAuthLogout from '../apps/storefront/functions/api/auth/logout.js';
import * as sfDevLogin from '../apps/storefront/functions/api/auth/dev-login.js';
import * as sfAuthConfig from '../apps/storefront/functions/api/auth/config.js';
import * as sfBannersList from '../apps/storefront/functions/api/banners/index.js';

// Admin handlers
import * as admStats from '../apps/admin/functions/api/admin/stats.js';
import * as admAssets from '../apps/admin/functions/api/admin/assets.js';
import * as admBannersList from '../apps/admin/functions/api/admin/banners/index.js';
import * as admOrdersList from '../apps/admin/functions/api/admin/orders/index.js';
import * as admOrderDetails from '../apps/admin/functions/api/admin/orders/[id].js';
import * as admProductsList from '../apps/admin/functions/api/admin/products/index.js';
import * as admProductDetails from '../apps/admin/functions/api/admin/products/[id].js';
import * as admCategoriesList from '../apps/admin/functions/api/admin/categories/index.js';
import * as admAuthConfig from '../apps/admin/functions/api/auth/config.js';
import * as admAuthMe from '../apps/admin/functions/api/auth/me.js';
import * as admAuthLogout from '../apps/admin/functions/api/auth/logout.js';
import * as admDevLogin from '../apps/admin/functions/api/auth/dev-login.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const sfDistDir = path.join(projectRoot, 'apps', 'storefront', 'dist');
const admDistDir = path.join(projectRoot, 'apps', 'admin', 'dist');

const env = {
  DB: createMockD1(),
  ENVIRONMENT: 'development',
  ADMIN_EMAILS: 'swayarienterprises@gmail.com',
  GOOGLE_STOREFRONT_CLIENT_ID: 'storefront-client.apps.googleusercontent.com',
  GOOGLE_ADMIN_CLIENT_ID: 'admin-client.apps.googleusercontent.com',
  GOOGLE_CLIENT_ID: 'storefront-client.apps.googleusercontent.com'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function serveStatic(req, res, distDir) {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let filePath = path.join(distDir, urlObj.pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const publicAssetPath = path.join(projectRoot, 'public', urlObj.pathname);
    if (fs.existsSync(publicAssetPath) && !fs.statSync(publicAssetPath).isDirectory()) {
      filePath = publicAssetPath;
    } else {
      filePath = path.join(distDir, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  } catch (err) {
    res.statusCode = 404;
    res.end('Not Found');
  }
}

async function parseCfRequest(req, port) {
  const urlObj = new URL(req.url, `http://${req.headers.host || `localhost:${port}`}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  let body = null;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks).toString('utf-8');
  }

  const cfReq = new Request(urlObj.toString(), {
    method: req.method,
    headers,
    body: body ? body : undefined
  });

  return { urlObj, cfReq };
}

// -------------------------------------------------------------
// 1. STOREFRONT SERVER (Port 8790)
// -------------------------------------------------------------
const sfServer = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:8790'}`);
  const pathname = urlObj.pathname;

  if (pathname.startsWith('/api/')) {
    try {
      const { cfReq } = await parseCfRequest(req, 8790);
      const context = {
        request: cfReq,
        env,
        params: {},
        next: async () => new Response('Not found', { status: 404 })
      };

      let cfRes;
      if (pathname === '/api/products') {
        cfRes = await sfProductsList.onRequestGet(context);
      } else if (pathname.startsWith('/api/products/')) {
        context.params.slug = decodeURIComponent(pathname.slice('/api/products/'.length));
        cfRes = await sfProductSlug.onRequestGet(context);
      } else if (pathname === '/api/categories') {
        cfRes = await sfCategoriesList.onRequestGet(context);
      } else if (pathname === '/api/orders') {
        cfRes = req.method === 'POST' ? await sfOrdersIndex.onRequestPost(context) : await sfOrdersIndex.onRequestGet(context);
      } else if (pathname.startsWith('/api/orders/')) {
        context.params.id = decodeURIComponent(pathname.slice('/api/orders/'.length));
        cfRes = await sfOrderDetails.onRequestGet(context);
      } else if (pathname === '/api/auth/me') {
        cfRes = await sfAuthMe.onRequestGet(context);
      } else if (pathname === '/api/auth/logout') {
        cfRes = await sfAuthLogout.onRequestPost(context);
      } else if (pathname === '/api/auth/dev-login') {
        cfRes = await sfDevLogin.onRequestPost(context);
      } else if (pathname === '/api/auth/config') {
        cfRes = await sfAuthConfig.onRequestGet(context);
      } else if (pathname === '/api/banners') {
        cfRes = await sfBannersList.onRequestGet(context);
      } else {
        cfRes = new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }

      res.statusCode = cfRes.status;
      cfRes.headers.forEach((val, key) => res.setHeader(key, val));
      const resBody = await cfRes.arrayBuffer();
      res.end(Buffer.from(resBody));
      return;
    } catch (err) {
      console.error('Storefront API Error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  serveStatic(req, res, sfDistDir);
});

// -------------------------------------------------------------
// 2. ADMIN PORTAL SERVER (Port 8791)
// -------------------------------------------------------------
const admServer = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:8791'}`);
  const pathname = urlObj.pathname;

  if (pathname.startsWith('/api/')) {
    try {
      const { cfReq } = await parseCfRequest(req, 8791);
      const context = {
        request: cfReq,
        env,
        params: {},
        next: async () => new Response('Not found', { status: 404 })
      };

      let cfRes;
      if (pathname === '/api/admin/stats') {
        cfRes = await admStats.onRequestGet(context);
      } else if (pathname === '/api/admin/assets') {
        cfRes = req.method === 'POST' ? await admAssets.onRequestPost(context) : await admAssets.onRequestGet(context);
      } else if (pathname === '/api/admin/banners') {
        cfRes = req.method === 'POST' ? await admBannersList.onRequestPost(context) : await admBannersList.onRequestGet(context);
      } else if (pathname === '/api/admin/products') {
        cfRes = req.method === 'POST' ? await admProductsList.onRequestPost(context) : await admProductsList.onRequestGet(context);
      } else if (pathname.startsWith('/api/admin/products/')) {
        context.params.id = decodeURIComponent(pathname.slice('/api/admin/products/'.length));
        cfRes = req.method === 'PUT' ? await admProductDetails.onRequestPut(context) : req.method === 'DELETE' ? await admProductDetails.onRequestDelete(context) : await admProductDetails.onRequestGet(context);
      } else if (pathname === '/api/admin/orders') {
        cfRes = await admOrdersList.onRequestGet(context);
      } else if (pathname.startsWith('/api/admin/orders/')) {
        context.params.id = decodeURIComponent(pathname.slice('/api/admin/orders/'.length));
        cfRes = req.method === 'PATCH' ? await admOrderDetails.onRequestPatch(context) : await admOrderDetails.onRequestGet(context);
      } else if (pathname === '/api/admin/categories') {
        cfRes = await admCategoriesList.onRequestGet(context);
      } else if (pathname === '/api/auth/me') {
        cfRes = await admAuthMe.onRequestGet(context);
      } else if (pathname === '/api/auth/dev-login') {
        cfRes = await admDevLogin.onRequestPost(context);
      } else if (pathname === '/api/auth/logout') {
        cfRes = await admAuthLogout.onRequestPost(context);
      } else if (pathname === '/api/auth/config') {
        cfRes = await admAuthConfig.onRequestGet(context);
      } else {
        cfRes = new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }

      res.statusCode = cfRes.status;
      cfRes.headers.forEach((val, key) => res.setHeader(key, val));
      const resBody = await cfRes.arrayBuffer();
      res.end(Buffer.from(resBody));
      return;
    } catch (err) {
      console.error('Admin API Error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  serveStatic(req, res, admDistDir);
});

const SF_PORT = 8790;
const ADM_PORT = 8791;

sfServer.listen(SF_PORT, '127.0.0.1', () => {
  console.log(`🛍️  Storefront running at: http://127.0.0.1:${SF_PORT}`);
});

admServer.listen(ADM_PORT, '127.0.0.1', () => {
  console.log(`🛡️  Admin Portal running at: http://127.0.0.1:${ADM_PORT}`);
});
