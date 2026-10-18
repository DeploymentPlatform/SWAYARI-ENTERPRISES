# SWAYARI — Design System

> **Source of truth for values:** `packages/ui/src/tailwind-preset.cjs` (Tailwind) and
> `packages/ui/src/tokens.ts` (TypeScript). Rationale and art direction: `docs/DESIGN_DIRECTION.md`.
> Replaces the Milestone 2 system (Playfair Display / Plus Jakarta Sans, rounded cards and badges).
> **Last updated:** 2026-10-18 (Asia/Kolkata)

## Colour
| Token | Hex | Notes |
| --- | --- | --- |
| `ivory` | #FBF8F3 | Page background |
| `stone` / `stone-deep` / `stone-shade` | #F2ECE3 / #E6DDD0 / #D8CCBB | Alternate sections, hairlines, input borders |
| `ink` / `ink-soft` / `ink-faint` | #231C18 / #5A4F48 / #776B62 | Text. `ink-faint` only on ivory (4.9:1) |
| `burgundy` / `-hover` / `-deep` / `-soft` | #6B1F2A / #581923 / #3F131A / #F6ECEB | Actions, footer, selection |
| `gold` / `gold-light` | #B08A4A / #D9C29A | Decorative rules and emblem; `gold-light` text only on dark |
| `umber` | #120C08 | Hero panel sampled from the hero photograph |

## Type
- `font-wordmark` Cinzel 600 — SWAYARI wordmark only.
- `font-display` Cormorant Garamond 500/600 — headings ≥ 28px (`text-display-sm/md/lg/xl` = 32/44/56/72px).
- `font-sans` Jost 400/500 — body 16–18px; `text-label` 13px uppercase, 0.14em tracking.
- Admin uses Jost for all figures (Cormorant's old-style numerals read poorly in data).

## Layout
- `max-w-content` 1320px with `.container-content` gutters 16 / 24 / 40px.
- Section spacing 64–112px desktop, 56–64px mobile; groups 16–32px.
- Ratios: `aspect-product` 4:5, `aspect-editorial` 4:5, `aspect-wide` 3:2, hero 2.32:1 desktop + square mobile crop.

## Components (storefront, `apps/storefront/src/index.css` + `components/ui.tsx`)
- Buttons: `.btn-primary` (burgundy), `.btn-secondary` (ink outline), `.btn-light` / `.btn-ghost-light` (on dark imagery). 48px high, 2px radius.
- Forms: `.field-label`, `.field-input` (aria-invalid styling), `.field-error`; error summary focused on submit.
- `OrderDisclaimer` renders the mandatory notice from `@swayari/shared` (exact wording).
- `ProductCollection` chooses featured / balanced row / grid from the real item count.
- Drawers and dialogs share `useDialogBehaviour` (focus trap, Escape, scroll lock, focus restore).

## Components (admin, `apps/admin/src/index.css` + `components/ui.tsx`)
- `.adm-card`, `.adm-btn-primary/secondary/quiet`, `.adm-input`, `.adm-table`, `.adm-chip-on/off`.
- `StatusBadge`, `Thumb`, `ErrorBanner`, `PageHeader`, `Drawer` (focus-trapped right drawer).
- Staff-only notes use an amber panel labelled “Staff only — never shown to the customer”.

## Motion & accessibility
- `MotionConfig reducedMotion="user"`; motion limited to hero entrance, drawers/dialogs and image hover zoom.
- Visible `:focus-visible` outline in burgundy; skip link; real links (`<a href>`) for navigation.
- Hero image is eager with `fetchpriority="high"` and preloaded per breakpoint; other images lazy-load with width/height set.
