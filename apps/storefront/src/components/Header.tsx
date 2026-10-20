import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Menu, Search, ShoppingBag, User as UserIcon, X, LogOut, Package, 
  ChevronRight, Phone, Sparkles, Check, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useRouter } from '../lib/router';
import { useProducts } from '../lib/products';
import { formatPrice } from '@swayari/shared';

const NAV_LINKS = [
  { slug: 'all-frames', label: 'All Frames', href: '/shop' },
  { slug: 'wedding-return-gifts', label: 'Wedding Return Gifts', href: '/shop?bulk=1' },
  { slug: 'how-to-order', label: 'How to Order', href: '/#how-to-order' },
  { slug: 'contact', label: 'Contact', href: '/contact' }
];

const DEITY_SHORTCUTS = [
  { slug: 'ganesha', label: 'Ganesha', href: '/shop?deity=ganesha' },
  { slug: 'lakshmi', label: 'Lakshmi', href: '/shop?deity=lakshmi' },
  { slug: 'balaji', label: 'Balaji (Venkateswara)', href: '/shop?deity=balaji' },
  { slug: 'radha-krishna', label: 'Radha Krishna', href: '/shop?deity=radha-krishna' },
  { slug: 'hanuman', label: 'Hanuman', href: '/shop?deity=hanuman' },
  { slug: 'under-49', label: 'Pocket Favors (≤ ₹49)', href: '/shop?budget=under-49' }
];

export const Header: React.FC = () => {
  const { path, navigate } = useRouter();
  const { user, logout, initiateGoogleSignIn } = useAuth();
  const signOut = () => logout();
  const requestSignIn = () => initiateGoogleSignIn();
  const { itemCount, openDrawer } = useCart();
  const { products } = useProducts();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
    setIsSearchFocused(false);
  }, [path]);

  // Click outside to close search dropdown & account dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter search suggestions as user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const filtered = products
      .filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.deity && p.deity.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      )
      .slice(0, 5);
    setSuggestions(filtered);
  }, [searchQuery, products]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    setIsSearchFocused(false);
    if (q) {
      navigate(`/shop?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/shop');
    }
  }

  function handleSuggestionClick(slug: string) {
    setIsSearchFocused(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  }

  return (
    <>
      {/* 1. Top Notice Strip */}
      <aside aria-label="Devotional frames proposition" className="bg-[#5C1D24] text-[#FDFBF7] text-[12px] font-medium py-1.5 px-4 tracking-wide shadow-inner">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C49A45]/30 text-[#E8D29E] text-[10px]">✨</span>
            <span>
              <strong className="font-semibold text-white">Devotional frames ₹99 &amp; under</strong> — Thoughtful return gifts for your special celebrations.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-[#FDFBF7]/90">
            <span>Shipping quoted separately by our team</span>
            <Link to="/contact" className="hover:text-white underline underline-offset-2 transition-colors">
              Bulk Enquiry Concierge
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Shopping Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E6DDD5] shadow-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Brand, Search, Utilities */}
          <div className="flex items-center justify-between h-[68px] md:h-[76px] gap-4 md:gap-8">
            
            {/* Left: Mobile hamburger + SWAYARI Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#2B2625] hover:text-[#5C1D24] transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
              >
                <Menu className="w-6 h-6" strokeWidth={1.75} />
              </button>

              <Link to="/" className="flex items-center gap-2.5 group py-1" aria-label="SWAYARI Home">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#C49A45]/40 bg-[#FAF7F2] p-1.5 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                  <img src="/assets/brand/swayari-logo.svg" alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-wordmark text-[1.375rem] md:text-[1.625rem] font-bold tracking-[0.12em] text-[#5C1D24] leading-none group-hover:text-[#4A161D] transition-colors">
                    SWAYARI
                  </span>
                  <span className="text-[10px] md:text-[11px] tracking-[0.22em] text-[#C49A45] uppercase font-sans font-medium mt-0.5">
                    Décor &amp; Gifting
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Prominent Search Bar (Desktop) */}
            <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-[560px] relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <div className="absolute left-3.5 text-[#6B6362] pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search god frames and return gifts"
                  className="w-full h-[42px] pl-10 pr-10 rounded-full border border-[#E6DDD5] bg-[#FAF7F2] text-[#2B2625] text-[14px] placeholder-[#6B6362] focus:outline-none focus:border-[#5C1D24] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#5C1D24] transition-all shadow-inner"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    className="absolute right-3.5 text-[#6B6362] hover:text-[#2B2625] p-1"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Live Search Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E6DDD5] shadow-lg overflow-hidden z-50 divide-y divide-[#F4EFEB]"
                  >
                    {suggestions.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-1.5 text-[11px] font-semibold text-[#6B6362] uppercase tracking-wider">
                          Suggested Devotional Frames
                        </div>
                        {suggestions.map((p) => {
                          const thumb = p.images?.[0] || '/assets/products/venkateswara-frame-960.webp';
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSuggestionClick(p.slug)}
                              className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-[#FAF7F2] text-left transition-colors group"
                            >
                              <img src={thumb} alt="" className="w-11 h-11 rounded-lg object-contain bg-[#FAF7F2] border border-[#E6DDD5]/60 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-[#2B2625] group-hover:text-[#5C1D24] truncate">
                                  {p.name}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-[#6B6362] mt-0.5">
                                  <span>{p.dimensions || p.frameSize || 'Devotional Frame'}</span>
                                  {p.indicativePrice && (
                                    <>
                                      <span>•</span>
                                      <span className="font-semibold text-[#5C1D24]">{formatPrice(p.indicativePrice)} per frame</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[#6B6362] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          );
                        })}
                        <div className="p-2 bg-[#FAF7F2] border-t border-[#E6DDD5]/60">
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="w-full text-center py-1.5 text-[12px] font-medium text-[#5C1D24] hover:underline flex items-center justify-center gap-1.5"
                          >
                            <span>See all results for "{searchQuery}"</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-[13px] text-[#6B6362]">
                        No matching devotional frames found for "{searchQuery}".
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="text-[#5C1D24] font-semibold hover:underline"
                          >
                            Browse All Frames (≤ ₹99)
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Account & Cart Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Account / My Requests */}
              <div ref={accountRef} className="relative">
                {user ? (
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FAF7F2] transition-colors border border-transparent hover:border-[#E6DDD5]"
                    aria-label="Customer account menu"
                  >
                    {user.picture ? (
                      <img src={user.picture} alt="" className="w-7 h-7 rounded-full object-cover border border-[#C49A45]/40" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#C49A45]/40 flex items-center justify-center text-[#5C1D24] text-[12px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline text-[13px] font-medium text-[#2B2625] max-w-[120px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={requestSignIn}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E6DDD5] hover:border-[#5C1D24] text-[#2B2625] hover:text-[#5C1D24] text-[13px] font-medium transition-all hover:bg-[#FAF7F2]"
                  >
                    <UserIcon className="w-4 h-4 text-[#C49A45]" />
                    <span>Sign In</span>
                  </button>
                )}

                {/* Account dropdown */}
                <AnimatePresence>
                  {accountMenuOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white border border-[#E6DDD5] shadow-lg py-1.5 z-50"
                    >
                      <div className="px-4 py-2 border-b border-[#F4EFEB]">
                        <p className="text-[13px] font-bold text-[#2B2625] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#6B6362] truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#2B2625] hover:bg-[#FAF7F2] hover:text-[#5C1D24]"
                      >
                        <Package className="w-4 h-4 text-[#C49A45]" />
                        <span>My Order Requests</span>
                      </Link>
                      <button
                        type="button"
                        onClick={signOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[#B42318] hover:bg-[#FDF2F2] text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Request Cart Button */}
              <button
                type="button"
                onClick={openDrawer}
                className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFEB] border border-[#E6DDD5] text-[#5C1D24] transition-colors"
                aria-label={`View request list (${itemCount} items)`}
              >
                <ShoppingBag className="w-5 h-5 text-[#5C1D24]" />
                <span className="hidden sm:inline text-[13px] font-semibold">Request</span>
                {itemCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#5C1D24] text-white text-[11px] font-bold shadow-xs">
                    {itemCount}
                  </span>
                )}
              </button>

            </div>

          </div>

          {/* Mobile Search Bar Row */}
          <div className="md:hidden pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-[#6B6362]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search god frames and return gifts"
                className="w-full h-[38px] pl-10 pr-9 rounded-full border border-[#E6DDD5] bg-[#FAF7F2] text-[13px] placeholder-[#6B6362] focus:outline-none focus:border-[#5C1D24] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#6B6362] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

        </div>

        {/* 3. Bottom Navigation Strip: Clean Confirmed Navigation (All Frames, Wedding Return Gifts, How to Order, Contact + Deity Shortcuts) */}
        <nav aria-label="Storefront navigation" className="bg-[#FAF7F2] border-t border-[#E6DDD5] overflow-x-auto scrollbar-none">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2 min-w-max gap-4">
              
              {/* Primary Navigation Links */}
              <ul className="flex items-center gap-1 sm:gap-2">
                {NAV_LINKS.map((link) => {
                  const isSelected = path === link.href;

                  return (
                    <li key={link.slug}>
                      <Link
                        to={link.href}
                        className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-semibold tracking-wide transition-all ${
                          isSelected
                            ? 'bg-[#5C1D24] text-white shadow-xs'
                            : 'text-[#2B2625] hover:text-[#5C1D24] hover:bg-white'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Quick Deity Filter Shortcuts */}
              <div className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-[#E6DDD5]">
                <span className="text-[11px] font-bold text-[#C49A45] uppercase tracking-wider mr-1">Deities:</span>
                {DEITY_SHORTCUTS.map((sc) => (
                  <Link
                    key={sc.slug}
                    to={sc.href}
                    className="px-2.5 py-1 rounded-md text-[12px] font-medium text-[#6B6362] hover:text-[#5C1D24] hover:bg-white transition-colors"
                  >
                    {sc.label}
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </nav>
      </header>

      {/* 4. Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 bottom-0 left-0 w-[82vw] max-w-[340px] bg-white border-r border-[#E6DDD5] shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E6DDD5] flex items-center justify-between bg-[#FAF7F2]">
                <div className="flex items-center gap-2">
                  <img src="/assets/brand/swayari-logo.svg" alt="" className="w-8 h-8 object-contain" />
                  <span className="font-wordmark font-bold text-[1.25rem] text-[#5C1D24] tracking-wider">SWAYARI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 text-[#6B6362] hover:text-[#2B2625]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-bold text-[#C49A45] uppercase tracking-widest">
                    Navigation
                  </p>
                  <div className="space-y-1 mt-1">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.slug}
                        to={link.href}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-semibold text-[#2B2625] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <span>{link.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#6B6362]" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="px-3 py-1.5 text-[11px] font-bold text-[#C49A45] uppercase tracking-widest">
                    Popular Deities &amp; Favors
                  </p>
                  <div className="space-y-1 mt-1">
                    {DEITY_SHORTCUTS.map((sc) => (
                      <Link
                        key={sc.slug}
                        to={sc.href}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium text-[#6B6362] hover:bg-[#FAF7F2] hover:text-[#5C1D24] transition-colors"
                      >
                        <span>{sc.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#6B6362]" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6DDD5]">
                  <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DDD5] text-[12px] text-[#6B6362] leading-relaxed">
                    <strong className="text-[#5C1D24] block mb-1">Bulk Return Gifts</strong>
                    All frames ₹99 &amp; under. Shipping quoted separately. Submit your bulk request and our team will contact you.
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#E6DDD5] bg-[#FAF7F2]">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {user.picture ? (
                        <img src={user.picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#5C1D24] text-white flex items-center justify-center font-bold text-[12px]">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#2B2625] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#6B6362] truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={signOut}
                      className="p-2 text-[#B42318] hover:bg-white rounded-lg transition-colors"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={requestSignIn}
                    className="w-full py-2.5 rounded-lg bg-[#5C1D24] text-white text-[13px] font-semibold hover:bg-[#4A161D] transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-[#E8D29E]" />
                    <span>Sign in with Google</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
