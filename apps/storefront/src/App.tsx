import React, { useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RouterProvider, useRouter } from './lib/router';
import { initPreviewMode, isPreviewMode, setPreviewMode } from './lib/preview';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SignInDialog } from './components/SignInDialog';

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
import { NotFoundPage } from './pages/NotFoundPage';
import { DevLoginPage } from './pages/DevLoginPage';

initPreviewMode();

function Routes() {
  const { path, search } = useRouter();

  if (path === '/') return <HomePage />;
  if (path === '/shop') return <ShopPage />;
  if (path === '/search') return <ShopPage searchQuery={search.get('q') || ''} />;
  if (path.startsWith('/product/')) return <ProductDetailPage slug={decodeURIComponent(path.slice('/product/'.length))} />;
  if (path === '/cart') return <CartPage />;
  if (path === '/checkout') return <CheckoutPage />;
  if (path.startsWith('/order-confirmation/')) return <OrderConfirmationPage orderId={decodeURIComponent(path.slice('/order-confirmation/'.length))} />;
  if (path === '/orders' || path === '/account' || path === '/account/orders') return <AccountOrdersPage />;
  if (path === '/about') return <AboutPage />;
  if (path === '/contact') return <ContactPage />;
  if (path === '/ordering-policy') return <OrderingPolicyPage />;
  if (path === '/privacy-policy' || path === '/privacy') return <PrivacyPolicyPage />;
  if (path === '/dev-login') return <DevLoginPage />;
  return <NotFoundPage />;
}

/** Small, out-of-layout indicator shown only while the sample preview dataset is active. */
const PreviewIndicator: React.FC = () => {
  const [on, setOn] = useState(isPreviewMode());
  if (!on) return null;
  return (
    <div className="fixed bottom-2 left-2 z-30 flex items-center gap-1 border border-gold/50 bg-ivory/95 py-0.5 pl-2 pr-0.5 text-[0.6875rem] text-ink-soft shadow-subtle backdrop-blur">
      <span>Sample preview</span>
      <button
        type="button"
        className="px-1.5 py-1 font-medium text-burgundy underline underline-offset-2"
        aria-label="Hide sample preview items"
        onClick={() => {
          setPreviewMode(false);
          setOn(false);
          window.location.reload();
        }}
      >
        Hide
      </button>
    </div>
  );
};

export const App: React.FC = () => (
  <MotionConfig reducedMotion="user">
    <RouterProvider>
      <AuthProvider>
        <CartProvider>
          <a
            href="#main"
            className="sr-only z-[70] bg-burgundy px-4 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main" className="flex-1" tabIndex={-1}>
              <Routes />
            </main>
            <Footer />
          </div>
          <CartDrawer />
          <SignInDialog />
          <PreviewIndicator />
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  </MotionConfig>
);

export default App;
