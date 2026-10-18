import React, { useEffect, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, AlertCircle, Lock, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { handleGoogleCallback, authError, clearAuthError, devLoginAdmin } = useAdminAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Render Google Sign-in button if GIS is available
    if (window.google?.accounts?.id && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: '1097223362145-admin.apps.googleusercontent.com', // Verified server-side
        callback: (response: any) => {
          if (response.credential) {
            handleGoogleCallback(response.credential);
          }
        },
        auto_select: false
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 320
      });
    }
  }, []);

  const isLocalDev = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-ivory-border shadow-card p-8 sm:p-10 space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <img
            src="/assets/brand/swayari-logo.svg"
            alt="SWAYARI — Décor & Gifting"
            className="h-12 w-auto mx-auto object-contain"
          />
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-burgundy-light text-burgundy text-xs font-semibold tracking-wide">
            <Lock className="w-3.5 h-3.5" />
            <span>Staff Operations &amp; Order Portal</span>
          </div>
          <p className="text-xs text-charcoal-muted font-light leading-relaxed">
            Restricted to authorized SWAYARI administrators and studio personnel. Please authenticate with your official Google account.
          </p>
        </div>

        {/* Access Denied Warning if unauthorized email attempted */}
        {authError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-2">
            <div className="flex items-center space-x-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Authorization Access Denied</span>
            </div>
            <p className="font-light leading-relaxed">
              {authError}
            </p>
            <p className="text-[11px] text-red-600 font-light">
              Only verified identities listed in the backend staff allowlist (<span className="font-mono">swayarienterprises@gmail.com</span>) can access the admin dashboard.
            </p>
          </div>
        )}

        {/* Google Sign-In Area */}
        <div className="space-y-4">
          <div className="flex justify-center" ref={googleBtnRef}>
            <div className="text-xs text-charcoal-light py-2">
              Loading Google Sign-in...
            </div>
          </div>

          <div className="text-center">
            <span className="text-[11px] text-charcoal-light">
              Required Account: <span className="font-medium text-charcoal">swayarienterprises@gmail.com</span>
            </span>
          </div>
        </div>

        {/* Local Dev Login Shortcut (Dev mode only) */}
        {isLocalDev && (
          <div className="pt-4 border-t border-ivory-border text-center space-y-2">
            <p className="text-[11px] text-amber-800 font-medium">Local Development Mode</p>
            <button
              onClick={() => devLoginAdmin()}
              className="w-full py-2.5 px-4 rounded-lg bg-burgundy text-white text-xs font-medium hover:bg-burgundy-hover transition-colors shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>Quick Login as Studio Admin (Local Test)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Security Footnote */}
        <div className="text-center pt-2 border-t border-ivory-border/60 text-[10px] text-charcoal-light space-y-1">
          <p className="flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>Host-Only Scoped Session Security • Protected Portal</span>
          </p>
          <p>© {new Date().getFullYear()} SWAYARI ENTERPRISES</p>
        </div>

      </div>
    </div>
  );
};
