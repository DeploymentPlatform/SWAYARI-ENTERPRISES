import assert from 'node:assert/strict';
import { createMockD1 } from './d1-mock.js';
import * as utils from '../functions/_utils.js';
import * as devLogin from '../functions/api/auth/dev-login.js';
import * as authMe from '../functions/api/auth/me.js';
import * as authLogout from '../functions/api/auth/logout.js';
import * as productsList from '../functions/api/products/index.js';
import * as productSlug from '../functions/api/products/[slug].js';
import * as categoriesList from '../functions/api/categories/index.js';
import * as ordersIndex from '../functions/api/orders/index.js';
import * as orderDetails from '../functions/api/orders/[id].js';
import * as adminOrders from '../functions/api/admin/orders/index.js';
import * as adminOrderDetails from '../functions/api/admin/orders/[id].js';
import * as adminProducts from '../functions/api/admin/products/index.js';
import * as adminProductDetails from '../functions/api/admin/products/[id].js';
import * as adminStats from '../functions/api/admin/stats.js';

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

function makeContext(request, env, params = {}) {
  return { request, env, params };
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
console.log('SWAYARI ENTERPRISES - Core System Test Suite');
console.log('====================================================');

const env = {
  DB: createMockD1(),
  ENVIRONMENT: 'development',
  ADMIN_EMAILS: 'swayarienterprises@gmail.com',
  GOOGLE_CLIENT_ID: 'test-google-client-id.apps.googleusercontent.com'
};

// 1. DATABASE SCHEMA & DEMO DATA SEPARATION
await test('1. Initial products query separates demo preview data from public store', async () => {
  const req = makeRequest('http://localhost/api/products');
  const res = await productsList.onRequestGet(makeContext(req, env));
  const data = await res.json();
  assert.equal(data.success, true);
  // Zero production products published yet
  assert.equal(data.count, 0, 'Production storefront must hide demo/draft products');
});

await test('2. Explicit include_demo flag exposes demo preview data', async () => {
  const req = makeRequest('http://localhost/api/products?include_demo=1');
  const res = await productsList.onRequestGet(makeContext(req, env));
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.count >= 1, true);
  assert.equal(data.products[0].isDemo, true);
  assert.equal(data.products[0].sku, 'SWY-DEMO-001');
});

// 2. AUTHENTICATION & SECURITY
let customerCookie = '';
let adminCookie = '';

await test('3. Dev test login strictly blocks non-development environment', async () => {
  const prodEnv = { ...env, ENVIRONMENT: 'production' };
  const req = makeRequest('http://localhost/api/auth/dev-login', {
    method: 'POST',
    body: { role: 'customer' }
  });
  const res = await devLogin.onRequestPost(makeContext(req, prodEnv));
  assert.equal(res.status, 403, 'Dev login must be rejected in production');
});

await test('4. Customer login sets secure session cookie and returns user profile', async () => {
  const req = makeRequest('http://localhost/api/auth/dev-login', {
    method: 'POST',
    body: { role: 'customer', customEmail: 'ananya.sharma@example.com', customName: 'Ananya Sharma' }
  });
  const res = await devLogin.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.user.email, 'ananya.sharma@example.com');
  assert.equal(data.user.role, 'customer');
  
  const setCookie = res.headers.get('Set-Cookie');
  assert.ok(setCookie.includes('swayari_session='));
  const match = setCookie.match(/swayari_session=([^;]+)/);
  customerCookie = `swayari_session=${match[1]}`;
});

await test('5. Admin login grants admin role to swayarienterprises@gmail.com', async () => {
  const req = makeRequest('http://localhost/api/auth/dev-login', {
    method: 'POST',
    body: { role: 'admin' }
  });
  const res = await devLogin.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.user.email, 'swayarienterprises@gmail.com');
  assert.equal(data.user.role, 'admin');

  const setCookie = res.headers.get('Set-Cookie');
  const match = setCookie.match(/swayari_session=([^;]+)/);
  adminCookie = `swayari_session=${match[1]}`;
});

await test('6. auth/me correctly identifies authenticated customer and admin', async () => {
  // Test customer
  const req1 = makeRequest('http://localhost/api/auth/me', { cookie: customerCookie });
  const res1 = await authMe.onRequestGet(makeContext(req1, env));
  const data1 = await res1.json();
  assert.equal(data1.authenticated, true);
  assert.equal(data1.user.role, 'customer');

  // Test admin
  const req2 = makeRequest('http://localhost/api/auth/me', { cookie: adminCookie });
  const res2 = await authMe.onRequestGet(makeContext(req2, env));
  const data2 = await res2.json();
  assert.equal(data2.authenticated, true);
  assert.equal(data2.user.role, 'admin');

  // Test signed-out visitor
  const req3 = makeRequest('http://localhost/api/auth/me');
  const res3 = await authMe.onRequestGet(makeContext(req3, env));
  const data3 = await res3.json();
  assert.equal(data3.authenticated, false);
  assert.equal(data3.user, null);
});

// 3. ROLE ACCESS ENFORCEMENT & DATA ISOLATION
await test('7. Non-admin customer cannot access admin APIs (403 Forbidden)', async () => {
  const req = makeRequest('http://localhost/api/admin/orders', { cookie: customerCookie });
  const res = await adminOrders.onRequestGet(makeContext(req, env));
  assert.equal(res.status, 403, 'Customer must be blocked from admin orders API');
});

await test('8. Signed-out visitor cannot submit order requests (401 Unauthorized)', async () => {
  const req = makeRequest('http://localhost/api/orders', {
    method: 'POST',
    body: { idempotencyKey: 'test-key-12345678', items: [{ productId: 'demo-prod-radha-krishna-frame', quantity: 1 }] }
  });
  const res = await ordersIndex.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 401, 'Anonymous users cannot submit order requests');
});

// 4. ORDER INTEGRITY, IDEMPOTENCY, AND PRICE RE-VERIFICATION
let createdOrderId = '';
const idempotencyToken = 'idemp-' + Date.now() + '-uuid';

// First, publish a product for testing
await test('9. Admin creates and publishes a genuine product', async () => {
  const req = makeRequest('http://localhost/api/admin/products', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      sku: 'SWY-BR-001',
      name: 'Mayur Brass Diya Uruli',
      description: 'Handcrafted bell metal brass uruli with peacock finial and ornate oil lamps.',
      material: 'Pure Cast Brass',
      dimensions: 'Diameter: 12 inches, Height: 8 inches, Weight: 3.2 kg',
      indicativePrice: 4850,
      minQuantity: 1,
      status: 'published',
      isDemo: false,
      images: ['/assets/demo/sample_product_1.jpeg']
    }
  });
  const res = await adminProducts.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.productId);
});

await test('10. Order submission ignores client-forged prices and re-calculates from database', async () => {
  // Find published product id
  const prod = await env.DB.prepare("SELECT id FROM products WHERE sku = 'SWY-BR-001'").first();

  const req = makeRequest('http://localhost/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: {
      idempotencyKey: idempotencyToken,
      customerName: 'Ananya Sharma',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 402, Royal Palms, Road No 12, Banjara Hills',
      deliveryCity: 'Hyderabad',
      deliveryState: 'Telangana',
      deliveryPincode: '500034',
      customerNotes: 'Please call before dispatching as this is a festive housewarming gift.',
      items: [
        {
          productId: prod.id,
          quantity: 2,
          // Intentionally try to forge a fake ₹10 price
          forgedPrice: 10,
          customisationNote: 'Include gold gift wrapper'
        }
      ]
    }
  });

  const res = await ordersIndex.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.orderId);
  createdOrderId = data.orderId;
  // Database price is 4850 * 2 = 9700, NOT ₹20!
  assert.equal(data.indicativeSubtotal, 9700, 'Server must calculate real subtotal from database');
});

await test('11. Idempotent re-submission returns existing order without creating duplicates', async () => {
  const req = makeRequest('http://localhost/api/orders', {
    method: 'POST',
    cookie: customerCookie,
    body: {
      idempotencyKey: idempotencyToken, // Same idempotency key!
      customerName: 'Ananya Sharma',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 402, Royal Palms',
      deliveryCity: 'Hyderabad',
      deliveryState: 'Telangana',
      deliveryPincode: '500034',
      items: [{ productId: 'ignored', quantity: 2 }]
    }
  });

  const res = await ordersIndex.onRequestPost(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.orderId, createdOrderId);
  assert.equal(data.isExisting, true);

  // Verify DB count has exactly 1 order
  const countRow = await env.DB.prepare('SELECT COUNT(*) as count FROM orders WHERE idempotency_key = ?').bind(idempotencyToken).first();
  assert.equal(countRow.count, 1, 'Duplicate clicks must not insert multiple rows');
});

// 5. CUSTOMER ORDER PRIVACY & INTERNAL NOTE PROTECTION
await test('12. Customer B cannot view Customer A order (Cross-customer isolation)', async () => {
  // Create Customer B
  const reqB = makeRequest('http://localhost/api/auth/dev-login', {
    method: 'POST',
    body: { role: 'customer', customEmail: 'customer.b@example.com', customName: 'Customer B', customId: 'cust-b-id' }
  });
  const resB = await devLogin.onRequestPost(makeContext(reqB, env));
  const setCookieB = resB.headers.get('Set-Cookie');
  const matchB = setCookieB.match(/swayari_session=([^;]+)/);
  const customerBCookie = `swayari_session=${matchB[1]}`;

  // Customer B tries to view Customer A's order
  const req = makeRequest(`http://localhost/api/orders/${createdOrderId}`, { cookie: customerBCookie });
  const res = await orderDetails.onRequestGet(makeContext(req, env, { id: createdOrderId }));
  assert.equal(res.status, 403, 'Customer B must be prohibited from viewing Customer A orders');
});

// 6. ADMIN QUOTATION REVISIONS & INTERNAL NOTES
await test('13. Admin can add internal notes and customer cannot view internal notes', async () => {
  // Admin adds internal note
  const reqAdmin = makeRequest(`http://localhost/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'contacted',
      internalNote: 'Called customer on phone. Confirmed delivery needed by Oct 24th.'
    }
  });
  const resAdmin = await adminOrderDetails.onRequestPatch(makeContext(reqAdmin, env, { id: createdOrderId }));
  assert.equal(resAdmin.status, 200);

  // Customer retrieves their order details
  const reqCust = makeRequest(`http://localhost/api/orders/${createdOrderId}`, { cookie: customerCookie });
  const resCust = await orderDetails.onRequestGet(makeContext(reqCust, env, { id: createdOrderId }));
  const dataCust = await resCust.json();

  assert.equal(dataCust.order.status, 'contacted');
  // Confirm internalNotes field is completely omitted/absent from customer response
  assert.equal(dataCust.order.internalNotes, undefined, 'Internal notes must never leak to customer');
});

await test('14. Admin quotation revisions do not overwrite original request items', async () => {
  const prod = await env.DB.prepare("SELECT id FROM products WHERE sku = 'SWY-BR-001'").first();

  // Admin issues Revision #1
  const reqAdmin = makeRequest(`http://localhost/api/admin/orders/${createdOrderId}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: {
      status: 'quoted',
      quotation: {
        items: [
          {
            productId: prod.id,
            productName: 'Mayur Brass Diya Uruli',
            quantity: 2,
            agreedUnitPrice: 4600 // Discounted after telephone discussion
          }
        ],
        shippingCharge: 350,
        taxAmount: 0,
        quotationNotes: 'Festive packaging and tracked express courier included.'
      }
    }
  });
  const resAdmin = await adminOrderDetails.onRequestPatch(makeContext(reqAdmin, env, { id: createdOrderId }));
  assert.equal(resAdmin.status, 200);

  // Verify original order items remain intact
  const items = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(createdOrderId).all();
  assert.equal(items.results.length, 1);
  assert.equal(items.results[0].snapshot_indicative_price, 4850, 'Original snapshot price preserved');

  // Verify quotation table has Revision #1
  const quotes = await env.DB.prepare('SELECT * FROM order_quotations WHERE order_id = ?').bind(createdOrderId).all();
  assert.equal(quotes.results.length, 1);
  assert.equal(quotes.results[0].revision_number, 1);
  assert.equal(quotes.results[0].total_quoted_amount, 4600 * 2 + 350); // 9550
});

// 7. PRODUCT ARCHIVAL PRESERVES HISTORICAL ORDERS
await test('15. Archiving a product hides it from storefront but preserves historical orders', async () => {
  const prod = await env.DB.prepare("SELECT id FROM products WHERE sku = 'SWY-BR-001'").first();

  // Soft archive
  const reqArch = makeRequest(`http://localhost/api/admin/products/${prod.id}`, {
    method: 'DELETE',
    cookie: adminCookie
  });
  const resArch = await adminProductDetails.onRequestDelete(makeContext(reqArch, env, { id: prod.id }));
  assert.equal(resArch.status, 200);

  // Storefront listing now hides the archived product
  const reqStore = makeRequest('http://localhost/api/products');
  const resStore = await productsList.onRequestGet(makeContext(reqStore, env));
  const dataStore = await resStore.json();
  assert.equal(dataStore.products.find(p => p.id === prod.id), undefined);

  // Customer order still retrieves the snapshot cleanly
  const reqCust = makeRequest(`http://localhost/api/orders/${createdOrderId}`, { cookie: customerCookie });
  const resCust = await orderDetails.onRequestGet(makeContext(reqCust, env, { id: createdOrderId }));
  const dataCust = await resCust.json();
  assert.equal(dataCust.order.items[0].sku, 'SWY-BR-001');
  assert.equal(dataCust.order.items[0].name, 'Mayur Brass Diya Uruli');
});

// 8. ADMIN STATS & REFRESH
await test('16. Admin stats endpoint accurately reports dashboard metrics', async () => {
  const req = makeRequest('http://localhost/api/admin/stats', { cookie: adminCookie });
  const res = await adminStats.onRequestGet(makeContext(req, env));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.stats.orders.total, 1);
  assert.equal(data.stats.orders.quoted, 1);
  assert.ok(data.stats.products.total >= 1);
});

console.log('====================================================');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
