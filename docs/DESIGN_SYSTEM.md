# SWAYARI — Definitive Design System

> **Design Direction:** Tanishq-inspired visual refinement paired with Amazon-grade high-density shopping navigation.  
> **Source of Truth:** `packages/ui/src/tailwind-preset.cjs` (Tailwind) and `packages/ui/src/tokens.ts` (TypeScript).  
> **Last updated:** 2026-10-18 (Asia/Kolkata)

---

## 1. Palette & Surface Tokens

| Token | Hex / Value | Contrast Ratio | Architectural Role |
| --- | --- | --- | --- |
| `ivory` | `#F7F4EF` | Base canvas | Warm artisanal backdrop for storefront pages |
| `surface` / `surface-card` | `#FFFFFF` | 13.8:1 against `#292421` | Crisp white elevated product surfaces and dialogs |
| `stone` | `#F4EFEA` | Background tone | Subtle contrast sections, chip backdrops, and card wells |
| `stone-deep` / `border` | `#E7DFD5` | Border tone | Subtle neutral dividers, product card outlines, table borders |
| `ink` / `charcoal` | `#292421` | 13.8:1 on white, 12.6:1 on ivory | Primary typography, product names, price numerals |
| `ink-soft` | `#544A44` | 6.8:1 on white (WCAG AAA) | Secondary specifications, categories, metadata, descriptions |
| `ink-faint` | `#7A6E66` | 4.6:1 on white (WCAG AA) | Input placeholders, inactive indicators, timestamps |
| `burgundy` | `#571C2A` | 8.9:1 on white, 8.2:1 on ivory | Primary brand accent, Add to Request buttons, links, header bar |
| `burgundy-hover` | `#441420` | 11.4:1 on white | Interactive hover state for primary burgundy controls |
| `burgundy-deep` | `#35121C` | 13.5:1 on white | Footer backdrop, dark mode highlights, deep wine accents |
| `burgundy-soft` | `#F7ECEE` | Tint | Subtle active selection pills, badge backdrops, table row highlight |
| `gold` | `#B49155` | Accent only | Antique gold decorative rules, slide indicators, category pills |
| `gold-light` | `#D8C29D` | Highlight | Serif headline emphasis on dark campaign backgrounds |
| `gold-dark` | `#8F7138` | 4.8:1 on ivory | Legible gold labels on light ivory backgrounds |
| `umber` | `#1B1310` | Dark backdrop | Campaign hero carousel background and high-contrast night surfaces |

---

## 2. Typography Hierarchy

- **Wordmark (`font-wordmark`):** `Cinzel`, weight 600. Reserved strictly for the SWAYARI brand mark and header identity.
- **Display Serif (`font-display`):** `Playfair Display`, serif, weight 600/700. Used for campaign hero headlines, seasonal banner titles, and selected featured collection headers.
- **Clean Shopping Sans (`font-sans`):** `Plus Jakarta Sans`, system-ui, sans-serif, weights 400, 500, 600, 700. Used for all shopping navigation, product card labels, specifications, price formatting, input fields, and admin management tables. Ensures effortless readability at high density without eye fatigue.

---

## 3. High-Density Layout & Responsive Target

At standard 1440×900 desktop viewport, the viewport prioritises:
**Header → Search → Categories → Campaign Hero → Category Shortcuts → First Product Row.**

- **Max Content Width:** `85rem` (~1360px) centered with responsive gutters:
  - Desktop: 32px / 40px padding
  - Tablet: 24px padding
  - Mobile: 16px padding
- **Compact Sticky Header:**
  - Desktop: 68px height (SWAYARI logo + prominent central search bar + account menu + cart button with live badge). Followed by a compact 42px category navigation strip.
  - Mobile: 56px primary header with search bar immediately underneath.
- **Campaign Hero Carousel:**
  - Desktop: ~340–380px height (compact, never full-screen).
  - Mobile: ~240–260px height.
  - Controls: Touch swipe, drag navigation, prev/next arrows, clickable pill indicators, 6s autoplay with automatic pause on hover, focus, and tab switch.
- **Category Shortcuts Row:**
  - Compact 5-column row of circular 1:1 thumbnails (96px desktop, 64px mobile) with clear category labels.
- **Product Card Grids:**
  - Desktop: 4 cards across with 20px gap (`grid-cols-4`).
  - Tablet: 3 cards across (`grid-cols-3`).
  - Mobile: 2 cards across (`grid-cols-2`) with 12px gap.
  - Card Height: Product image container is strictly 1:1 square (~180–220px desktop), with 2-line title clamp to maintain aligned baseline prices and CTA buttons.

---

## 4. Components & Interactions

- **Product Card:**
  - 1:1 product image on `#FAF7F2` surface with `object-contain`.
  - Category pill badge and sample indicator.
  - Two-line clamped title.
  - Formatted indicative price in `#571C2A` bold.
  - Desktop "Quick View" hover button and mobile "Details" trigger.
  - "Add to Request" button that transitions to green "Added!" on confirmation.
- **Quick View Modal:**
  - Focus-trapped modal overlay displaying full image gallery, material, dimensions, indicative price, quantity stepper, bespoke note input, and Add to Request action.
- **Search Autocomplete:**
  - Debounced (250ms) search input in header with instant suggestion dropdown featuring product thumbnails, category badges, prices, and keyboard navigation.
- **Cart / Request Drawer:**
  - Smooth slide-out drawer from right displaying selected items, quantities, custom notes, and the mandatory quotation disclaimer text:
    > *“Our team will contact you to confirm availability, final pricing, shipping charges and delivery details. Submitting this request does not confirm a purchase or reserve stock.”*

---

## 5. Motion & Accessibility

- **Duration Guidelines:** Micro-interactions (150–200ms), drawers and modals (250–300ms), carousel slide transitions (450ms).
- **Reduced Motion:** Fully honours `prefers-reduced-motion: reduce` by disabling slide translations and providing immediate opacity fades.
- **Keyboard Navigation:** High-contrast focus rings (`outline: 2px solid #571C2A; outline-offset: 2px`).
- **Touch Ergonomics:** All mobile touch targets (cart toggle, search input, category shortcuts, Add to Request buttons) meet or exceed the 44×44px minimum target area.

