import React, { Suspense, lazy, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RouterProvider, useRouter } from './lib/router';
import { initPreviewMode, isPreviewMode, setPreviewMode } from './lib/preview';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SignInDialog } from './components/SignInDialog';
import { PageTransition } from './components/motion';

import { HomePage } from './pages/HomePage';

// Every page except the home page is split into its own chunk and loaded on demand.
const named = <T extends Record<string, React.ComponentType<any>>>(load: () => Promise<T>, key: keyof T) =>
  lazy(() => load().then(m => ({ default: m[key] })));

const loadShop = () => import('./pages/ShopPage');
const loadProduct = () => import('./pages/ProductDetailPage');

const ShopPage = named(loadShop, 'ShopPage');
const ProductDetailPage = named(loadProduct, 'ProductDetailPage');
const CartPage = named(() => import('./pages/CartPage'), 'CartPage');
const CheckoutPage = named(() => import('./pages/CheckoutPage'), 'CheckoutPage');
const OrderConfirmationPage = named(() => import('./pages/OrderConfirmationPage'), 'OrderConfirmationPage');
const AccountOrdersPage = named(() => import('./pages/AccountOrdersPage'), 'AccountOrdersPage');
const AboutPage = named(() => import('./pages/AboutPage'), 'AboutPage');
const ContactPage = named(() => import('./pages/ContactPage'), 'ContactPage');
const OrderingPolicyPage = named(() => import('./pages/OrderingPolicyPage'), 'OrderingPolicyPage');
const PrivacyPolicyPage = named(() => import('./pages/PrivacyPolicyPage'), 'PrivacyPolicyPage');
const NotFoundPage = named(() => import('./pages/NotFoundPage'), 'NotFoundPage');
const DevLoginPage = named(() => import('./pages/DevLoginPage'), 'DevLoginPage');

// Warm the two most visited pages once the browser is idle, so the first tap feels instant.
if (typeof window !== 'undefined') {
  const warm = () => {
    loadShop();
    loadProduct();
  };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  window.addEventListener('load', () => (idle ? idle(warm) : setTimeout(warm, 1500)), { once: true });
}

const PageFallback: React.FC = () => (
  <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Loading page">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
  </div>
);

initPreviewMode();

function Routes() {
  const { path } = useRouter();
  return (
    <Suspense fallback={<PageFallback />}>
      <PageTransition routeKey={path}>
        <RouteSwitch />
      </PageTransition>
    </Suspense>
  );
}

function RouteSwitch() {
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
    <div className="fixed bottom-[76px] left-3 z-30 flex items-center gap-1 rounded-full border border-gold/40 bg-ivory-light/95 py-0.5 pl-3 pr-1 text-[0.6875rem] text-ink-soft shadow-soft backdrop-blur md:bottom-4">
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
            className="sr-only z-[70] rounded-full bg-burgundy px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main" className="flex-1 pb-[68px] focus:outline-none md:pb-0" tabIndex={-1}>
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
