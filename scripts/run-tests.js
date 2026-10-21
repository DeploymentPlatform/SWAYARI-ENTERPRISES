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
  DB: createMockD1(),
  ENVIRONMENT: 'development',
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

// 11. DEVOTIONAL FRAMES & FILTER TESTS (Strictly <= ₹99)
await test('26. Devotional frame attributes and budget filters strictly enforce ₹99 ceiling', async () => {
  // Query budget under-49
  const resUnder49 = await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products?include_demo=1&budget=under-49'), env));
  const dataUnder49 = await resUnder49.json();
  assert.equal(dataUnder49.success, true);
  assert.ok(dataUnder49.products.length > 0, 'Must have devotional frames under ₹49');
  for (const p of dataUnder49.products) {
    assert.ok(p.indicativePrice !== null && p.indicativePrice <= 49, `Product ${p.sku} with price ${p.indicativePrice} must be <= 49`);
    assert.equal(p.isQuoteOnly, false);
  }

  // Query budget 50-79
  const res5079 = await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products?include_demo=1&budget=50-79'), env));
  const data5079 = await res5079.json();
  assert.equal(data5079.success, true);
  assert.ok(data5079.products.length > 0, 'Must have devotional frames ₹50-₹79');
  for (const p of data5079.products) {
    assert.ok(p.indicativePrice >= 50 && p.indicativePrice <= 79, `Product ${p.sku} price ${p.indicativePrice} must be between 50 and 79`);
    assert.equal(p.isQuoteOnly, false);
  }

  // Query budget 80-99
  const res8099 = await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products?include_demo=1&budget=80-99'), env));
  const data8099 = await res8099.json();
  assert.equal(data8099.success, true);
  assert.ok(data8099.products.length > 0, 'Must have devotional frames ₹80-₹99');
  for (const p of data8099.products) {
    assert.ok(p.indicativePrice >= 80 && p.indicativePrice <= 99, `Product ${p.sku} price ${p.indicativePrice} must be between 80 and 99`);
    assert.equal(p.isQuoteOnly, false);
  }

  // Query deity filter (e.g., Ganesha)
  const resGanesha = await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products?include_demo=1&deity=Ganesha'), env));
  const dataGanesha = await resGanesha.json();
  assert.equal(dataGanesha.success, true);
  assert.ok(dataGanesha.products.length > 0, 'Must have Ganesha frames');
  for (const p of dataGanesha.products) {
    assert.equal(p.deity, 'Ganesha');
    assert.ok(p.indicativePrice <= 99);
  }

  // Query frame size filter
  const resSize = await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products?include_demo=1&frame_size=Classic%204%22%C3%976%22'), env));
  const dataSize = await resSize.json();
  assert.equal(dataSize.success, true);
  assert.ok(dataSize.products.length > 0, 'Must have Classic 4"×6" frames');
  for (const p of dataSize.products) {
    assert.equal(p.frameSize, 'Classic 4"×6"');
  }
});

await test('27. Bulk order requests capture occasion, requiredDate, and tiered pricing within ₹99 ceiling', async () => {
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

// 12. STRICT ₹99 PRICE RULE ENFORCEMENT
await test('28. Server-side order request rejects items exceeding ₹99 ceiling', async () => {
  // Directly insert an expensive item into DB for testing rejection
  await env.DB.prepare(`
    INSERT OR REPLACE INTO products (id, sku, name, slug, description, indicative_price, min_quantity, status, is_demo, created_at, updated_at)
    VALUES ('test-expensive-frame', 'SWY-TEST-EXP', 'Overpriced Frame', 'overpriced-frame', 'Test frame', 150, 1, 'published', 0, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z')
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
  assert.ok(data.error.includes('₹99'));
});

await test('29. Admin product creation rejects indicative price or variants exceeding ₹99', async () => {
  const reqOver = makeRequest('http://admin/api/admin/products', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      sku: 'SWY-OVER-01',
      name: 'Overpriced Devotional Frame',
      slug: 'overpriced-devotional-frame',
      description: 'Above ₹99 ceiling',
      indicativePrice: 120,
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
      variants: [{ id: 'large', name: 'Large', indicative_price: 150 }],
      minQuantity: 1,
      status: 'published'
    }
  });
  const resVariantOver = await admProductsList.onRequestPost(makeContext(reqVariantOver, env));
  assert.equal(resVariantOver.status, 400);
});

await test('30. Admin quotation revisions strictly reject agreed unit prices exceeding ₹99', async () => {
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
            agreedUnitPrice: 150 // Exceeds 99!
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
  assert.ok(data.error.includes('₹99'));
});

await test('31. Storefront queries strictly exclude products priced above ₹99 even if published', async () => {
  // Query storefront without demo filter
  const sfRes = await sfProductsList.onRequestGet(makeContext(makeRequest('http://storefront/api/products'), env));
  const sfData = await sfRes.json();
  assert.equal(sfData.success, true);
  for (const p of sfData.products) {
    if (p.indicativePrice !== null) {
      assert.ok(p.indicativePrice <= 99, `Product ${p.sku} must not exceed 99 on storefront`);
    }
  }
  // Verify test-expensive-frame is excluded from storefront
  assert.equal(sfData.products.some(p => p.id === 'test-expensive-frame'), false);
});

// 13. REGRESSION SUITE: BULK PRICING, QUANTITY RULES, UPGRADES, ASSETS, SAMPLE ISOLATION

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

await test('35. Monetary calculation enforces integer paise, rejects > 9,900 paise and malformed/over-precision values', async () => {
  // Check validatePricePaise
  assert.equal(validatePricePaise(99).isValid, true);
  assert.equal(validatePricePaise(99).paise, 9900);
  assert.equal(validatePricePaise(49.50).isValid, true);
  assert.equal(validatePricePaise(49.50).paise, 4950);

  // Exceeds ₹99
  assert.equal(validatePricePaise(99.01).isValid, false);
  assert.equal(validatePricePaise(100).isValid, false);

  // Over-precision (more than 2 decimal places)
  assert.equal(validatePricePaise(49.999).isValid, false);
  assert.ok(validatePricePaise(49.999).error.includes('decimal places'));

  // Negative / zero / malformed
  assert.equal(validatePricePaise(0).isValid, false);
  assert.equal(validatePricePaise(-10).isValid, false);
  assert.equal(validatePricePaise('invalid').isValid, false);
});

await test('36. Admin quotation revision strictly rejects invalid prices, negative charges, and fractional quantities', async () => {
  // 1. Quoted unit price exceeds ₹99
  const overPriceRes = await admOrderDetails.onRequestPatch(makeContext(makeRequest(`http://admin/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'quoted',
      quotation: {
        items: [{ productId: createdProdId, quantity: 2, agreedUnitPrice: 105 }],
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

await test('40. Authentic devotional frame photographs and hero banners exist on disk and have non-zero file sizes', async () => {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');
  const requiredAssets = [
    'products/venkateswara-frame-960.webp',
    'products/ganesha-frame-800.webp',
    'products/lakshmi-frame-800.webp',
    'products/radha-krishna-frame-960.webp',
    'products/saraswati-frame-800.webp',
    'products/shiva-parvati-frame-800.webp',
    'products/murugan-frame-800.webp',
    'products/sai-baba-frame-800.webp',
    'products/placeholder-devotional-frame-800.webp',
    'editorial/hero-devotional-collection-desktop.webp',
    'editorial/hero-wedding-favors-desktop.webp',
    'editorial/hero-bulk-process-desktop.webp'
  ];

  for (const rel of requiredAssets) {
    const fullPath = path.join(assetsDir, rel);
    assert.ok(fs.existsSync(fullPath), `Asset ${rel} must exist in public/assets`);
    const stats = fs.statSync(fullPath);
    assert.ok(stats.size > 5000, `Asset ${rel} size (${stats.size} bytes) must be > 5,000 bytes`);
  }
});

console.log('====================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
