import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Location {
  path: string;
  search: URLSearchParams;
}

interface NavigateOptions {
  replace?: boolean;
  /** Stay where the visitor is (e.g. refining shop filters) instead of jumping to the top. */
  keepScroll?: boolean;
}

interface RouterValue extends Location {
  navigate: (to: string, options?: NavigateOptions) => void;
}

const RouterContext = createContext<RouterValue | undefined>(undefined);

function readLocation(): Location {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return { path, search: new URLSearchParams(window.location.search) };
}

// `html { scroll-behavior: smooth }` would otherwise animate page jumps, and on phones the
// animation is cut short while the next page streams in, leaving it opened halfway down.
const jumpTo = (top: number) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });

/** Remember how far down the current history entry was scrolled, for the Back button. */
const rememberScroll = () => {
  try {
    window.history.replaceState({ ...(window.history.state || {}), y: window.scrollY }, '');
  } catch {
    // Safari rate-limits history writes; losing one saved position is harmless.
  }
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location>(readLocation);
  const pendingScroll = useRef<number | null>(null);

  useEffect(() => {
    // We restore positions ourselves once the page has rendered; the browser's guess lands too early.
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

    let timer: number | undefined;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(rememberScroll, 150);
    };
    const onPop = (event: PopStateEvent) => {
      pendingScroll.current = typeof event.state?.y === 'number' ? event.state.y : 0;
      setLocation(readLocation());
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', onPop);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  // Scroll after the new page is committed, not before, so it applies to the page being shown.
  useLayoutEffect(() => {
    const target = pendingScroll.current;
    if (target === null) return;
    pendingScroll.current = null;
    jumpTo(target);
    if (target === 0) return;
    // Going Back: lazy pages and product data arrive a moment later, so keep trying until the
    // page is tall enough to reach the saved position (or give up after ~1.5s).
    let frames = 0;
    let raf = 0;
    const settle = () => {
      if (Math.abs(window.scrollY - target) < 2 || frames++ > 90) return;
      jumpTo(target);
      raf = requestAnimationFrame(settle);
    };
    raf = requestAnimationFrame(settle);
    const stop = () => cancelAnimationFrame(raf);
    window.addEventListener('touchstart', stop, { once: true, passive: true });
    window.addEventListener('wheel', stop, { once: true, passive: true });
    return () => {
      stop();
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('wheel', stop);
    };
  }, [location]);

  const navigate = useCallback((to: string, options?: NavigateOptions) => {
    const current = window.location.pathname + window.location.search;
    const y = window.scrollY;
    if (to !== current) {
      if (options?.replace) window.history.replaceState({ y: 0 }, '', to);
      else {
        rememberScroll();
        window.history.pushState({ y: 0 }, '', to);
      }
    }
    pendingScroll.current = options?.keepScroll ? y : to.includes('#') ? null : 0;
    setLocation(readLocation());
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
