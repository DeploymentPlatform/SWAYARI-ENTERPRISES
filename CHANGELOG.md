# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
