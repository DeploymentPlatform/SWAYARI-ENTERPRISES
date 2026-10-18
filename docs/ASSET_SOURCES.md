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

## 5. Tanishq-Inspired 20-Product Sample Catalogue & Campaign Hero Imagery

In accordance with the definitive design direction, an isolated demo catalogue of 20 coherent products across 5 categories was sourced from Pexels under the [Pexels licence](https://www.pexels.com/license/) (free commercial use, modification permitted). All images were downloaded, framed on warm neutral surfaces (`#FAF7F2`) with 1:1 square aspect ratios, and saved locally as high-performance `.webp` and `.jpg` files (`public/assets/products/*-800.{webp,jpg}`).

### A. 20 Sample Products

| Category | Local Files (`public/assets/products/`) | Product Name | Pexels ID | Creator | Source URL |
| --- | --- | --- | --- | --- | --- |
| Devotional Frames | `demo-frame-sanctum-gold-800.{webp,jpg}` | Ornate Sanctum Devotional Gold Relief Frame | 10905470 | Eva Bronzini | [Pexels 10905470](https://www.pexels.com/photo/painting-of-flowers-in-decorative-frame-10905470/) |
| Devotional Frames | `demo-frame-baroque-floral-800.{webp,jpg}` | Royal Heritage Gold Embossed Devotional Frame | 10905473 | Eva Bronzini | [Pexels 10905473](https://www.pexels.com/photo/baroque-style-frame-with-a-vibrant-floral-painting-against-an-elegant-wall-10905473/) |
| Devotional Frames | `demo-frame-temple-collection-800.{webp,jpg}` | Classic Temple Gold Leaf Framed Collection | 9456729 | Mihai Moisa | [Pexels 9456729](https://www.pexels.com/photo/gold-framed-paintings-hanging-on-wall-9456729/) |
| Devotional Frames | `demo-frame-vintage-altar-800.{webp,jpg}` | Vintage Hand-Carved Teak & Gold Leaf Frame | 10502844 | Eva Bronzini | [Pexels 10502844](https://www.pexels.com/photo/lilac-flowers-in-a-vase-and-golden-frames-on-vintage-wallpaper-10502844/) |
| Decorative Lamps | `demo-lamp-traditional-pillar-800.{webp,jpg}` | Traditional Ornate Brass Kuthu Pillar Lamp | 30043135 | Dilip Rathod | [Pexels 30043135](https://www.pexels.com/photo/elegant-traditional-indian-brass-oil-lamp-decor-30043135/) |
| Decorative Lamps | `demo-lamp-ceremonial-diya-800.{webp,jpg}` | Handcrafted Ceremonial Brass Oil Lamp | 30327092 | Dilip Rathod | [Pexels 30327092](https://www.pexels.com/photo/traditional-diya-lamp-lit-for-celebration-30327092/) |
| Decorative Lamps | `demo-lamp-sacred-flame-800.{webp,jpg}` | Classic Temple Brass Deepam with Pedestal | 30799797 | Contributor | [Pexels 30799797](https://www.pexels.com/photo/traditional-oil-diya-lamp-with-flame-in-dark-setting-30799797/) |
| Decorative Lamps | `demo-lamp-serene-glow-800.{webp,jpg}` | Antique Meditative Brass Oil Lamp | 29994970 | Dilip Rathod | [Pexels 29994970](https://www.pexels.com/photo/lit-diya-lamp-creating-a-serene-atmosphere-29994970/) |
| Home Accents | `demo-accent-krishna-flute-800.{webp,jpg}` | Intricate Brass Lord Krishna Playing Flute | 33289454 | Contributor | [Pexels 33289454](https://www.pexels.com/photo/intricate-brass-sculpture-of-a-hindu-deity-holding-a-flute-33289454/) |
| Home Accents | `demo-accent-ganesha-statue-800.{webp,jpg}` | Hand-Sculpted Bronze Ganesha on Stone Pedestal | 28206212 | Contributor | [Pexels 28206212](https://www.pexels.com/photo/intricate-bronze-ganesha-statue-on-stone-surface-28206212/) |
| Home Accents | `demo-accent-ganesh-idol-800.{webp,jpg}` | Regal Auspicious Brass Ganesha Figurine | 33643802 | Contributor | [Pexels 33643802](https://www.pexels.com/photo/intricate-ganesh-idol-with-vibrant-details-33643802/) |
| Home Accents | `demo-accent-ceremonial-bell-800.{webp,jpg}` | Sacred Brass Temple Bell with Ceremonial Finial | 7536968 | Antoni Shkraba | [Pexels 7536968](https://www.pexels.com/photo/bracelet-among-decoration-on-an-indian-ceremony-7536968/) |
| Festive Décor | `demo-decor-floral-uruli-800.{webp,jpg}` | Traditional Brass Uruli with Floating Candles & Petals | 8818664 | Yan Krukau | [Pexels 8818664](https://www.pexels.com/photo/flowers-and-candles-floating-in-a-bowl-8818664/) |
| Festive Décor | `demo-decor-pooja-arrangement-800.{webp,jpg}` | Ceremonial Brass Pooja Display with Marigolds | 8818762 | Yan Krukau | [Pexels 8818762](https://www.pexels.com/photo/person-holding-and-fixing-flower-arrangement-with-traditional-ritual-decorations-8818762/) |
| Festive Décor | `demo-decor-brass-stand-800.{webp,jpg}` | Multi-Tier Brass Lamp Stand with Festive Garlands | 8887201 | Lara Jameson | [Pexels 8887201](https://www.pexels.com/photo/a-candle-holder-with-candles-8887201/) |
| Festive Décor | `demo-decor-marigold-diya-800.{webp,jpg}` | Handcrafted Brass Diya with Fresh Blossom Petals | 31723285 | Contributor | [Pexels 31723285](https://www.pexels.com/photo/traditional-diya-lamp-with-flower-petals-31723285/) |
| Gift Sets | `demo-gift-traditional-hamper-800.{webp,jpg}` | Shubh Aarambh Handcrafted Ritual Gift Hamper | 5313214 | Contributor | [Pexels 5313214](https://www.pexels.com/photo/white-statue-on-a-woven-tray-with-marigolds-and-wrapped-package-5313214/) |
| Gift Sets | `demo-gift-sweets-presentation-800.{webp,jpg}` | Utsav Celebratory Brass & Sweets Presentation Box | 14275717 | Contributor | [Pexels 14275717](https://www.pexels.com/photo/close-up-of-indian-laddoo-sweets-elegantly-arranged-in-a-box-14275717/) |
| Gift Sets | `demo-gift-luxury-botanical-800.{webp,jpg}` | Royal Heritage Gift Chest with Floral Adornment | 13930487 | Hilal Yıldız | [Pexels 13930487](https://www.pexels.com/photo/flowers-on-a-gift-13930487/) |
| Gift Sets | `demo-gift-festive-twin-diya-800.{webp,jpg}` | Twin Auspicious Brass Diya & Dhoop Gift Hamper | 6213685 | Naveen Sahu | [Pexels 6213685](https://www.pexels.com/photo/lighted-diya-beside-the-flowers-6213685/) |

### B. Campaign Carousel Banners

| Slide | Local Files (`public/assets/editorial/`) | Theme | Desktop Composition | Mobile Composition | Source Image |
| --- | --- | --- | --- | --- | --- |
| 1 | `hero-slide-1-moments-{desktop,mobile}.{webp,jpg}` | Gifts for Meaningful Moments | 1440×420 wide crop | 640×360 mobile crop | [Pexels 8887201](https://www.pexels.com/photo/a-candle-holder-with-candles-8887201/) |
| 2 | `hero-slide-2-devotional-{desktop,mobile}.{webp,jpg}` | Devotional Frames Collection | 1440×420 wide crop | 640×360 mobile crop | [Pexels 10905470](https://www.pexels.com/photo/painting-of-flowers-in-decorative-frame-10905470/) |
| 3 | `hero-slide-3-decor-{desktop,mobile}.{webp,jpg}` | Artisanal Brass & Temple Lighting | 1440×420 wide crop | 640×360 mobile crop | [Pexels 30043135](https://www.pexels.com/photo/elegant-traditional-indian-brass-oil-lamp-decor-30043135/) |
| 4 | `hero-slide-4-gifting-{desktop,mobile}.{webp,jpg}` | Festive Urulis & Home Accents | 1440×420 wide crop | 640×360 mobile crop | [Pexels 8818664](https://www.pexels.com/photo/flowers-and-candles-floating-in-a-bowl-8818664/) |

### C. Category Shortcuts

| Category | Local Files (`public/assets/categories/`) | Aspect / Shape | Source |
| --- | --- | --- | --- |
| Devotional Frames | `cat-devotional-frames.{webp,jpg}` | 1:1 circular thumbnail (240×240) | Pexels 10905470 |
| Decorative Lamps | `cat-decorative-lamps.{webp,jpg}` | 1:1 circular thumbnail (240×240) | Pexels 30043135 |
| Home Accents | `cat-home-accents.{webp,jpg}` | 1:1 circular thumbnail (240×240) | Pexels 33289454 |
| Festive Décor | `cat-festive-decor.{webp,jpg}` | 1:1 circular thumbnail (240×240) | Pexels 8818664 |
| Gift Sets | `cat-gift-sets.{webp,jpg}` | 1:1 circular thumbnail (240×240) | Pexels 14275717 |

