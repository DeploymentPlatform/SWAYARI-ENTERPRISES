import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, User as UserIcon, X, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useRouter } from '../lib/router';
import { Wordmark, useDialogBehaviour } from './ui';

const NAV = [
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'Our Story' },
  { to: '/contact', label: 'Contact' }
];

const IconButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = '', children, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`relative inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-burgundy ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
);

export const Header: React.FC = () => {
  const { path } = useRouter();
  const { itemCount, openDrawer } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [path]);

  const isActive = (to: string) => path === to || (to === '/shop' && (path.startsWith('/product/') || path === '/search'));

  return (
    <>
      <div className="bg-burgundy-deep text-ivory">
        <p className="container-content py-2 text-center text-[0.8125rem] tracking-wide text-ivory/90">
          <span className="hidden sm:inline">Order requests are confirmed personally by our team — no online payment is taken.</span>
          <span className="sm:hidden">Requests confirmed personally · No online payment</span>
        </p>
      </div>

      <header className="sticky top-0 z-40 border-b border-stone-deep bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/90">
        <div className="container-content grid h-[76px] grid-cols-[1fr_auto_1fr] items-center md:h-[88px]">
          {/* Left: mobile menu / desktop nav */}
          <div className="flex items-center">
            <IconButton className="-ml-2.5 lg:hidden" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <Menu className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </IconButton>
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-9">
                {NAV.map(item => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-current={isActive(item.to) ? 'page' : undefined}
                      className={`relative py-2 text-[0.8125rem] font-medium uppercase tracking-[0.14em] transition-colors hover:text-burgundy ${
                        isActive(item.to) ? 'text-burgundy after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-burgundy' : 'text-ink'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Centre: wordmark */}
          <Link to="/" aria-label="SWAYARI — Décor & Gifting, home" className="px-2">
            <Wordmark />
          </Link>

          {/* Right: utilities */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
            <IconButton aria-label="Search the collection" onClick={() => setSearchOpen(true)} className="hidden sm:inline-flex">
              <Search className="h-[21px] w-[21px]" strokeWidth={1.5} aria-hidden />
            </IconButton>
            <AccountMenu />
            <IconButton aria-label={`Open your bag, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`} onClick={openDrawer} className="-mr-2.5">
              <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.5} aria-hidden />
              {itemCount > 0 && (
                <span className="absolute right-1 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-burgundy px-1 text-[0.6875rem] font-semibold leading-none text-ivory">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </IconButton>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} isActive={isActive} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

/* ------------------------------------------------------------------ Account */

const AccountMenu: React.FC = () => {
  const { user, initiateGoogleSignIn, logout } = useAuth();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <IconButton aria-label="Sign in to your account" onClick={() => initiateGoogleSignIn(undefined, 'account')}>
        <UserIcon className="h-[21px] w-[21px]" strokeWidth={1.5} aria-hidden />
      </IconButton>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <IconButton aria-label={`Account menu for ${user.name}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>
        {user.picture ? (
          <img src={user.picture} alt="" className="h-7 w-7 rounded-full border border-stone-deep" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-burgundy text-xs font-semibold text-ivory">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
      </IconButton>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-64 border border-stone-deep bg-white py-2 shadow-card">
          <div className="border-b border-stone-deep px-4 pb-3 pt-1">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-sm text-ink-soft">{user.email}</p>
          </div>
          <button
            role="menuitem"
            type="button"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-stone"
            onClick={() => {
              setOpen(false);
              navigate('/orders');
            }}
          >
            <Package className="h-4 w-4 text-ink-soft" aria-hidden /> Your requests
          </button>
          <button
            role="menuitem"
            type="button"
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-stone"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="h-4 w-4 text-ink-soft" aria-hidden /> Sign out
          </button>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ Mobile menu */

const MobileMenu: React.FC<{ open: boolean; onClose: () => void; onSearch: () => void; isActive: (to: string) => boolean }> = ({
  open,
  onClose,
  onSearch,
  isActive
}) => {
  const ref = useDialogBehaviour(open, onClose);
  const { user, initiateGoogleSignIn } = useAuth();
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div className="absolute inset-0 bg-umber/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-label="Menu"
            className="outline-none absolute inset-y-0 left-0 flex w-[min(88vw,380px)] flex-col bg-ivory shadow-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex h-[76px] items-center justify-between border-b border-stone-deep px-4">
              <Wordmark size="sm" />
              <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center" aria-label="Close menu">
                <X className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-6 py-6">
              <ul className="space-y-1">
                {NAV.map(item => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      aria-current={isActive(item.to) ? 'page' : undefined}
                      className={`block border-b border-stone-deep py-4 font-display text-[1.75rem] leading-tight ${isActive(item.to) ? 'text-burgundy' : 'text-ink'}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 space-y-1 text-base">
                <button type="button" onClick={onSearch} className="flex w-full items-center gap-3 py-3 text-left">
                  <Search className="h-5 w-5 text-ink-soft" strokeWidth={1.5} aria-hidden /> Search
                </button>
                {user ? (
                  <Link to="/orders" onClick={onClose} className="flex items-center gap-3 py-3">
                    <Package className="h-5 w-5 text-ink-soft" strokeWidth={1.5} aria-hidden /> Your requests
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      initiateGoogleSignIn(undefined, 'account');
                    }}
                    className="flex w-full items-center gap-3 py-3 text-left"
                  >
                    <UserIcon className="h-5 w-5 text-ink-soft" strokeWidth={1.5} aria-hidden /> Sign in
                  </button>
                )}
              </div>
            </nav>
            <p className="border-t border-stone-deep px-6 py-5 text-sm text-ink-soft">
              Questions? <a className="link-underline" href="mailto:swayarienterprises@gmail.com">swayarienterprises@gmail.com</a>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------------------------------------------ Search */

const SearchDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const ref = useDialogBehaviour(open, onClose);
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    onClose();
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div className="absolute inset-0 bg-umber/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={ref}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-label="Search the collection"
            className="outline-none absolute inset-x-0 top-0 bg-ivory shadow-dialog"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <form onSubmit={submit} className="container-content flex items-center gap-3 py-6 md:py-9" role="search">
              <Search className="h-6 w-6 flex-shrink-0 text-ink-soft" strokeWidth={1.5} aria-hidden />
              <label htmlFor="site-search" className="sr-only">
                Search the collection
              </label>
              <input
                id="site-search"
                data-autofocus
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search the collection"
                className="w-full bg-transparent font-display text-2xl text-ink placeholder:text-ink-faint focus:outline-none md:text-4xl"
                autoComplete="off"
                enterKeyHint="search"
              />
              <button type="submit" className="btn-primary hidden sm:inline-flex" disabled={!query.trim()}>
                Search
              </button>
              <button type="button" onClick={onClose} className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center" aria-label="Close search">
                <X className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
