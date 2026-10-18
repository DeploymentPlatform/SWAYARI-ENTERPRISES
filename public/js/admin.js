// SWAYARI ENTERPRISES - Admin Control Center Logic
import { API } from './api.js';
import { Auth } from './auth.js';

let currentStatusFilter = 'all';
let currentSearch = '';
let currentOrders = [];
let pollInterval = null;

function formatStatusPill(status) {
  const map = {
    'new_request': { label: 'New Request', cls: 'status-new_request' },
    'contacted': { label: 'Contacted', cls: 'status-contacted' },
    'quoted': { label: 'Quoted', cls: 'status-quoted' },
    'confirmed': { label: 'Confirmed', cls: 'status-confirmed' },
    'dispatched': { label: 'Dispatched', cls: 'status-dispatched' },
    'completed': { label: 'Completed', cls: 'status-completed' },
    'cancelled': { label: 'Cancelled', cls: 'status-cancelled' }
  };
  const info = map[status] || { label: status, cls: 'badge-gold' };
  return `<span class="badge badge-status ${info.cls}">${info.label}</span>`;
}

async function checkAdminAuth() {
  const gate = document.getElementById('admin-gate-screen');
  const workspace = document.getElementById('admin-workspace');
  const emailDisplay = document.getElementById('admin-user-email');

  await Auth.init();

  if (!Auth.isAuthenticated() || !Auth.isAdmin()) {
    gate.style.display = 'block';
    workspace.style.display = 'none';

    // Show dev login option if in development
    const devBox = document.getElementById('gate-dev-box');
    if (devBox) devBox.style.display = 'block';

    document.getElementById('gate-dev-login-admin')?.addEventListener('click', async () => {
      await Auth.devLoginAs('admin', 'swayarienterprises@gmail.com');
      checkAdminAuth();
    });
    return false;
  }

  gate.style.display = 'none';
  workspace.style.display = 'block';
  emailDisplay.textContent = Auth.user.email;

  document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
    await Auth.logout();
    window.location.reload();
  });

  return true;
}

// Stats & Polling
async function loadStats() {
  try {
    const res = await API.getAdminStats();
    if (res.success && res.stats) {
      const o = res.stats.orders;
      document.getElementById('stat-new-requests').textContent = o.newRequests;
      document.getElementById('stat-contacted').textContent = o.contacted;
      document.getElementById('stat-quoted').textContent = o.quoted;
      document.getElementById('stat-confirmed').textContent = o.confirmed;
      document.getElementById('stat-total-orders').textContent = o.total;
    }
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }
}

async function loadOrders() {
  const tbody = document.getElementById('admin-orders-tbody');
  const params = {};
  if (currentStatusFilter && currentStatusFilter !== 'all') params.status = currentStatusFilter;
  if (currentSearch) params.search = currentSearch;

  try {
    const res = await API.getAdminOrders(params);
    currentOrders = res.orders || [];

    if (currentOrders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">No matching order requests found.</td></tr>`;
      return;
    }

    tbody.innerHTML = currentOrders.map(o => `
      <tr>
        <td><strong style="font-family:monospace; color:var(--color-burgundy);">${o.id}</strong></td>
        <td>${new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</td>
        <td><strong>${o.customer_name}</strong><br><span style="font-size:0.78rem; color:var(--text-muted);">${o.customer_email}</span></td>
        <td><a href="tel:${o.customer_phone}" style="color:var(--color-burgundy); font-weight:600;">${o.customer_phone}</a></td>
        <td>${o.delivery_city}, ${o.delivery_state}</td>
        <td>${formatStatusPill(o.status)}</td>
        <td>${o.item_count} item(s)</td>
        <td>
          ${o.latest_quote_total 
            ? `<strong style="color:#065F46;">₹${o.latest_quote_total.toLocaleString('en-IN')}</strong> (Rev #${o.latest_revision})`
            : (o.initial_indicative_subtotal ? `Est. ₹${o.initial_indicative_subtotal.toLocaleString('en-IN')}` : '<span style="color:var(--text-muted); font-size:0.8rem;">Unquoted</span>')}
        </td>
        <td>
          <button class="btn btn-primary btn-sm manage-ord-btn" data-order-id="${o.id}">
            Manage
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.manage-ord-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-id');
        openManageOrderDrawer(id);
      });
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#DC2626; padding:1.5rem;">Failed to fetch orders: ${err.message}</td></tr>`;
  }
}

function startPolling() {
  if (!pollInterval) {
    pollInterval = setInterval(() => {
      loadStats();
      loadOrders();
    }, 30000); // Poll modestly every 30 seconds
  }
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// Pause polling in background tabs
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPolling();
  } else {
    loadStats();
    loadOrders();
    startPolling();
  }
});

// Manage Order Modal
async function openManageOrderDrawer(orderId) {
  const modal = document.getElementById('manage-order-modal');
  const content = document.getElementById('manage-order-content');
  content.innerHTML = '<div style="text-align:center; padding:3rem;">Loading order data...</div>';
  modal.classList.add('open');

  try {
    const res = await API.getAdminOrderDetails(orderId);
    const o = res.order;

    content.innerHTML = `
      <div style="border-bottom:1px solid var(--border-subtle); padding-bottom:1rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:0.8rem; text-transform:uppercase; color:var(--text-muted);">Managing Order Request</span>
          <h2 style="font-family:monospace; color:var(--color-burgundy); font-size:1.6rem; margin:0.25rem 0;">${o.id}</h2>
          <div style="font-size:0.82rem; color:var(--text-muted);">Submitted: ${new Date(o.created_at).toLocaleString('en-IN')}</div>
        </div>
        <div>
          ${formatStatusPill(o.status)}
        </div>
      </div>

      <!-- Section 1: Customer & Delivery Details -->
      <div class="drawer-section">
        <h4 style="color:var(--color-burgundy); margin-bottom:0.75rem;">1. Customer &amp; Delivery Destination</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; font-size:0.9rem; background:var(--bg-primary); padding:1rem; border-radius:var(--radius-sm);">
          <div>
            <div><strong>Name:</strong> ${o.customer_name}</div>
            <div><strong>Email:</strong> ${o.customer_email}</div>
            <div><strong>Phone:</strong> <a href="tel:${o.customer_phone}" style="color:var(--color-burgundy); font-weight:700;">${o.customer_phone}</a></div>
          </div>
          <div>
            <div><strong>Address:</strong> ${o.delivery_address}</div>
            <div><strong>City/State:</strong> ${o.delivery_city}, ${o.delivery_state} - ${o.delivery_pincode}</div>
            ${o.customer_notes ? `<div style="margin-top:0.4rem; color:var(--color-burgundy); font-style:italic;"><strong>Customer Notes:</strong> "${o.customer_notes}"</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Section 2: Original Request Items Snapshot -->
      <div class="drawer-section">
        <h4 style="color:var(--color-burgundy); margin-bottom:0.75rem;">2. Requested Items Snapshot (Immutable)</h4>
        <table class="admin-table" style="font-size:0.88rem;">
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Indicative Price</th>
              <th>Custom Note</th>
            </tr>
          </thead>
          <tbody>
            ${o.items.map(it => `
              <tr>
                <td><strong>${it.name}</strong></td>
                <td><code>${it.sku}</code></td>
                <td>${it.variant || 'Standard'}</td>
                <td><strong>${it.quantity}</strong></td>
                <td>${it.indicativePrice ? '₹' + it.indicativePrice.toLocaleString('en-IN') : 'On Request'}</td>
                <td>${it.customisationNote || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Section 3: Status Transition -->
      <div class="drawer-section">
        <h4 style="color:var(--color-burgundy); margin-bottom:0.75rem;">3. Order Status Workflow</h4>
        <div style="display:flex; gap:1rem; align-items:center;">
          <select id="update-status-select" class="form-select" style="max-width:240px;">
            <option value="new_request" ${o.status === 'new_request' ? 'selected' : ''}>New Request</option>
            <option value="contacted" ${o.status === 'contacted' ? 'selected' : ''}>Contacted</option>
            <option value="quoted" ${o.status === 'quoted' ? 'selected' : ''}>Quoted</option>
            <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="dispatched" ${o.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
            <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <button id="save-status-btn" class="btn btn-primary btn-sm">Update Status</button>
        </div>
      </div>

      <!-- Section 4: Quotation Revisions -->
      <div class="drawer-section">
        <h4 style="color:var(--color-burgundy); margin-bottom:0.75rem;">4. Quotations &amp; Shipping Charges</h4>
        
        ${o.quotations && o.quotations.length > 0 ? `
          <div style="margin-bottom:1.5rem;">
            <h5 style="font-size:0.9rem; color:var(--text-muted); margin-bottom:0.5rem;">Past Quotation Revisions:</h5>
            ${o.quotations.map(q => `
              <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:var(--radius-sm); padding:0.85rem 1rem; margin-bottom:0.75rem; font-size:0.88rem;">
                <div style="display:flex; justify-content:space-between;">
                  <strong>Revision #${q.revisionNumber} by ${q.createdByAdmin}</strong>
                  <span style="font-size:0.8rem; color:#166534;">${new Date(q.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div style="margin-top:0.4rem;">
                  Items: ₹${q.itemsSubtotal.toLocaleString('en-IN')} | Shipping: ₹${q.shippingCharge.toLocaleString('en-IN')} | 
                  <strong style="color:#14532D;">Total: ₹${q.totalQuotedAmount.toLocaleString('en-IN')}</strong>
                </div>
                ${q.quotationNotes ? `<div style="font-size:0.8rem; font-style:italic; margin-top:0.25rem;">Note: ${q.quotationNotes}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p style="font-size:0.88rem; color:var(--text-muted); margin-bottom:1rem;">No quotation has been issued for this request yet.</p>'}

        <!-- Issue New Revision Form -->
        <div style="background:var(--bg-secondary); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:1.25rem;">
          <h5 style="font-size:0.95rem; margin-bottom:1rem; color:var(--color-burgundy);">Issue New Quotation Revision:</h5>
          
          <div id="quote-items-container">
            ${o.items.map((it, idx) => `
              <div class="quote-item-row" data-product-id="${it.productId}" data-name="${it.name}" data-qty="${it.quantity}" style="display:flex; align-items:center; gap:1rem; margin-bottom:0.75rem;">
                <div style="flex:2; font-size:0.9rem;">
                  <strong>${it.name}</strong> (${it.quantity} pcs)
                </div>
                <div style="flex:1; display:flex; align-items:center; gap:0.4rem;">
                  <span style="font-size:0.85rem;">₹</span>
                  <input type="number" class="form-input quote-unit-price" value="${it.indicativePrice || 0}" min="0" step="10" placeholder="Unit Price">
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;">
            <div class="form-group">
              <label class="form-label">Insured Shipping Charge (₹)</label>
              <input type="number" id="quote-shipping-charge" class="form-input" value="0" min="0" step="50">
            </div>
            <div class="form-group">
              <label class="form-label">Quotation Notes for Customer</label>
              <input type="text" id="quote-notes" class="form-input" placeholder="e.g. Express courier delivery in 3 days">
            </div>
          </div>

          <button id="submit-quote-revision-btn" class="btn btn-gold btn-sm">Issue Formal Quotation</button>
        </div>
      </div>

      <!-- Section 5: Internal Admin Notes (Private) -->
      <div class="drawer-section">
        <h4 style="color:var(--color-burgundy); margin-bottom:0.75rem;">5. Internal Notes (Private to Admin Team)</h4>
        
        <div id="internal-notes-list" style="margin-bottom:1rem;">
          ${o.internalNotes && o.internalNotes.length > 0 ? o.internalNotes.map(n => `
            <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-left:3px solid var(--color-burgundy); padding:0.65rem 0.85rem; border-radius:var(--radius-sm); margin-bottom:0.5rem; font-size:0.85rem;">
              <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:0.75rem; margin-bottom:0.25rem;">
                <strong>${n.adminName}</strong>
                <span>${new Date(n.createdAt).toLocaleString('en-IN')}</span>
              </div>
              <div>${n.note}</div>
            </div>
          `).join('') : '<p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.5rem;">No internal notes logged yet.</p>'}
        </div>

        <div style="display:flex; gap:0.5rem;">
          <input type="text" id="new-internal-note-input" class="form-input" placeholder="Add confidential call note or customer preference..." style="flex:1;">
          <button id="add-internal-note-btn" class="btn btn-secondary btn-sm">Save Note</button>
        </div>
      </div>

      <!-- Section 6: Audit History -->
      <div class="drawer-section">
        <h4 style="color:var(--color-burgundy); margin-bottom:0.75rem;">6. Audit Trail</h4>
        <div style="max-height:160px; overflow-y:auto; font-size:0.8rem; background:var(--bg-primary); padding:0.75rem; border-radius:var(--radius-sm);">
          ${o.auditLogs && o.auditLogs.length > 0 ? o.auditLogs.map(a => `
            <div style="margin-bottom:0.4rem; border-bottom:1px dotted var(--border-subtle); padding-bottom:0.25rem;">
              <span style="color:var(--text-muted);">${new Date(a.createdAt).toLocaleTimeString('en-IN')}</span> &bull; 
              <strong>${a.action}</strong> by ${a.performedBy}
            </div>
          `).join('') : 'No audit entries.'}
        </div>
      </div>
    `;

    // Bind Drawer Actions:
    // 1. Status Update
    document.getElementById('save-status-btn')?.addEventListener('click', async () => {
      const newStatus = document.getElementById('update-status-select').value;
      try {
        await API.updateAdminOrder(orderId, { status: newStatus });
        alert(`Status updated to ${newStatus}`);
        loadOrders();
        loadStats();
        openManageOrderDrawer(orderId);
      } catch (err) {
        alert(`Failed: ${err.message}`);
      }
    });

    // 2. Submit Quotation Revision
    document.getElementById('submit-quote-revision-btn')?.addEventListener('click', async () => {
      const rows = content.querySelectorAll('.quote-item-row');
      const items = [];
      rows.forEach(r => {
        items.push({
          productId: r.getAttribute('data-product-id'),
          productName: r.getAttribute('data-name'),
          quantity: parseInt(r.getAttribute('data-qty'), 10),
          agreedUnitPrice: parseFloat(r.querySelector('.quote-unit-price').value) || 0
        });
      });

      const shippingCharge = parseFloat(document.getElementById('quote-shipping-charge').value) || 0;
      const notes = document.getElementById('quote-notes').value.trim();

      try {
        await API.updateAdminOrder(orderId, {
          status: 'quoted',
          quotation: {
            items,
            shippingCharge,
            taxAmount: 0,
            quotationNotes: notes
          }
        });
        alert('Formal Quotation Revision saved and status updated to "Quoted"');
        loadOrders();
        loadStats();
        openManageOrderDrawer(orderId);
      } catch (err) {
        alert(`Quotation Error: ${err.message}`);
      }
    });

    // 3. Add Internal Note
    document.getElementById('add-internal-note-btn')?.addEventListener('click', async () => {
      const noteInput = document.getElementById('new-internal-note-input');
      const note = noteInput.value.trim();
      if (!note) return;

      try {
        await API.updateAdminOrder(orderId, { internalNote: note });
        noteInput.value = '';
        openManageOrderDrawer(orderId);
      } catch (err) {
        alert(`Failed: ${err.message}`);
      }
    });

  } catch (e) {
    content.innerHTML = `<div class="notice-box notice-warning">Error: ${e.message}</div>`;
  }
}

// Products Catalog Management
async function loadProducts() {
  const tbody = document.getElementById('admin-products-tbody');
  try {
    const res = await API.getAdminProducts();
    const prods = res.products || [];

    if (prods.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--text-muted);">No products registered yet. Click "+ Add New Product" to publish items.</td></tr>`;
      return;
    }

    tbody.innerHTML = prods.map(p => `
      <tr>
        <td>
          <img src="${(p.images && p.images[0]) || '/assets/brand/swayari_brand_card.jpeg'}" alt="${p.name}" style="width:44px; height:44px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
        </td>
        <td><code>${p.sku}</code></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.categoryName || 'Unassigned'}</td>
        <td>${p.indicativePrice ? '₹' + p.indicativePrice.toLocaleString('en-IN') : 'On Request'}</td>
        <td>${p.minQuantity}</td>
        <td>
          <span class="badge ${p.status === 'published' ? 'status-confirmed' : (p.status === 'draft' ? 'status-contacted' : 'status-cancelled')}">
            ${p.status}
          </span>
        </td>
        <td>${p.isDemo ? '<span class="badge badge-demo">Demo</span>' : 'Real'}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary btn-sm edit-prod-btn" data-prod-id="${p.id}">Edit</button>
            ${p.status !== 'archived' ? `<button class="btn btn-secondary btn-sm arch-prod-btn" data-prod-id="${p.id}" style="color:#DC2626;">Archive</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.edit-prod-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-prod-id');
        const prod = prods.find(x => x.id === id);
        if (prod) openProductModal(prod);
      });
    });

    tbody.querySelectorAll('.arch-prod-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-prod-id');
        if (confirm('Archive this product? It will be removed from the public storefront while preserving all past order requests.')) {
          await API.archiveAdminProduct(id);
          loadProducts();
        }
      });
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#DC2626;">Failed: ${err.message}</td></tr>`;
  }
}

// Product Create / Edit Modal
async function openProductModal(prod = null) {
  const modal = document.getElementById('product-modal');
  const content = document.getElementById('product-modal-content');
  const isEdit = !!prod;

  // Fetch categories and assets
  const catRes = await API.getAdminCategories().catch(() => ({ categories: [] }));
  const assetRes = await API.getAdminAssets().catch(() => ({ manifest: { assets: [] } }));
  const categories = catRes.categories || [];
  const assets = assetRes.manifest?.assets || [];

  content.innerHTML = `
    <h3 style="color:var(--color-burgundy); margin-bottom:1.5rem;">${isEdit ? 'Edit Product' : 'Add New Product'}</h3>
    <form id="product-edit-form">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div class="form-group">
          <label class="form-label">SKU <span class="required">*</span></label>
          <input type="text" id="prod-sku" class="form-input" required value="${prod?.sku || ''}" placeholder="e.g. SWY-SL-002">
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="prod-category" class="form-select">
            <option value="">-- Select Category --</option>
            ${categories.map(c => `
              <option value="${c.id}" ${prod?.categoryId === c.id ? 'selected' : ''}>${c.name}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Product Name <span class="required">*</span></label>
        <input type="text" id="prod-name" class="form-input" required value="${prod?.name || ''}" placeholder="e.g. Bala Krishna Embossed Silver Plaque">
      </div>

      <div class="form-group">
        <label class="form-label">Description <span class="required">*</span></label>
        <textarea id="prod-desc" class="form-textarea" rows="3" required placeholder="Detailed artisanal craftsmanship and devotional significance...">${prod?.description || ''}</textarea>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div class="form-group">
          <label class="form-label">Confirmed Material</label>
          <input type="text" id="prod-material" class="form-input" value="${prod?.material || ''}" placeholder="e.g. 999 Silver Foil / Solid Brass">
        </div>
        <div class="form-group">
          <label class="form-label">Confirmed Dimensions</label>
          <input type="text" id="prod-dimensions" class="form-input" value="${prod?.dimensions || ''}" placeholder="e.g. 10 x 8 inches">
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">
        <div class="form-group">
          <label class="form-label">Indicative Price (₹)</label>
          <input type="number" id="prod-price" class="form-input" value="${prod?.indicativePrice || ''}" placeholder="Empty for 'On Request'">
        </div>
        <div class="form-group">
          <label class="form-label">Minimum Quantity</label>
          <input type="number" id="prod-min-qty" class="form-input" value="${prod?.minQuantity || 1}" min="1">
        </div>
        <div class="form-group">
          <label class="form-label">Publication Status</label>
          <select id="prod-status" class="form-select">
            <option value="draft" ${prod?.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="published" ${prod?.status === 'published' ? 'selected' : ''}>Published</option>
            <option value="archived" ${prod?.status === 'archived' ? 'selected' : ''}>Archived</option>
          </select>
        </div>
      </div>

      <!-- Deployed Photo Selection -->
      <div class="form-group">
        <label class="form-label">Select Photo from Deployed Git Assets:</label>
        <select id="prod-photo-select" class="form-select">
          ${assets.map(a => `
            <option value="${a.path}" ${prod?.images && prod.images.includes(a.path) ? 'selected' : ''}>
              ${a.label} (${a.path})
            </option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.88rem; cursor:pointer;">
          <input type="checkbox" id="prod-is-demo" ${prod?.isDemo ? 'checked' : ''}>
          <span>Mark as Sample Preview / Demo Entry (Separated from production storefront)</span>
        </label>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:2rem;">
        <button type="button" id="cancel-prod-modal" class="btn btn-secondary btn-sm">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">${isEdit ? 'Save Changes' : 'Create Product'}</button>
      </div>
    </form>
  `;

  modal.classList.add('open');

  document.getElementById('cancel-prod-modal')?.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  document.getElementById('product-edit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      sku: document.getElementById('prod-sku').value.trim(),
      name: document.getElementById('prod-name').value.trim(),
      description: document.getElementById('prod-desc').value.trim(),
      categoryId: document.getElementById('prod-category').value || null,
      material: document.getElementById('prod-material').value.trim(),
      dimensions: document.getElementById('prod-dimensions').value.trim(),
      indicativePrice: document.getElementById('prod-price').value,
      minQuantity: parseInt(document.getElementById('prod-min-qty').value, 10) || 1,
      status: document.getElementById('prod-status').value,
      images: [document.getElementById('prod-photo-select').value],
      isDemo: document.getElementById('prod-is-demo').checked
    };

    try {
      if (isEdit) {
        await API.updateAdminProduct(prod.id, payload);
      } else {
        await API.createAdminProduct(payload);
      }
      modal.classList.remove('open');
      loadProducts();
    } catch (err) {
      alert(`Product Save Failed: ${err.message}`);
    }
  });
}

// Categories Tab
async function loadCategories() {
  const tbody = document.getElementById('admin-categories-tbody');
  try {
    const res = await API.getAdminCategories();
    const cats = res.categories || [];
    tbody.innerHTML = cats.map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td><code>${c.slug}</code></td>
        <td>${c.description || '-'}</td>
        <td>${c.display_order}</td>
        <td>${c.product_count} products</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5">Error: ${err.message}</td></tr>`;
  }
}

// Assets Gallery Tab
async function loadAssets() {
  const grid = document.getElementById('admin-assets-grid');
  try {
    const res = await API.getAdminAssets();
    const assets = res.manifest?.assets || [];

    grid.innerHTML = assets.map(a => `
      <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); overflow:hidden; padding:0.75rem;">
        <img src="${a.path}" alt="${a.label}" style="width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:var(--radius-sm); margin-bottom:0.5rem;">
        <div style="font-size:0.85rem; font-weight:600; color:var(--color-burgundy);">${a.label}</div>
        <div style="font-size:0.72rem; color:var(--text-muted); word-break:break-all;">${a.path}</div>
        <div style="margin-top:0.4rem; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.72rem; color:var(--text-muted);">${(a.sizeBytes / 1024).toFixed(1)} KB</span>
          <button class="btn btn-secondary btn-sm copy-path-btn" data-path="${a.path}" style="padding:0.2rem 0.5rem; font-size:0.75rem;">Copy Path</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.copy-path-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.getAttribute('data-path'));
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy Path'; }, 2000);
      });
    });
  } catch (err) {
    grid.innerHTML = `<div>Failed to load assets: ${err.message}</div>`;
  }
}

// Global Tab Switcher
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    const content = document.getElementById(tabId);
    if (content) content.style.display = 'block';

    if (tabId === 'products-tab') loadProducts();
    if (tabId === 'categories-tab') loadCategories();
    if (tabId === 'assets-tab') loadAssets();
  });
});

// Status Pills Filter
document.querySelectorAll('.admin-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.admin-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentStatusFilter = pill.getAttribute('data-status');
    loadOrders();
  });
});

// Search input debounce
let searchDebounce = null;
document.getElementById('admin-search-orders')?.addEventListener('input', (e) => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentSearch = e.target.value.trim();
    loadOrders();
  }, 300);
});

document.getElementById('refresh-orders-btn')?.addEventListener('click', () => {
  loadStats();
  loadOrders();
});

document.getElementById('close-manage-order-modal')?.addEventListener('click', () => {
  document.getElementById('manage-order-modal').classList.remove('open');
});

document.getElementById('close-product-modal')?.addEventListener('click', () => {
  document.getElementById('product-modal').classList.remove('open');
});

document.getElementById('add-product-btn')?.addEventListener('click', () => {
  openProductModal(null);
});

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  const isAuthed = await checkAdminAuth();
  if (isAuthed) {
    loadStats();
    loadOrders();
    startPolling();
  }
});
