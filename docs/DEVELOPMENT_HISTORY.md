# SWAYARI ENTERPRISES — Development History & Milestones

> **Format:** Immutable chronological log of actual completed development milestones.  
> **Rule:** Commit hashes must reflect actual preceding commits; never anticipate future hashes.

---

## Milestone 1: Initial Release Architecture, Database Schema, Edge APIs & Storefront

- **Date & Time (Asia/Kolkata):** `2026-10-18T19:46:32+05:30`
- **Working Branch:** `feature/swayari-initial-release`
- **Completed Implementation Commit:** [`122982b23b00eee05dbc0bc8f5dea834ed26314d`](file:///Users/suryateja/Downloads/SWAYARI%20ENTERPRISES/SWAYARI-ENTERPRISES)
- **Commit Summary:** `feat(storefront): implement core SWAYARI application, D1 schema, and Pages Functions`

### 1. Context & Motivation
SWAYARI ENTERPRISES required the initial production-ready release of its bespoke digital catalogue and order-management application. The business is founded upon artisanal devotional art, solid brassware, silver-embossed framed plaques, and curated celebratory gifting. Unlike ordinary e-commerce websites, this business requires a **catalogue and order request workflow without automated online payment checkouts**, since each customer order entails personal telephone consultation, customisation discussions, packaging choices, and insured transit calculations.

### 2. Architecture & Components Created
1. **Brand Identity & Vector Assets:**
   - Evaluated the provided brand artwork card (`swayari_brand_card.jpeg`).
   - Designed a responsive SVG logo (`swayari-logo.svg`) and circular lotus emblem favicon (`favicon.svg`) utilizing gold gradients and Cinzel/Cormorant Garamond typography.
   - Organized Git-tracked product photography (`sample_product_1.jpeg` through `sample_product_4.jpeg`) and created `scripts/generate-manifest.js` to build `public/assets/manifest.json`.
2. **Database Engine (Cloudflare D1):**
   - Implemented `migrations/0001_initial_schema.sql` defining 9 relational tables: `users`, `sessions`, `categories`, `products`, `orders`, `order_items`, `order_quotations`, `order_internal_notes`, and `audit_logs`.
   - Created `migrations/0002_demo_data.sql` with preview entries clearly tagged as `is_demo = 1` and excluded from production queries.
3. **Backend Edge APIs (Pages Functions):**
   - Auth: Google ID token verification (`functions/api/auth/google.js`) using `jose` with remote JWKS caching and `email_verified` validation.
   - Sessions: Cryptographic 256-bit token generation stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
   - Storefront: Products listing with category/search filtering (`/api/products`), single product lookup (`/api/products/[slug]`), and category summary with product counts (`/api/categories`).
   - Orders: Order request creation (`/api/orders`) with idempotency token verification, server-side price recalculation from database snapshots, and atomic `DB.batch` execution.
   - Admin APIs: Allowlist verification for `swayarienterprises@gmail.com`, order management with quotation revision creation (`order_quotations`), confidential internal notes (`order_internal_notes`), product catalogue management, and audit logging.
4. **Public Storefront & Admin Interfaces:**
   - Homepage (`/index.html`) with hero section, brand story, and graceful empty states.
   - Catalogue (`/shop/index.html`) with category filters and preview toggle.
   - Product Details (`/product/index.html`) with specifications table and "Add to Request" auth resume workflow.
   - Request Cart (`/cart/index.html`) and Order Request Form (`/checkout/index.html`) with mandatory disclaimer text.
   - Order Confirmation (`/order-confirmation/index.html`) with reference copy button and consultation timeline.
   - Customer Order History (`/account/orders/index.html`) showing real-time status and formal quotation breakdowns.
   - Admin Control Center (`/admin/index.html`) with order management drawer, quotation revision editor, internal notes logger, product manager, and tab-visibility-based polling.
   - Static informational pages: `/about/`, `/contact/`, `/ordering-policy/`, and `/privacy/`.
5. **Tooling & Backup Automation:**
   - Daily Asia/Kolkata snapshot shell script (`scripts/create-daily-backup.sh`).
   - GitHub Actions daily snapshot workflow (`.github/workflows/daily-backup.yml`).
   - Standalone Git bundle disaster recovery export script (`scripts/export-git-bundle.sh`).
   - In-memory D1 test runner (`scripts/d1-mock.js`) using Node 22 built-in `node:sqlite`.

### 3. Checks & Verification Executed
- **Automated Test Suite (`npm test`):**
  - Ran `scripts/run-tests.js`.
  - **Results: 16 passed, 0 failed.**
  - Verified: Demo data separation, dev login production isolation, session cookie creation, customer data isolation (Customer B blocked from Customer A orders), admin allowlist enforcement (non-admin receives 403 Forbidden), client-forged price rejection (indicative price re-calculated from DB), idempotency duplicate submission prevention, admin quotation revisions without overwriting original request items, internal notes confidentiality, and product archival preserving historical orders.
- **Local Dev Server Execution (`wrangler pages dev`):**
  - Applied migrations `0001_initial_schema.sql` and `0002_demo_data.sql` to local D1 SQLite database.
  - Verified live HTTP endpoints (`/api/categories`, `/api/products`, `/api/products?include_demo=1`).
  - Tested public storefront separation: `curl -s http://localhost:8788/api/products` returned `{"success":true,"count":0,"products":[]}`, confirming zero unverified demo products leak into the clean production store.

### 4. Deployment Status
- Local testing and development: 100% operational.
- Infrastructure accounts: Note that local wrangler CLI is currently authenticated to `naidupsuryateja@gmail.com`. As instructed by the business guidelines, all production Cloudflare resources (Pages project and D1 database) and Google Sign-in OAuth Web Client MUST be provisioned under the official business account `swayarienterprises@gmail.com`. Detailed setup steps are documented in `docs/DEPLOYMENT.md`.

### 5. Open Issues & Next Steps
1. Owner to sign in to Cloudflare with `swayarienterprises@gmail.com` and run `wrangler d1 create swayari-db` and `wrangler pages project create swayari-enterprises`.
2. Owner to configure Google Cloud OAuth Web Client ID under `swayarienterprises@gmail.com` and set the `GOOGLE_CLIENT_ID` secret on Cloudflare Pages.
3. Photograph real inventory and run `node scripts/generate-manifest.js` to populate authentic catalogue entries.

---

## Milestone 2: Two-Portal Independent Separation & Premium Redesign

- **Date & Time (Asia/Kolkata):** `2026-10-18T20:25:00+05:30`
- **Working Branch:** `feature/swayari-premium-portals`
- **Preceding Implementation Commit:** [`b236a60d92067ca107327d2e239d2046fe1af820`](file:///Users/suryateja/Downloads/SWAYARI%20ENTERPRISES/SWAYARI-ENTERPRISES)
- **Commit Summary:** `feat(portals): implement two-portal separation and premium redesign`

### 1. Context & Motivation
The owner rejected the previous single-origin architecture and layout as too basic for a luxury artisanal gifting brand. The requirements called for:
1. Complete architectural separation into **TWO independently deployable Cloudflare Pages applications**:
   - Customer Storefront (`apps/storefront`)
   - Admin Operations Portal (`apps/admin`)
2. Total elimination of admin routes, links, frontend bundles, and API handlers from the customer storefront.
3. Upgraded modern frontend stack using React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, and customized design tokens.
4. Premium editorial design direction inspired by *Ellementry*: warm ivory surfaces (`#FAF7F2`), deep burgundy accents (`#5C1D24`), restrained antique gold highlights (`#C49A45`), warm charcoal text, Playfair Display typography, 4:5 vertical product ratio cards, rich product detail gallery, and cart drawer.
5. Strict database scope isolation preventing customer tokens from authenticating against admin APIs.

### 2. Architecture & Components Created
1. **Monorepo Structure:**
   - `apps/storefront`: Public customer storefront with React 18, Vite, Pages Functions (`api/products`, `api/categories`, `api/orders`, `api/auth`).
   - `apps/admin`: Staff operations portal at dedicated origin with branded login screen (`swayarienterprises@gmail.com`), dashboard metrics, live order drawer, quotation editor, confidential staff notes thread, and product catalogue management.
   - `packages/shared`: Shared TypeScript types, constants, validation, formatters.
   - `packages/server`: Server-side cookie helpers, session verification, and audit logging.
   - `packages/ui`: Design system tokens and shared Tailwind preset.
2. **Database Migrations:**
   - `migrations/0003_session_scope.sql`: Added `scope TEXT NOT NULL DEFAULT 'customer'` to `sessions` table.
   - Host-only cookies: `swayari_customer_session` (14 days, scope: `customer`) and `swayari_admin_session` (7 days, scope: `admin`).
3. **Storefront Sanitization:**
   - Removed all `/admin` routes, buttons, footer links, and API handlers from the storefront application.
   - Storefront `_middleware.js` returns HTTP `404 Not Found` for any requests to `/admin` or `/api/admin`.
4. **Documentation:**
   - Created `docs/DESIGN_SYSTEM.md`: Comprehensive visual specifications covering typography, colors, spacing, ratios, controls, and accessibility.
   - Created `docs/BROWSER_SETUP_HANDOFF.md`: Step-by-step instructions for Google Cloud Console (OAuth Client IDs) and Cloudflare Dashboard (Pages projects, D1 bindings, environment variables).
   - Updated `docs/ARCHITECTURE.md`: Complete system architecture and sequence diagrams.
   - Updated `CHANGELOG.md`: Version 0.2.0 release documentation.

### 3. Checks & Verification Executed
- **Automated Test Suite (`npm test`):**
  - Ran `scripts/run-tests.js` against in-memory D1 test database.
  - **Results: 17 passed, 0 failed.**
  - Verified: Demo data separation, dev login production isolation, customer session cookie issuance, admin allowlist enforcement, customer session rejection on admin APIs (scope isolation), storefront 404 blocking on `/admin`, signed-out order block (401), genuine product creation/publishing, client price recalculation, duplicate order prevention via idempotency key, cross-customer isolation, internal notes confidentiality, quotation revisions without overwriting request items, product soft-archival, admin stats calculation, and production Vite builds.
- **Production Builds (`npm run build`):**
  - Asset manifest generated with 7 items.
  - `apps/storefront/dist`: index.html (1.77 kB), CSS (31.94 kB), JS (333.67 kB gzip 93.15 kB). Built in 982ms.
  - `apps/admin/dist`: index.html (1.30 kB), CSS (21.84 kB), JS (293.95 kB gzip 84.71 kB). Built in 698ms.
- **Local Dev Server Execution (`wrangler pages dev`):**
  - Storefront running on `http://localhost:8788`.
  - Admin Portal running on `http://localhost:8789`.
  - Both successfully binding to local D1 SQLite database (`.wrangler/state`).
- **Visual Previews:**
  - Visual preview renders generated and stored in artifact directory:
    - Customer Storefront: `storefront_redesign_preview_1792335079301.jpg`
    - Admin Operations Portal: `admin_portal_preview_1792335096615.jpg`

### 4. Deployment Status
- Both applications are production-build verified and ready for deployment as two independent Cloudflare Pages projects under `swayarienterprises@gmail.com`.
- Zero paid Cloudflare services enabled (R2 and Cloudflare Images remain unactivated; product photos remain Git-tracked in `public/assets/`).

### 5. Open Issues & Next Steps
1. Execute Claude in Chrome browser handoff using `docs/BROWSER_SETUP_HANDOFF.md`:
   - Create two Cloudflare Pages projects: `swayari-store` and `swayari-admin`.
   - Bind both to the same D1 database (`swayari-db`).
   - Create two Google OAuth Web Client IDs in Google Cloud Console.
2. Review visual previews with the owner.
3. Merge `feature/swayari-premium-portals` into `main` after owner visual sign-off.


---

## Milestone 3: Editorial Storefront Redesign, Staff Portal Refinement & Portal Hardening

- **Date & Time (Asia/Kolkata):** `2026-10-18T21:20:00+05:30`
- **Working Branch:** `feature/swayari-editorial-redesign` (from `feature/swayari-premium-portals` @ `da7c7c6`)
- **Completed Implementation Commit:** `1bd5ce7060f452835eb58a5b5a71988f702b3aa7`
- **Commit Summary:** `feat(redesign): photography-led storefront, refined staff portal and portal hardening`

### 1. Context & Motivation
The owner rejected the Milestone 2 storefront: grass-background product photo as the hero, the same
photo repeated, a single narrow card in an empty grid, the square logo artwork reused as content,
pale empty panels, badge clutter, exaggerated and unsupported claims, a weak header wordmark and a
development sign-in strip visible to customers. The brief asked for a photography-led, honest
direction — “Warm Indian homes, thoughtful gifting and beautifully presented devotional décor” —
using licensed editorial imagery, prepared real product photographs, and a calmer staff portal,
without changing the working architecture.

### 2. What Changed
1. **Visual direction** — `docs/DESIGN_DIRECTION.md`; tokens in `packages/ui` (ivory/stone,
   ink, burgundy, restrained gold, umber hero panel; Cinzel wordmark, Cormorant Garamond display,
   Jost text). `docs/DESIGN_SYSTEM.md` rewritten to match.
2. **Storefront (`apps/storefront/src`)** — rebuilt header (live-text wordmark, Shop / Our Story /
   Contact, search, account, bag, mobile menu); wide editorial hero with a separate mobile crop;
   `ProductCollection` that adapts to the real item count; occasion tiles linking to enquiries;
   brand story; “How ordering works”; footer. Shop/search, product detail, bag drawer, full bag,
   request form (inline validation + focused error summary), confirmation and request history
   redesigned. Sign-in dialog renders Google’s own button using the storefront client ID from
   `/api/auth/config`; the intended add is resumed exactly once via sessionStorage. Contact form
   now honestly composes an email (no backend existed; it previously showed a fake success).
   Copy rewritten to remove unsupported claims.
3. **Imagery** — eight licensed Pexels photographs (`public/assets/editorial`, recorded in
   `docs/ASSET_SOURCES.md`); `scripts/prepare-product-photo.py` produces perspective-true cutouts
   of the four supplied framed pieces on a neutral surface (originals untouched, max 960px to avoid
   overstating quality). `scripts/sync-assets.js` copies canonical `public/assets` into each portal.
4. **Staff portal (`apps/admin/src`)** — branded split login, sidebar, overview with real counts
   only (preview samples counted separately), order list with status chips/search/thumbnails,
   order drawer separating customer data, read-only original request, customer-visible quotations
   and an amber “Staff only” notes panel; structured product editor drawer with an explicit sample flag.
5. **Hardening (server)**
   - Dev login is deny-by-default: only when `ENVIRONMENT === 'development'` (previously allowed
     whenever the variable was anything other than `production`, including unset).
   - Order submission rejects unpublished/archived products and preview samples outside
     development; idempotency keys are honoured only for the customer who created the order (409 otherwise).
   - Admin product update preserves `is_demo` and variants when the client omits them (editing a
     sample previously turned it into live inventory and erased variants).
   - Product-by-slug hides samples unless `include_demo=1`; category counts exclude samples.
   - Customer order list returns camelCase fields (history page previously showed blank dates/cities).
   - Admin orders list honours `limit` and returns a thumbnail; admin asset list reads the
     deployed manifest instead of a hard-coded, mislabelled list.
   - CSP allows `https://accounts.google.com/gsi/style` (Google button styles were blocked).
   - `/api/auth/config` per portal exposes only that portal’s OAuth client ID.
6. **Deployment wiring** — root `wrangler.toml` no longer declares `pages_build_output_dir`;
   `docs/BROWSER_SETUP_HANDOFF.md` corrected: each Pages project must use `apps/storefront` or
   `apps/admin` as its root directory (Pages has no separate functions-directory setting, so the
   documented root `/` would have deployed the legacy root `functions/` including admin handlers).
   Dev scripts run from each app folder against the shared local D1 state.

### 3. Database / Migrations
- `migrations/0004_preview_catalogue.sql`: renames the demo category label “Silver Plated Art” →
  “Devotional Frames”; neutralises demo category descriptions; rewrites `SWY-DEMO-001` with honest
  copy and the prepared images (material/dimensions/variants/customisation cleared); adds
  `SWY-DEMO-002…004` for the other supplied photographs. All rows remain `is_demo = 1`.
  Applied locally (`npm run d1:migrate:local`): ✅. **Not applied remotely.**

### 4. Checks & Results (actually run)
- `npm run build` — manifest 73 assets; storefront JS 462 kB (≈141 kB gzip); admin JS 280 kB. ✅
- `npm test` — **25 passed, 0 failed** (8 new tests covering the hardening items and storefront
  bundle/function separation).
- `npx tsc --noEmit -p tsconfig.json` — 0 errors.
- Local servers: storefront `wrangler pages dev` on :8790, admin on :8791 (the previous agent’s
  servers were still running on :8788/:8789 and were left untouched).
- Visual verification with headless Chrome (puppeteer-core) at 1440, 768 and 390 px: homepage
  (first screen and full page), single- and two-item collection layouts, production state with no
  live inventory, shop, search (results and empty), product (desktop/mobile), sign-in dialog,
  bag drawer, full bag, request form validation, submission → confirmation → history, mobile
  menu, search dialog, Our Story, Contact, policy, 404, and all admin screens. No horizontal
  overflow and no script errors (other than Google reporting the local placeholder client ID).
  Curated before/after set: `docs/screenshots/2026-10-18-editorial-redesign/`.
- End-to-end flow verified: signed-out “Add to bag” → sign-in dialog → local test sign-in →
  item added once and drawer opened → request saved → reference shown → visible in history and
  in the staff portal.

### 5. Deployment Status
- Nothing deployed; no Cloudflare or Google settings changed. No paid services enabled.
- Real Google sign-in not exercised (local `.dev.vars` contains a placeholder client ID).

### 6. Open Issues & Next Steps
1. Owner review of the redesign; merge to `main` only after sign-off.
2. Configure both Pages projects with the corrected root directories, `SKIP_DEPENDENCY_INSTALL=1`,
   `GOOGLE_STOREFRONT_CLIENT_ID` / `GOOGLE_ADMIN_CLIENT_ID`, then apply migration 0004 remotely.
3. Owner to decide whether to delete the legacy single-origin files (root `functions/` and root
   `public/*.html|js|css`); removal was not performed.
4. Confirm real product details (sizes, materials, prices) and publish real inventory; better
   product photographs on a plain background would allow larger gallery images.
5. Optional: reduce storefront JS by lazy-loading Motion; consider a contact-form backend.
