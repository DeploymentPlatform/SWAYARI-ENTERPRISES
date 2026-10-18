import React, { useState } from 'react';
import { LayoutDashboard, Inbox, Package, Layers, Sliders, Image as ImageIcon, LogOut, Menu, X } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Wordmark } from './ui';

interface AdminLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

const NAV = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Order requests', icon: Inbox },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'banners', label: 'Campaign banners', icon: Sliders },
  { id: 'assets', label: 'Photo library', icon: ImageIcon }
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, setCurrentTab, children }) => {
  const { user, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (onPick?: () => void) => (
    <nav aria-label="Staff portal" className="flex-1 px-3 py-4">
      <ul className="space-y-0.5">
        {NAV.map(item => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  setCurrentTab(item.id);
                  onPick?.();
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[0.9375rem] transition-colors ${
                  active ? 'bg-burgundy-soft font-medium text-burgundy-deep' : 'text-ink-soft hover:bg-stone hover:text-ink'
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? 'text-burgundy' : ''}`} strokeWidth={1.75} aria-hidden />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const account = (
    <div className="border-t border-stone-deep p-4">
      <div className="flex items-center gap-3">
        {user?.picture ? (
          <img src={user.picture} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-sm font-semibold text-white">{user?.name?.[0] || 'S'}</span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="truncate text-[0.8125rem] text-ink-soft">{user?.email}</p>
        </div>
      </div>
      <button type="button" onClick={() => logout()} className="adm-btn-quiet mt-3 h-9 w-full justify-start px-2">
        <LogOut className="h-4 w-4" aria-hidden /> Sign out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col border-r border-stone-deep bg-white lg:flex">
        <div className="border-b border-stone-deep px-5 py-5">
          <Wordmark />
        </div>
        {nav()}
        {account}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-umber/40" onClick={() => setMobileOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label="Navigation" className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-drawer">
            <div className="flex items-center justify-between border-b border-stone-deep px-5 py-4">
              <Wordmark />
              <button type="button" onClick={() => setMobileOpen(false)} className="adm-btn-quiet h-9 w-9 px-0" aria-label="Close navigation">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {nav(() => setMobileOpen(false))}
            {account}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-stone-deep bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="adm-btn-quiet h-9 w-9 px-0" aria-label="Open navigation">
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <Wordmark />
        </header>
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
};
