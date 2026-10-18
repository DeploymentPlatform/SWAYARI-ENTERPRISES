#!/usr/bin/env bash
set -euo pipefail

# SWAYARI ENTERPRISES - Offline Git Bundle Disaster Recovery Export
# Creates an independent single-file git bundle outside the repository root.

export TZ="Asia/Kolkata"
TODAY=$(date "+%Y-%m-%d")
REPO_ROOT=$(git rev-parse --show-toplevel)
OUTPUT_DIR="${1:-${REPO_ROOT}/../}"
BUNDLE_FILE="${OUTPUT_DIR}/SWAYARI-ENTERPRISES-SNAPSHOT-${TODAY}.bundle"

echo "Creating offline repository bundle at: ${BUNDLE_FILE}"
git bundle create "${BUNDLE_FILE}" --all

echo "Verifying bundle integrity..."
git bundle verify "${BUNDLE_FILE}"

echo "=========================================================="
echo "✓ Git bundle created successfully!"
echo "Location: ${BUNDLE_FILE}"
echo "To restore on another machine:"
echo "  git clone ${BUNDLE_FILE} swayari-restored"
echo "=========================================================="
