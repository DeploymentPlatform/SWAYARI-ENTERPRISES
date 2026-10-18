import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@swayari/shared';

interface AdminAuthConfig {
  googleClientId: string | null;
  devLoginAvailable: boolean;
}

interface AdminAuthContextType {
  user: User | null;
  config: AdminAuthConfig;
  isLoading: boolean;
  authError: string | null;
  handleGoogleCallback: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
  devLoginAdmin: () => Promise<void>;
  clearAuthError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [config, setConfig] = useState<AdminAuthConfig>({ googleClientId: null, devLoginAvailable: false });

  useEffect(() => {
    checkAdminSession();
    fetch('/api/auth/config')
      .then(res => (res.ok ? res.json() : null))
      .then(data => data && setConfig({ googleClientId: data.googleClientId || null, devLoginAvailable: Boolean(data.devLoginAvailable) }))
      .catch(() => undefined);
  }, []);

  async function checkAdminSession() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user && data.user.role === 'admin') {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Admin session check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleCallback(credential: string): Promise<boolean> {
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credential })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Access denied: Account is not in the authorized admin allowlist');
      }

      setUser(data.user);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
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
      setAuthError(null);
    }
  }

  async function devLoginAdmin() {
    try {
      setIsLoading(true);
      setAuthError(null);
      const res = await fetch('/api/auth/dev-login', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
      } else {
        throw new Error(data.error || 'Dev login failed');
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        config,
        isLoading,
        authError,
        handleGoogleCallback,
        logout,
        devLoginAdmin,
        clearAuthError: () => setAuthError(null)
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
