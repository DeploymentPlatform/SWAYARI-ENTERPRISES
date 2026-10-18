import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface Location {
  path: string;
  search: URLSearchParams;
}

interface RouterValue extends Location {
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterValue | undefined>(undefined);

function readLocation(): Location {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return { path, search: new URLSearchParams(window.location.search) };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location>(readLocation);

  useEffect(() => {
    const onPop = () => setLocation(readLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const current = window.location.pathname + window.location.search;
    if (to !== current) {
      if (options?.replace) window.history.replaceState({}, '', to);
      else window.history.pushState({}, '', to);
    }
    setLocation(readLocation());
    if (!to.includes('#')) window.scrollTo({ top: 0 });
  }, []);

  return <RouterContext.Provider value={{ ...location, navigate }}>{children}</RouterContext.Provider>;
};

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider');
  return ctx;
}

/** Anchor that keeps real hrefs (crawlable, open-in-new-tab) but navigates client-side. */
export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }> = ({
  to,
  onClick,
  children,
  ...rest
}) => {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={event => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          rest.target === '_blank'
        ) {
          return;
        }
        event.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
};
