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

const CATEGORIES = [
  { slug: 'all', label: 'All Pieces', href: '/shop' },
  { slug: 'devotional-frames', label: 'Devotional Frames', href: '/shop?category=devotional-frames' },
  { slug: 'decorative-lamps', label: 'Decorative Lamps', href: '/shop?category=decorative-lamps' },
  { slug: 'home-accents', label: 'Home Accents', href: '/shop?category=home-accents' },
  { slug: 'festive-decor', label: 'Festive Décor', href: '/shop?category=festive-decor' },
  { slug: 'gift-sets', label: 'Gift Sets', href: '/shop?category=gift-sets' },
  { slug: 'about', label: 'Our Story', href: '/about' },
  { slug: 'contact', label: 'Contact', href: '/contact' }
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

  const currentCategory = new URLSearchParams(window.location.search).get('category');
  const isShopActive = path === '/shop' || path.startsWith('/product/');

  return (
    <>
      {/* 1. Top Notice Strip */}
      <aside aria-label="Order request model notice" className="bg-[#571C2A] text-[#F7F4EF] text-[12px] font-medium py-1.5 px-4 tracking-wide shadow-inner">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#B49155]/20 text-[#B49155] text-[10px]">✨</span>
            <span>
              <strong className="font-semibold text-white">Design Preview Store:</strong> Sample prices &amp; pieces for layout evaluation.
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-[#F7F4EF]/85">
            <span>No upfront online payment · Personal phone consultation</span>
            <Link to="/contact" className="hover:text-white underline underline-offset-2 transition-colors">
              Call / WhatsApp Us
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. Main Shopping Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E7DFD5] shadow-soft">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Brand, Search, Utilities */}
          <div className="flex items-center justify-between h-[68px] md:h-[76px] gap-4 md:gap-8">
            
            {/* Left: Mobile hamburger + SWAYARI Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-[#292421] hover:text-[#571C2A] transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
              >
                <Menu className="w-6 h-6" strokeWidth={1.75} />
              </button>

              <Link to="/" className="flex items-center gap-2.5 group py-1" aria-label="SWAYARI Home">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-[#B49155]/40 bg-[#FAF7F2] p-1.5 flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                  <img src="/assets/brand/swayari-logo.svg" alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-wordmark text-[1.375rem] md:text-[1.625rem] font-bold tracking-[0.12em] text-[#571C2A] leading-none group-hover:text-[#441420] transition-colors">
                    SWAYARI
                  </span>
                  <span className="text-[10px] md:text-[11px] tracking-[0.22em] text-[#B49155] uppercase font-sans font-medium mt-0.5">
                    Décor &amp; Gifting
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Prominent Tanishq/Amazon-style Search Bar (Desktop) */}
            <div ref={searchContainerRef} className="hidden md:block flex-1 max-w-[560px] relative">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <div className="absolute left-3.5 text-[#7A6E66] pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search décor, gifts and more"
                  className="w-full h-[42px] pl-10 pr-10 rounded-full border border-[#E7DFD5] bg-[#FAF7F2] text-[#292421] text-[14px] placeholder-[#7A6E66] focus:outline-none focus:border-[#571C2A] focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#571C2A] transition-all shadow-inner"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                    className="absolute right-3.5 text-[#7A6E66] hover:text-[#292421] p-1"
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
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E7DFD5] shadow-modal overflow-hidden z-50 divide-y divide-[#F4EFEA]"
                  >
                    {suggestions.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-1.5 text-[11px] font-semibold text-[#7A6E66] uppercase tracking-wider">
                          Suggested Pieces
                        </div>
                        {suggestions.map((p) => {
                          const thumb = p.images?.[0] || '/assets/demo/sample_product_1.jpeg';
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSuggestionClick(p.slug)}
                              className="w-full px-4 py-2.5 flex items-center gap-3.5 hover:bg-[#FAF7F2] text-left transition-colors group"
                            >
                              <img src={thumb} alt="" className="w-11 h-11 rounded-lg object-cover bg-[#F4EFEA] border border-[#E7DFD5]/60 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-[#292421] group-hover:text-[#571C2A] truncate">
                                  {p.name}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-[#7A6E66] mt-0.5">
                                  <span>{p.categoryName || 'Décor'}</span>
                                  {p.indicativePrice && (
                                    <>
                                      <span>•</span>
                                      <span className="font-semibold text-[#571C2A]">{formatPrice(p.indicativePrice)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-[#7A6E66] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          );
                        })}
                        <div className="p-2 bg-[#FAF7F2] border-t border-[#E7DFD5]/60">
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="w-full text-center py-1.5 text-[12px] font-medium text-[#571C2A] hover:underline flex items-center justify-center gap-1.5"
                          >
                            <span>See all results for "{searchQuery}"</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-[13px] text-[#544A44]">
                        No matching pieces found for "{searchQuery}".
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="text-[#571C2A] font-semibold hover:underline"
                          >
                            Browse All Pieces in Catalogue
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
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FAF7F2] transition-colors border border-transparent hover:border-[#E7DFD5]"
                    aria-label="Customer account menu"
                  >
                    {user.picture ? (
                      <img src={user.picture} alt="" className="w-7 h-7 rounded-full object-cover border border-[#B49155]/40" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#571C2A] text-white text-[12px] font-semibold flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline-block text-[13px] font-medium text-[#292421] max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={requestSignIn}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FAF7F2] text-[#292421] hover:text-[#571C2A] transition-colors border border-transparent hover:border-[#E7DFD5]"
                  >
                    <UserIcon className="w-5 h-5 text-[#544A44]" />
                    <span className="hidden sm:inline-block text-[13px] font-medium">Sign In</span>
                  </button>
                )}

                {/* Account Dropdown */}
                <AnimatePresence>
                  {accountMenuOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E7DFD5] shadow-modal py-2 z-50 text-[13px]"
                    >
                      <div className="px-4 py-2 border-b border-[#F4EFEA]">
                        <p className="font-semibold text-[#292421] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#7A6E66] truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account/orders"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[#292421] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#571C2A]" />
                        <span>My Order Requests</span>
                      </Link>
                      <button
                        type="button"
                        onClick={signOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[#B42318] hover:bg-[#FAF7F2] text-left transition-colors border-t border-[#F4EFEA]"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Cart / Bag Button */}
              <button
                type="button"
                onClick={openDrawer}
                className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-[#FAF7F2] hover:bg-[#F4EFEA] border border-[#E7DFD5] transition-all hover:border-[#B49155]/60 group"
                aria-label={`Shopping bag with ${itemCount} items`}
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-[#571C2A] group-hover:scale-105 transition-transform" strokeWidth={1.8} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#571C2A] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[13px] font-semibold text-[#292421] hidden sm:inline-block">
                  Cart
                </span>
              </button>

            </div>

          </div>

          {/* Mobile Search Row (Full Width) */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 text-[#7A6E66]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search décor, gifts and more"
                className="w-full h-[38px] pl-10 pr-9 rounded-full border border-[#E7DFD5] bg-[#FAF7F2] text-[13px] placeholder-[#7A6E66] focus:outline-none focus:border-[#571C2A] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[#7A6E66] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

        </div>

        {/* 3. Bottom Category Navigation Strip (Tanishq/Amazon Style) */}
        <nav aria-label="Category navigation" className="bg-[#FAF7F2] border-t border-[#E7DFD5] overflow-x-auto scrollbar-none">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center gap-1 sm:gap-2 md:gap-4 py-2 min-w-max">
              {CATEGORIES.map((cat) => {
                const isSelected = 
                  cat.slug === 'all' 
                    ? isShopActive && !currentCategory
                    : currentCategory === cat.slug;

                return (
                  <li key={cat.slug}>
                    <Link
                      to={cat.href}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12.5px] md:text-[13px] font-medium tracking-wide transition-all ${
                        isSelected
                          ? 'bg-[#571C2A] text-white shadow-sm'
                          : 'text-[#544A44] hover:text-[#571C2A] hover:bg-white'
                      }`}
                    >
                      {cat.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
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
              className="absolute top-0 bottom-0 left-0 w-[82vw] max-w-[340px] bg-white border-r border-[#E7DFD5] shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#E7DFD5] flex items-center justify-between bg-[#FAF7F2]">
                <div className="flex items-center gap-2">
                  <img src="/assets/brand/swayari-logo.svg" alt="" className="w-8 h-8 object-contain" />
                  <span className="font-wordmark font-bold text-[1.25rem] text-[#571C2A] tracking-wider">SWAYARI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 text-[#544A44] hover:text-[#292421]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="px-3 py-1.5 text-[11px] font-bold text-[#7A6E66] uppercase tracking-widest">
                  Categories
                </p>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={cat.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#292421] hover:bg-[#FAF7F2] transition-colors"
                  >
                    <span>{cat.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#7A6E66]" />
                  </Link>
                ))}

                <div className="pt-4 border-t border-[#E7DFD5] mt-4 space-y-1">
                  <p className="px-3 py-1.5 text-[11px] font-bold text-[#7A6E66] uppercase tracking-widest">
                    Customer Care
                  </p>
                  <Link
                    to="/ordering-policy"
                    className="block px-3 py-2 text-[13px] text-[#544A44] hover:text-[#571C2A]"
                  >
                    How Ordering Works
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-3 py-2 text-[13px] text-[#544A44] hover:text-[#571C2A]"
                  >
                    Contact &amp; Customization
                  </Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#E7DFD5] bg-[#FAF7F2]">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <p className="text-[13px] font-semibold text-[#292421]">{user.name}</p>
                      <p className="text-[11px] text-[#7A6E66] truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={signOut}
                      className="p-2 text-[#B42318] hover:bg-white rounded-lg transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); requestSignIn(); }}
                    className="w-full py-2.5 rounded-lg bg-[#571C2A] text-white text-[13px] font-semibold hover:bg-[#441420] transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Sign In with Google</span>
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
