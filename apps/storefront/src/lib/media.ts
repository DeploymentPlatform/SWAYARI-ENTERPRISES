// Responsive image helpers. Prepared assets follow the naming convention `<name>-<width>.jpg`
// with a sibling `<name>-<width>.webp` (see scripts/prepare-product-photo.py).

export interface ImageSources {
  src: string;
  srcSet?: string;
  webpSrcSet?: string;
}

const PRODUCT_WIDTHS = [600, 960];

export function productImageSources(path: string | undefined | null): ImageSources | null {
  if (!path) return null;
  const match = path.match(/^(\/assets\/products\/[a-z0-9-]+?)-(\d+)\.jpg$/);
  if (!match) return { src: path };
  const base = match[1];
  // The second gallery image ("-photo-") only has its own measured widths; use what we know.
  const isPhoto = base.endsWith('-photo');
  const widths = isPhoto ? [600, Number(match[2])] : PRODUCT_WIDTHS;
  const unique = Array.from(new Set(widths)).sort((a, b) => a - b);
  return {
    src: path,
    srcSet: unique.map(w => `${base}-${w}.jpg ${w}w`).join(', '),
    webpSrcSet: unique.map(w => `${base}-${w}.webp ${w}w`).join(', ')
  };
}

export function editorialSources(name: string, widths: number[]): ImageSources {
  const base = `/assets/editorial/${name}`;
  return {
    src: `${base}-${widths[widths.length - 1]}.jpg`,
    srcSet: widths.map(w => `${base}-${w}.jpg ${w}w`).join(', '),
    webpSrcSet: widths.map(w => `${base}-${w}.webp ${w}w`).join(', ')
  };
}

export const PLACEHOLDER_PRODUCT_IMAGE = '/assets/brand/icon-512.png';

/** Drops repeated photographs listed in several formats (name.webp + name.jpg), keeping WebP. */
export function uniqueProductImages(images: string[] | undefined | null): string[] {
  const byName = new Map<string, string>();
  for (const src of images || []) {
    const key = src.replace(/\.(webp|jpe?g|png|avif)$/i, '');
    const existing = byName.get(key);
    if (!existing || (/\.webp$/i.test(src) && !/\.webp$/i.test(existing))) byName.set(key, src);
  }
  return Array.from(byName.values());
}

/**
 * Card-size responsive sources for a product photo: a 480px thumbnail (scripts/generate-thumbnails.js)
 * plus the original. If the thumbnail is missing, `onError` falls back to the original alone.
 */
export function productCardImage(src: string) {
  const match = src.match(/^\/assets\/products\/([^/]+)\.(webp|jpe?g|png)$/i);
  if (!match) return { src };
  const width = Number(src.match(/-(\d{3,4})\.(?:webp|jpe?g|png)$/i)?.[1]) || 800;
  return {
    src,
    srcSet: `/assets/products/thumbs/${match[1]}.webp 480w, ${src} ${Math.max(width, 481)}w`,
    onError: (e: { currentTarget: HTMLImageElement }) => {
      const img = e.currentTarget;
      if (img.srcset) {
        img.removeAttribute('srcset');
        img.src = src;
      }
    }
  };
}

/** Grid cards: two columns on phones, three on tablets, four on desktop. */
export const PRODUCT_CARD_SIZES = '(min-width: 1280px) 300px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw';
