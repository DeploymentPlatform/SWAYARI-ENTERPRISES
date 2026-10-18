// SWAYARI ENTERPRISES - Core Client Initialization & UI Bindings
import { Auth } from './auth.js';
import { Cart } from './cart.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Auth
  await Auth.init();

  // 2. Sync Cart Badge
  const updateBadge = () => {
    const badge = document.querySelector('.cart-count-badge');
    if (badge) {
      const count = Cart.getTotalCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  };

  updateBadge();
  window.addEventListener('swayari:cart-updated', updateBadge);

  // 3. Setup Toast System
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  window.addEventListener('swayari:toast', (e) => {
    const msg = e.detail?.message;
    if (!msg) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${msg}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  });

  // 4. Mobile Menu Toggle
  const menuBtn = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // 5. Auth Modal Close
  const closeAuthBtn = document.getElementById('auth-modal-close');
  if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', () => Auth.closeAuthModal());
  }
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) Auth.closeAuthModal();
    });
  }

  // Dev mode buttons in auth modal if present
  document.getElementById('dev-login-customer-btn')?.addEventListener('click', () => {
    Auth.devLoginAs('customer', 'ananya.sharma@example.com');
  });
  document.getElementById('dev-login-admin-btn')?.addEventListener('click', () => {
    Auth.devLoginAs('admin', 'swayarienterprises@gmail.com');
  });
});
