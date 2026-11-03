import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Inbox, Package, Layers, Sliders, Image as ImageIcon, LogOut, Menu, X } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Ornament, Wordmark, useDialogBehaviour } from './ui';
import { EASE_LUXURY } from './motion';

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

/** Subtle temple-motif glow used behind the dark navigation panels. */
const PanelGlow: React.FC = () => (
  <>
    <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
    <span aria-hidden className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-burgundy-accent/40 blur-3xl" />
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M14 2 26 14 14 26 2 14Z' fill='none' stroke='%23E3CC9A' stroke-width='0.6'/%3E%3C/svg%3E\")"
      }}
    />
  </>
);

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentTab, setCurrentTab, children }) => {
  const { user, logout } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer if the viewport grows to the desktop layout while it is open.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setMobileOpen(false);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const nav = (variant: 'desktop' | 'mobile', onPick?: () => void) => (
    <nav aria-label="Staff portal" className="relative flex-1 overflow-y-auto px-3 py-6">
      <p className="mb-3 px-3 text-[0.625rem] font-semibold uppercase tracking-[0.28em] text-gold-light/60">Manage</p>
      <ul className="space-y-1">
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
                className={`group relative flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.9rem] transition-colors duration-300 ${
                  active ? 'font-semibold text-ivory-light' : 'text-ivory/65 hover:bg-white/[0.04] hover:text-ivory-light'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`nav-active-${variant}`}
                    aria-hidden
                    className="absolute inset-0 rounded-xl border border-gold/25 bg-gradient-to-r from-gold/[0.16] to-white/[0.03]"
                    transition={{ duration: 0.5, ease: EASE_LUXURY }}
                  >
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-gold-light to-gold" />
                  </motion.span>
                )}
                <Icon
                  className={`relative h-[18px] w-[18px] flex-shrink-0 transition-colors duration-300 ${active ? 'text-gold-light' : 'text-ivory/45 group-hover:text-gold-light/80'}`}
                  strokeWidth={1.6}
                  aria-hidden
                />
                <span className="relative">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const account = (
    <div className="relative border-t border-white/10 p-4">
      <div className="flex items-center gap-3 rounded-xl px-1">
        {user?.picture ? (
          <img src={user.picture} alt="" className="h-9 w-9 rounded-full ring-2 ring-gold/50 ring-offset-2 ring-offset-burgundy-deep" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold font-display text-base font-bold text-burgundy-deep ring-2 ring-gold/30 ring-offset-2 ring-offset-burgundy-deep">
            {user?.name?.[0] || 'S'}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ivory-light">{user?.name}</p>
          <p className="truncate text-[0.75rem] text-ivory/55">{user?.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => logout()}
        className="mt-3 flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-ivory/65 transition-colors duration-300 hover:bg-white/[0.05] hover:text-ivory-light sm:min-h-[40px]"
      >
        <LogOut className="h-4 w-4" aria-hidden /> Sign out
      </button>
    </div>
  );

  const panelClass = 'flex flex-col overflow-hidden bg-gradient-to-b from-burgundy-deep to-umber text-ivory';

  return (
    <div className="flex min-h-screen">
      <aside className={`${panelClass} sticky top-0 hidden h-screen w-[264px] flex-shrink-0 border-r border-gold/20 lg:flex`}>
        <PanelGlow />
        <div className="relative px-6 pb-6 pt-8">
          <Wordmark tone="light" />
          <Ornament className="mt-6 [&::after]:w-full [&::after]:flex-1 [&::before]:w-4" />
        </div>
        {nav('desktop')}
        {account}
      </aside>

      <AnimatePresence>
        {mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} panelClass={panelClass} nav={nav('mobile', () => setMobileOpen(false))} account={account} />}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="pt-safe sticky top-0 z-30 border-b border-stone-deep/80 bg-ivory/85 backdrop-blur-xl backdrop-saturate-150 lg:hidden">
          <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="adm-icon-btn h-11 w-11 border border-stone-deep bg-white shadow-subtle sm:h-11 sm:w-11"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <Wordmark size="sm" />
            <span className="ml-auto hidden truncate text-sm font-medium text-ink-soft sm:block">{NAV.find(n => n.id === currentTab)?.label}</span>
            {user?.picture ? (
              <img src={user.picture} alt="" className="ml-auto h-9 w-9 rounded-full ring-2 ring-gold/40 sm:ml-0" referrerPolicy="no-referrer" />
            ) : (
              <span aria-hidden className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-burgundy font-display text-base font-bold text-gold-light sm:ml-0">
                {user?.name?.[0] || 'S'}
              </span>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 pb-16 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">{children}</main>
      </div>
    </div>
  );
};

const MobileNav: React.FC<{ onClose: () => void; panelClass: string; nav: React.ReactNode; account: React.ReactNode }> = ({ onClose, panelClass, nav, account }) => {
  const ref = useRef<HTMLDivElement>(null);
  useDialogBehaviour(ref, onClose);
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <motion.div
        className="absolute inset-0 bg-umber/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.45, ease: EASE_LUXURY }}
        className={`${panelClass} pt-safe absolute inset-y-0 left-0 w-[min(84vw,300px)] shadow-dialog outline-none`}
      >
        <PanelGlow />
        <span aria-hidden className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
        <div className="relative flex items-center justify-between px-5 pb-2 pt-5">
          <Wordmark tone="light" />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-ivory/80 transition-colors hover:border-gold/50 hover:text-ivory-light"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="relative px-5">
          <Ornament className="mt-3 [&::after]:w-full [&::after]:flex-1 [&::before]:w-4" />
        </div>
        {nav}
        <div className="pb-safe relative">{account}</div>
      </motion.div>
    </div>
  );
};
