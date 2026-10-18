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

- **Frontend:** Semantic HTML5, Modern Vanilla CSS (variables, luxury ivory/burgundy/gold design tokens, responsive grid), JavaScript ES Modules.
- **Backend / API:** Cloudflare Pages Functions (`/functions/api/*`).
- **Database:** Cloudflare D1 (Serverless SQLite on Cloudflare's Free tier).
- **Authentication:** Direct Google Identity Services (GIS) on the frontend; RFC-compliant JWT/JWKS verification using `jose` on the backend edge.
- **Sessions:** Cryptographically generated tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.

---

## Directory Structure

```text
SWAYARI-ENTERPRISES/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated continuous integration test suite
│       └── daily-backup.yml       # Daily Asia/Kolkata code snapshot workflow
├── functions/                     # Cloudflare Pages Functions (Edge API)
│   ├── _middleware.js             # Security headers, CSP & CSRF origin guards
│   ├── _utils.js                  # Auth, session, D1 queries & audit utilities
│   └── api/
│       ├── auth/                  # Google ID token verification & session routes
│       ├── products/              # Storefront catalogue querying & filtering
│       ├── categories/            # Active categories with product counts
│       ├── orders/                # Order request submission (atomic D1 batch)
│       └── admin/                 # Authorized administrator management routes
├── migrations/
│   ├── 0001_initial_schema.sql    # D1 production schema
│   └── 0002_demo_data.sql         # Seed preview demo entries (is_demo = 1)
├── public/                        # Static assets & storefront pages
│   ├── assets/
│   │   ├── brand/                 # SVG logo, favicon, official artwork
│   │   ├── demo/                  # Authenticated product photography samples
│   │   └── manifest.json          # Git-tracked image asset manifest
│   ├── css/                       # Design tokens, typography, components, layouts
│   ├── js/                        # Client API client, cart, auth & admin modules
│   ├── shop/                      # Catalogue browse & search
│   ├── product/                   # Single product details & specifications
│   ├── cart/                      # Request cart & quantity review
│   ├── checkout/                  # Contact & delivery request submission
│   ├── order-confirmation/        # Request reference code & consultation timeline
│   ├── account/orders/            # Customer request history & quotation breakdown
│   ├── admin/                     # Full administrator control center
│   ├── about/                     # Heritage, story & craftsmanship
│   ├── contact/                   # Business office & bulk gifting enquiry form
│   ├── ordering-policy/           # Manual confirmation & shipping policy
│   └── privacy/                   # Data protection & Google auth transparency
├── scripts/
│   ├── create-daily-backup.sh     # Asia/Kolkata daily branch snapshot script
│   ├── export-git-bundle.sh       # Offline git bundle disaster recovery exporter
│   ├── generate-manifest.js       # Auto-generator for deployed photo manifest
│   ├── d1-mock.js                 # In-memory D1 test runner via node:sqlite
│   └── run-tests.js               # Comprehensive 16-point automated test suite
├── docs/                          # In-depth architectural & operational docs
├── package.json
└── wrangler.toml                  # Cloudflare Pages & D1 database configuration
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

### 2. Generate Asset Manifest
```bash
npm run build
```

### 3. Run Automated Test Suite
```bash
npm test
```
Executes all 16 unit, security, data isolation, and transactional tests using the in-memory D1 test adapter.

### 4. Local Development Server
```bash
npm run dev
```
Starts the local development server at `http://localhost:8788`.

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
