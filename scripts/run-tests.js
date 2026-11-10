import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMockD1 } from './d1-mock.js';

// Storefront backend imports
import * as sfMiddleware from '../apps/storefront/functions/_middleware.js';
import * as sfAuthGoogle from '../apps/storefront/functions/api/auth/google.js';
import * as sfAuthMe from '../apps/storefront/functions/api/auth/me.js';
import * as sfAuthLogout from '../apps/storefront/functions/api/auth/logout.js';
import * as sfDevLogin from '../apps/storefront/functions/api/auth/dev-login.js';
import * as sfProductsList from '../apps/storefront/functions/api/products/index.js';
import * as sfProductSlug from '../apps/storefront/functions/api/products/[slug].js';
import * as sfCategoriesList from '../apps/storefront/functions/api/categories/index.js';
import * as sfOrdersIndex from '../apps/storefront/functions/api/orders/index.js';
import * as sfOrderDetails from '../apps/storefront/functions/api/orders/[id].js';
import * as sfAuthConfig from '../apps/storefront/functions/api/auth/config.js';
import { planSeo } from '../apps/storefront/functions/_seo.js';
import * as sfSitemap from '../apps/storefront/functions/sitemap.xml.js';
import { BLOG_POSTS } from '../apps/storefront/src/content/blog-posts.js';

// Admin backend imports
import * as admMiddleware from '../apps/admin/functions/_middleware.js';
import * as admAuthGoogle from '../apps/admin/functions/api/auth/google.js';
import * as admAuthMe from '../apps/admin/functions/api/auth/me.js';
import * as admAuthLogout from '../apps/admin/functions/api/auth/logout.js';
import * as admDevLogin from '../apps/admin/functions/api/auth/dev-login.js';
import * as admStats from '../apps/admin/functions/api/admin/stats.js';
import * as admOrdersList from '../apps/admin/functions/api/admin/orders/index.js';
import * as admOrderDetails from '../apps/admin/functions/api/admin/orders/[id].js';
import * as admProductsList from '../apps/admin/functions/api/admin/products/index.js';
import * as admProductDetails from '../apps/admin/functions/api/admin/products/[id].js';
import * as admCategoriesList from '../apps/admin/functions/api/admin/categories/index.js';
import * as admAuthConfig from '../apps/admin/functions/api/auth/config.js';
import * as admAssets from '../apps/admin/functions/api/admin/assets.js';
import * as admBannersList from '../apps/admin/functions/api/admin/banners/index.js';
import {
  calculateEffectiveUnitPrice,
  calculateLineSubtotal,
  aggregateCartItems,
  calculateCartTotals,
  validateQuantityRules,
  validatePricePaise
} from '../packages/shared/src/pricing.js';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

function makeContext(request, env, params = {}, next = async () => new Response('OK')) {
  return { request, env, params, next };
}

function makeRequest(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.cookie) {
    headers.set('Cookie', options.cookie);
  }
  if (options.body && typeof options.body === 'object') {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body);
  }
  return new Request(url, { ...options, headers });
}

console.log('====================================================');
console.log('SWAYARI ENTERPRISES - Two-Portal System Test Suite');
console.log('====================================================');

const env = {
  DB: createMockD1({ legacyFixtures: true }),
  ENVIRONMENT: 'development',
  MIN_ORDER_FRAMES: '1', // legacy tests use small quantities; the 25-frame rule has its own tests
  ADMIN_EMAILS: 'swayarienterprises@gmail.com',
  GOOGLE_STOREFRONT_CLIENT_ID: 'storefront-client.apps.googleusercontent.com',
  GOOGLE_ADMIN_CLIENT_ID: 'admin-client.apps.googleusercontent.com',
  GOOGLE_CLIENT_ID: 'storefront-client.apps.googleusercontent.com'
};

// 1. DATABASE & CATALOGUE DEMO DATA SEPARATION
await test('1. Storefront queries hide demo preview items from genuine production store', async () => {
  const req = makeRequest('http://storefront/api/products');
  const res = await sfProductsList.onRequestGet(makeContext(req, env));
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.count, 0, 'Production storefront must hide demo items by default');
});

await test('2. Explicit include_demo flag in development exposes preview items', async () => {
  const req = makeRequest('http://storefront/api/products?include_demo=1');
  const res = await sfProductsList.onRequestGet(makeContext(req, env));
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.count >= 1, true);
  assert.equal(data.products[0].isDemo, true);
  assert.equal(data.products[0].sku, 'SWY-DEMO-001');
});

// 2. DEV-LOGIN ENVIRONMENT ISOLATION
await test('3. Dev test login is strictly disabled in production for both portals', async () => {
  const prodEnv = { ...env, ENVIRONMENT: 'production' };
  
  const sfReq = makeRequest('http://storefront/api/auth/dev-login', { method: 'POST', body: {} });
  const sfRes = await sfDevLogin.onRequestPost(makeContext(sfReq, prodEnv));
  assert.equal(sfRes.status, 403, 'Storefront dev login must be forbidden in production');

  const admReq = makeRequest('http://admin/api/auth/dev-login', { method: 'POST', body: {} });
  const admRes = await admDevLogin.onRequestPost(makeContext(admReq, prodEnv));
  assert.equal(admRes.status, 403, 'Admin dev login must be forbidden in production');
});

// 3. AUTHENTICATION & PORTAL SESSION SCOPE ISOLATION
let customerCookie = '';
let adminCookie = '';

await test('4. Customer login issues scoped swayari_customer_session cookie', async () => {
  const req = makeRequest('http://storefront/api/auth/dev-login', {
    method: 'POST',
    body: { customEmail: 'ananya.sharma@example.com', customName: 'Ananya Sharma' }
  });
  const res = await sfDevLogin.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.user.email, 'ananya.sharma@example.com');
  assert.equal(data.user.role, 'customer');

  const setCookie = res.headers.get('Set-Cookie');
  assert.ok(setCookie.includes('swayari_customer_session='));
  const match = setCookie.match(/swayari_customer_session=([^;]+)/);
  customerCookie = `swayari_customer_session=${match[1]}`;
});

await test('5. Admin login enforces allowlist (swayarienterprises@gmail.com) and issues swayari_admin_session', async () => {
  const req = makeRequest('http://admin/api/auth/dev-login', { method: 'POST' });
  const res = await admDevLogin.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.user.email, 'swayarienterprises@gmail.com');
  assert.equal(data.user.role, 'admin');

  const setCookie = res.headers.get('Set-Cookie');
  assert.ok(setCookie.includes('swayari_admin_session='));
  const match = setCookie.match(/swayari_admin_session=([^;]+)/);
  adminCookie = `swayari_admin_session=${match[1]}`;
});

await test('6. Customer session cookie is strictly rejected by Admin APIs (Scope Enforcement)', async () => {
  // Try calling admin orders API using customer cookie
  const req = makeRequest('http://admin/api/admin/orders', { cookie: customerCookie });
  const res = await admOrdersList.onRequestGet(makeContext(req, env));
  assert.equal(res.status, 401, 'Customer session must be rejected by admin endpoints');
});

await test('7. Storefront middleware completely blocks /admin and /api/admin with 404', async () => {
  const req1 = makeRequest('http://storefront/admin');
  const res1 = await sfMiddleware.onRequest(makeContext(req1, env));
  assert.equal(res1.status, 404, 'Storefront must never serve /admin');

  const req2 = makeRequest('http://storefront/api/admin/orders');
  const res2 = await sfMiddleware.onRequest(makeContext(req2, env));
  assert.equal(res2.status, 404, 'Storefront must never serve /api/admin');
});

await test('8. Signed-out visitor cannot submit order requests (401 Unauthorized)', async () => {
  const req = makeRequest('http://storefront/api/orders', {
    method: 'POST',
    body: { idempotencyKey: 'anon-test-12345678', items: [{ productId: 'test', quantity: 1 }] }
  });
  const res = await sfOrdersIndex.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 401);
});

// 4. ADMIN PRODUCT PUBLISHING & STOREFRONT VISIBILITY
let createdProdId = '';

await test('9. Admin creates and publishes a genuine product', async () => {
  const req = makeRequest('http://admin/api/admin/products', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      sku: 'SWY-FRAME-DEV-01',
      name: 'Mayur Sri Ganesha Devotional Frame',
      slug: 'mayur-sri-ganesha-devotional-frame',
      description: 'Handcrafted gold foil devotional frame with intricate arch border.',
      material: 'Gold Foil & Synthetic Moulding Frame',
      dimensions: '4 x 6 inches',
      indicativePrice: 89,
      minQuantity: 1,
      status: 'published',
      isDemo: false,
      images: ['/assets/demo/sample_product_2.jpeg'],
      deity: 'Ganesha',
      frameSize: '4x6 in',
      orientation: 'portrait',
      borderFinish: 'Antique Gold'
    }
  });
  const res = await admProductsList.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.productId);
  createdProdId = data.productId;

  // Verify storefront now sees it
  const sfReq = makeRequest('http://storefront/api/products');
  const sfRes = await sfProductsList.onRequestGet(makeContext(sfReq, env));
  const sfData = await sfRes.json();
  assert.equal(sfData.count, 1);
  assert.equal(sfData.products[0].sku, 'SWY-FRAME-DEV-01');
});

// 5. ATOMIC ORDER SUBMISSION, IDEMPOTENCY & FORGED PRICE REJECTION
let createdOrderId = '';
const testIdempotencyKey = 'idemp-' + Date.now() + '-key1234';

await test('10. Order submission recalculates real database price and rejects forged prices', async () => {
  const req = makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: {
      idempotencyKey: testIdempotencyKey,
      customerName: 'Ananya Sharma',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 402, Royal Palms, Banjara Hills',
      deliveryCity: 'Hyderabad',
      deliveryState: 'Telangana',
      deliveryPincode: '500034',
      customerNotes: 'Please call before dispatch for temple sanctification timing.',
      items: [
        {
          productId: createdProdId,
          quantity: 2,
          forgedPrice: 10 // Client attempts to forge price
        }
      ]
    }
  });
  const res = await sfOrdersIndex.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.orderId);
  createdOrderId = data.orderId;
  // Database price is 89 * 2 = 178, NOT 20!
  assert.equal(data.indicativeSubtotal, 178, 'Server must calculate price from D1 database');
});

await test('11. Idempotent re-submission returns existing order without creating duplicates', async () => {
  const req = makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: {
      idempotencyKey: testIdempotencyKey,
      customerName: 'Ananya Sharma',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 402, Royal Palms',
      deliveryCity: 'Hyderabad',
      deliveryState: 'Telangana',
      deliveryPincode: '500034',
      items: [{ productId: createdProdId, quantity: 2 }]
    }
  });
  const res = await sfOrdersIndex.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.orderId, createdOrderId);
  assert.equal(data.isExisting, true);

  const countRow = await env.DB.prepare('SELECT COUNT(*) as count FROM orders WHERE idempotency_key = ?').bind(testIdempotencyKey).first();
  assert.equal(countRow.count, 1, 'Duplicate submissions must not duplicate order rows');
});

// 6. CUSTOMER DATA PRIVACY & CROSS-CUSTOMER ISOLATION
await test('12. Customer B cannot view Customer A order (Cross-customer isolation)', async () => {
  const reqB = makeRequest('http://storefront/api/auth/dev-login', {
    method: 'POST',
    body: { customEmail: 'customer.b@example.com', customName: 'Customer B', customId: 'cust-b-id' }
  });
  const resB = await sfDevLogin.onRequestPost(makeContext(reqB, env));
  const setCookieB = resB.headers.get('Set-Cookie');
  const matchB = setCookieB.match(/swayari_customer_session=([^;]+)/);
  const customerBCookie = `swayari_customer_session=${matchB[1]}`;

  const req = makeRequest(`http://storefront/api/orders/${createdOrderId}`, { cookie: customerBCookie });
  const res = await sfOrderDetails.onRequestGet(makeContext(req, env, { id: createdOrderId }));
  assert.equal(res.status, 403, 'Customer B must be prohibited from viewing Customer A orders');
});

// 7. ADMIN QUOTATIONS, CONFIDENTIAL INTERNAL NOTES & STOREFRONT CONCEALMENT
await test('13. Admin logs internal staff note and customer API completely omits it', async () => {
  // Admin adds internal note
  const reqAdm = makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'contacted',
      internalNote: 'Spoke with Ananya. Express courier to Hyderabad requested by Friday.'
    }
  });
  const resAdm = await admOrderDetails.onRequestPatch(makeContext(reqAdm, env, { id: createdOrderId }));
  assert.equal(resAdm.status, 200);

  // Admin verifies internal note is present
  const reqAdmView = makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, { cookie: adminCookie });
  const resAdmView = await admOrderDetails.onRequestGet(makeContext(reqAdmView, env, { id: createdOrderId }));
  const dataAdm = await resAdmView.json();
  assert.equal(dataAdm.order.internalNotes.length, 1);
  assert.equal(dataAdm.order.internalNotes[0].note.includes('Spoke with Ananya'), true);

  // Customer fetches their own order details
  const reqCust = makeRequest(`http://storefront/api/orders/${createdOrderId}`, { cookie: customerCookie });
  const resCust = await sfOrderDetails.onRequestGet(makeContext(reqCust, env, { id: createdOrderId }));
  const dataCust = await resCust.json();

  assert.equal(dataCust.order.status, 'contacted');
  // Internal notes field must be undefined / absent from customer response
  assert.equal(dataCust.order.internalNotes, undefined, 'Customer API must NEVER leak internal notes');
});

await test('14. Admin quotation revisions do not overwrite original request items', async () => {
  const reqAdm = makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'quoted',
      quotation: {
        items: [
          {
            productId: createdProdId,
            productName: 'Mayur Sri Ganesha Devotional Frame',
            quantity: 2,
            agreedUnitPrice: 85
          }
        ],
        shippingCharge: 50,
        taxAmount: 0,
        quotationNotes: 'Multi-layer bubble wrap & wooden box included.'
      }
    }
  });
  const resAdm = await admOrderDetails.onRequestPatch(makeContext(reqAdm, env, { id: createdOrderId }));
  assert.equal(resAdm.status, 200);

  // Verify original snapshot price remains immutable
  const items = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(createdOrderId).all();
  assert.equal(items.results[0].snapshot_indicative_price, 89, 'Original snapshot price must remain intact');

  // Verify quotation table has Revision #1
  const quotes = await env.DB.prepare('SELECT * FROM order_quotations WHERE order_id = ?').bind(createdOrderId).all();
  assert.equal(quotes.results.length, 1);
  assert.equal(quotes.results[0].revision_number, 1);
  assert.equal(quotes.results[0].total_quoted_amount, 85 * 2 + 50); // 220
});

// 8. PRODUCT ARCHIVAL PRESERVES HISTORICAL ORDERS
await test('15. Soft-archiving a product hides it from storefront while preserving past orders', async () => {
  const reqArch = makeRequest(`http://admin/api/admin/products/${createdProdId}`, {
    method: 'DELETE',
    cookie: adminCookie
  });
  const resArch = await admProductDetails.onRequestDelete(makeContext(reqArch, env, { id: createdProdId }));
  assert.equal(resArch.status, 200);

  // Storefront hides archived product
  const reqStore = makeRequest('http://storefront/api/products');
  const resStore = await sfProductsList.onRequestGet(makeContext(reqStore, env));
  const dataStore = await resStore.json();
  assert.equal(dataStore.products.find(p => p.id === createdProdId), undefined);

  // Past customer order still loads snapshot cleanly
  const reqCust = makeRequest(`http://storefront/api/orders/${createdOrderId}`, { cookie: customerCookie });
  const resCust = await sfOrderDetails.onRequestGet(makeContext(reqCust, env, { id: createdOrderId }));
  const dataCust = await resCust.json();
  assert.equal(dataCust.order.items[0].sku, 'SWY-FRAME-DEV-01');
  assert.equal(dataCust.order.items[0].name, 'Mayur Sri Ganesha Devotional Frame');
});

// 9. DASHBOARD STATS
await test('16. Admin stats endpoint accurately reports metrics from shared D1 database', async () => {
  const req = makeRequest('http://admin/api/admin/stats', { cookie: adminCookie });
  const res = await admStats.onRequestGet(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.stats.orders.total, 1);
  assert.equal(data.stats.orders.quoted, 1);
  assert.equal(data.stats.totalRevenueQuoted, 220);
});

// 11. HARDENING ADDED WITH THE EDITORIAL REDESIGN (Milestone 3)
await test('17. Dev login is deny-by-default when ENVIRONMENT is missing or not "development"', async () => {
  for (const value of [undefined, '', 'staging', 'Production']) {
    const e = { ...env, ENVIRONMENT: value };
    const sf = await sfDevLogin.onRequestPost(makeContext(makeRequest('http://storefront/api/auth/dev-login', { method: 'POST', body: {} }), e));
    const adm = await admDevLogin.onRequestPost(makeContext(makeRequest('http://admin/api/auth/dev-login', { method: 'POST', body: {} }), e));
    assert.equal(sf.status, 403, `Storefront dev login must be refused for ENVIRONMENT=${value}`);
    assert.equal(adm.status, 403, `Admin dev login must be refused for ENVIRONMENT=${value}`);
  }
});

await test('18. Sample items and archived products cannot be requested in production', async () => {
  const prodEnv = { ...env, ENVIRONMENT: 'production' };
  const base = {
    customerName: 'Ananya Sharma', customerPhone: '9876543210', deliveryAddress: 'Flat 402, Royal Palms',
    deliveryCity: 'Hyderabad', deliveryState: 'Telangana', deliveryPincode: '500034'
  };
  const demoReq = makeRequest('http://storefront/api/orders', {
    method: 'POST', cookie: customerCookie,
    body: { ...base, idempotencyKey: 'demo-attempt-12345678', items: [{ productId: 'demo-prod-radha-krishna-frame', quantity: 1 }] }
  });
  const demoRes = await sfOrdersIndex.onRequestPost(makeContext(demoReq, prodEnv));
  assert.equal(demoRes.status, 400, 'Preview samples must be rejected outside development');

  const archivedReq = makeRequest('http://storefront/api/orders', {
    method: 'POST', cookie: customerCookie,
    body: { ...base, idempotencyKey: 'archived-attempt-1234', items: [{ productId: createdProdId, quantity: 1 }] }
  });
  const archivedRes = await sfOrdersIndex.onRequestPost(makeContext(archivedReq, prodEnv));
  assert.equal(archivedRes.status, 404, 'Archived products must not be requestable');
});

await test('19. A request reference (idempotency key) cannot be reused by a different customer', async () => {
  const login = await sfDevLogin.onRequestPost(makeContext(makeRequest('http://storefront/api/auth/dev-login', {
    method: 'POST', body: { customEmail: 'customer.c@example.com', customName: 'Customer C', customId: 'cust-c-id' }
  }), env));
  const cookieC = 'swayari_customer_session=' + login.headers.get('Set-Cookie').match(/swayari_customer_session=([^;]+)/)[1];
  const res = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST', cookie: cookieC,
    body: {
      idempotencyKey: testIdempotencyKey, customerName: 'Customer C', customerPhone: '9123456780',
      deliveryAddress: 'House 7, MG Road', deliveryCity: 'Pune', deliveryState: 'Maharashtra', deliveryPincode: '411001',
      items: [{ productId: 'demo-prod-hanuman-frame', quantity: 1 }]
    }
  }), env));
  assert.equal(res.status, 409, 'Another customer must not receive an existing order via its key');
});

await test('20. Editing a sample product without the isDemo field keeps it hidden from the storefront', async () => {
  const res = await admProductDetails.onRequestPut(makeContext(makeRequest('http://admin/api/admin/products/demo-prod-hanuman-frame', {
    method: 'PUT', cookie: adminCookie,
    body: { sku: 'SWY-DEMO-004', name: 'Hanuman Framed Relief', slug: 'hanuman-framed-relief-sample', description: 'Edited description', status: 'published' }
  }), env, { id: 'demo-prod-hanuman-frame' }));
  assert.equal(res.status, 200);
  const row = await env.DB.prepare('SELECT is_demo FROM products WHERE id = ?').bind('demo-prod-hanuman-frame').first();
  assert.equal(row.is_demo, 1, 'Sample flag must be preserved');
  const list = await (await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products'), env))).json();
  assert.equal(list.products.some(p => p.id === 'demo-prod-hanuman-frame'), false);
});

await test('21. Sample product pages are only served when the preview dataset is requested', async () => {
  const slug = 'radha-krishna-embossed-frame-sample';
  const hidden = await sfProductSlug.onRequestGet(makeContext(makeRequest(`http://storefront/api/products/${slug}`), env, { slug }));
  assert.equal(hidden.status, 404);
  const shown = await sfProductSlug.onRequestGet(makeContext(makeRequest(`http://storefront/api/products/${slug}?include_demo=1`), env, { slug }));
  assert.equal(shown.status, 200);
  assert.equal((await shown.json()).product.isDemo, true);
});

await test('22. Each portal exposes only its own OAuth client ID', async () => {
  const sf = await (await sfAuthConfig.onRequestGet(makeContext(makeRequest('http://storefront/api/auth/config'), env))).json();
  const adm = await (await admAuthConfig.onRequestGet(makeContext(makeRequest('http://admin/api/auth/config'), env))).json();
  assert.equal(sf.googleClientId, env.GOOGLE_STOREFRONT_CLIENT_ID);
  assert.equal(adm.googleClientId, env.GOOGLE_ADMIN_CLIENT_ID);
  assert.notEqual(sf.googleClientId, adm.googleClientId);
  const prod = await (await sfAuthConfig.onRequestGet(makeContext(makeRequest('http://storefront/api/auth/config'), { ...env, ENVIRONMENT: 'production' }))).json();
  assert.equal(prod.devLoginAvailable, false);
});

await test('23. Customer order history returns the customer-facing shape without internal fields', async () => {
  const res = await sfOrderDetails.onRequestGet(makeContext(makeRequest('http://storefront/api/orders/my', { cookie: customerCookie }), env, { id: 'my' }));
  const data = await res.json();
  assert.equal(res.status, 200);
  const o = data.orders.find(x => x.id === createdOrderId);
  assert.ok(o, 'Own order must be listed');
  assert.ok(o.createdAt && o.deliveryCity && typeof o.itemCount === 'number');
  assert.equal(JSON.stringify(data).includes('Spoke with Ananya'), false, 'Internal notes must never appear');
});

await test('24. Storefront deployment contains no admin handlers, routes or admin API calls', async () => {
  const sfFunctions = path.join(process.cwd(), 'apps', 'storefront', 'functions');
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
  const files = walk(sfFunctions).map(f => path.relative(sfFunctions, f));
  assert.equal(files.some(f => f.split(path.sep).includes('admin')), false, 'No admin function files in storefront');
  const distDir = path.join(process.cwd(), 'apps', 'storefront', 'dist', 'assets');
  const bundle = fs.readdirSync(distDir).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(distDir, f), 'utf8')).join('\n');
  assert.equal(bundle.includes('/api/admin'), false, 'Storefront bundle must not call admin APIs');
  assert.equal(/Staff portal|Order requests, catalogue and customer follow-up/.test(bundle), false, 'Storefront bundle must not include admin screens');
  const html = fs.readFileSync(path.join(process.cwd(), 'apps', 'storefront', 'dist', 'index.html'), 'utf8');
  assert.equal(html.includes('admin'), false);
});

// 10. PRODUCTION BUILDS VERIFICATION
await test('25. Production Vite builds exist for both Storefront and Admin', async () => {
  const sfDist = path.join(process.cwd(), 'apps', 'storefront', 'dist', 'index.html');
  const admDist = path.join(process.cwd(), 'apps', 'admin', 'dist', 'index.html');
  assert.ok(fs.existsSync(sfDist), 'Storefront dist/index.html must exist');
  assert.ok(fs.existsSync(admDist), 'Admin dist/index.html must exist');
});

// 11. CATALOGUE FILTER TESTS (real kit catalogue from all migrations)
const kitEnv = { ...env, DB: createMockD1(), MIN_ORDER_FRAMES: undefined };
await test('26. Price filters return only items inside each band', async () => {
  const bands = { 'under-299': [0, 299], '300-999': [300, 999], '1000-2999': [1000, 2999], 'under-2999': [0, 2999] };
  for (const [band, [min, max]] of Object.entries(bands)) {
    const res = await sfProductsList.onRequestGet(makeContext(makeRequest(`http://storefront/api/products?budget=${band}`), kitEnv));
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.products.length > 0, `Band ${band} must have products`);
    for (const p of data.products) {
      assert.ok(p.indicativePrice !== null && p.indicativePrice >= min && p.indicativePrice <= max, `Product ${p.sku} price ${p.indicativePrice} must be between ${min} and ${max}`);
    }
  }

  // Deity filter matches the tag words on each product
  const resGanesh = await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products?deity=ganesh'), kitEnv));
  const dataGanesh = await resGanesh.json();
  assert.ok(dataGanesh.products.length >= 8, 'Must have Ganesh designs across products');
  for (const p of dataGanesh.products) {
    assert.ok(p.deity.toLowerCase().includes('ganesh'), `${p.name} must be tagged Ganesh`);
  }
});

await test('27. Bulk order requests capture occasion, requiredDate, and tiered pricing with tiered pricing', async () => {
  const bulkPayload = {
    idempotencyKey: 'test-bulk-req-12345',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    deliveryAddress: 'Flat 402, Lotus Residency, MG Road',
    deliveryCity: 'Bengaluru',
    deliveryState: 'Karnataka',
    deliveryPincode: '560001',
    occasion: 'Wedding & Return Gifting',
    requiredDate: '2026-11-15',
    isBulkRequest: true,
    items: [
      {
        productId: 'demo-prod-godframe-01',
        productSku: 'SWY-FRAME-001',
        productName: 'Sri Venkateswara Sanctum Gold Frame',
        quantity: 50
      }
    ]
  };

  const req = makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: bulkPayload
  });
  const res = await sfOrdersIndex.onRequestPost(makeContext(req, env));
  const data = await res.json();
  assert.equal(res.status, 201);
  assert.equal(data.success, true);
  assert.ok(data.orderId);

  // Verify in admin orders API
  const adminRes = await admOrderDetails.onRequestGet(makeContext(makeRequest(`http://admin/api/admin/orders/${data.orderId}`, { cookie: adminCookie }), env, { id: data.orderId }));
  const adminData = await adminRes.json();
  assert.equal(adminRes.status, 200);
  assert.equal(adminData.order.occasion, 'Wedding & Return Gifting');
  assert.equal(adminData.order.requiredDate, '2026-11-15');
  assert.equal(adminData.order.isBulkRequest, true);
  // Tiered pricing applied: 50 pcs tiered price for SWY-FRAME-001 is 69/pc instead of indicative 89!
  assert.equal(adminData.order.items[0].indicativePrice, 69);
});

// 12. PRICE SANITY RULES
await test('28. Server-side order request rejects implausible prices', async () => {
  // Directly insert an item with a broken price for testing rejection
  await env.DB.prepare(`
    INSERT OR REPLACE INTO products (id, sku, name, slug, description, indicative_price, min_quantity, status, is_demo, created_at, updated_at)
    VALUES ('test-expensive-frame', 'SWY-TEST-EXP', 'Overpriced Frame', 'overpriced-frame', 'Test frame', 250000, 1, 'published', 0, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z')
  `).run();

  const req = makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: {
      idempotencyKey: 'test-expensive-reject-' + Date.now(),
      customerName: 'Ananya Sharma',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 402, Banjara Hills',
      deliveryCity: 'Hyderabad',
      deliveryState: 'Telangana',
      deliveryPincode: '500034',
      items: [{ productId: 'test-expensive-frame', quantity: 1 }]
    }
  });
  const res = await sfOrdersIndex.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error.includes('no longer available'), 'Items above the ₹2,999 store limit cannot be requested');
  await env.DB.prepare("UPDATE products SET status = 'archived' WHERE id = 'test-expensive-frame'").run();
});

await test('29. Admin product creation rejects indicative price or variants above the ₹20,000 sanity cap', async () => {
  const reqOver = makeRequest('http://admin/api/admin/products', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      sku: 'SWY-OVER-01',
      name: 'Overpriced Devotional Frame',
      slug: 'overpriced-devotional-frame',
      description: 'Above the sanity cap',
      indicativePrice: 25000,
      minQuantity: 1,
      status: 'published'
    }
  });
  const resOver = await admProductsList.onRequestPost(makeContext(reqOver, env));
  assert.equal(resOver.status, 400);

  const reqVariantOver = makeRequest('http://admin/api/admin/products', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      sku: 'SWY-OVER-VAR',
      name: 'Variant Overpriced Frame',
      slug: 'variant-overpriced-frame',
      description: 'Variant exceeds 99',
      indicativePrice: 79,
      hasVariants: true,
      variants: [{ id: 'large', name: 'Large', indicative_price: 25000 }],
      minQuantity: 1,
      status: 'published'
    }
  });
  const resVariantOver = await admProductsList.onRequestPost(makeContext(reqVariantOver, env));
  assert.equal(resVariantOver.status, 400);
});

await test('30. Admin quotation revisions reject agreed unit prices above the ₹20,000 sanity cap', async () => {
  const reqOverQuote = makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'quoted',
      quotation: {
        items: [
          {
            productId: createdProdId,
            productName: 'Mayur Sri Ganesha Devotional Frame',
            quantity: 2,
            agreedUnitPrice: 25000 // Above the sanity cap
          }
        ],
        shippingCharge: 50,
        taxAmount: 0
      }
    }
  });
  const resOverQuote = await admOrderDetails.onRequestPatch(makeContext(reqOverQuote, env, { id: createdOrderId }));
  assert.equal(resOverQuote.status, 400);
  const data = await resOverQuote.json();
  assert.ok(data.error.includes('₹20,000'));
});

await test('31. Storefront lists only items under ₹2,999; the wall frames above it are hidden', async () => {
  const all = await (await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products'), kitEnv))).json();
  assert.equal(all.success, true);
  assert.ok(all.products.every(p => p.indicativePrice === null || p.indicativePrice <= 2999), 'Every listed item is ₹2,999 or less');
  assert.equal(all.products.some(p => ['kit-05-01', 'kit-06-01', 'kit-07-01'].includes(p.id)), false, 'Wall frames are not listed');
  const grand = all.products.find(p => p.id === 'kit-12-02');
  assert.ok(grand, 'Grand 14×17 god frames stay on the store');
  assert.equal(grand.indicativePrice, 1449);
  assert.equal(grand.mrp, 2199);
  assert.equal(grand.priceGroup, '12');
  const wall = await (await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products?category=wall-frames'), kitEnv))).json();
  assert.equal(wall.products.length, 0);
  const slug = '12-gods-silver-foil-wall-frame';
  const page = await sfProductSlug.onRequestGet(makeContext(makeRequest(`http://storefront/api/products/${slug}`), kitEnv, { slug }));
  assert.equal(page.status, 404, 'A wall frame page is not served');
  assert.equal(all.products.some(p => p.id === 'test-expensive-frame'), false);
});

await test('32. Bulk pricing is consistent across calculation, cart totals, and server order submission', async () => {
  // Sai Baba frame example: Base ₹65, 100-pc tier ₹42
  const saiBabaTiers = [
    { min_qty: 25, unit_price: 58 },
    { min_qty: 50, unit_price: 49 },
    { min_qty: 100, unit_price: 42 }
  ];

  // 1 pc -> base price 65
  assert.equal(calculateEffectiveUnitPrice(65, saiBabaTiers, 1), 65);
  assert.equal(calculateLineSubtotal(65, 1), 65);

  // 25 pcs -> 58
  assert.equal(calculateEffectiveUnitPrice(65, saiBabaTiers, 25), 58);
  assert.equal(calculateLineSubtotal(58, 25), 1450);

  // 100 pcs -> 42
  assert.equal(calculateEffectiveUnitPrice(65, saiBabaTiers, 100), 42);
  assert.equal(calculateLineSubtotal(42, 100), 4200);

  // Cart total must calculate 4,200 (NOT 6,500!)
  const cartTotals = calculateCartTotals([
    {
      productId: 'demo-prod-godframe-12',
      sku: 'SWY-FRAME-012',
      name: 'Shirdi Sai Baba Shraddha Saburi Frame',
      indicativePrice: 42,
      basePrice: 65,
      bulkTiers: saiBabaTiers,
      quantity: 100
    }
  ]);
  assert.equal(cartTotals.subtotal, 4200, 'Cart total must be ₹4,200 at 100 pieces (tier ₹42), not ₹6,500');
  assert.equal(cartTotals.totalQuantity, 100);

  // Server-side order submission must independently calculate ₹4,200 from D1 database
  const orderRes = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: {
      idempotencyKey: 'test-sai-baba-100pcs-' + Date.now(),
      customerName: 'Ananya Sharma',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 402, Banjara Hills',
      deliveryCity: 'Hyderabad',
      deliveryState: 'Telangana',
      deliveryPincode: '500034',
      items: [{ productId: 'demo-prod-godframe-12', quantity: 100 }]
    }
  }), env));

  assert.equal(orderRes.status, 201);
  const orderData = await orderRes.json();
  assert.equal(orderData.indicativeSubtotal, 4200, 'Server saved order must strictly total ₹4,200');
});

await test('33. Server and shared validator reject negative, zero, fractional, and malformed quantities, and enforce MOQ & order increments', async () => {
  // Shared validator checks
  assert.equal(validateQuantityRules(-5).isValid, false);
  assert.equal(validateQuantityRules(0).isValid, false);
  assert.equal(validateQuantityRules(2.5).isValid, false);
  assert.equal(validateQuantityRules('abc').isValid, false);
  assert.equal(validateQuantityRules(null).isValid, false);

  // MOQ & Increment enforcement in shared validator
  assert.equal(validateQuantityRules(5, 10, 5).isValid, false, 'Below MOQ 10 must fail');
  assert.equal(validateQuantityRules(12, 10, 5).isValid, false, 'Quantity 12 with inc 5 must fail');
  assert.equal(validateQuantityRules(15, 10, 5).isValid, true, 'Quantity 15 with MOQ 10, inc 5 must pass');

  // Server endpoint rejection
  const basePayload = {
    customerName: 'Ananya Sharma',
    customerPhone: '9876543210',
    deliveryAddress: 'Flat 402, Banjara Hills',
    deliveryCity: 'Hyderabad',
    deliveryState: 'Telangana',
    deliveryPincode: '500034'
  };

  // 1. Negative quantity
  const negRes = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: { ...basePayload, idempotencyKey: 'test-neg-' + Date.now(), items: [{ productId: 'demo-prod-godframe-01', quantity: -5 }] }
  }), env));
  assert.equal(negRes.status, 400);

  // 2. Zero quantity
  const zeroRes = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: { ...basePayload, idempotencyKey: 'test-zero-' + Date.now(), items: [{ productId: 'demo-prod-godframe-01', quantity: 0 }] }
  }), env));
  assert.equal(zeroRes.status, 400);

  // 3. Fractional quantity
  const fracRes = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: { ...basePayload, idempotencyKey: 'test-frac-' + Date.now(), items: [{ productId: 'demo-prod-godframe-01', quantity: 3.5 }] }
  }), env));
  assert.equal(fracRes.status, 400);

  // 4. Malformed quantity
  const malRes = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: { ...basePayload, idempotencyKey: 'test-mal-' + Date.now(), items: [{ productId: 'demo-prod-godframe-01', quantity: 'fifty' }] }
  }), env));
  assert.equal(malRes.status, 400);

  // 5. Below MOQ (SWY-FRAME-001 has MOQ=10, ordering 4)
  const moqRes = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: { ...basePayload, idempotencyKey: 'test-moq-' + Date.now(), items: [{ productId: 'demo-prod-godframe-01', quantity: 4 }] }
  }), env));
  assert.equal(moqRes.status, 400);
  assert.ok((await moqRes.json()).error.includes('minimum order quantity'));

  // 6. Violates increment (SWY-FRAME-001 has MOQ=10, inc=5. Ordering 12)
  const incRes = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: { ...basePayload, idempotencyKey: 'test-inc-' + Date.now(), items: [{ productId: 'demo-prod-godframe-01', quantity: 12 }] }
  }), env));
  assert.equal(incRes.status, 400);
  assert.ok((await incRes.json()).error.includes('multiples of 5'));
});

await test('34. Duplicate lines in cart or order request are aggregated cleanly per design and cannot bypass MOQ or pricing', async () => {
  // In cart: 2 items of Sai Baba frame (50 pcs + 50 pcs)
  const cartItems = [
    {
      productId: 'demo-prod-godframe-12',
      sku: 'SWY-FRAME-012',
      name: 'Shirdi Sai Baba Shraddha Saburi Frame',
      indicativePrice: 65,
      basePrice: 65,
      bulkTiers: [{ min_qty: 100, unit_price: 42 }],
      quantity: 50,
      customisationNote: 'First batch'
    },
    {
      productId: 'demo-prod-godframe-12',
      sku: 'SWY-FRAME-012',
      name: 'Shirdi Sai Baba Shraddha Saburi Frame',
      indicativePrice: 65,
      basePrice: 65,
      bulkTiers: [{ min_qty: 100, unit_price: 42 }],
      quantity: 50,
      customisationNote: 'Second batch'
    }
  ];

  const aggregated = aggregateCartItems(cartItems);
  assert.equal(aggregated.length, 1, 'Duplicate lines must combine into a single aggregated line');
  assert.equal(aggregated[0].quantity, 100);
  assert.equal(aggregated[0].indicativePrice, 42, 'Aggregated 100 pieces must receive 100-pc bulk tier');

  // Submit to server with 2 lines for same design (50 + 50)
  const res = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: {
      idempotencyKey: 'test-dup-lines-' + Date.now(),
      customerName: 'Ananya Sharma',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 402, Banjara Hills',
      deliveryCity: 'Hyderabad',
      deliveryState: 'Telangana',
      deliveryPincode: '500034',
      items: [
        { productId: 'demo-prod-godframe-12', quantity: 50, customisationNote: 'Batch A' },
        { productId: 'demo-prod-godframe-12', quantity: 50, customisationNote: 'Batch B' }
      ]
    }
  }), env));

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.indicativeSubtotal, 4200, 'Aggregated total 100 pcs must evaluate to ₹4,200');

  // Verify in order details that items were combined into 1 line item
  const ord = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(data.orderId).all();
  assert.equal(ord.results.length, 1);
  assert.equal(ord.results[0].quantity, 100);
  assert.equal(ord.results[0].snapshot_indicative_price, 42);
});

await test('35. Monetary calculation enforces integer paise, rejects > ₹20,000 and malformed/over-precision values', async () => {
  assert.equal(validatePricePaise(99).isValid, true);
  assert.equal(validatePricePaise(99).paise, 9900);
  assert.equal(validatePricePaise(49.50).isValid, true);
  assert.equal(validatePricePaise(49.50).paise, 4950);
  assert.equal(validatePricePaise(6799).isValid, true);
  assert.equal(validatePricePaise(20000).isValid, true);

  // Above the sanity cap
  assert.equal(validatePricePaise(20000.01).isValid, false);
  assert.equal(validatePricePaise(25000).isValid, false);

  // Over-precision (more than 2 decimal places)
  assert.equal(validatePricePaise(49.999).isValid, false);
  assert.ok(validatePricePaise(49.999).error.includes('decimal places'));

  // Negative / zero / malformed
  assert.equal(validatePricePaise(0).isValid, false);
  assert.equal(validatePricePaise(-10).isValid, false);
  assert.equal(validatePricePaise('invalid').isValid, false);
});

await test('36. Admin quotation revision strictly rejects invalid prices, negative charges, and fractional quantities', async () => {
  // 1. Quoted unit price above the ₹20,000 sanity cap
  const overPriceRes = await admOrderDetails.onRequestPatch(makeContext(makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'quoted',
      quotation: {
        items: [{ productId: createdProdId, quantity: 2, agreedUnitPrice: 20005 }],
        shippingCharge: 50
      }
    }
  }), env, { id: createdOrderId }));
  assert.equal(overPriceRes.status, 400);

  // 2. Negative shipping charge
  const negShipRes = await admOrderDetails.onRequestPatch(makeContext(makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'quoted',
      quotation: {
        items: [{ productId: createdProdId, quantity: 2, agreedUnitPrice: 85 }],
        shippingCharge: -20
      }
    }
  }), env, { id: createdOrderId }));
  assert.equal(negShipRes.status, 400);
  assert.ok((await negShipRes.json()).error.includes('Shipping charge must be a non-negative'));

  // 3. Negative tax amount
  const negTaxRes = await admOrderDetails.onRequestPatch(makeContext(makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'quoted',
      quotation: {
        items: [{ productId: createdProdId, quantity: 2, agreedUnitPrice: 85 }],
        shippingCharge: 50,
        taxAmount: -10
      }
    }
  }), env, { id: createdOrderId }));
  assert.equal(negTaxRes.status, 400);

  // 4. Fractional quantity
  const fracQtyRes = await admOrderDetails.onRequestPatch(makeContext(makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'quoted',
      quotation: {
        items: [{ productId: createdProdId, quantity: 2.5, agreedUnitPrice: 85 }],
        shippingCharge: 50
      }
    }
  }), env, { id: createdOrderId }));
  assert.equal(fracQtyRes.status, 400);
});

await test('37. Migration 0008 preserves owner categories, products, banners, orders, quotations and notes without destructive cascade', async () => {
  // Test isolated database migration safety: simulate a database at 0007, then upgrade to 0008
  const { DatabaseSync } = await import('node:sqlite');
  const pre0008Db = new DatabaseSync(':memory:');
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const preFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && f < '0008')
    .sort();

  for (const f of preFiles) {
    pre0008Db.exec(fs.readFileSync(path.join(migrationsDir, f), 'utf8'));
  }

  // Insert owner category
  pre0008Db.prepare(`
    INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at)
    VALUES ('owner-cat-festive', 'Festive Special', 'festive-special', 'Owner collection', 99, 1, '2026-10-18T00:00:00Z')
  `).run();

  // Insert owner product linked to category
  pre0008Db.prepare(`
    INSERT INTO products (id, sku, name, slug, description, category_id, indicative_price, min_quantity, status, is_demo, created_at, updated_at)
    VALUES ('owner-prod-001', 'OWNER-SKU-01', 'Owner Divine Frame', 'owner-divine-frame', 'Owner frame', 'owner-cat-festive', 75, 1, 'published', 0, '2026-10-18T00:00:00Z', '2026-10-18T00:00:00Z')
  `).run();

  // Insert owner banner
  pre0008Db.prepare(`
    INSERT INTO campaign_banners (
      id, badge, headline, emphasis, supporting, cta_text, cta_href,
      desktop_image, mobile_image, alt, display_order, is_active, created_at, updated_at
    ) VALUES (
      'owner-banner-001', 'Custom Festive Collection', 'Owner bespoke headline', 'Special',
      'Owner bespoke supporting', 'Shop Now', '/shop',
      '/assets/owner/banner-desktop.webp', '/assets/owner/banner-mobile.webp',
      'Owner banner alt', 10, 1, '2026-10-18T00:00:00Z', '2026-10-18T00:00:00Z'
    )
  `).run();

  // Execute migration 0008 SQL directly to upgrade database
  const migration0008Path = path.join(process.cwd(), 'migrations', '0008_devotional_frames_99.sql');
  const sql = fs.readFileSync(migration0008Path, 'utf8');
  pre0008Db.exec(sql);

  // 1. Verify owner category is intact
  const cat = pre0008Db.prepare('SELECT * FROM categories WHERE id = ?').get('owner-cat-festive');
  assert.ok(cat, 'Owner category must be preserved');
  assert.equal(cat.name, 'Festive Special');

  // 2. Verify owner product's category_id was NOT set to NULL (No foreign key deletion cascade)
  const prod = pre0008Db.prepare('SELECT * FROM products WHERE id = ?').get('owner-prod-001');
  assert.ok(prod, 'Owner product must be preserved');
  assert.equal(prod.category_id, 'owner-cat-festive', 'Owner product category association must remain intact');

  // 3. Verify owner banner was NOT wiped out by blanket DELETE FROM campaign_banners
  const banner = pre0008Db.prepare('SELECT * FROM campaign_banners WHERE id = ?').get('owner-banner-001');
  assert.ok(banner, 'Owner banner must be preserved');
  assert.equal(banner.headline, 'Owner bespoke headline');
});

await test('38. Admin photo management endpoint validates magic bytes, size limits, and returns local manifest assets', async () => {
  // 1. Assets listing returns catalogue photos
  const listRes = await admAssets.onRequestGet(makeContext(makeRequest('http://admin/api/admin/assets', { cookie: adminCookie }), env));
  assert.equal(listRes.status, 200);
  const listData = await listRes.json();
  assert.equal(listData.success, true);
  assert.ok(Array.isArray(listData.assets));
  assert.ok(listData.assets.length > 0, 'Manifest assets must be returned');

  // 2. Asset upload requires admin authentication
  const unauthRes = await admAssets.onRequestPost(makeContext(makeRequest('http://admin/api/admin/assets', {
    method: 'POST',
    body: { fileName: 'test.jpg', base64Data: 'dGVzdA==' }
  }), env));
  assert.equal(unauthRes.status, 401, 'Upload must require admin authentication');

  // 3. Asset upload rejects invalid/spoofed image format (non-JPEG/PNG/WebP magic bytes)
  const badImageRes = await admAssets.onRequestPost(makeContext(makeRequest('http://admin/api/admin/assets', {
    method: 'POST',
    cookie: adminCookie,
    body: { fileName: 'fake.jpg', base64Data: Buffer.from('NOT AN IMAGE FILE').toString('base64') }
  }), env));
  assert.equal(badImageRes.status, 400);
  assert.ok((await badImageRes.json()).error.includes('magic bytes'));
});

await test('39. Sample data is strictly isolated when ENVIRONMENT is missing, empty, or misspelled', async () => {
  const invalidEnvironments = [undefined, '', 'staging', 'preview-typo', 'deveopment'];

  for (const envVal of invalidEnvironments) {
    const testEnv = { ...env, ENVIRONMENT: envVal };

    // Storefront product list with include_demo=1 must ignore include_demo and return 0 demo products
    const sfRes = await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products?include_demo=1'), testEnv));
    const sfData = await sfRes.json();
    assert.equal(sfData.success, true);
    for (const p of sfData.products) {
      assert.equal(p.isDemo, false, `Demo item ${p.sku} leaked under ENVIRONMENT="${envVal}"`);
    }

    // Direct order submission for demo item must be blocked
    const ordRes = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
      method: 'POST',
      cookie: customerCookie,
      body: {
        idempotencyKey: 'test-env-leak-' + Date.now(),
        customerName: 'Ananya Sharma',
        customerPhone: '9876543210',
        deliveryAddress: 'Flat 402',
        deliveryCity: 'Hyderabad',
        deliveryState: 'Telangana',
        deliveryPincode: '500034',
        items: [{ productId: 'demo-prod-godframe-01', quantity: 10 }]
      }
    }), testEnv));
    assert.equal(ordRes.status, 400, `Demo order must be refused under ENVIRONMENT="${envVal}"`);
  }
});

// GOD FRAMES CATALOGUE (all migrations, no legacy fixtures)
const liveDb = createMockD1();
const liveRows = sql => liveDb._rawDb.prepare(sql).all();

await test('40. Live catalogue is the 98 designs under ₹2,999 in four categories at the exact kit prices', async () => {
  const products = liveRows("SELECT * FROM products WHERE status = 'published' AND is_demo = 0");
  assert.equal(products.length, 98, '91 kit designs + 7 3D colour god stands are for sale');
  assert.ok(products.every(p => p.indicative_price <= 2999), 'Nothing above ₹2,999 is for sale');
  // The wall frames are archived (kept for earlier requests), with their kit prices intact
  const kit = liveRows("SELECT * FROM products WHERE id LIKE 'kit-%'");
  assert.equal(kit.length, 101);
  const byId = Object.fromEntries(kit.map(p => [p.id, p]));
  assert.deepEqual(['kit-05-01', 'kit-06-01', 'kit-07-01'].map(id => byId[id].status), ['archived', 'archived', 'archived']);
  const tiers = id => JSON.parse(byId[id].bulk_tiers_json).map(t => t.unit_price);
  // Spot checks against the kit's price table
  assert.deepEqual(tiers('kit-01-01'), [549, 469, 429, 399]);
  assert.deepEqual(tiers('kit-01-03'), [499, 419, 389, 359]);
  assert.deepEqual(tiers('kit-02-04'), [899, 799, 749, 699]);
  assert.deepEqual(tiers('kit-03-07'), [99, 59, 49, 39]);
  assert.deepEqual(tiers('kit-07-01'), [6799, 6299, 5999, 5799]);
  assert.deepEqual(tiers('kit-12-02'), [1449, 1249, 1149, 1099]);
  assert.equal(byId['kit-02-03'].mrp, 1599);
  assert.equal(byId['kit-01-03'].price_group, '01B');
  const stand = JSON.parse(byId['kit-04-02'].variants_json);
  assert.deepEqual(stand.map(v => [v.name, v.mrp, v.tiers.map(t => t.unit_price)]), [
    ['No. 1 (small)', 149, [89, 69, 59, 49]],
    ['No. 2 (medium)', 299, [169, 139, 119, 99]],
    ['No. 3 (large)', 599, [349, 289, 249, 219]]
  ]);
  assert.deepEqual(JSON.parse(byId['kit-09-01'].variants_json).map(v => v.tiers.map(t => t.min_qty)), [[1, 3, 10, 25], [1, 3, 10, 25]]);
  // 3D colour god stands (cost ₹150): one size, seven designs share one slab group
  const stands3d = kit.filter(p => p.price_group === '13');
  assert.equal(stands3d.length, 7);
  for (const p of stands3d) {
    assert.equal(p.category_id, 'cat-god-stands');
    assert.equal(p.status, 'published');
    assert.equal(p.mrp, 599);
    assert.equal(p.has_variants, 0);
    assert.deepEqual(tiers(p.id), [349, 299, 269, 249]);
    assert.equal(JSON.parse(p.images).length, 2, `${p.name}: stand photo and close-up`);
  }
  for (const p of products) {
    const prices = JSON.parse(p.bulk_tiers_json).map(t => t.unit_price);
    assert.ok(prices.every(x => x % 10 === 9), `${p.name}: every price ends in 9`);
    assert.ok(!/999 silver|fine silver|pure silver/i.test(p.description), `${p.name}: no purity claims`);
  }
  const categories = liveRows('SELECT name FROM categories WHERE is_active = 1 ORDER BY display_order');
  assert.deepEqual(categories.map(c => c.name), ['God Frames', 'Stotram Frames', 'God Stands', 'Stotram Cards']);
});

await test('41. "Silver" never appears on its own in catalogue or banner text', async () => {
  const texts = [
    ...liveRows('SELECT name, slug, description, material, set_contents, customisation_info FROM products'),
    ...liveRows('SELECT name, slug, description FROM categories'),
    ...liveRows('SELECT badge, headline, emphasis, supporting, alt FROM campaign_banners WHERE is_active = 1')
  ].flatMap(r => Object.values(r)).filter(v => typeof v === 'string');
  for (const t of texts) {
    const loose = t.toLowerCase().replace(/silver[ -]foil/g, '');
    assert.ok(!loose.includes('silver'), `Plain "silver" found in: ${t}`);
  }
});

await test('42. Every product and active banner image exists on disk', async () => {
  const assetsRoot = path.join(process.cwd(), 'public');
  const paths = new Set();
  for (const p of liveRows("SELECT images FROM products WHERE status = 'published'")) {
    const imgs = JSON.parse(p.images);
    assert.ok(imgs.length >= 1, 'Each product has at least one photo');
    imgs.forEach(i => paths.add(i));
  }
  for (const b of liveRows('SELECT desktop_image, mobile_image FROM campaign_banners WHERE is_active = 1')) {
    paths.add(b.desktop_image);
    paths.add(b.mobile_image);
  }
  for (const rel of paths) {
    const full = path.join(assetsRoot, rel);
    assert.ok(fs.existsSync(full), `${rel} must exist`);
    assert.ok(fs.statSync(full).size > 5000, `${rel} must not be empty`);
  }
});

await test('43. Designs of one product and size share a slab; a single piece can be requested', async () => {
  const realEnv = kitEnv;
  const login = await sfDevLogin.onRequestPost(makeContext(makeRequest('http://storefront/api/auth/dev-login', {
    method: 'POST', body: { customEmail: 'slab.order@example.com', customName: 'Slab Order' }
  }), realEnv));
  const cookie = `swayari_customer_session=${login.headers.get('Set-Cookie').match(/swayari_customer_session=([^;]+)/)[1]}`;
  const order = (key, items) => sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST', cookie,
    body: {
      idempotencyKey: key, customerName: 'Slab Order', customerPhone: '9876543210',
      deliveryAddress: '12 Temple Street', deliveryCity: 'Tirupati', deliveryState: 'Andhra Pradesh', deliveryPincode: '517501',
      items
    }
  }), realEnv));
  // The kit's own example: 60 stotram cards in 6 designs → 50–99 slab → ₹49 each → ₹2,940
  const cards = ['kit-03-01', 'kit-03-02', 'kit-03-03', 'kit-03-04', 'kit-03-05', 'kit-03-06'].map(productId => ({ productId, quantity: 10 }));
  const res = await order('slab-cards-' + Date.now(), cards);
  assert.equal(res.status, 201);
  assert.equal((await res.json()).indicativeSubtotal, 2940);

  // Sizes count separately: 6 + 6 stands of No. 1 (12 → ₹69) and 5 of No. 3 (₹349)
  const stands = await order('slab-stands-' + Date.now(), [
    { productId: 'kit-04-02', selectedVariant: 'No. 1 (small)', quantity: 6 },
    { productId: 'kit-04-03', selectedVariant: 'No. 1 (small)', quantity: 6 },
    { productId: 'kit-04-05', selectedVariant: 'No. 3 (large)', quantity: 5 }
  ]);
  assert.equal(stands.status, 201);
  assert.equal((await stands.json()).indicativeSubtotal, 12 * 69 + 5 * 349);

  // A product with sizes needs a valid size
  const noSize = await order('slab-nosize-' + Date.now(), [{ productId: 'kit-04-02', quantity: 2 }]);
  assert.equal(noSize.status, 400);

  // One piece is fine
  const one = await order('slab-one-' + Date.now(), [{ productId: 'kit-12-02', quantity: 1 }]);
  assert.equal(one.status, 201);
  assert.equal((await one.json()).indicativeSubtotal, 1449);

  // A wall frame (above ₹2,999) can no longer be requested
  const wall = await order('slab-wall-' + Date.now(), [{ productId: 'kit-07-01', quantity: 1 }]);
  assert.equal(wall.status, 404);
});

await test('44. Order requests with oversized fields are refused', async () => {
  const res = await sfOrdersIndex.onRequestPost(makeContext(makeRequest('http://storefront/api/orders', {
    method: 'POST', cookie: customerCookie,
    body: {
      idempotencyKey: 'too-long-' + Date.now(), customerName: 'Ananya Sharma', customerPhone: '9876543210',
      deliveryAddress: 'x'.repeat(5000), deliveryCity: 'Hyderabad', deliveryState: 'Telangana', deliveryPincode: '500034',
      items: [{ productId: createdProdId, quantity: 30 }]
    }
  }), env));
  assert.equal(res.status, 400);
});

await test('45. Middleware refuses state changes from foreign or missing origins', async () => {
  const prodEnv = { ...env, ENVIRONMENT: 'production' };
  const call = (mw, url, origin) => mw.onRequest(makeContext(makeRequest(url, {
    method: 'POST', headers: origin ? { Origin: origin } : {}, body: {}
  }), prodEnv));
  for (const [mw, url] of [[sfMiddleware, 'https://swayari-store.pages.dev/api/auth/google'], [admMiddleware, 'https://swayari-admin.pages.dev/api/auth/google']]) {
    assert.equal((await call(mw, url, 'https://localhost.evil.com')).status, 403, 'Look-alike localhost origin must be refused');
    assert.equal((await call(mw, url, 'https://evil.example')).status, 403, 'Foreign origin must be refused');
    assert.equal((await call(mw, url, null)).status, 403, 'Missing origin must be refused');
    assert.equal((await call(mw, url, new URL(url).origin)).status, 200, 'Same origin must pass');
  }
});

await test('46. Banner buttons can only link to pages on this site', async () => {
  const res = await admBannersList.onRequestPost(makeContext(makeRequest('http://admin/api/admin/banners', {
    method: 'POST', cookie: adminCookie,
    body: {
      headline: 'Test', ctaText: 'Go', ctaHref: 'javascript:alert(1)',
      desktopImage: '/assets/editorial/hero-god-frames-desktop.webp', mobileImage: '/assets/editorial/hero-god-frames-mobile.webp'
    }
  }), env));
  assert.equal(res.status, 400);
});

await test('47. Every page gets its own title, canonical address and status before it reaches the browser', async () => {
  const plan = href => planSeo(new URL(href), kitEnv);
  const home = await plan('https://swayari.com/');
  assert.equal(home.status, 200);
  assert.equal(home.canonical, 'https://swayari.com/');
  assert.ok(home.isHome);

  // A single collection filter is a page of its own; tracking codes and combinations are not
  const cards = await plan('https://swayari.com/shop?category=stotram-cards&utm_source=wa');
  assert.equal(cards.canonical, 'https://swayari.com/shop?category=stotram-cards');
  assert.match(cards.robots, /^index/);
  assert.match(cards.title, /Stotram Cards/i);
  const combo = await plan('https://swayari.com/shop?category=stotram-cards&budget=under-299');
  assert.match(combo.robots, /^noindex/);

  // Retired collections, old aliases and trailing slashes redirect
  assert.equal((await plan('https://swayari.com/shop?category=wall-frames')).redirect, '/shop');
  assert.equal((await plan('https://swayari.com/privacy')).redirect, '/privacy-policy');
  assert.equal((await plan('https://swayari.com/about/')).redirect, '/about');

  // A product above the price limit sends visitors to the shop; one for sale carries Product data
  const wallSlug = kitEnv.DB.prepare
    ? (await kitEnv.DB.prepare("SELECT slug FROM products WHERE id = 'kit-07-01'").first())?.slug
    : null;
  assert.ok(wallSlug, 'Wall frame row must still exist (archived, not deleted)');
  assert.equal((await plan(`https://swayari.com/product/${wallSlug}`)).redirect, '/shop');
  const forSaleSlug = (await kitEnv.DB.prepare("SELECT slug FROM products WHERE id = 'kit-12-02'").first()).slug;
  const product = await plan(`https://swayari.com/product/${forSaleSlug}`);
  assert.equal(product.status, 200);
  assert.equal(product.type, 'product');
  assert.ok(product.jsonLd.some(d => d['@type'] === 'Product' && d.offers), 'Product structured data with offers');
  assert.equal((await plan('https://swayari.com/product/no-such-frame')).status, 404);

  // Gift guides: the index, each article and unknown articles
  assert.ok(BLOG_POSTS.length >= 6, 'At least six gift guides');
  const post = BLOG_POSTS[0];
  const article = await plan(`https://swayari.com/blog/${post.slug}`);
  assert.equal(article.status, 200);
  assert.equal(article.type, 'article');
  assert.equal(article.canonical, `https://swayari.com/blog/${post.slug}`);
  assert.ok(article.jsonLd.some(d => d['@type'] === 'BlogPosting'));
  assert.equal((await plan('https://swayari.com/blog/not-a-guide')).status, 404);
  assert.equal((await plan('https://swayari.com/no-such-page')).status, 404);
  assert.match((await plan('https://swayari.com/checkout')).robots, /^noindex/);
});

await test('48. Gift guides follow the wording rules and fit search results', async () => {
  const slugs = new Set();
  for (const post of BLOG_POSTS) {
    assert.ok(!slugs.has(post.slug), `Duplicate slug ${post.slug}`);
    slugs.add(post.slug);
    assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    const title = post.metaTitle || post.title;
    assert.ok(`${title} | SWAYARI`.length <= 70, `Title too long: ${title}`);
    assert.ok(post.description.length >= 110 && post.description.length <= 165, `Description length ${post.description.length}: ${post.slug}`);
    assert.ok(fs.existsSync(path.join(process.cwd(), 'public', post.image)), `Missing image ${post.image}`);
    const text = [post.title, post.description, post.excerpt, post.html, ...(post.faq || []).flatMap(f => [f.q, f.a])].join(' ');
    assert.doesNotMatch(text, /999\s*(?:fine|silver)|silver\s*999|fine silver|pure silver|german silver|sterling|wall frame/i, `Wording rule broken in ${post.slug}`);
    for (const m of text.matchAll(/silver(?![ -]foil)/gi)) {
      assert.fail(`"silver" without "foil" in ${post.slug}: …${text.slice(Math.max(0, m.index - 30), m.index + 30)}…`);
    }
    assert.doesNotMatch(post.html, /<(script|style|iframe|img)\b/i, `Unexpected tag in ${post.slug}`);
    for (const [, href] of post.html.matchAll(/href="([^"]+)"/g)) {
      assert.ok(href.startsWith('/') || href.startsWith('#'), `External link in ${post.slug}: ${href}`);
    }
  }
  const res = await sfSitemap.onRequestGet({ env: kitEnv });
  const xml = await res.text();
  assert.ok(xml.includes(`<loc>https://swayari.com/blog/${BLOG_POSTS[0].slug}</loc>`), 'Sitemap lists the articles');
  assert.ok(xml.includes('<loc>https://swayari.com/shop?category=stotram-cards</loc>'), 'Sitemap lists collection pages');
  assert.ok(!xml.includes('wall-frame'), 'Sitemap leaves out the hidden wall frames');
});

console.log('====================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
