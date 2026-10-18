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
      sku: 'SWY-BR-001',
      name: 'Mayur Brass Diya Uruli',
      slug: 'mayur-brass-diya-uruli',
      description: 'Handcrafted bell metal brass uruli with peacock finial and ornate oil lamps.',
      material: 'Pure Cast Brass',
      dimensions: 'Diameter: 12 in, Height: 8 in, Weight: 3.2 kg',
      indicativePrice: 4850,
      minQuantity: 1,
      status: 'published',
      isDemo: false,
      images: ['/assets/demo/sample_product_2.jpeg']
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
  assert.equal(sfData.products[0].sku, 'SWY-BR-001');
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
  // Database price is 4850 * 2 = 9700, NOT 20!
  assert.equal(data.indicativeSubtotal, 9700, 'Server must calculate price from D1 database');
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
            productName: 'Mayur Brass Diya Uruli',
            quantity: 2,
            agreedUnitPrice: 4650
          }
        ],
        shippingCharge: 350,
        taxAmount: 0,
        quotationNotes: 'Multi-layer bubble wrap & wooden box included.'
      }
    }
  });
  const resAdm = await admOrderDetails.onRequestPatch(makeContext(reqAdm, env, { id: createdOrderId }));
  assert.equal(resAdm.status, 200);

  // Verify original snapshot price remains immutable
  const items = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(createdOrderId).all();
  assert.equal(items.results[0].snapshot_indicative_price, 4850, 'Original snapshot price must remain intact');

  // Verify quotation table has Revision #1
  const quotes = await env.DB.prepare('SELECT * FROM order_quotations WHERE order_id = ?').bind(createdOrderId).all();
  assert.equal(quotes.results.length, 1);
  assert.equal(quotes.results[0].revision_number, 1);
  assert.equal(quotes.results[0].total_quoted_amount, 4650 * 2 + 350); // 9650
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
  assert.equal(dataCust.order.items[0].sku, 'SWY-BR-001');
  assert.equal(dataCust.order.items[0].name, 'Mayur Brass Diya Uruli');
});

// 9. DASHBOARD STATS
await test('16. Admin stats endpoint accurately reports metrics from shared D1 database', async () => {
  const req = makeRequest('http://admin/api/admin/stats', { cookie: adminCookie });
  const res = await admStats.onRequestGet(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.stats.orders.total, 1);
  assert.equal(data.stats.orders.quoted, 1);
  assert.equal(data.stats.totalRevenueQuoted, 9650);
});

// 10. PRODUCTION BUILDS VERIFICATION
await test('17. Production Vite builds exist for both Storefront and Admin', async () => {
  const sfDist = path.join(process.cwd(), 'apps', 'storefront', 'dist', 'index.html');
  const admDist = path.join(process.cwd(), 'apps', 'admin', 'dist', 'index.html');
  assert.ok(fs.existsSync(sfDist), 'Storefront dist/index.html must exist');
  assert.ok(fs.existsSync(admDist), 'Admin dist/index.html must exist');
});

console.log('====================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
