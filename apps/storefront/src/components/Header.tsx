import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Menu, Search, ShoppingBag, User as UserIcon, X, LogOut, Package,
  ChevronRight, ArrowRight, Home, LayoutGrid, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useRouter } from '../lib/router';
import { productCardImage, uniqueProductImages } from '../lib/media';
import { useProducts } from '../lib/products';
import { formatPrice, Product } from '@swayari/shared';
import { LotusMark, useDialogBehaviour } from './ui';
import { EASE_LUXURY } from './motion';

const NAV_LINKS = [
  { slug: 'all-frames', label: 'All Frames', href: '/shop' },
  { slug: 'wedding-return-gifts', label: 'Return Gifts', href: '/shop?bulk=1' },
  { slug: 'how-to-order', label: 'How to Order', href: '/#how-to-order' },
  { slug: 'about', label: 'Our Story', href: '/about' },
  { slug: 'contact', label: 'Contact', href: '/contact' }
];

const DEITY_SHORTCUTS = [
  { slug: 'ganesha', label: 'Ganesha', href: '/shop?deity=ganesha' },
  { slug: 'lakshmi', label: 'Lakshmi', href: '/shop?deity=lakshmi' },
  { slug: 'balaji', label: 'Balaji', href: '/shop?deity=balaji' },
  { slug: 'radha-krishna', label: 'Radha Krishna', href: '/shop?deity=radha-krishna' },
  { slug: 'hanuman', label: 'Hanuman', href: '/shop?deity=hanuman' },
  { slug: 'shiva-parvati', label: 'Shiva Parvati', href: '/shop?deity=shiva' },
  { slug: 'under-49', label: 'Pocket Favours ≤ ₹49', href: '/shop?budget=under-49' }
];

const ANNOUNCEMENTS = [
  'Devotional frames ₹99 & under — thoughtful return gifts for every celebration',
  'Bulk quantities for weddings, griha pravesh & festivals — personally coordinated',
  'Send your request — our team confirms availability, packing & shipping'
];

function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

/* ------------------------------------------------------------------ Brand lockup */

const BrandLockup: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <Link to="/" className="group flex flex-col items-center leading-none">
    <LotusMark className={`text-gold transition-all duration-500 ease-luxury group-hover:text-gold-dark ${compact ? 'h-0 w-6 opacity-0' : 'mb-1 h-3.5 w-6 opacity-100'}`} />
    <span
      className={`font-wordmark font-semibold tracking-[0.24em] text-burgundy-deep transition-all duration-500 ease-luxury pl-[0.24em] ${
        compact ? 'text-[1.25rem] sm:text-[1.4rem]' : 'text-[1.35rem] sm:text-[1.75rem]'
      }`}
    >
      SWAYARI
    </span>
    <span
      className={`flex items-center gap-2 overflow-hidden transition-all duration-500 ease-luxury ${compact ? 'mt-0 max-h-0 opacity-0' : 'mt-1.5 max-h-4 opacity-100'}`}
    >
      <span className="h-px w-4 bg-gold/70 sm:w-6" />
      <span className="font-sans text-[0.55rem] font-semibold uppercase tracking-[0.42em] text-gold-dark sm:text-[0.6rem]">
        Décor &amp; Gifting
      </span>
      <span className="h-px w-4 bg-gold/70 sm:w-6" />
    </span>
    <span className="sr-only"> — home</span>
  </Link>
);

/* ------------------------------------------------------------------ Search overlay */

const SearchOverlay: React.FC<{ open: boolean; onClose: () => void; products: Product[] }> = ({ open, onClose, products }) => {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const ref = useDialogBehaviour(open, onClose);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const q = query.trim().toLowerCase();
  const suggestions = q
    ? products
        .filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            (p.deity && p.deity.toLowerCase().includes(q)) ||
            (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
            (p.material && p.material.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
        )
        .slice(0, 6)
    : [];

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    onClose();
    navigate(q ? `/shop?search=${encodeURIComponent(query.trim())}` : '/shop');
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-umber/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="Search the collection"
            tabIndex={-1}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_LUXURY }}
            className="relative border-b border-gold/30 bg-ivory-light shadow-dialog focus:outline-none"
          >
            <div className="container-content py-6 sm:py-10">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Search the collection</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-11 w-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-stone hover:text-burgundy"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={submit} className="relative mt-3">
                <Search className="pointer-events-none absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 text-gold-dark" aria-hidden />
                <input
                  data-autofocus
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ganesha, Lakshmi, teak frame…"
                  aria-label="Search god frames and return gifts"
                  autoComplete="off"
                  className="w-full border-0 border-b border-stone-shade bg-transparent py-4 pl-10 pr-4 font-display text-[1.75rem] text-ink placeholder:text-ink-faint/60 focus:border-gold focus:outline-none focus:ring-0 sm:text-[2.5rem]"
                />
              </form>

              <div className="mt-6 min-h-[3rem]">
                {q && suggestions.length > 0 && (
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {suggestions.map((p, i) => (
                      <motion.li
                        key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.4, ease: EASE_LUXURY }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate(`/product/${p.slug}`);
                          }}
                          className="group flex w-full items-center gap-4 rounded-2xl border border-transparent p-2.5 text-left transition-all duration-300 hover:border-stone-deep hover:bg-white hover:shadow-soft"
                        >
                          <img
                            {...productCardImage(uniqueProductImages(p.images)[0] || '/assets/products/venkateswara-frame-600.webp')}
                            sizes="64px"
                            alt=""
                            className="h-16 w-16 flex-shrink-0 rounded-xl border border-stone-deep bg-ivory object-contain"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-lg text-ink group-hover:text-burgundy">{p.name}</span>
                            <span className="mt-0.5 block text-xs text-ink-faint">
                              {p.dimensions || p.frameSize || 'Devotional frame'}
                              {p.indicativePrice ? (
                                <span className="font-semibold text-burgundy"> · {formatPrice(p.indicativePrice)}</span>
                              ) : null}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 text-gold opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
                {q && suggestions.length === 0 && (
                  <p className="text-sm text-ink-soft">No frames match “{query}”. Try a deity name such as Ganesha or Lakshmi.</p>
                )}
                {!q && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Popular</span>
                    {DEITY_SHORTCUTS.slice(0, 6).map(d => (
                      <Link key={d.slug} to={d.href} className="chip" onClick={onClose}>
                        {d.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {q && (
                <button type="button" onClick={() => submit()} className="text-link mt-6">
                  See all results <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

/* ------------------------------------------------------------------ Header */

export const Header: React.FC = () => {
  const { path, search } = useRouter();
  const { user, logout, initiateGoogleSignIn } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { products } = useProducts();
  const scrolled = useScrolled();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(0);
  const accountRef = useRef<HTMLDivElement>(null);
  const drawerRef = useDialogBehaviour(menuOpen, () => setMenuOpen(false));

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    setSearchOpen(false);
  }, [path, search]);

  useEffect(() => {
    const t = window.setInterval(() => setAnnouncement(i => (i + 1) % ANNOUNCEMENTS.length), 5000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentHref = path + (search.toString() ? `?${search.toString()}` : '');
  const isActive = (href: string) => (href === '/shop' ? path === '/shop' && !search.toString() : currentHref === href);

  const iconBtn =
    'relative grid h-11 w-11 place-items-center rounded-full text-ink transition-all duration-300 ease-luxury hover:bg-white hover:text-burgundy hover:shadow-soft';

  return (
    <>
      {/* Announcement bar */}
      <aside aria-label="Store announcements" className="relative overflow-hidden bg-burgundy-deep text-ivory-light">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(227,204,154,0.18),transparent)]" />
        <div className="container-content relative flex h-9 items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={announcement}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: EASE_LUXURY }}
              className="truncate text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-gold-light sm:text-[0.72rem]"
            >
              {ANNOUNCEMENTS[announcement]}
            </motion.p>
          </AnimatePresence>
        </div>
      </aside>

      {/* Main header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ease-luxury ${
          scrolled ? 'glass border-x-0 border-t-0 border-b-stone-deep/70 shadow-[0_10px_30px_-20px_rgba(46,12,20,0.35)]' : 'border-b border-stone-deep/60 bg-ivory-light/60 backdrop-blur-md'
        }`}
      >
        <div className="container-content">
          <div className={`grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500 ease-luxury ${scrolled ? 'h-16' : 'h-[72px] sm:h-[88px]'}`}>
            {/* Left: menu (mobile) / nav (desktop) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className={`${iconBtn} -ml-2 lg:hidden`}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
              >
                <Menu className="h-[22px] w-[22px]" strokeWidth={1.6} />
              </button>
              <nav aria-label="Primary" className="hidden lg:block">
                <ul className="flex items-center gap-7 xl:gap-9">
                  {NAV_LINKS.slice(0, 3).map(link => (
                    <li key={link.slug}>
                      <Link
                        to={link.href}
                        className={`group relative py-2 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                          isActive(link.href) ? 'text-burgundy' : 'text-ink hover:text-burgundy'
                        }`}
                      >
                        {link.label}
                        <span
                          className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-500 ease-luxury ${
                            isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <button type="button" onClick={() => setSearchOpen(true)} className={`${iconBtn} lg:hidden`} aria-label="Search">
                <Search className="h-5 w-5" strokeWidth={1.7} />
              </button>
            </div>

            {/* Centre: brand */}
            <BrandLockup compact={scrolled} />

            {/* Right: utilities */}
            <div className="flex items-center justify-end gap-1 sm:gap-1.5">
              <nav aria-label="Secondary" className="mr-4 hidden xl:block">
                <ul className="flex items-center gap-7">
                  {NAV_LINKS.slice(3).map(link => (
                    <li key={link.slug}>
                      <Link
                        to={link.href}
                        className={`group relative py-2 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] transition-colors ${
                          isActive(link.href) ? 'text-burgundy' : 'text-ink hover:text-burgundy'
                        }`}
                      >
                        {link.label}
                        <span className={`absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-500 ease-luxury ${isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <button type="button" onClick={() => setSearchOpen(true)} className={`${iconBtn} hidden lg:grid`} aria-label="Search">
                <Search className="h-5 w-5" strokeWidth={1.7} />
              </button>

              <div ref={accountRef} className="relative hidden sm:block">
                {user ? (
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(o => !o)}
                    className={iconBtn}
                    aria-label="Account menu"
                    aria-expanded={accountMenuOpen}
                  >
                    {user.picture ? (
                      <img src={user.picture} alt="" className="h-8 w-8 rounded-full border border-gold/50 object-cover" />
                    ) : (
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-burgundy text-[0.75rem] font-bold text-ivory-light">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                ) : (
                  <button type="button" onClick={() => initiateGoogleSignIn()} className={iconBtn} aria-label="Sign in">
                    <UserIcon className="h-5 w-5" strokeWidth={1.7} />
                  </button>
                )}

                <AnimatePresence>
                  {accountMenuOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: EASE_LUXURY }}
                      className="absolute right-0 top-full z-50 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-stone-deep bg-white shadow-dialog"
                    >
                      <div className="border-b border-stone-deep bg-ivory-light px-5 py-4">
                        <p className="truncate font-display text-lg text-ink">{user.name}</p>
                        <p className="truncate text-xs text-ink-faint">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/account/orders"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink transition-colors hover:bg-ivory hover:text-burgundy"
                        >
                          <Package className="h-4 w-4 text-gold-dark" /> My order requests
                        </Link>
                        <button
                          type="button"
                          onClick={() => logout()}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-800 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={openDrawer}
                className={`${iconBtn} -mr-2 sm:mr-0`}
                aria-label={`View request list (${itemCount} items)`}
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-burgundy px-1 text-[0.625rem] font-bold text-ivory-light ring-2 ring-ivory-light"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Deity row (desktop) */}
        <div
          className={`hidden overflow-hidden border-t border-stone-deep/60 transition-all duration-500 ease-luxury lg:block ${
            scrolled ? 'max-h-0 border-transparent opacity-0' : 'max-h-12 opacity-100'
          }`}
        >
          <div className="container-content flex h-11 items-center justify-center gap-1">
            <span className="mr-3 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold-dark">Shop by deity</span>
            {DEITY_SHORTCUTS.map(sc => (
              <Link
                key={sc.slug}
                to={sc.href}
                className={`rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-all duration-300 ${
                  currentHref === sc.href ? 'bg-burgundy text-ivory-light' : 'text-ink-soft hover:bg-white hover:text-burgundy'
                }`}
              >
                {sc.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} products={products} />

      {/* Mobile / tablet drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-umber/50 backdrop-blur-sm"
            />
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              tabIndex={-1}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.55, ease: EASE_LUXURY }}
              className="absolute bottom-0 left-0 top-0 flex w-[86vw] max-w-[380px] flex-col bg-ivory-light shadow-drawer focus:outline-none"
            >
              <div className="relative overflow-hidden bg-burgundy-deep px-6 pb-7 pt-6 text-ivory-light">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <LotusMark className="mb-1.5 h-4 w-7 text-gold-light" />
                    <p className="font-wordmark text-2xl font-semibold tracking-[0.24em]">SWAYARI</p>
                    <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-gold-light">Décor &amp; Gifting</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="grid h-11 w-11 place-items-center rounded-full text-ivory-light/80 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link, i) => (
                    <motion.li
                      key={link.slug}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: EASE_LUXURY }}
                    >
                      <Link
                        to={link.href}
                        className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-[1.5rem] text-ink transition-colors hover:bg-white hover:text-burgundy"
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 text-gold" />
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                <p className="eyebrow mt-8 px-4">Shop by deity</p>
                <div className="mt-4 flex flex-wrap gap-2 px-4">
                  {DEITY_SHORTCUTS.map(sc => (
                    <Link key={sc.slug} to={sc.href} className="chip">
                      {sc.label}
                    </Link>
                  ))}
                </div>

                <div className="mx-4 mt-8 rounded-2xl border border-gold/30 bg-gold-pale/50 p-4 text-[0.8125rem] leading-relaxed text-ink-soft">
                  <p className="font-display text-lg text-burgundy">Planning a celebration?</p>
                  All frames ₹99 &amp; under. Send your request and our team will personally confirm quantities, packing and shipping.
                  <Link to="/contact" className="text-link mt-3 flex">
                    <Phone className="h-3.5 w-3.5" /> Talk to us
                  </Link>
                </div>
              </div>

              <div className="border-t border-stone-deep bg-white p-4 pb-safe">
                {user ? (
                  <div className="flex items-center justify-between gap-3">
                    <Link to="/account/orders" className="flex min-w-0 items-center gap-3">
                      {user.picture ? (
                        <img src={user.picture} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-burgundy font-bold text-ivory-light">{user.name.charAt(0)}</span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{user.name}</span>
                        <span className="block truncate text-xs text-ink-faint">My order requests</span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="grid h-11 w-11 place-items-center rounded-full text-red-800 hover:bg-red-50"
                      aria-label="Sign out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => initiateGoogleSignIn()} className="btn-primary w-full">
                    <UserIcon className="h-4 w-4" /> Sign in with Google
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MobileTabBar
        path={path}
        itemCount={itemCount}
        onSearch={() => setSearchOpen(true)}
        onCart={openDrawer}
        onAccount={() => (user ? undefined : initiateGoogleSignIn())}
        signedIn={Boolean(user)}
      />
    </>
  );
};

/* ------------------------------------------------------------------ Mobile tab bar */

const MobileTabBar: React.FC<{
  path: string;
  itemCount: number;
  signedIn: boolean;
  onSearch: () => void;
  onCart: () => void;
  onAccount: () => void;
}> = ({ path, itemCount, signedIn, onSearch, onCart, onAccount }) => {
  const item = 'flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] transition-colors';
  const on = 'text-burgundy';
  const off = 'text-ink-soft';
  return (
    <nav
      aria-label="Quick navigation"
      className="glass fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 border-t-stone-deep/80 pb-safe pt-1 shadow-[0_-10px_30px_-20px_rgba(46,12,20,0.35)] md:hidden"
    >
      <div className="flex px-2">
        <Link to="/" className={`${item} ${path === '/' ? on : off}`}>
          <Home className="h-5 w-5" strokeWidth={1.7} /> Home
        </Link>
        <Link to="/shop" className={`${item} ${path === '/shop' ? on : off}`}>
          <LayoutGrid className="h-5 w-5" strokeWidth={1.7} /> Shop
        </Link>
        <button type="button" onClick={onSearch} className={`${item} ${off}`}>
          <Search className="h-5 w-5" strokeWidth={1.7} /> Search
        </button>
        <button type="button" onClick={onCart} className={`${item} ${off} relative`}>
          <span className="relative">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
            {itemCount > 0 && (
              <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-burgundy px-1 text-[0.55rem] text-ivory-light">
                {itemCount}
              </span>
            )}
          </span>
          Request
        </button>
        {signedIn ? (
          <Link to="/account/orders" className={`${item} ${path.startsWith('/account') ? on : off}`}>
            <UserIcon className="h-5 w-5" strokeWidth={1.7} /> Account
          </Link>
        ) : (
          <button type="button" onClick={onAccount} className={`${item} ${off}`}>
            <UserIcon className="h-5 w-5" strokeWidth={1.7} /> Sign in
          </button>
        )}
      </div>
    </nav>
  );
};
