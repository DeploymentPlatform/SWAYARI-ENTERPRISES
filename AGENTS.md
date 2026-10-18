# Instructions for Future Development Agents

> **Project:** SWAYARI ENTERPRISES  
> **Brand:** SWAYARI — Décor & Gifting  
> **Target Accounts:** `swayarienterprises@gmail.com` (Cloudflare & Google Sign-In)  
> **Repository:** `https://github.com/DeploymentPlatform/SWAYARI-ENTERPRISES`

All AI and human software engineers contributing to this repository MUST strictly abide by the following operational directives:

---

## 1. Core Business Model & Non-Negotiables

1. **NO Online Payment Gateways:** SWAYARI is a bespoke catalogue and order-request application. Never integrate automated checkout, credit/debit card capture, payment gateways (Stripe, Razorpay, etc.), or automatic stock reservations.
2. **Mandatory Disclaimer Text:** Near every order request submission form and cart review, the following exact text MUST be displayed:
   > *“Our team will contact you to confirm availability, final pricing, shipping charges and delivery details. Submitting this request does not confirm a purchase or reserve stock.”*
3. **Quotation Revisions Never Overwrite:** The initial order request items and snapshot prices must remain immutable. Any pricing adjustments or shipping charges must be recorded in `order_quotations` as revision records.
4. **Internal Notes Confidentiality:** Notes stored in `order_internal_notes` must NEVER be exposed in public or customer APIs.
5. **Separation of Demo Data:** Real inventory is populated gradually. Demo or preview items must be tagged with `is_demo = 1` and excluded from the public storefront unless specifically requested or toggled. Never invent fake testimonials, fake sales numbers, or unsupported purity claims.

---

## 2. Documentation Maintenance Protocol

Whenever you perform meaningful implementation work:
1. Complete and test the implementation on a `feature/<description>` branch.
2. Commit the changes first to obtain the **actual completed commit hash**.
3. **DO NOT invent history or future commit hashes:** A commit cannot contain its own hash. You must reference known preceding commit hashes in documentation, then commit the documentation update separately.
4. Update `docs/DEVELOPMENT_HISTORY.md` and `CHANGELOG.md` recording:
   - Date and time in **Asia/Kolkata** (IST).
   - What changed and the architectural rationale.
   - Relevant branch.
   - Actual completed commit references.
   - Database schema or migration alterations.
   - Exact checks and tests run with their real results.
   - Cloudflare deployment status.
   - Open issues and immediate next steps.

---

## 3. Git Branching & Backup Rules

- **`main`**: The sole production branch triggering live Cloudflare Pages deployment.
- **`feature/<name>`**: Working branches for developing features or bug fixes.
- **`backup/YYYY-MM-DD`**: Daily snapshot branches created from `main` using Asia/Kolkata dates.
- Never force-push (`git push --force`) to `main`.
- Never delete or overwrite historical `backup/*` branches.
- Never commit credentials, private customer data, or `.env` files.
- Maintain minimum permissions for GitHub Actions workflows (`contents: write`).

---

## 4. Cloudflare Free-First Architecture

- Do NOT activate metered paid services (R2, Cloudflare Images, Workers Paid) without explicit owner approval.
- Keep image assets tracked in Git under `public/assets/` and run `node scripts/generate-manifest.js` to update `public/assets/manifest.json`.
- Apply D1 migrations deliberately using versioned SQL files in `migrations/`.

---

## 5. Automated Verification Checklist

Before opening a pull request or merging to `main`, you must execute and verify:
```bash
npm run build      # Regenerates public/assets/manifest.json
npm test           # Executes the 16-point automated test suite
```
Every single test must pass with 0 errors.
