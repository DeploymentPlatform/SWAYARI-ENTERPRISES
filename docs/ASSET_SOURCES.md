# SWAYARI — Asset Sources

> Every image on the customer website is either (1) a photograph of a SWAYARI product supplied
> by the owner, or (2) licensed editorial photography used only for atmosphere. Editorial images
> are never given a product name, price or Add to bag action, and are captioned
> “Styling inspiration” where they could be mistaken for something we sell.
> **Last updated:** 2026-10-18 (Asia/Kolkata)

## 1. Licence summary — Pexels

All editorial images below come from Pexels and are used under the
[Pexels licence](https://www.pexels.com/license/) (checked 2026-10-18):

- Free for commercial use; modification allowed; attribution not required (credit given here anyway).
- Not allowed: implying that people or brands in the image endorse SWAYARI; selling unaltered
  copies; redistributing on other stock platforms; using an image as a trademark or logo.

No paid stock, no Unsplash+ images, no random-image endpoints and no hot-linked third-party URLs
are used. Files were downloaded once, cropped and re-encoded locally (WebP + JPEG) and are tracked
in Git under `public/assets/editorial/`.

## 2. Editorial photography (licensed stock — not SWAYARI products)

| Local files (`public/assets/editorial/`) | Original page | Creator | Intended use | Processing |
| --- | --- | --- | --- | --- |
| `hero-festive-lamps-{1080,1600,2400}.{webp,jpg}` | https://www.pexels.com/photo/a-candle-holder-with-candles-8887201/ | Lara Jameson (pexels.com/@lara-jameson) | Homepage hero, desktop (brass lamps with marigolds) | 2800×1200 band crop (y 380–1580); captioned “Styling inspiration” |
| `hero-festive-lamps-mobile-{600,900}.{webp,jpg}` | same as above | Lara Jameson | Homepage hero, separate mobile composition | 4:5 crop centred on the lamps (x 840–2240) |
| `occasion-housewarming-{600,900}.{webp,jpg}` | https://www.pexels.com/photo/person-holding-and-fixing-flower-arrangement-with-traditional-ritual-decorations-8818762/ | Yan Krukau (pexels.com/@yankrukov) | “Housewarming” occasion tile | 4:5 crop; only hands visible, no faces |
| `occasion-celebrations-{600,900}.{webp,jpg}` | https://www.pexels.com/photo/flowers-and-candles-floating-in-a-bowl-8818664/ | Yan Krukau | “Festive celebrations” occasion tile | 4:5 crop |
| `occasion-gifting-{600,900}.{webp,jpg}` | https://www.pexels.com/photo/flowers-on-a-gift-13930487/ | Hilal Yıldız (pexels.com/@hilal-yildiz-70588620) | “Thoughtful gifting” occasion tile | 4:5 crop |
| `brand-stone-arch-{600,1000}.{webp,jpg}` | https://www.pexels.com/photo/minimalist-arch-in-studio-with-textured-walls-29627528/ | Pavel Morillo (pexels.com/@thisispav) | Homepage brand introduction | 4:5 crop |
| `assist-brass-diyas-{900,1600}.{webp,jpg}` | https://www.pexels.com/photo/lighted-diya-beside-the-flowers-6213685/ | Naveen Sahu (pexels.com/@nncapture) | Our Story page | Resized only; captioned “Styling inspiration” |
| `marigold-garlands-{600,900}.{webp,jpg}` | https://www.pexels.com/photo/vivid-display-of-marigold-garlands-in-vase-38697658/ | Tanha Tamanna Syed (pexels.com/@tanhatamannasyed) | Our Story page header | 4:5 crop; captioned “Styling inspiration” |

Required attribution: none (Pexels licence). Recorded here for transparency.

Selection notes: chosen as a set for matching warm, low-key light (brass, marigold, lamplight,
ivory plaster). Rejected during review: heart-confetti gift shots (Valentine theme), cool grey
interiors, images with prominent faces, and a gift-wrapping scene with Christmas lights.

## 3. SWAYARI product photography (owner-supplied)

| Original (unchanged) | Prepared files (`public/assets/products/`) | Subject | Notes |
| --- | --- | --- | --- |
| `public/assets/demo/sample_product_1.jpeg` | `radha-krishna-frame-{600,960}`, `radha-krishna-frame-photo-{600,744}` | Radha Krishna framed relief | |
| `public/assets/demo/sample_product_2.jpeg` | `bala-krishna-frame-{600,960}`, `bala-krishna-frame-photo-{600,823}` | Bala Krishna framed relief | |
| `public/assets/demo/sample_product_3.jpeg` | `venkateswara-frame-{600,960}`, `venkateswara-frame-photo-{600,781}` | Sri Venkateswara framed relief | |
| `public/assets/demo/sample_product_4.jpeg` | `hanuman-frame-{600,960}`, `hanuman-frame-photo-{600,741}` | Hanuman framed relief | |

Each prepared set has `.jpg` and `.webp` versions. Produced with
`scripts/prepare-product-photo.py`:

- The frame's four outer corners are detected against the green backdrop and the slight camera
  perspective is corrected, keeping the measured frame proportions (no stretching).
- The product pixels are placed **unaltered** on a generated warm stone-coloured surface with a soft
  shadow. Nothing in the artwork, colours, embellishment or frame is repainted or regenerated.
- Output is capped at 960px wide because the frames occupy only ~650–720px of the source photos;
  larger sizes would overstate the photo quality.
- The `-photo-` files are honest close crops of the original photograph (green backdrop retained,
  camera watermark cropped out) and appear as the second gallery image.

Photography limitation: the originals are phone photos on artificial grass with a camera
timestamp. Fresh photographs on a plain neutral background, with a size reference, would allow
larger gallery images and detail views.

## 4. Brand assets

| File | Source | Use |
| --- | --- | --- |
| `public/assets/brand/swayari_brand_card.jpeg` | Owner-supplied brand artwork | Brand reference and Open Graph share image only — not used as page content |
| `public/assets/brand/swayari-logo.svg`, `favicon.svg` | Created in Milestone 1 from the brand card | Favicon; the site header renders the wordmark as live text in Cinzel |
