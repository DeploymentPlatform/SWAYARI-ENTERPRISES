import { useEffect } from 'react';

const SITE = 'SWAYARI — Silver Foil God Frames';
const DEFAULT_DESCRIPTION =
  'Devotional gifts under ₹999 — No. 1 silver foil god frames at ₹149 each for wedding return gifts, griha pravesh and poojas. Minimum 25 frames, shipping extra.';

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

/** Keeps the document title, description and Open Graph tags in sync with the current page. */
export function usePageMeta(title: string | null, description?: string, options?: { noindex?: boolean }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | SWAYARI` : SITE;
    document.title = fullTitle;
    const desc = description || DEFAULT_DESCRIPTION;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[name="robots"]', 'name', 'robots', options?.noindex ? 'noindex, nofollow' : 'index, follow');
    // Canonical URL follows the current page (query strings are filters, not separate pages).
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [title, description, options?.noindex]);
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
