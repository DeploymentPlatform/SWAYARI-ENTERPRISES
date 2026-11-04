import { useEffect } from 'react';
import { PAGES, canonicalUrl, fullTitle } from '../content/seo.js';

const DEFAULT_DESCRIPTION = PAGES['/'].description;

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

/**
 * Keeps the document title, description and Open Graph tags in sync with the current page.
 * The server writes the same details into the first HTML (functions/_middleware.js, from content/seo.js);
 * this keeps them right while visitors move between pages inside the app.
 */
export function usePageMeta(title: string | null, description?: string, options?: { noindex?: boolean; image?: string }) {
  useEffect(() => {
    const pageTitle = fullTitle(title);
    document.title = pageTitle;
    const desc = description || DEFAULT_DESCRIPTION;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    if (options?.image) setMeta('meta[property="og:image"]', 'property', 'og:image', new URL(options.image, 'https://swayari.com').href);
    setMeta('meta[name="robots"]', 'name', 'robots', options?.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    // Canonical URL is always on the public domain; only a single landing filter (category, occasion,
    // budget or deity) makes a shop page a page of its own, so the pages.dev copy, www and filter
    // combinations never compete with swayari.com in search results.
    const canonicalHref = canonicalUrl(window.location.pathname, new URLSearchParams(window.location.search));
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalHref);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;
  }, [title, description, options?.noindex, options?.image]);
}

/** Injects JSON-LD structured data for the lifetime of the component. */
export function useStructuredData(id: string, data: object | null) {
  useEffect(() => {
    if (!data) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => script.remove();
  }, [id, JSON.stringify(data)]);
}
