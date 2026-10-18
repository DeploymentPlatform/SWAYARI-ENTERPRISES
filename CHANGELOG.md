# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
