import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { User, CartItem } from '@swayari/shared';

interface AuthConfig {
  googleClientId: string | null;
  devLoginAvailable: boolean;
}

interface SignInRequest {
  reason: 'add' | 'checkout' | 'orders' | 'account';
  pendingItem?: CartItem;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  config: AuthConfig;
  signInRequest: SignInRequest | null;
  signInError: string | null;
  /** Opens the sign-in dialog; an optional item is added to the bag once, after sign-in. */
  initiateGoogleSignIn: (pendingItem?: CartItem, reason?: SignInRequest['reason']) => void;
  closeSignIn: () => void;
  /** Hides the dialog but keeps the pending item (used when switching to local dev sign-in). */
  hideSignIn: () => void;
  handleGoogleCallback: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  consumePendingAddToCart: () => CartItem | null;
  devLoginCustomer: () => Promise<boolean>;
}

const PENDING_KEY = 'swayari_pending_add';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readPending(): CartItem | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as CartItem) : null;
  } catch {
    return null;
  }
}

function writePending(item: CartItem | null) {
  try {
    if (item) sessionStorage.setItem(PENDING_KEY, JSON.stringify(item));
    else sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<AuthConfig>({ googleClientId: null, devLoginAvailable: false });
  const [signInRequest, setSignInRequest] = useState<SignInRequest | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);
  const pendingRef = useRef<CartItem | null>(readPending());

  useEffect(() => {
    checkSession();
    fetch('/api/auth/config')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setConfig({ googleClientId: data.googleClientId || null, devLoginAvailable: Boolean(data.devLoginAvailable) });
      })
      .catch(() => undefined);
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = res.ok ? await res.json() : null;
      setUser(data?.authenticated && data.user ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const initiateGoogleSignIn = useCallback((pendingItem?: CartItem, reason: SignInRequest['reason'] = 'account') => {
    pendingRef.current = pendingItem || null;
    writePending(pendingItem || null);
    setSignInError(null);
    setSignInRequest({ reason: pendingItem ? 'add' : reason, pendingItem });
  }, []);

  const closeSignIn = useCallback(() => {
    setSignInRequest(null);
    setSignInError(null);
    // Closing without signing in abandons the intended add.
    pendingRef.current = null;
    writePending(null);
  }, []);

  const hideSignIn = useCallback(() => setSignInRequest(null), []);

  async function handleGoogleCallback(credential: string): Promise<boolean> {
    setSignInError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credential })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.user) throw new Error(data.error || 'Sign-in could not be completed.');
      setUser(data.user);
      setSignInRequest(null);
      return true;
    } catch (err: any) {
      setSignInError(err.message || 'Sign-in could not be completed. Please try again.');
      return false;
    }
  }

  async function devLoginCustomer(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customEmail: 'preview.customer@example.com', customName: 'Preview Customer' })
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data.user);
      setSignInRequest(null);
      return true;
    } catch {
      return false;
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      pendingRef.current = null;
      writePending(null);
    }
  }

  /** Returns the pending item at most once, then clears it everywhere. */
  const consumePendingAddToCart = useCallback((): CartItem | null => {
    const item = pendingRef.current || readPending();
    pendingRef.current = null;
    writePending(null);
    return item;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        config,
        signInRequest,
        signInError,
        initiateGoogleSignIn,
        closeSignIn,
        hideSignIn,
        handleGoogleCallback,
        logout,
        consumePendingAddToCart,
        devLoginCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel?: () => void;
        };
      };
    };
  }
}
