import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountOrdersPage } from './pages/AccountOrdersPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { OrderingPolicyPage } from './pages/OrderingPolicyPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';

const AppContent: React.FC = () => {
  const { user, handleGoogleCallback, devLoginCustomer } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  // Sync route on popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on route navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPath]);

  // Initialize Google Identity Services
  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '1097223362145-storefront.apps.googleusercontent.com', // Will use server verified env or real GIS
        callback: (response: any) => {
          if (response.credential) {
            handleGoogleCallback(response.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  }, []);

  function navigate(path: string) {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  }

  // Parse route
  function renderPage() {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage navigate={navigate} />;
    }
    if (currentPath === '/shop') {
      return <ShopPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '').replace(/\/$/, '');
      return <ProductDetailPage slug={slug} navigate={navigate} />;
    }
    if (currentPath === '/cart') {
      return <CartPage navigate={navigate} />;
    }
    if (currentPath === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/order-confirmation/')) {
      const id = currentPath.replace('/order-confirmation/', '').replace(/\/$/, '');
      return <OrderConfirmationPage orderId={id} navigate={navigate} />;
    }
    if (currentPath === '/orders' || currentPath === '/account') {
      return <AccountOrdersPage navigate={navigate} />;
    }
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage />;
    }
    if (currentPath === '/ordering-policy') {
      return <OrderingPolicyPage />;
    }
    if (currentPath === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }

    // Default Fallback
    return <HomePage navigate={navigate} />;
  }

  const isLocalDev = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal font-sans">
      {/* Local Preview Dev Login Helper (Only visible in localhost) */}
      {isLocalDev && !user && (
        <div className="bg-amber-100/90 border-b border-amber-300 py-1 px-4 text-xs text-amber-900 flex items-center justify-between z-50">
          <span>Local Development Mode — Storefront Preview</span>
          <button
            onClick={() => devLoginCustomer()}
            className="underline font-semibold hover:text-amber-950"
          >
            Quick Customer Test Sign-In
          </button>
        </div>
      )}

      {/* Header */}
      <Header currentPath={currentPath} navigate={navigate} />

      {/* Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => navigate('/checkout')}
        onExplore={() => navigate('/shop')}
      />

      {/* Dynamic Route Body */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Footer (STRICTLY NO ADMIN LINK) */}
      <Footer navigate={navigate} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
