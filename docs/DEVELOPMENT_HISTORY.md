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
