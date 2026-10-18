# SWAYARI ENTERPRISES — Backup, Disaster Recovery & Retention Policy

## 1. Code Snapshots via Git Branches

### Git Branching Model
- **`main`**: The canonical production branch. Only commits merged to `main` trigger production deployment on Cloudflare Pages.
- **`feature/<name>`**: Working branches for development and testing.
- **`backup/YYYY-MM-DD`**: Daily code snapshots representing the state of `main` at midnight (00:00 IST) using Asia/Kolkata dates.

### Automated GitHub Actions Workflow
The workflow `.github/workflows/daily-backup.yml` runs automatically:
- **Schedule:** `cron: '30 18 * * *'` (18:30 UTC = 00:00 Asia/Kolkata IST).
- **Manual Trigger:** Supports `workflow_dispatch` for on-demand execution.
- **Preservation Guarantee:** If a branch `backup/YYYY-MM-DD` already exists, the workflow logs a notice and exits cleanly without overwriting.
- **Permissions:** Minimum required scope (`contents: write`).

> [!IMPORTANT]
> **Scheduled Actions Nature:** GitHub Actions scheduled cron jobs are best-effort. Under GitHub policies, scheduled workflows can experience queuing delays or be disabled if a public repository has no activity for 60 days. Furthermore, they capture pushed commits on GitHub only. Always maintain local copies and use the manual fallback scripts below.

### Manual Local Fallback Command
```bash
npm run backup:daily
# Equivalent to: bash scripts/create-daily-backup.sh
```

---

## 2. Independent Offline Disaster Recovery (Git Bundle)

Git branches exist within the same repository. If the remote GitHub repository is ever compromised, inaccessible, or accidentally deleted, internal branches do not provide true disaster recovery.

To maintain an independent offline archive:
```bash
bash scripts/export-git-bundle.sh [output-directory]
```
*Creates a verified, self-contained single-file `.bundle` (e.g. `SWAYARI-ENTERPRISES-SNAPSHOT-2026-10-18.bundle`) on an external drive or secure offline storage.*

### Restoring from a Git Bundle
```bash
git clone SWAYARI-ENTERPRISES-SNAPSHOT-2026-10-18.bundle swayari-restored
cd swayari-restored
git checkout main
```

---

## 3. Cloudflare D1 Database Backup & Recovery

> [!CAUTION]
> **Data Privacy Warning:** The GitHub repository is public. **NEVER commit production database exports, SQL dumps, customer telephone numbers, or order histories into this repository.**

### Exporting Production D1 Data
To create an encrypted, local offline backup of production data:
```bash
# Export remote D1 database to a local SQL file (stored outside repository)
npx wrangler d1 export swayari-db --remote --output=../swayari-d1-backup-$(date +%Y-%m-%d).sql
```

### Restoring Production D1 Database
In the event of database corruption or regional failure:
1. Re-provision or clear the target database:
   ```bash
   npx wrangler d1 execute swayari-db --remote --command="PRAGMA foreign_keys = OFF;"
   ```
2. Execute the backup SQL file:
   ```bash
   npx wrangler d1 execute swayari-db --remote --file=../swayari-d1-backup-2026-10-18.sql
   ```
3. Verify integrity:
   ```bash
   npx wrangler d1 execute swayari-db --remote --command="SELECT count(*) FROM orders;"
   ```
