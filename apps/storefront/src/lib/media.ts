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

export const PLACEHOLDER_PRODUCT_IMAGE = '/assets/brand/favicon.svg';
