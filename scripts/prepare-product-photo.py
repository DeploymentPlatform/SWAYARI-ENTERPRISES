#!/usr/bin/env python3
"""
SWAYARI product photo preparation (framed pieces photographed flat on a plain backdrop).

What it does — and deliberately does NOT do:
  * Detects the four outer corners of a rectangular framed product photographed on a
    contrasting backdrop (the supplied photos use green artificial grass).
  * Corrects the slight camera perspective so the frame is square-on, keeping the measured
    aspect ratio of the frame (no stretching).
  * Places the exact, unaltered product pixels on a warm neutral stone-coloured surface with a
    soft, believable shadow.
  * Writes responsive WebP + JPEG sizes, plus an honest "as photographed" close crop that
    removes the camera watermark but keeps the original background.

  It never repaints, regenerates or retouches the product itself (deity artwork, embossing,
  colours and frame are kept exactly as photographed). Originals are never modified.

Usage:
  python3 scripts/prepare-product-photo.py <input.jpg> <output-dir> <slug>

Requires Pillow, NumPy and SciPy.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy import ndimage

SURFACE_TOP = (240, 233, 222)     # warm ivory stone
SURFACE_BOTTOM = (226, 215, 199)  # deeper sand toward the foreground
CANVAS_RATIO = (4, 5)             # product image ratio used across the storefront
SIZES = [960, 600]             # canvas widths (source frames are ~650-720px; never upscale far)
BACKDROP_TOLERANCE = 14


def backdrop_mask(rgb: np.ndarray) -> np.ndarray:
    """True where the pixel looks like the green backdrop."""
    r, g, b = (rgb[..., i].astype(np.int16) for i in range(3))
    return (g > r + BACKDROP_TOLERANCE) & (g > b + BACKDROP_TOLERANCE)


def find_frame_corners(img: Image.Image):
    rgb = np.asarray(img.convert('RGB'))
    product = ~backdrop_mask(rgb)
    # Remove grass speckle and camera watermark text, then keep the largest solid region.
    product = ndimage.binary_opening(product, iterations=3)
    product = ndimage.binary_fill_holes(product)
    labels, count = ndimage.label(product)
    if count == 0:
        raise SystemExit('No product region found against the backdrop')
    sizes = ndimage.sum(product, labels, range(1, count + 1))
    frame = labels == (int(np.argmax(sizes)) + 1)

    ys, xs = np.nonzero(frame)
    s, d = xs + ys, xs - ys
    tl = (xs[np.argmin(s)], ys[np.argmin(s)])
    br = (xs[np.argmax(s)], ys[np.argmax(s)])
    tr = (xs[np.argmax(d)], ys[np.argmax(d)])
    bl = (xs[np.argmin(d)], ys[np.argmin(d)])
    return tl, tr, br, bl


def rectify(img: Image.Image, corners, inset_px: int = 2) -> Image.Image:
    tl, tr, br, bl = corners
    dist = lambda a, b: float(np.hypot(a[0] - b[0], a[1] - b[1]))
    width = round((dist(tl, tr) + dist(bl, br)) / 2)
    height = round((dist(tl, bl) + dist(tr, br)) / 2)
    # PIL QUAD order: upper-left, lower-left, lower-right, upper-right
    quad = (*tl, *bl, *br, *tr)
    out = img.transform((width, height), Image.QUAD, quad, resample=Image.BICUBIC)
    # Trim a hair's width to drop backdrop fringe pixels on the anti-aliased edge.
    return out.crop((inset_px, inset_px, width - inset_px, height - inset_px))


def surface(width: int, height: int) -> Image.Image:
    t = np.linspace(0, 1, height)[:, None, None]
    top = np.array(SURFACE_TOP, dtype=np.float32)[None, None, :]
    bottom = np.array(SURFACE_BOTTOM, dtype=np.float32)[None, None, :]
    grad = top * (1 - t) + bottom * t
    grad = np.repeat(grad, width, axis=1)
    rng = np.random.default_rng(7)
    grain = rng.normal(0, 2.2, (height, width, 1)).astype(np.float32)
    # Soft vignette so the piece sits in gentle light.
    yy, xx = np.mgrid[0:height, 0:width]
    cx, cy = width / 2, height * 0.45
    r = np.sqrt(((xx - cx) / width) ** 2 + ((yy - cy) / height) ** 2)
    light = (1 - np.clip(r * 0.22, 0, 0.12))[..., None]
    arr = np.clip(grad * light + grain, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def compose(product: Image.Image, canvas_w: int) -> Image.Image:
    canvas_h = canvas_w * CANVAS_RATIO[1] // CANVAS_RATIO[0]
    base = surface(canvas_w, canvas_h)

    max_w, max_h = canvas_w * 0.70, canvas_h * 0.66
    scale = min(max_w / product.width, max_h / product.height)
    pw, ph = round(product.width * scale), round(product.height * scale)
    piece = product.resize((pw, ph), Image.LANCZOS)
    px, py = (canvas_w - pw) // 2, round(canvas_h * 0.47 - ph / 2)

    # Two-layer shadow: a broad ambient shadow and a tighter contact shadow.
    shadow = Image.new('L', (canvas_w, canvas_h), 0)
    ambient = Image.new('L', (pw, ph), 120)
    shadow.paste(ambient, (px + round(pw * 0.015), py + round(ph * 0.045)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(canvas_w * 0.028))
    contact = Image.new('L', (canvas_w, canvas_h), 0)
    contact.paste(Image.new('L', (pw, ph), 130), (px, py + round(ph * 0.012)))
    contact = contact.filter(ImageFilter.GaussianBlur(canvas_w * 0.006))
    combined = Image.fromarray(np.maximum(np.asarray(shadow), np.asarray(contact)))
    tint = Image.new('RGB', (canvas_w, canvas_h), (74, 52, 38))
    base = Image.composite(tint, base, combined)

    base.paste(piece, (px, py))
    return base


def honest_crop(img: Image.Image, corners) -> Image.Image:
    """Close crop of the original photo around the frame (removes the camera watermark)."""
    xs = [c[0] for c in corners]
    ys = [c[1] for c in corners]
    pad_x = (max(xs) - min(xs)) * 0.06
    pad_y = (max(ys) - min(ys)) * 0.06
    box = (
        max(0, int(min(xs) - pad_x)), max(0, int(min(ys) - pad_y)),
        min(img.width, int(max(xs) + pad_x)), min(img.height, int(max(ys) + pad_y)),
    )
    return img.crop(box)


def save_variants(img: Image.Image, out_dir: str, name: str, widths):
    for w in widths:
        h = round(img.height * w / img.width)
        resized = img.resize((w, h), Image.LANCZOS) if w != img.width else img
        resized.save(os.path.join(out_dir, f'{name}-{w}.webp'), 'WEBP', quality=82, method=6)
        resized.save(os.path.join(out_dir, f'{name}-{w}.jpg'), 'JPEG', quality=84, optimize=True, progressive=True)


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)
    src, out_dir, slug = sys.argv[1:]
    os.makedirs(out_dir, exist_ok=True)
    img = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    corners = find_frame_corners(img)
    product = rectify(img, corners)

    largest = compose(product, SIZES[0])
    save_variants(largest, out_dir, f'{slug}', SIZES)

    crop = honest_crop(img, corners)
    crop_w = min(1200, crop.width)
    save_variants(crop, out_dir, f'{slug}-photo', [crop_w, 600] if crop_w > 600 else [crop_w])
    print(f'{slug}: frame {product.width}x{product.height}px, corners={corners}')


if __name__ == '__main__':
    main()
