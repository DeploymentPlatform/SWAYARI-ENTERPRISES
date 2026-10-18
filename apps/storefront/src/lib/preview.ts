// Explicit preview dataset switch.
//
// The public storefront only lists real inventory (is_demo = 0). For visual review the sample
// items supplied by the owner can be shown by opening any page with `?preview=1` (remembered for
// the browser tab) — or automatically on localhost. `?preview=0` turns it off again.
// Sample items are always tagged in the interface and can never be requested in production
// (the order API rejects them outside local development).

const KEY = 'swayari_preview_catalogue';

function isLocalHost() {
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1';
}

export function initPreviewMode() {
  const flag = new URLSearchParams(window.location.search).get('preview');
  try {
    if (flag === '1') sessionStorage.setItem(KEY, '1');
    if (flag === '0') sessionStorage.setItem(KEY, '0');
  } catch {
    /* storage unavailable: fall back to URL / host detection */
  }
}

export function isPreviewMode(): boolean {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored === '1') return true;
    if (stored === '0') return false;
  } catch {
    /* ignore */
  }
  return isLocalHost();
}

export function setPreviewMode(on: boolean) {
  try {
    sessionStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/** Visual QA only: `?count=1` limits the preview dataset to N items to check sparse layouts. */
export function previewCountOverride(): number | null {
  if (!isPreviewMode()) return null;
  const n = Number(new URLSearchParams(window.location.search).get('count'));
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function withPreview(url: string): string {
  if (!isPreviewMode()) return url;
  return url + (url.includes('?') ? '&' : '?') + 'include_demo=1';
}
