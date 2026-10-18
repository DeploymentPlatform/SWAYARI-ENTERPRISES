import { useEffect } from 'react';

const SITE = 'SWAYARI — Décor & Gifting';
const DEFAULT_DESCRIPTION =
  'Décor and gifting for homes and special occasions. Choose your pieces, send a request, and our team will contact you to confirm the details.';

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
