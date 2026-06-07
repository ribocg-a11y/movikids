param(
  [switch]$DryRun,
  [switch]$SoHoje
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

if ($DryRun) {
  $nodeScript = "C:\Users\riboc\Projects\google-drive-sheets-auth\scripts\limpar-testes-movikids.js"
  if (-not (Test-Path $nodeScript)) {
    Write-Error "Script Node nao encontrado: $nodeScript`nRode npm run auth em google-drive-sheets-auth se necessario."
  }
  & node $nodeScript --dry-run
  exit $LASTEXITCODE
}

if ($SoHoje) {
  $r = Invoke-MoviTestCleanup -SoHoje
} else {
  $r = Invoke-MoviTestCleanup
}

$r | ConvertTo-Json -Compress
if (-not $r.ok) { exit 1 }
exit 0
