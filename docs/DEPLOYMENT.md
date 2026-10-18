# SWAYARI ENTERPRISES — Production Deployment Guide

> **Target Cloudflare Account:** `swayarienterprises@gmail.com`  
> **Target Google Cloud Account:** `swayarienterprises@gmail.com`  
> **Source Control:** `https://github.com/DeploymentPlatform/SWAYARI-ENTERPRISES`

---

## 1. Account Ownership & Separation Notice

During preliminary inspection, the local environment was logged into a personal developer account (`naidupsuryateja@gmail.com`). **Do not deploy production resources under personal accounts.**

Follow these steps to establish production infrastructure under the verified business account `swayarienterprises@gmail.com`.

---

## 2. Cloudflare CLI Authentication

Log in to the official SWAYARI Cloudflare account:
```bash
npx wrangler login
```
*Select `swayarienterprises@gmail.com` in the browser authorization prompt.*

Verify active identity:
```bash
npx wrangler whoami
```
*Ensure Account Name and Account ID correspond to SWAYARI ENTERPRISES.*

---

## 3. Provision Cloudflare D1 Database (Free Tier)

Create the production D1 database:
```bash
npx wrangler d1 create swayari-db
```

The output will display:
```text
✅ Successfully created DB 'swayari-db'!
[[d1_databases]]
binding = "DB"
database_name = "swayari-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copy the generated `database_id` and replace the placeholder in `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "swayari-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # Insert real database ID here
```

Apply versioned migrations to the production database:
```bash
npx wrangler d1 migrations apply DB --remote
```

---

## 4. Google Cloud Identity Services (OAuth 2.0 Web Client)

1. Open [Google Cloud Console](https://console.cloud.google.com/) logged in as `swayarienterprises@gmail.com`.
2. Create or select a project named **SWAYARI ENTERPRISES**.
3. Navigate to **APIs & Services > OAuth consent screen**:
   - User Type: **External**
   - App Name: `SWAYARI Décor & Gifting`
   - User Support Email: `swayarienterprises@gmail.com`
   - Developer Contact: `swayarienterprises@gmail.com`
   - Scopes: `openid`, `email`, `profile`
4. Navigate to **Credentials > Create Credentials > OAuth client ID**:
   - Application Type: **Web application**
   - Name: `SWAYARI Web Client`
   - **Authorized JavaScript origins:**
     - `http://localhost:8788` (for local development)
     - `https://swayari-enterprises.pages.dev` (Pages production URL)
     - `https://swayari.com` (if connecting custom domain)
5. Copy the generated **Client ID** (e.g. `123456789-abcdef.apps.googleusercontent.com`).

---

## 5. Configure Cloudflare Pages Project

### Option A: Via GitHub Integration (Recommended for automatic deployments on push to `main`)
1. Open Cloudflare Dashboard > **Workers & Pages > Create application > Pages > Connect to Git**.
2. Select repository `DeploymentPlatform/SWAYARI-ENTERPRISES`.
3. Build Settings:
   - Framework preset: **None**
   - Build command: `node scripts/generate-manifest.js`
   - Build output directory: `public`
4. Bind D1 Database:
   - Go to Project Settings > **Functions > D1 database bindings**.
   - Variable name: `DB`
   - D1 database: `swayari-db`
5. Configure Environment Variables & Secrets:
   - `ENVIRONMENT`: `production`
   - `ADMIN_EMAILS`: `swayarienterprises@gmail.com`
   - `GOOGLE_CLIENT_ID`: `<Your-Google-Client-ID>`
   - `SESSION_SECRET`: `<Generate a random 32-character string>`

### Option B: Via Wrangler CLI
```bash
# Create project
npx wrangler pages project create swayari-enterprises --production-branch main

# Set environment secrets
npx wrangler pages secret put GOOGLE_CLIENT_ID
npx wrangler pages secret put SESSION_SECRET
npx wrangler pages secret put ADMIN_EMAILS

# Deploy manually
npx wrangler pages deploy public --project-name swayari-enterprises
```

---

## 6. Post-Deployment Verification Checklist

1. [ ] Browse `https://swayari-enterprises.pages.dev/` as a signed-out visitor.
2. [ ] Click "Add to Request" on any item; verify Google Sign-in modal appears.
3. [ ] Sign in with `swayarienterprises@gmail.com` and navigate to `/admin/`.
4. [ ] Confirm admin workspace opens and displays order metrics.
5. [ ] Submit a test order request as a customer; confirm notification is received in the admin panel.
