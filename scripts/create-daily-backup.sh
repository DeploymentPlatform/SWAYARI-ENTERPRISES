#!/usr/bin/env bash
set -euo pipefail

# SWAYARI ENTERPRISES - Daily Code Snapshot Creator
# Uses Asia/Kolkata timezone to generate standard backup branch name: backup/YYYY-MM-DD

export TZ="Asia/Kolkata"
TODAY=$(date "+%Y-%m-%d")
BACKUP_BRANCH="backup/${TODAY}"

echo "=========================================================="
echo "SWAYARI ENTERPRISES - Code Snapshot Generator"
echo "Target Date (Asia/Kolkata): ${TODAY}"
echo "Target Branch:              ${BACKUP_BRANCH}"
echo "=========================================================="

# Ensure we are in git repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "${REPO_ROOT}"

# Check for uncommitted working tree changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Warning: Working tree has uncommitted modifications."
  echo "Please commit or stash changes on your active branch before snapshotting."
  exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: ${CURRENT_BRANCH}"

# Verify whether backup branch already exists locally
if git show-ref --verify --quiet "refs/heads/${BACKUP_BRANCH}"; then
  echo "ℹ️  Snapshot branch '${BACKUP_BRANCH}' already exists locally. Preserving existing snapshot."
else
  echo "Creating snapshot branch '${BACKUP_BRANCH}' from commit $(git rev-parse --short HEAD)..."
  git branch "${BACKUP_BRANCH}" HEAD
  echo "✓ Created local branch: ${BACKUP_BRANCH}"
fi

# If remote origin exists, check if already pushed
if git remote | grep -q "^origin$"; then
  if git ls-remote --heads origin "${BACKUP_BRANCH}" | grep -q "${BACKUP_BRANCH}"; then
    echo "ℹ️  Remote snapshot branch 'origin/${BACKUP_BRANCH}' already exists. Preserving without overwrite."
  else
    echo "Pushing snapshot branch to origin..."
    git push origin "${BACKUP_BRANCH}" || echo "⚠️ Push to origin failed or not permitted. Local branch remains safe."
  fi
fi

echo "=========================================================="
echo "Snapshot completed successfully: ${BACKUP_BRANCH}"
echo "=========================================================="
