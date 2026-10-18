import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, setCurrentTab, children }) => {
  const { user, logout } = useAdminAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Requests', icon: ShoppingBag },
    { id: 'products', label: 'Catalogue & Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'assets', label: 'Asset Gallery', icon: ImageIcon }
  ];

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-ivory-border shadow-subtle">
        {/* Brand Header */}
        <div className="p-6 border-b border-ivory-border">
          <img
            src="/assets/brand/swayari-logo.svg"
            alt="SWAYARI"
            className="h-9 w-auto object-contain"
          />
          <div className="mt-2 flex items-center space-x-1.5 text-[10px] uppercase tracking-wider font-semibold text-burgundy">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>Operations &amp; Admin</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-burgundy text-white shadow-sm font-semibold'
                    : 'text-charcoal hover:bg-ivory hover:text-burgundy'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Staff User Footer */}
        <div className="p-4 border-t border-ivory-border space-y-3 bg-ivory/50">
          <div className="flex items-center space-x-3">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-gold/40" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-burgundy-light text-burgundy flex items-center justify-center font-bold text-xs">
                {user?.name?.[0] || 'A'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-charcoal truncate">{user?.name}</p>
              <p className="text-[11px] text-charcoal-muted truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-ivory-border px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-subtle">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 text-charcoal hover:text-burgundy"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-serif text-lg font-semibold text-charcoal capitalize">
              {navItems.find(i => i.id === currentTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block text-xs font-medium text-charcoal-muted">
              Official Studio Account: <span className="font-mono text-charcoal font-semibold">{user?.email}</span>
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/40"
            />
            <div className="relative w-64 bg-white flex flex-col p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-4 border-b border-ivory-border">
                <img src="/assets/brand/swayari-logo.svg" alt="SWAYARI" className="h-8 w-auto" />
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-charcoal" />
                </button>
              </div>
              <nav className="flex-1 py-4 space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium ${
                        isActive ? 'bg-burgundy text-white font-semibold' : 'text-charcoal hover:bg-ivory'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center space-x-1.5 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Page View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
