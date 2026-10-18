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
import { Loader2 } from 'lucide-react';
import { Wordmark } from './components/ui';

const AdminContent: React.FC = () => {
  const { user, isLoading } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-sm text-ink-soft" role="status">
        <Wordmark />
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-burgundy" aria-hidden /> Checking your staff session…
        </span>
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
      {renderTabContent()}
    </AdminLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminContent />
    </AdminAuthProvider>
  );
};

export default App;
