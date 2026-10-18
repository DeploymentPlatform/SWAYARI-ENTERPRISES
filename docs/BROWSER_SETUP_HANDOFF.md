# Browser Setup & Cloudflare Dashboard Handoff Guide

> **Target Account:** `swayarienterprises@gmail.com` (Cloudflare & Google Cloud Console)  
> **Repository:** `https://github.com/DeploymentPlatform/SWAYARI-ENTERPRISES`  
> **Purpose:** Instructions for configuring Cloudflare Pages, D1 database bindings, and Google Identity Services OAuth 2.0 Web Clients in the business Google/Cloudflare browser profile.

---

## Part 1: Shared Database & Prerequisite Migration

Both applications share the exact same Cloudflare D1 production database.

### 1. Create Remote D1 Database
In Cloudflare Dashboard or Wrangler CLI (authenticated as `swayarienterprises@gmail.com`):
```bash
npx wrangler d1 create swayari-db
```
- **Generated Database ID:** (Insert generated UUID in `wrangler.toml` under `database_id`).
- **Database Binding Name:** `DB`

### 2. Apply Central Schema Migrations
Execute from the repository root:
```bash
npm run d1:migrate:remote
```
This applies migrations in sequence:
1. `migrations/0001_initial_schema.sql` (Tables: `users`, `sessions`, `categories`, `products`, `orders`, `order_items`, `order_quotations`, `order_internal_notes`, `audit_logs`)
2. `migrations/0002_demo_data.sql` (Preview demo entries with `is_demo = 1`)
3. `migrations/0003_session_scope.sql` (Session scope isolation column and index)

---

## Part 2: Customer Storefront Portal (`apps/storefront`)

### 1. Cloudflare Pages Project Configuration
- **Project Name:** `swayari-store` (or existing `swayari-enterprises`)
- **Production Branch:** `main`
- **Root Directory:** `apps/storefront`  ← required for portal isolation (see note below)
- **Framework Preset:** `None`
- **Build Command:** `cd ../.. && npm ci && npm run build:storefront`
- **Build Output Directory:** `dist` (relative to the root directory, i.e. `apps/storefront/dist`)
- **Functions:** picked up automatically from `apps/storefront/functions` because it sits in the root directory

> **Portal isolation note (corrected 2026-10-18):** Cloudflare Pages has no separate "functions
> directory" setting — it always uses `functions/` inside the project's root directory. With the
> root directory set to `/`, Pages would deploy the legacy single-origin `functions/` folder at the
> repository root, which contains admin API handlers. Each project must therefore use its own app
> folder as the root directory.
>
> Because the build command installs dependencies from the workspace root (`cd ../.. && npm ci`),
> also add the plaintext build variable `SKIP_DEPENDENCY_INSTALL = 1` to both projects so Pages does
> not attempt its own install inside the app folder. Verify the first deployment's build log after
> configuring this (not yet exercised on Cloudflare — no deployment was made in Milestone 3).
- **Production URL:** `https://swayari-store.pages.dev` (or configured custom apex domain)
- **Local Dev Origin:** `http://localhost:8788`

### 2. Google Identity Services (OAuth 2.0 Web Client)
In Google Cloud Console under `swayarienterprises@gmail.com`:
- **Application Type:** Web Application
- **Client Name:** `SWAYARI Customer Storefront`
- **Authorized JavaScript Origins:**
  - `http://localhost:8788` (Local Storefront Development)
  - `http://127.0.0.1:8788`
  - `https://swayari-store.pages.dev` (Cloudflare Production)
- **Authorized Redirect URIs:** Not required (uses direct GIS prompt & credential callback).

### 3. Environment Variables & Secrets
Set in Cloudflare Dashboard under **Settings > Environment variables** (or via Wrangler CLI):

| Variable Name | Classification | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Public (Plaintext) | `production` | Must never be `development` in Cloudflare. Development sign-in only works when this is exactly `development` (local `npm run dev:*` sets it). |
| `GOOGLE_STOREFRONT_CLIENT_ID` | Public / Plaintext | `<storefront-client-id>.apps.googleusercontent.com` | OAuth Client ID for customer GIS verification. Also served to the browser by `/api/auth/config` to render the Google button. |
| `GOOGLE_CLIENT_ID` | Fallback | `<storefront-client-id>.apps.googleusercontent.com` | Standard fallback OAuth Client ID |
| `SESSION_SECRET` | Secret (Encrypted) | `<crypto-random-64-char-hex>` | Cryptographic secret for signing |

### 4. D1 Database Binding
In **Settings > Functions > D1 database bindings**:
- **Variable Name:** `DB`
- **D1 Database:** `swayari-db`

### 5. Session & Cookie Policy
- **Cookie Name:** `swayari_customer_session`
- **Scope:** `customer`
- **Flags:** `HttpOnly; Secure; SameSite=Lax; Max-Age=1209600; Path=/` (Host-only cookie, no wildcard Domain attribute)
- **Portal Isolation:** Storefront contains ZERO admin API routes or bundles. Any request to `/admin` or `/api/admin/*` returns a strict HTTP `404 Not Found`.

---

## Part 3: Admin Operations Portal (`apps/admin`)

### 1. Cloudflare Pages Project Configuration
- **Project Name:** `swayari-admin`
- **Production Branch:** `main`
- **Root Directory:** `apps/admin`
- **Framework Preset:** `None`
- **Build Command:** `cd ../.. && npm ci && npm run build:admin`
- **Build Output Directory:** `dist`
- **Functions:** picked up automatically from `apps/admin/functions`
- **Production URL:** `https://swayari-admin.pages.dev`
- **Local Dev Origin:** `http://localhost:8789`

### 2. Google Identity Services (OAuth 2.0 Web Client)
In Google Cloud Console under `swayarienterprises@gmail.com`:
- **Application Type:** Web Application
- **Client Name:** `SWAYARI Admin Portal`
- **Authorized JavaScript Origins:**
  - `http://localhost:8789` (Local Admin Development)
  - `http://127.0.0.1:8789`
  - `https://swayari-admin.pages.dev` (Cloudflare Production)
- **Authorized Redirect URIs:** Not required (uses direct GIS prompt & credential callback).

### 3. Environment Variables & Secrets
Set in Cloudflare Dashboard under **Settings > Environment variables** (or via Wrangler CLI):

| Variable Name | Classification | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Public (Plaintext) | `production` | Must never be `development` in Cloudflare. Development sign-in only works when this is exactly `development` (local `npm run dev:*` sets it). |
| `ADMIN_EMAILS` | Secret / Config | `swayarienterprises@gmail.com` | Strict server-side allowlist for staff access |
| `GOOGLE_ADMIN_CLIENT_ID` | Public / Plaintext | `<admin-client-id>.apps.googleusercontent.com` | OAuth Client ID for staff GIS verification. Also served to the staff login page by `/api/auth/config`. |
| `GOOGLE_CLIENT_ID` | Fallback | `<admin-client-id>.apps.googleusercontent.com` | Standard fallback OAuth Client ID |
| `SESSION_SECRET` | Secret (Encrypted) | `<crypto-random-64-char-hex>` | Cryptographic secret for signing |

### 4. D1 Database Binding
In **Settings > Functions > D1 database bindings**:
- **Variable Name:** `DB`
- **D1 Database:** `swayari-db` (Select same database as Storefront)

### 5. Session & Cookie Policy
- **Cookie Name:** `swayari_admin_session`
- **Scope:** `admin`
- **Flags:** `HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/` (Host-only cookie, no wildcard Domain attribute)
- **Portal Security:** Unauthenticated users only see the branded staff login screen. Authenticated non-allowlist Google accounts receive a 403 Forbidden access-denied state with zero dashboard data exposed.

---

## Part 4: Deployment Order & Verification Checklist

1. **Step 1:** Run `npx wrangler d1 create swayari-db` under `swayarienterprises@gmail.com`.
2. **Step 2:** Apply migrations once: `npm run d1:migrate:remote`.
3. **Step 3:** Deploy Storefront Pages project `swayari-store` and bind `DB`.
4. **Step 4:** Deploy Admin Pages project `swayari-admin` and bind `DB`.
5. **Step 5:** Configure Google OAuth Client IDs and add production origins.
6. **Step 6:** Verify that a request submitted on `swayari-store` appears immediately in the dashboard of `swayari-admin`.
