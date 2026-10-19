import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMockD1 } from './d1-mock.js';

import * as sfMiddleware from '../apps/storefront/functions/_middleware.js';
import * as sfProductsList from '../apps/storefront/functions/api/products/index.js';
import * as sfProductSlug from '../apps/storefront/functions/api/products/[slug].js';
import * as sfCategoriesList from '../apps/storefront/functions/api/categories/index.js';
import * as sfOrdersIndex from '../apps/storefront/functions/api/orders/index.js';
import * as sfOrderDetails from '../apps/storefront/functions/api/orders/[id].js';
import * as sfAuthMe from '../apps/storefront/functions/api/auth/me.js';
import * as sfAuthLogout from '../apps/storefront/functions/api/auth/logout.js';
import * as sfDevLogin from '../apps/storefront/functions/api/auth/dev-login.js';
import * as sfAuthConfig from '../apps/storefront/functions/api/auth/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'apps', 'storefront', 'dist');

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

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:8788'}`);
  const pathname = urlObj.pathname;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    try {
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
        if (req.method === 'POST') {
          cfRes = await sfOrdersIndex.onRequestPost(context);
        } else {
          cfRes = await sfOrdersIndex.onRequestGet(context);
        }
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
      } else {
        cfRes = new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }

      res.statusCode = cfRes.status;
      cfRes.headers.forEach((val, key) => {
        res.setHeader(key, val);
      });
      const resBody = await cfRes.arrayBuffer();
      res.end(Buffer.from(resBody));
      return;
    } catch (err) {
      console.error('API Error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
      return;
    }
  }

  // Handle static files
  let filePath = path.join(distDir, pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // Check in public/assets or fall back to index.html for client-side routing
    const publicAssetPath = path.join(projectRoot, 'public', pathname);
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
});

const PORT = 8790;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
