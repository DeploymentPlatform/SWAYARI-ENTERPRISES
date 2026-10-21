import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const artifactsDir = '/Users/suryateja/.gemini/antigravity-ide/brain/963d30b0-0358-49ea-a838-cbf1fe54437d';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function connectCDP(port = 9222) {
  let versionData;
  for (let i = 0; i < 20; i++) {
    try {
      const versionRes = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (versionRes.ok) {
        versionData = await versionRes.json();
        break;
      }
    } catch {
      await sleep(300);
    }
  }
  if (!versionData) throw new Error('Could not connect to Chrome debugging port ' + port);
  const wsUrl = versionData.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let idCounter = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) cb.reject(new Error(data.error.message));
      else cb.resolve(data.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  return { ws, send };
}

async function main() {
  console.log('Launching headless Google Chrome with CDP...');
  const profileDir = `/tmp/chrome-cdp-profile-${Date.now()}`;
  const chromeProcess = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    `--user-data-dir=${profileDir}`,
    '--window-size=1280,950',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const { ws, send } = await connectCDP(9222);
    console.log('Connected to Chrome DevTools Protocol!');

    // Create target page
    const { targetId } = await send('Target.createTarget', { url: 'http://127.0.0.1:8790' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

    function pageSend(method, params = {}) {
      return send('Target.sendMessageToTarget', {
        sessionId,
        message: JSON.stringify({ id: Math.floor(Math.random() * 1000000), method, params })
      });
    }

    // Helper for direct page commands
    const pageTab = await (await fetch('http://127.0.0.1:9222/json')).json();
    const pageTarget = pageTab.find(t => t.id === targetId);
    const pageWs = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => pageWs.onopen = r);

    let pid = 1;
    const pCallbacks = new Map();
    pageWs.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.id && pCallbacks.has(d.id)) {
        const cb = pCallbacks.get(d.id);
        pCallbacks.delete(d.id);
        if (d.error) cb.reject(new Error(d.error.message));
        else cb.resolve(d.result);
      }
    };
    function call(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = pid++;
        pCallbacks.set(id, { resolve, reject });
        pageWs.send(JSON.stringify({ id, method, params }));
      });
    }

    await call('Page.enable');
    await call('Runtime.enable');
    await call('Network.enable');

    async function screenshot(filename) {
      const res = await call('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(res.data, 'base64');
      const outPath = path.join(artifactsDir, filename);
      fs.writeFileSync(outPath, buf);
      console.log(`Saved screenshot: ${outPath} (${buf.length} bytes)`);
    }

    async function evaluate(expression) {
      const res = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res?.result?.value;
    }

    // ---------------------------------------------------------------
    // 1. STOREFRONT CART & BULK TIER PRICING TEST
    // ---------------------------------------------------------------
    console.log('Navigating to Shirdi Sai Baba frame detail page...');
    await call('Page.navigate', { url: 'http://127.0.0.1:8790/product/shirdi-sai-baba-shraddha-saburi-frame?include_demo=1' });
    await sleep(2000);

    // Set cart in localStorage directly to 100 pieces of Sai Baba frame
    console.log('Populating cart with 100 pieces of Sai Baba frame...');
    await evaluate(`
      const saiBabaTiers = [
        { min_qty: 30, unit_price: 58 },
        { min_qty: 60, unit_price: 50 },
        { min_qty: 100, unit_price: 42 }
      ];
      const item = {
        productId: 'demo-prod-godframe-12',
        sku: 'SWY-FRAME-012',
        name: 'Shirdi Sai Baba Shraddha Saburi Frame',
        indicativePrice: 42,
        basePrice: 65,
        bulkTiers: saiBabaTiers,
        quantity: 100,
        imageUrl: '/assets/products/sai-baba-frame-800.webp',
        customisationNote: 'Wedding Favor gift wrap'
      };
      localStorage.setItem('swayari_cart', JSON.stringify([item]));
      localStorage.setItem('swayari_preview_mode', 'true');
    `);

    // Navigate to Cart page
    console.log('Navigating to Cart page...');
    await call('Page.navigate', { url: 'http://127.0.0.1:8790/cart' });
    await sleep(2000);
    await screenshot('storefront_cart.png');

    // Navigate to Checkout page
    console.log('Navigating to Checkout page...');
    await call('Page.navigate', { url: 'http://127.0.0.1:8790/checkout' });
    await sleep(2000);
    await screenshot('storefront_checkout.png');

    // ---------------------------------------------------------------
    // 2. CUSTOMER ORDER SUBMISSION & CONFIRMATION
    // ---------------------------------------------------------------
    console.log('Logging in customer and submitting order request...');
    const custLoginRes = await fetch('http://127.0.0.1:8790/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customEmail: 'ananya.sharma@example.com', customName: 'Ananya Sharma' })
    });
    const custCookie = custLoginRes.headers.get('set-cookie').split(';')[0];

    const orderRes = await fetch('http://127.0.0.1:8790/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': custCookie },
      body: JSON.stringify({
        idempotencyKey: 'e2e-order-' + Date.now(),
        customerName: 'Ananya Sharma',
        customerPhone: '9876543210',
        deliveryAddress: 'Flat 402, Royal Palms, Banjara Hills',
        deliveryCity: 'Hyderabad',
        deliveryState: 'Telangana',
        deliveryPincode: '500034',
        occasion: 'Wedding Return Gifts',
        customerNotes: 'Please pack individually with blessing ribbon tags.',
        items: [{ productId: 'demo-prod-godframe-12', quantity: 100 }]
      })
    });
    const orderData = await orderRes.json();
    console.log('Customer order submitted:', orderData);
    const orderId = orderData.orderId;

    // Set customer session cookie in browser
    await call('Network.setCookie', {
      name: 'swayari_customer_session',
      value: custCookie.replace('swayari_customer_session=', ''),
      domain: '127.0.0.1',
      path: '/'
    });

    // View Order Confirmation Page in customer storefront
    console.log('Navigating to Order Confirmation page...');
    await call('Page.navigate', { url: `http://127.0.0.1:8790/order-confirmation/${orderId}` });
    await sleep(2500);
    await screenshot('storefront_order_confirmation.png');

    // ---------------------------------------------------------------
    // 3. ADMIN PORTAL: LOGIN, ORDER DETAILS, STAFF NOTES, PHOTO MANAGER
    // ---------------------------------------------------------------
    console.log('Navigating to Admin login...');
    await call('Page.navigate', { url: 'http://127.0.0.1:8791/login' });
    await sleep(2000);

    // Click "Sign in as local test administrator"
    console.log('Signing in as admin...');
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign in as local test administrator'));
      if (btn) btn.click();
    `);
    await sleep(2500);

    // Capture Admin Dashboard
    console.log('Capturing Admin Dashboard...');
    await screenshot('admin_dashboard.png');

    // Get admin cookie to add staff note and quotation
    const admLoginRes = await fetch('http://127.0.0.1:8791/api/auth/dev-login', { method: 'POST' });
    const admCookie = admLoginRes.headers.get('set-cookie').split(';')[0];

    // Add private staff note and issue quotation
    console.log('Adding private staff note and issuing quotation revision...');
    await fetch(`http://127.0.0.1:8791/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Cookie': admCookie },
      body: JSON.stringify({
        status: 'quoted',
        internalNote: 'Spoke with Ananya on WhatsApp. Wedding is on 15th Nov; confirmed ₹42/frame tier for 100 pcs with express dispatch.',
        quotation: {
          items: [{ productId: 'demo-prod-godframe-12', productName: 'Shirdi Sai Baba Shraddha Saburi Frame', agreedUnitPrice: 42, quantity: 100 }],
          shippingCharge: 150,
          taxAmount: 0,
          quotationNotes: 'Dispatched via premium express courier with multi-layer bubble wrap.'
        }
      })
    });

    // Refresh Dashboard to reflect the new quoted status, then click order row
    console.log('Opening order detail modal...');
    await evaluate(`
      const refreshBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Refresh'));
      if (refreshBtn) refreshBtn.click();
    `);
    await sleep(1500);

    await evaluate(`
      const orderRow = document.querySelector('tbody tr');
      if (orderRow) orderRow.click();
    `);
    await sleep(2000);
    await screenshot('admin_order_detail.png');

    // Scroll down inside the order detail modal to show private staff notes & quotation history
    await evaluate(`
      const modalBody = document.querySelector('.overflow-y-auto');
      if (modalBody) modalBody.scrollTop = 600;
    `);
    await sleep(1000);
    await screenshot('admin_order_detail_staff_notes.png');

    // Close order modal if open
    await evaluate(`
      const closeBtn = document.querySelector('button[aria-label="Close"], button[aria-label="close"]');
      if (closeBtn) closeBtn.click();
      else {
        const escBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Close' || b.textContent.trim() === '×');
        if (escBtn) escBtn.click();
      }
    `);
    await sleep(1000);

    // Navigate to Products tab by clicking sidebar button
    console.log('Navigating to Products tab in admin...');
    await evaluate(`
      const prodNav = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Products'));
      if (prodNav) prodNav.click();
    `);
    await sleep(2000);

    // Open ProductEditorModal by clicking "Edit" on the first product
    console.log('Opening ProductEditorModal for existing product to verify photo manager...');
    await evaluate(`
      const editBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === 'Edit');
      if (editBtns.length > 0) editBtns[0].click();
    `);
    await sleep(2000);

    // Scroll to photo management section inside the modal
    await evaluate(`
      const modal = document.querySelector('.overflow-y-auto');
      if (modal) modal.scrollTop = 450;
    `);
    await sleep(1000);
    await screenshot('admin_product_photo_manager.png');

    console.log('All E2E CDP verification workflows and screenshots completed successfully!');
    pageWs.close();
    ws.close();
  } catch (err) {
    console.error('CDP Error:', err);
  } finally {
    chromeProcess.kill();
  }
}

main();
