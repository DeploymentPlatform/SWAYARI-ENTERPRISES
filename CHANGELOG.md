# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.7.0] - 2026-10-21

### Fixed & Enhanced
- **Corrected Every Product Image (Issue 1):**
  - Replaced misleading and mismatched demo files (street, bedroom, stairs, rabbit) with authentic gold foil devotional frames for all deities (Sri Venkateswara, Ganesha, Lakshmi, Saraswati, Radha Krishna, Shiva Parvati, Murugan, Sai Baba).
  - Generated neutral devotional placeholder `placeholder-devotional-frame-800.webp` and 3 responsive marketing hero banners (`hero-devotional-collection-desktop`, `hero-wedding-favors-desktop`, `hero-bulk-process-desktop`).
  - Synchronized assets across `public/assets` and both portal origins (`apps/storefront/public/assets`, `apps/admin/public/assets`) and regenerated `manifest.json`.
- **Bulk Pricing Consistency (Issue 2):**
  - Implemented shared pricing calculation engine in `packages/shared/src/pricing.ts` and `pricing.js` (`calculateEffectiveUnitPrice`, `calculateLineSubtotal`, `aggregateCartItems`, `calculateCartTotals`).
  - Shared calculation used across Quick View, product details, cart drawer, cart page, and server-side order calculation (`/api/orders`).
  - Correctly applies volume discount tiers (e.g. Shirdi Sai Baba frame base price ₹65, 100-piece tier ₹42/frame; 100 pieces correctly subtotal to ₹4,200, never ₹6,500).
  - Kept shipping charge separate and explicitly labeled *"To be confirmed by our team"*.
- **Enforced Bulk Quantity Rules & Duplicate Line Aggregation (Issue 3):**
  - Strictly required finite positive whole integer quantities; rejected negative, zero, fractional, and malformed inputs.
  - Enforced configured MOQ (`min_quantity`) and order increment (`order_increment`) across all quantity controls, typed inputs, cart edits, and server order validation.
  - Aggregated duplicate cart and order lines by design (`productId` + `selectedVariant`) so splitting or combining lines cannot bypass MOQ or alter tiered pricing.
- **Restored Admin Photo Management (Issue 4):**
  - Restored full photo management controls in `ProductEditorModal.tsx`: image upload, thumbnail preview, primary photo selection badge, move up/down reordering, safe photo removal, and catalogue asset picker.
  - Added secure `POST /api/admin/assets` endpoint with magic byte validation (JPEG, PNG, WebP) and 5MB size limit.
  - Enforced mandatory genuine photograph requirement before publishing live inventory.
- **Safe Database Migrations (Issue 5):**
  - Rewrote `migrations/0008_devotional_frames_99.sql` using non-destructive `INSERT INTO categories ... ON CONFLICT(id) DO UPDATE SET ...` to prevent `ON DELETE SET NULL` cascade on existing products.
  - Eliminated unconditional `DELETE FROM campaign_banners;`, replacing it with targeted retirement of known legacy seed banners (`WHERE id IN (...)`), preserving owner categories, products, banners, and quotations.
- **Integer Paise & Strict ₹99 Ceiling Validation (Issue 6):**
  - Standardized monetary calculations on integer paise (`validatePricePaise`). Replaced basic `price > 99` check with strict validation requiring valid positive amounts `<= 9,900` paise.
  - Enforced equivalent rules for variants, bulk tiers, and admin quotation agreed unit prices (`<= ₹99`), nonnegative shipping/tax, and whole integer quantities.
  - Strictly isolated sample data when `ENVIRONMENT` is missing, misspelled, or non-dev/preview.
- **Business Content Cleanup (Issue 7):**
  - Removed outdated links to lamps, sculptures, and urulis from `Footer.tsx` and customer navigation.
  - Removed unconfirmed marketing claims.
  - Preserved exact verbatim disclaimer across all request review and submission flows: *"Our team will contact you to confirm availability, final pricing, shipping charges and delivery details. Submitting this request does not confirm a purchase or reserve stock."*
- **Fixed Typecheck & Added Meaningful Regression Tests (Issue 8):**
  - Fixed TypeScript errors: exported `BudgetBandDefinition` in `ShopByBudget.tsx`, added `deity` to `useProducts` options type in `ShopPage.tsx`.
  - Expanded test suite in `scripts/run-tests.js` to 40 passing tests covering bulk pricing consistency, duplicate lines aggregation, MOQ/increments, integer paise validation, quotation checks, migration 0007->0008 upgrade safety, admin assets upload with magic bytes, sample isolation, and disk asset presence.
- **Verified Real Application End-to-End (Issue 9):**
  - Executed end-to-end verification across Storefront (`http://127.0.0.1:8790`) and Admin (`http://127.0.0.1:8791`) using native headless Chrome with Chrome DevTools Protocol (CDP).
  - Captured real screenshots of desktop home, mobile home, product detail, cart with ₹4,200 tier pricing, checkout with Google sign-in gating, order confirmation, admin login, admin dashboard, admin order detail with private staff notes, and admin product photo manager.

---

## [0.6.0] - 2026-10-20

### Changed
- **Confirmed Business Direction — Devotional Frames ₹99 & Under:** Repositioned SWAYARI exclusively around devotional and god frames priced at ₹99 or less per frame for bulk wedding and celebratory return gifts.
- **Brand Messaging:** Main positioning *"Devotional frames ₹99 & under"* and supporting message *"Thoughtful return gifts for your special celebrations."* Shipping charged separately upon team confirmation.
- **Strict ₹99 Price Ceiling:** Enforced ₹99 ceiling across product publishing, search and collections, product details and variants, request cart, server-side order validation, and admin quotation creation.
- **Storefront Hierarchy & Aesthetic:**
  1. Compact Header: SWAYARI logo, search *"Search god frames and return gifts"*, navigation (All Frames, Wedding Return Gifts, How to Order, Contact), customer account, request cart badge (no admin links).
  2. Compact Campaign Carousel (~300–340px desktop, ~200–240px mobile) with 3 confirmed slides and both "Explore Frames" and "Request a Bulk Quote" CTAs.
  3. InfoStrip: "₹99 or Less Per Frame", "Bulk Order Enquiries", "Shipping Quoted Separately", "Order-Request Model".
  4. Early Frame Collection: 4 cards across on desktop, 2 on mobile with deity badge, dimensions, "₹X per frame", MOQ, "Shipping quoted separately", Quick View, and Add to Request.
  5. Wedding Return-Gifting Section with "Plan Your Return Gifts" action.
  6. 3-step Order Explanation with exact mandatory verbatim disclaimer.
  7. Compact contact and footer.
- **Bulk Quantity Controls:** Interactive numeric input stepper with `+`/`-` controls, configurable MOQ, order increments, unit price × qty = items subtotal breakdown, and separate shipping confirmation notice.
- **Archival of Incompatible Products:** Soft-archived legacy collections (`> ₹99`, lamps, sculptures, hampers) via `status = 'archived'` in migration `0008` while preserving database records, photographs, and historical orders.
- **Admin Portal Updates:** Added frame metadata management (deity, frame size, orientation, border finish), soft-delete endpoint (`onRequestDelete`), and quotation ceiling enforcement (`agreedUnitPrice <= 99`).

### Added
- Migration `0008_devotional_frames_99.sql`: frame schema columns, devotional categories, archival of legacy products, 12 authentic sample devotional frames (`SWY-FRAME-001` through `012`, strictly <= ₹99), and confirmed campaign banners.
- Tests 28, 29, 30, and 31 in `scripts/run-tests.js`: verifying order rejection over ₹99, admin product creation price capping, quotation revision price capping, and storefront exclusion of items > ₹99. Suite total: 31 passed, 0 failed.

Implementation commit: `837928b`.

---

## [0.5.0] - 2026-10-19

### Changed
- **Affordable Gifting Positioning:** Repositioned SWAYARI around "Gifts ₹999 & under" with dedicated entry-level "₹99 & under" collection, brand headline *"Thoughtful gifts. Beautifully priced."*, and supporting copy *"Discover gifts for celebrations, return gifting and everyday moments."*
- **Homepage Structure:** Restructured homepage into strictly prioritised shopping hierarchy:
  1. Compact header with branding, prominent search, account, and bag.
  2. Compact campaign carousel (~310–330px desktop, ~220px mobile) with pause controls and indicators.
  3. Shop by Budget shortcuts (4 prominent cards).
  4. Selected gift collections with visible prices.
  5. Bulk & Return Gifts concierge section.
  6. Shop by Occasion section.
  7. Order-request process explanation with verbatim mandatory disclaimer.
  8. Compact footer.
- **Budget Navigation:** Created 4 inclusive, non-overlapping budget bands (`under-99`, `100-299`, `300-499`, `500-999`). Server-side and client-side filtering strictly excludes quote-only items from numeric bands.
- **Catalogue & Checkout:** Added budget and occasion filter pills on `/shop`. Enhanced checkout form to capture occasion, required date, and bulk request flag with pincode delivery timeline note.
- **Product Cards & PDP:** Added unit/set pricing indicators (`/ pc`, `/ set`), MOQ badges (`Min. 10 pcs`), set contents (`✨ ...`), and volume tiered pricing tables.
- **Admin Management:** Enhanced `ProductEditorModal.tsx` and `OrderDetailModal.tsx` to manage price types, set contents, order increments, volume pricing tiers, shipping info, purchase models, and event details.

### Added
- Migration `0007_affordable_gifting.sql` extending `products` and `orders` tables, and seeding 17 realistic sample products across 4 budget tiers (`is_demo = 1`).
- Sourced and converted 17 licensed sample product photographs (Pexels free commercial licence) into 1:1 WebP and JPG assets; regenerated `manifest.json` (173 total assets).
- Tests 26 & 27 in `scripts/run-tests.js` verifying budget boundary queries and bulk order tiered pricing.
- Asset license documentation in `docs/ASSET_SOURCES.md` Section 6.

Implementation commit: `ddb2d93`.

---

## [0.4.0] - 2026-10-18

### Changed
- **Definitive Storefront Redesign:** Replaced oversized editorial layout with high-density, Tanishq-inspired visual refinement and Amazon-style fast shopping layout.
- **Compact Shopping Header:** Left-aligned SWAYARI logo, prominent central search bar (`Search décor, gifts and more`), debounced instant autocomplete with product thumbnails and category badges, customer account menu, and live shopping cart badge. Compact category navigation strip below.
- **Multi-Slide Campaign Carousel:** Sleek ~350px desktop / ~260px mobile 4-slide hero banner with touch swipe, keyboard controls, dot indicators, 6s autoplay with automatic pause on hover, keyboard focus, and tab switch.
- **Category Shortcuts Strip:** Compact row of 5 circular thumbnails highlighting Devotional Frames, Decorative Lamps, Home Accents, Festive Décor, and Gift Sets.
- **High-Density Product Rows:** 4 cards across on desktop, 3 on tablet, 2 on mobile with 1:1 square product imagery on warm neutral surfaces (`#FAF7F2`), category pills, sample price tags, quick view overlay, and 'Add to Request' feedback.
- **Admin Campaign Banners Management:** Added dedicated admin interface (`apps/admin/src/pages/BannersPage.tsx`) with interactive desktop/mobile device previews, copy editor, CTA destination links, reordering, and active toggles.

### Added
- Migration `0005_rich_demo_catalogue.sql`: 5 core categories and 20 sample products with realistic sample prices, dimensions, and materials.
- Migration `0006_campaign_banners.sql`: Dynamic campaign banners table with 4 default slides.
- Storefront and Admin Banners APIs (`/api/banners` and `/api/admin/banners`).
- `scripts/prepare-tanishq-catalogue.py` downloading and formatting 20 licensed stock assets from Pexels into WebP and JPG.
- Quick View modal (`apps/storefront/src/components/QuickViewModal.tsx`).
- Definitive design system documentation in `docs/DESIGN_SYSTEM.md` and asset sources in `docs/ASSET_SOURCES.md`.

Implementation commit: `31c9c11`.

---

## [0.3.0] - 2026-10-18

### Changed
- Storefront redesigned around a photography-led editorial direction (`docs/DESIGN_DIRECTION.md`):
  new header wordmark, wide editorial hero with mobile composition, inventory-adaptive collection,
  occasion tiles, brand story, ordering steps, and redesigned shop, search, product, bag, request
  form, confirmation and request history.
- Staff portal refined into a neutral operations interface with an order drawer, staff-only notes
  panel, structured product editor and real counts only.
- Copy rewritten to remove unconfirmed claims (artisans, casting, purity, origin, bespoke).
- Root `wrangler.toml` no longer declares a Pages output; handoff guide uses per-app root directories.

### Added
- Licensed editorial photography with source record (`docs/ASSET_SOURCES.md`).
- `scripts/prepare-product-photo.py` and prepared product images; `scripts/sync-assets.js`.
- Migration `0004_preview_catalogue.sql` (honest sample entries, `is_demo = 1`).
- `/api/auth/config` on both portals; `/dev-login` local-only page.
- Tests 18–25 (now 25 total).

### Fixed / Security
- Dev login now deny-by-default (requires `ENVIRONMENT=development`).
- Orders reject archived/draft products and samples outside development; idempotency keys scoped per customer.
- Editing a sample product no longer publishes it as live inventory or erases variants.
- Sample product URLs hidden without the preview flag; category counts exclude samples.
- Customer order history fields; Google sign-in stylesheet allowed by CSP; Google button now
  renders reliably after the async script loads.

Implementation commit: `1bd5ce7`.

---

## [0.2.0] - 2026-10-18

### Added
- **Two-Portal Separated Architecture:**
  - Separated public customer storefront and internal staff operations into two independently deployable applications:
    - Customer Storefront: `apps/storefront` deployed to primary domain.
    - Admin Operations Portal: `apps/admin` deployed to dedicated admin origin.
  - Complete elimination of admin routes, links, frontend bundles, and API handlers from the customer storefront.
  - Storefront middleware returns `404 Not Found` for any requests to `/admin` or `/api/admin`.
- **Database Scope Isolation:**
  - Added Migration `0003_session_scope.sql` introducing `scope` (`'customer'` or `'admin'`) to `sessions` table.
  - Host-only scoped cookies: `swayari_customer_session` (14 days) and `swayari_admin_session` (7 days).
  - Strict scope verification rejecting customer sessions on admin APIs.
- **Frontend Stack & Monorepo Packages:**
  - Migrated to React 18, TypeScript, Vite, Tailwind CSS with customized design tokens.
  - Created shared monorepo packages: `packages/shared` (types, constants, validation, formatters), `packages/server` (edge cookies, session verification, audit logging), and `packages/ui` (design tokens and Tailwind preset).
- **Substantial Visual Redesign:**
  - Warm ivory surfaces (`#FAF7F2`), deep burgundy accents (`#5C1D24`), restrained antique gold details (`#C49A45`), and warm charcoal body text (`#2A2624`).
  - Playfair Display serif display typography and Plus Jakarta Sans body typography.
  - Refined editorial hero, 4:5 vertical product ratio cards, rich product detail gallery with packaging options and dimension specifications.
  - Full-featured cart drawer and page, atomic order request submission with the mandatory disclaimer notice, and customer order history.
  - Admin Operations Portal with branded staff login screen (`swayarienterprises@gmail.com`), dashboard metrics, live order review, quotation revision editor, confidential staff notes thread, and product catalogue management.
- **Documentation:**
  - Created `docs/DESIGN_SYSTEM.md` with complete specifications for typography, colors, spacing, ratios, controls, and accessibility.
  - Created `docs/BROWSER_SETUP_HANDOFF.md` detailing step-by-step configuration for Google Cloud Console and Cloudflare Dashboard for both portals.
- **Automated Verification:**
  - Expanded automated test suite from 16 to 17 tests, including session scope isolation and production build validation.

---

## [0.1.0] - 2026-10-18

### Added
- **Core Architecture & Brand Assets:**
  - Integrated official SWAYARI Décor & Gifting brand artwork and lotus emblem.
  - Implemented scalable vector logo (`public/assets/brand/swayari-logo.svg`) and favicon.
  - Created Git-tracked asset directory with automated manifest generator (`scripts/generate-manifest.js`).
- **Database Architecture (Cloudflare D1):**
  - Migration `0001_initial_schema.sql` defining `users`, `sessions`, `categories`, `products`, `orders`, `order_items`, `order_quotations`, `order_internal_notes`, and `audit_logs`.
  - Migration `0002_demo_data.sql` with clearly demarcated preview items (`is_demo = 1`).
- **Backend Edge Services (Cloudflare Pages Functions):**
  - Google ID token verification via maintained `jose` library with Google JWKS caching and email verification checks.
  - Secure session creation with `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
  - Atomic order request submission using `DB.batch` with idempotency token verification to prevent duplicate submissions.
  - Customer data isolation ensuring customers can only access their own order records.
  - Admin management APIs with server-side allowlist check for `swayarienterprises@gmail.com`.
  - Quotation revision system allowing agreed unit price adjustments and shipping charges without overwriting original request items.
  - Confidential internal notes storage excluded from public/customer responses.
  - Security middleware enforcing CSP, Frame Options, nosniff, and origin validation on mutations.
- **Storefront & Admin Interfaces:**
  - Homepage featuring hero section, curated collection showcase, brand story, and graceful empty states.
  - Shop catalogue with search, category filtering, and preview sample toggle.
  - Product detail pages with specifications table, packaging options, and indicative price disclaimers.
  - Request Cart with quantity controls and mandatory order request disclaimer.
  - Order Request Form with customer prefill and idempotency protection.
  - Order Confirmation page with reference generator and next-steps timeline.
  - Customer Order History dashboard at `/account/orders`.
  - Full Admin Control Center at `/admin/` with tab-based metrics, live order review, quotation editor, product management, and visibility-aware polling.
  - Policy and informative pages: `/about/`, `/contact/`, `/ordering-policy/`, `/privacy/`.
- **Testing & Tooling:**
  - In-memory D1 test adapter using `node:sqlite`.
  - 16-point automated test suite covering security, idempotency, data isolation, and quotation revisions.
  - Daily Asia/Kolkata code snapshot script (`scripts/create-daily-backup.sh`) and GitHub Actions workflow (`daily-backup.yml`).
  - Standalone offline Git bundle disaster recovery exporter (`scripts/export-git-bundle.sh`).
