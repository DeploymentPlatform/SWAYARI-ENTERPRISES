# SWAYARI ENTERPRISES

> **Brand:** SWAYARI  
> **Brand Subtitle:** Décor & Gifting  
> **Entity:** SWAYARI ENTERPRISES  
> **Repository:** `https://github.com/DeploymentPlatform/SWAYARI-ENTERPRISES`  
> **Account:** `swayarienterprises@gmail.com`

---

## Overview

SWAYARI is a bespoke digital catalogue and order-management application for artisanal devotional art, handcrafted brassware, silver-foil framed relief plaques, and curated festive and corporate gifting mementos.

### Distinct Architectural Model: Catalogue & Order Request
SWAYARI is **intentionally NOT an automated online payment checkout**. Because each item represents delicate metalcraft, customized dimensions, and dedicated engraving:
1. **Free Browsing:** Customers explore the catalogue freely without signing in.
2. **Intentional Sign-in:** Clicking "Add to Cart / Add to Request" triggers a verified Google Sign-in flow.
3. **Exact Action Resume:** Upon successful authentication, the intended item and quantity are automatically added to the request list.
4. **Order Request Submission:** Customers specify delivery destination, contact telephone number, and customisation requests.
5. **Mandatory Legal Notice:**
   > *“Our team will contact you to confirm availability, final pricing, shipping charges and delivery details. Submitting this request does not confirm a purchase or reserve stock.”*
6. **Personal Telephone Consultation:** The SWAYARI team directly contacts customers, discusses packaging and dedications, calculates insured shipping charges, and issues formal quotation revisions via the admin dashboard.

---

## Technology Stack

- **Applications:**
  - **Storefront (`apps/storefront`):** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide icons. High-density, Tanishq-inspired visual elegance with Amazon-grade shopping ergonomics.
  - **Admin Operations (`apps/admin`):** React 18, TypeScript, Vite, Tailwind CSS. Protected operational control center for orders, quotations, internal notes, catalogue, and campaign hero banners.
- **Shared Packages:**
  - `packages/shared`: Shared TypeScript types, validation schemas, formatters, and business constants.
  - `packages/server`: Edge session verification, cookie management, and audit logging.
  - `packages/ui`: Shared design tokens and Tailwind configuration preset.
- **Backend / Edge Functions:** Cloudflare Pages Functions per portal application root.
- **Database:** Cloudflare D1 (Serverless SQLite on Cloudflare's Free tier) shared across both backends via server-side bindings.
- **Authentication:** Direct Google Identity Services (GIS) on the frontend; RFC-compliant JWT/JWKS verification using `jose` on the backend edge.
- **Sessions:** Cryptographically generated tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies with portal scope enforcement (`swayari_customer_session` vs `swayari_admin_session`).

---

## Directory Structure

```text
SWAYARI-ENTERPRISES/
├── apps/
│   ├── storefront/                # Customer shopping portal (React 18 + Vite)
│   │   ├── functions/             # Storefront Pages Functions (No admin handlers)
│   │   ├── src/                   # Components, pages, hooks, contexts
│   │   └── public/assets/         # Synced product and editorial assets
│   └── admin/                     # Restricted business portal (React 18 + Vite)
│       ├── functions/             # Protected Admin Pages Functions
│       ├── src/                   # Order manager, product editor, banner manager
│       └── public/assets/         # Synced operational assets
├── packages/
│   ├── shared/                    # Shared TypeScript interfaces & constants
│   ├── server/                    # Edge authentication & cookie utilities
│   └── ui/                        # Design tokens & Tailwind preset
├── migrations/
│   ├── 0001_initial_schema.sql    # D1 relational schema
│   ├── 0002_demo_data.sql         # Seed preview demo entries (is_demo = 1)
│   ├── 0003_session_scope.sql     # Customer vs admin session scope isolation
│   ├── 0004_preview_catalogue.sql # Frame relief preview updates
│   ├── 0005_rich_demo_catalogue.sql # 20 sample products across 5 categories
│   └── 0006_campaign_banners.sql # Dynamic campaign hero banners
├── public/assets/                 # Authoritative Git-tracked asset repository
│   ├── brand/                     # SVG logo, favicon, official artwork
│   ├── categories/                # 5 circular category shortcuts
│   ├── editorial/                 # Desktop & mobile campaign hero slides
│   ├── products/                  # 20 high-res WebP/JPG product photographs
│   └── manifest.json              # Generated asset manifest
├── scripts/
│   ├── prepare-tanishq-catalogue.py # Image download & crop pipeline
│   ├── sync-assets.js             # Asset synchronization to app roots
│   ├── generate-manifest.js       # Manifest builder
│   ├── d1-mock.js                 # In-memory D1 test runner via node:sqlite
│   └── run-tests.js               # Automated test suite (25 tests)
├── docs/                          # Comprehensive architectural documentation
├── package.json
└── wrangler.toml                  # Cloudflare D1 database configuration
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js `>= 18.0.0` (Tested on Node v22.18.0)
- npm `>= 9.0.0`

### 1. Installation
```bash
npm install
```

### 2. Build both portals
```bash
npm run build
```
Regenerates `public/assets/manifest.json`, copies the Git-tracked assets into each portal
(`scripts/sync-assets.js`) and builds `apps/storefront/dist` and `apps/admin/dist`.

### 3. Run the automated test suite
```bash
npm test
```
Runs 25 security, data-isolation, ordering and portal-separation tests against an in-memory D1 database.

### 4. Local development
```bash
npm run d1:migrate:local   # once, and after adding migrations
npm run dev:storefront     # customer website  → http://localhost:8788
npm run dev:admin          # staff portal      → http://localhost:8789
```
Both share the local D1 database in `.wrangler/state` and run with `ENVIRONMENT=development`.

- **Preview catalogue:** the public site lists only real inventory. Sample items supplied for review
  are shown on localhost automatically, or anywhere with `?preview=1` (`?preview=0` hides them).
  `?count=1` (preview only) limits the samples to check the single-product layout.
- **Local test sign-in:** customer — open the sign-in dialog and choose *Local development sign-in*
  (route `/dev-login`); staff — button on the staff login page. Both are refused by the server
  unless `ENVIRONMENT` is exactly `development`.

### 5. Adding product photographs
Photograph the piece flat on a plain contrasting background, then:
```bash
python3 scripts/prepare-product-photo.py <photo.jpg> public/assets/products <product-slug>
npm run build
```
The script corrects perspective and places the unaltered product on a neutral surface
(see `docs/ASSET_SOURCES.md`). Attach the result to a product in the staff portal.

---

## Daily Backup & Disaster Recovery

SWAYARI uses a strict Git branching model:
- `main`: Stable production branch.
- `feature/<name>`: Development work.
- `backup/YYYY-MM-DD`: Daily code snapshot of `main` using Asia/Kolkata dates.
- Release tags: Annotated version tags (e.g. `v0.1.0`).

Run manual daily snapshot:
```bash
npm run backup:daily
```

Export standalone offline bundle:
```bash
bash scripts/export-git-bundle.sh
```

---

## Contact & Administrative Access

- **Authorized Administrator:** `swayarienterprises@gmail.com`
- **Customer Support Email:** `swayarienterprises@gmail.com`
- **Ownership:** SWAYARI ENTERPRISES
