# scripts/install-git-hooks.ps1
#
# One-time installer for the BSV Law project git hooks. Jon runs this once
# per clone of the repository. It copies the project-tracked
# scripts/hooks/pre-commit into the per-clone .git/hooks/ directory and sets
# the executable bit so Git for Windows' bundled bash can run it.
#
# Plain-English summary: Git hooks live inside the hidden .git folder, which
# is never committed. To share a hook across the team, we keep the canonical
# copy under scripts/hooks/ (which IS committed) and run this installer once
# to put it where Git looks for it.
#
# Run from any working directory inside the repo:
#     powershell -ExecutionPolicy Bypass -File scripts/install-git-hooks.ps1

$ErrorActionPreference = 'Stop'

# Resolve repo root via git so this script works no matter where it is
# invoked from inside the working tree.
$repoRoot = git rev-parse --show-toplevel
if (-not $repoRoot) {
    Write-Error "git rev-parse --show-toplevel failed — are you inside a git repository?"
    exit 1
}

$sourcePath = Join-Path $repoRoot 'scripts/hooks/pre-commit'
$hookPath   = Join-Path $repoRoot '.git/hooks/pre-commit'

if (-not (Test-Path $sourcePath)) {
    Write-Error "Source hook not found at $sourcePath"
    exit 1
}

Copy-Item -Force $sourcePath $hookPath

# Grant execute permission. Git for Windows' bundled bash honors the file's
# executable bit; on NTFS we approximate via icacls Read+Execute.
icacls $hookPath /grant Everyone:RX | Out-Null

Write-Host "Pre-commit hook installed at $hookPath"
Write-Host ""
Write-Host "Next step: install the gitleaks binary (Plan 06). Until then, the"
Write-Host "hook will print an error when it cannot find 'gitleaks' on PATH."
