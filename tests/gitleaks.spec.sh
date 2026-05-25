#!/usr/bin/env bash
# tests/gitleaks.spec.sh
#
# Negative-test shell script (NOT a Playwright test). Run manually in Plan 06's
# verification step after the gitleaks binary is installed. CI runs the
# equivalent server-side via the GitHub Actions gitleaks step (Plan 07).
#
# What this test proves (VALIDATION.md row 01-05-05, requirement SEC-04):
#   The gitleaks pre-commit hook blocks any attempt to commit the AWS example
#   key AKIAIOSFODNN7EXAMPLE. We use the canonical AWS documentation example
#   key — a fake credential that gitleaks's default rule set recognizes as a
#   real-looking AWS access key id pattern.
#
# Prerequisites:
#   1. gitleaks binary on PATH (Plan 06 install).
#   2. scripts/install-git-hooks.ps1 has been run so .git/hooks/pre-commit
#      exists and is executable.
#
# Safety:
#   - Runs on a throwaway branch named gitleaks-negative-test-<epoch>.
#   - Always cleans up via the trap (even on script failure).

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

BRANCH="gitleaks-negative-test-$(date +%s)"
TEMP_FILE="$REPO_ROOT/gitleaks-test-fake-secret.txt"
ORIGINAL_BRANCH=$(git symbolic-ref --short HEAD)

cleanup() {
  # Best-effort cleanup. Order matters: drop changes, return to original
  # branch, delete throwaway branch, remove temp file.
  git reset --hard HEAD >/dev/null 2>&1 || true
  rm -f "$TEMP_FILE" || true
  git checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1 || true
  git branch -D "$BRANCH" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git checkout -b "$BRANCH"

# AKIAIOSFODNN7EXAMPLE is the canonical AWS documentation example access key.
# It is publicly documented as a fake — committing it does NOT leak a real
# credential — and gitleaks's default rule set matches it as a real-looking
# AWS access key id pattern.
echo "fake_aws_key=AKIAIOSFODNN7EXAMPLE" > "$TEMP_FILE"
git add "$TEMP_FILE"

echo "Attempting to commit a fake AWS key — gitleaks should block this..."
if git commit -m "negative test: should be blocked by gitleaks"; then
  echo "FAIL: commit succeeded, but gitleaks should have blocked it"
  exit 1
else
  echo "PASS: gitleaks blocked AWS key commit"
fi
