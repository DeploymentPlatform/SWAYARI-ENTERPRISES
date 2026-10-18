import React, { useState, useEffect } from 'react';
import { ShoppingBag, User as UserIcon, Menu, X, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { user, initiateGoogleSignIn, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top Heritage Ribbon */}
      <div className="bg-burgundy-deep text-ivory-light py-1.5 px-4 text-center text-xs tracking-widest uppercase font-medium border-b border-gold/20">
        Bespoke Devotional Décor &amp; Handcrafted Gifting — Hand-finished in India
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-ivory/95 backdrop-blur-md shadow-subtle py-3 border-b border-ivory-border'
            : 'bg-ivory py-4 border-b border-ivory-border/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-charcoal hover:text-burgundy focus:outline-none"
                aria-label="Open navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-wide">
              <button
                onClick={() => navigate('/shop')}
                className={`transition-colors hover:text-burgundy ${
                  currentPath === '/shop' ? 'text-burgundy font-semibold border-b-2 border-burgundy pb-0.5' : 'text-charcoal'
                }`}
              >
                Shop Catalogue
              </button>
              <button
                onClick={() => navigate('/about')}
                className={`transition-colors hover:text-burgundy ${
                  currentPath === '/about' ? 'text-burgundy font-semibold border-b-2 border-burgundy pb-0.5' : 'text-charcoal'
                }`}
              >
                Our Craft &amp; Story
              </button>
              <button
                onClick={() => navigate('/contact')}
                className={`transition-colors hover:text-burgundy ${
                  currentPath === '/contact' ? 'text-burgundy font-semibold border-b-2 border-burgundy pb-0.5' : 'text-charcoal'
                }`}
              >
                Enquire / Contact
              </button>
            </nav>

            {/* Central Brand Identity (Logo SVG) */}
            <div className="flex justify-center flex-1 lg:flex-none">
              <button
                onClick={() => navigate('/')}
                className="group flex flex-col items-center focus:outline-none"
                aria-label="SWAYARI Home"
              >
                <img
                  src="/assets/brand/swayari-logo.svg"
                  alt="SWAYARI — Décor & Gifting"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
                />
              </button>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Catalogue Search Shortcut */}
              <button
                onClick={() => navigate('/shop')}
                className="p-2 text-charcoal hover:text-burgundy transition-colors"
                title="Search collection"
                aria-label="Search collection"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Customer Account / Sign In */}
              {user ? (
                <div className="relative group">
                  <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-ivory-muted text-charcoal hover:text-burgundy transition-colors"
                    title={`Signed in as ${user.name}`}
                  >
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full border border-gold/40" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                    <span className="hidden md:inline text-xs font-medium text-charcoal max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-card border border-ivory-border py-1 hidden group-hover:block z-50">
                    <div className="px-4 py-2 border-b border-ivory-border text-xs text-charcoal-muted">
                      <p className="font-semibold text-charcoal truncate">{user.name}</p>
                      <p className="truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => navigate('/orders')}
                      className="w-full text-left px-4 py-2 text-xs text-charcoal hover:bg-ivory-muted hover:text-burgundy"
                    >
                      My Order Requests
                    </button>
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center space-x-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => initiateGoogleSignIn()}
                  className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-burgundy/30 text-burgundy hover:bg-burgundy hover:text-white transition-all duration-200"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Cart Drawer Trigger */}
              <button
                onClick={openDrawer}
                className="relative p-2 text-charcoal hover:text-burgundy transition-colors"
                aria-label={`Shopping bag with ${itemCount} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-burgundy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-ivory-border bg-ivory px-4 pt-3 pb-5 space-y-3 animate-fadeIn">
            <button
              onClick={() => {
                navigate('/shop');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-base font-serif text-charcoal hover:text-burgundy border-b border-ivory-border/50"
            >
              Shop Catalogue
            </button>
            <button
              onClick={() => {
                navigate('/about');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-base font-serif text-charcoal hover:text-burgundy border-b border-ivory-border/50"
            >
              Our Craft &amp; Story
            </button>
            <button
              onClick={() => {
                navigate('/contact');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-base font-serif text-charcoal hover:text-burgundy border-b border-ivory-border/50"
            >
              Enquire / Contact
            </button>
            {user ? (
              <button
                onClick={() => {
                  navigate('/orders');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm text-burgundy font-medium"
              >
                My Order Requests ({user.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  initiateGoogleSignIn();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-sm text-burgundy font-medium"
              >
                Sign In with Google
              </button>
            )}
          </div>
        )}
      </header>
    </>
  );
};
