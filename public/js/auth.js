// SWAYARI ENTERPRISES - Authentication & Google Identity Services Module
import { API } from './api.js';
import { Cart } from './cart.js';

export const Auth = {
  user: null,
  isInitialized: false,

  async init() {
    try {
      const data = await API.getMe();
      if (data.authenticated && data.user) {
        this.user = data.user;
      } else {
        this.user = null;
      }
    } catch (e) {
      this.user = null;
    }
    this.isInitialized = true;
    this.updateHeaderUI();
    this.initGoogleClient();
    this.checkResumePendingAction();
    return this.user;
  },

  isAuthenticated() {
    return !!this.user;
  },

  isAdmin() {
    return this.user && this.user.role === 'admin';
  },

  initGoogleClient() {
    // Check if Google GIS script is loaded
    if (typeof window.google !== 'undefined' && window.google.accounts) {
      this.setupGooglePrompt();
    } else {
      window.addEventListener('load', () => {
        if (typeof window.google !== 'undefined' && window.google.accounts) {
          this.setupGooglePrompt();
        }
      });
    }
  },

  setupGooglePrompt() {
    // In production this client ID is configured via environment / meta tag
    const metaClientId = document.querySelector('meta[name="google-client-id"]')?.content;
    if (!metaClientId || metaClientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
      // In dev or preview mode with placeholder, Google prompt will wait for configuration
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: metaClientId,
        callback: (response) => this.handleGoogleCredential(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render button if container exists
      const btnContainer = document.getElementById('google-signin-btn-container');
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 280
        });
      }
    } catch (e) {
      console.warn('Google Identity initialization notice:', e.message);
    }
  },

  async handleGoogleCredential(response) {
    if (!response || !response.credential) return;

    try {
      const result = await API.verifyGoogle(response.credential);
      if (result.success && result.user) {
        this.user = result.user;
        this.closeAuthModal();
        this.updateHeaderUI();
        this.showToast(`Welcome back, ${this.user.name}!`);
        this.checkResumePendingAction();
      }
    } catch (err) {
      alert(`Sign-in failed: ${err.message}`);
    }
  },

  async devLoginAs(role, email) {
    try {
      const res = await API.devLogin(role, email);
      if (res.success && res.user) {
        this.user = res.user;
        this.closeAuthModal();
        this.updateHeaderUI();
        this.showToast(`Logged in as ${res.user.name} (${res.user.role})`);
        this.checkResumePendingAction();
        return res.user;
      }
    } catch (err) {
      alert(`Dev login error: ${err.message}`);
    }
  },

  async logout() {
    try {
      await API.logout();
    } catch (_) {}
    this.user = null;
    this.updateHeaderUI();
    this.showToast('You have been logged out.');
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/account')) {
      window.location.href = '/';
    }
  },

  // Flow: Add to cart when signed out triggers sign in, resumes once upon success
  requireAuthForAction(pendingAction) {
    if (this.isAuthenticated()) {
      return true;
    }
    // Save pending action to resume exactly once
    sessionStorage.setItem('swayari_pending_action', JSON.stringify(pendingAction));
    this.openAuthModal();
    return false;
  },

  checkResumePendingAction() {
    if (!this.isAuthenticated()) return;
    const raw = sessionStorage.getItem('swayari_pending_action');
    if (!raw) return;

    try {
      const action = JSON.parse(raw);
      sessionStorage.removeItem('swayari_pending_action');

      if (action.type === 'add_to_cart' && action.product) {
        Cart.addItem(action.product, action.quantity || 1, action.variant || null, action.note || '');
        this.showToast(`Added "${action.product.name}" to your request list!`);
      }
    } catch (e) {
      sessionStorage.removeItem('swayari_pending_action');
    }
  },

  openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('open');
      // If dev mode button exists and Google client ID is not configured, show dev shortcuts
      const devBox = document.getElementById('dev-auth-options');
      if (devBox) devBox.style.display = 'block';
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('open');
    // If sign in was closed without authenticating, pending action is cancelled
    if (!this.isAuthenticated()) {
      sessionStorage.removeItem('swayari_pending_action');
    }
  },

  updateHeaderUI() {
    const authLinkContainer = document.getElementById('header-auth-container');
    const adminLink = document.getElementById('header-admin-link');

    if (adminLink) {
      adminLink.style.display = this.isAdmin() ? 'inline-block' : 'none';
    }

    if (!authLinkContainer) return;

    if (this.isAuthenticated()) {
      const firstName = (this.user.name || 'Account').split(' ')[0];
      authLinkContainer.innerHTML = `
        <div class="user-dropdown-wrap" style="position:relative;">
          <button id="user-menu-btn" class="action-btn" title="${this.user.email}" style="width:auto; padding:0 0.75rem; gap:0.4rem; font-size:0.85rem; font-weight:600;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>${firstName}</span>
          </button>
          <div id="user-dropdown-menu" style="display:none; position:absolute; right:0; top:110%; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); box-shadow:var(--shadow-md); min-width:180px; z-index:200;">
            <div style="padding:0.75rem 1rem; border-bottom:1px solid var(--border-subtle); font-size:0.8rem; color:var(--text-muted);">${this.user.email}</div>
            <a href="/account/orders" style="display:block; padding:0.6rem 1rem; font-size:0.88rem; color:var(--text-primary);">Order History</a>
            ${this.isAdmin() ? '<a href="/admin" style="display:block; padding:0.6rem 1rem; font-size:0.88rem; color:var(--color-burgundy); font-weight:600;">Admin Dashboard</a>' : ''}
            <button id="logout-btn" style="width:100%; text-align:left; background:none; border:none; border-top:1px solid var(--border-subtle); padding:0.6rem 1rem; font-size:0.88rem; color:#DC2626; cursor:pointer;">Sign Out</button>
          </div>
        </div>
      `;

      const menuBtn = document.getElementById('user-menu-btn');
      const dropMenu = document.getElementById('user-dropdown-menu');
      if (menuBtn && dropMenu) {
        menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dropMenu.style.display = dropMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', () => { dropMenu.style.display = 'none'; });
      }

      document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    } else {
      authLinkContainer.innerHTML = `
        <button id="header-signin-btn" class="btn btn-secondary btn-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
          <span>Sign In</span>
        </button>
      `;
      document.getElementById('header-signin-btn')?.addEventListener('click', () => this.openAuthModal());
    }
  },

  showToast(msg) {
    window.dispatchEvent(new CustomEvent('swayari:toast', { detail: { message: msg } }));
  }
};
