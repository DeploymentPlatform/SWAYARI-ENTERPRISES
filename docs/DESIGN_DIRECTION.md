# SWAYARI — Visual Direction

> **Direction:** Warm Indian homes, thoughtful gifting and beautifully presented devotional décor.
> **Applies to:** the customer storefront (`apps/storefront`). The admin portal follows the
> neutral operations variant described at the end.
> **Last updated:** 2026-10-18 (Asia/Kolkata)

## 1. What we are fixing

The rejected version led with a grass-background product photo in a narrow card, repeated the
same photo, reused the square logo artwork as a content photograph, filled space with pale panels,
badges and exaggerated luxury copy, and showed a development sign-in strip to customers.

The new direction is **photography-led and honest**: licensed editorial photography carries the
atmosphere; our real product photographs carry the catalogue; copy states only confirmed facts.

## 2. Principles

1. **One strong image per moment.** A single wide editorial hero, never a carousel or collage.
2. **Our products are evidence, not decoration.** Real product photos are shown large on a calm
   stone surface. Stock photography never carries a price, an Add to bag button or a product name.
3. **Editorial images are labelled where confusion is possible** (“Styling inspiration”).
4. **Layout follows inventory.** One product gets a featured composition, two or three get a
   balanced row, four or more get a grid. Empty categories are hidden.
5. **Useful words over adjectives.** No claims about artisans, manufacturing, casting, purity,
   origin or bespoke capability until the owner confirms them.
6. **Restraint.** Hairlines instead of boxes, few shadows, almost no rounded corners, gold used as
   an accent line or emblem — never for essential text.

## 3. Palette

| Token | Hex | Use |
| --- | --- | --- |
| `ivory` | `#FBF8F3` | Page background |
| `stone` | `#F2ECE3` | Alternate sections, product image surface |
| `stone-deep` | `#E6DDD0` | Hairlines, input borders, placeholders |
| `ink` | `#231C18` | Headings and body text (15.9:1 on ivory) |
| `ink-soft` | `#5A4F48` | Secondary text (7.5:1 on ivory, 6.8:1 on stone) |
| `ink-faint` | `#776B62` | Meta text and captions on ivory only (4.9:1; use `ink-soft` on stone) |
| `burgundy` | `#6B1F2A` | Primary actions, links, active states |
| `burgundy-deep` | `#3F131A` | Footer, pressed states |
| `gold` | `#B08A4A` | Decorative rules, lotus emblem, focus accents |
| `umber` | `#120C08` | Hero panel blended from the hero photograph's shadows |

## 4. Typography

- **Wordmark:** Cinzel 600, wide tracking — echoes the serif capitals of the supplied brand card.
- **Display:** Cormorant Garamond 500/600 for headlines (≥ 28px only; it is too delicate below).
- **Text & interface:** Jost 400/500 — 16–18px body, 13px uppercase labels with 0.14em tracking.
- Desktop hero headline 72px / mobile 44px; section headings 44px / 32px.

## 5. Layout & rhythm

- Content width 1320px; gutters 16px (mobile), 24px (tablet), 40px (desktop).
- Major sections separated by 64–96px; related groups by 16–32px.
- Rhythm on the homepage: **large** (hero) → **medium** (collection) → **medium** (occasions) →
  **large** (brand story with photograph) → **compact** (how ordering works) → footer.
- Image ratios: hero 2.32:1 desktop with a dedicated 4:5 mobile crop; products 4:5; editorial
  tiles 4:5; wide editorial 3:2.

## 6. Photography

- **Editorial set** (Pexels licence, see `docs/ASSET_SOURCES.md`): warm festive Indian home scenes
  in brass, marigold and lamplight; a kraft-wrapped gift; a calm ivory stone interior. Chosen for
  matching warmth and low-key lighting. No faces, no visible brands, no watermarks.
- **Product set:** the owner's four photographs of framed devotional relief pieces. Each frame is
  detected, perspective-corrected without stretching, and placed unaltered on a warm stone surface
  with a soft shadow (`scripts/prepare-product-photo.py`). An honest close crop of the original
  photograph is kept as the second gallery image. Originals remain untouched in
  `public/assets/demo/`.
- The square brand card is used as a brand reference only (Open Graph image), not as page content.

## 7. Components

- **Header:** slim service line; centred Cinzel wordmark with lotus emblem; Shop / Our Story /
  Contact; search, account and bag icons; full-screen mobile menu.
- **Buttons:** 48px high, 2px radius, uppercase 13px labels. Primary = burgundy fill; secondary =
  ink outline; on dark imagery primary = ivory fill.
- **Product card:** 4:5 image on stone, serif name, “Price on request” when no price, a visible
  Add to bag action. Preview samples carry a small “Sample” tag.
- **Drawers & dialogs:** right-side bag drawer and centred sign-in dialog, both focus-trapped,
  Escape to close, with restrained slide/fade motion that respects reduced-motion settings.

## 8. Motion

Subtle and functional only: hero text fade-up on load, image zoom on hover (desktop), drawer and
dialog transitions. No scroll-jacking, parallax, autoplay video or WebGL.

## 9. Admin portal variant

Neutral operations interface: white and stone surfaces, ink text, burgundy for primary actions and
selection, the same wordmark at small size. Real counts only, no charts or marketing imagery.
Internal notes are visually separated (amber “Staff only” panel) from customer-facing data.
