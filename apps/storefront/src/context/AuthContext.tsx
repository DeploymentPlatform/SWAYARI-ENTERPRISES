import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem } from '@swayari/shared';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  initiateGoogleSignIn: (pendingItem?: CartItem) => void;
  handleGoogleCallback: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  pendingAddToCart: CartItem | null;
  consumePendingAddToCart: () => CartItem | null;
  devLoginCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAddToCart, setPendingAddToCart] = useState<CartItem | null>(null);

  // Check current session on mount
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  function initiateGoogleSignIn(pendingItem?: CartItem) {
    if (pendingItem) {
      setPendingAddToCart(pendingItem);
    }

    // Trigger Google OneTap or Google Identity Services prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google OneTap prompt was not displayed or skipped. Falling back to explicit prompt.');
        }
      });
    } else {
      console.warn('Google Identity Services script not yet loaded.');
    }
  }

  async function handleGoogleCallback(credential: string): Promise<boolean> {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credential })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Authentication failed');
      }

      const data = await res.json();
      setUser(data.user);
      return true;
    } catch (err: any) {
      alert(`Sign in could not be completed: ${err.message}`);
      setPendingAddToCart(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setPendingAddToCart(null);
    }
  }

  function consumePendingAddToCart(): CartItem | null {
    const item = pendingAddToCart;
    setPendingAddToCart(null);
    return item;
  }

  // Quick dev login for local preview testing
  async function devLoginCustomer() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customEmail: 'ananya.sharma@example.com',
          customName: 'Ananya Sharma'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Dev login error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        initiateGoogleSignIn,
        handleGoogleCallback,
        logout,
        pendingAddToCart,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Global declaration for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}
