import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AssetsPage } from './pages/AssetsPage';
import { Loader2 } from 'lucide-react';

const AdminContent: React.FC = () => {
  const { user, isLoading } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center space-y-4 text-xs text-charcoal-muted">
        <img src="/assets/brand/swayari-logo.svg" alt="SWAYARI" className="h-10 w-auto" />
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin text-burgundy" />
          <span>Verifying studio administrator session...</span>
        </div>
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
