import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BannersPage } from './pages/BannersPage';
import { AssetsPage } from './pages/AssetsPage';
import { MotionConfig, motion } from 'framer-motion';
import { Ornament, Wordmark } from './components/ui';
import { EASE_LUXURY, PageTransition } from './components/motion';

const AdminContent: React.FC = () => {
  const { user, isLoading } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-sm text-ink-soft" role="status">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_LUXURY }}
          className="flex flex-col items-center gap-5"
        >
          <Wordmark size="lg" />
          <Ornament />
          <span className="flex items-center gap-3">
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            Checking your staff session…
          </span>
        </motion.div>
      </div>
    );
  }

  // Not signed in: Show branded staff login screen
  if (!user) {
    return <LoginPage />;
  }

  // Signed in: Render layout and active tab
  function renderTabContent() {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigateTab={tab => setCurrentTab(tab)}
            onOpenOrder={orderId => {
              setSelectedOrderId(orderId);
              setCurrentTab('orders');
            }}
          />
        );
      case 'orders':
        return <OrdersPage initialSelectedOrderId={selectedOrderId} />;
      case 'products':
        return <ProductsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'banners':
        return <BannersPage />;
      case 'assets':
        return <AssetsPage />;
      default:
        return (
          <DashboardPage
            onNavigateTab={tab => setCurrentTab(tab)}
            onOpenOrder={orderId => {
              setSelectedOrderId(orderId);
              setCurrentTab('orders');
            }}
          />
        );
    }
  }

  return (
    <AdminLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      <PageTransition routeKey={currentTab}>{renderTabContent()}</PageTransition>
    </AdminLayout>
  );
};

export const App: React.FC = () => {
  return (
    <MotionConfig reducedMotion="user">
      <AdminAuthProvider>
        <AdminContent />
      </AdminAuthProvider>
    </MotionConfig>
  );
};

export default App;
