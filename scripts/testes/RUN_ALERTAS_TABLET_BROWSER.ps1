# Executa TESTE_ALERTAS_TABLET_BROWSER.js no Chrome via Playwright (login admin + checkTimer).
param(
  [string]$FeUrl = "https://ribocg-a11y.github.io/movikids/?force=1.8.20",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

$runnerPath = Join-Path $PSScriptRoot "_run_alertas_playwright.mjs"
if (-not (Test-Path $runnerPath)) {
  throw "Runner ausente: $runnerPath"
}

$result = [ordered]@{
  suite = "RUN_ALERTAS_TABLET_BROWSER"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  feUrl = $FeUrl
}

try {
  if (-not (Test-Path (Join-Path $PSScriptRoot "node_modules\playwright"))) {
    Push-Location $PSScriptRoot
    npm install playwright --no-save *> $null
    npx playwright install chromium *> $null
    Pop-Location
  }

  $env:MK_FE_URL = $FeUrl
  $env:MK_ADMIN_PIN = $AdminPin
  Push-Location $PSScriptRoot
  $lines = & node $runnerPath 2>&1
  Pop-Location
  $text = ($lines | Out-String).Trim()
  Write-Host $text
  if ($LASTEXITCODE -ne 0) { throw "Browser test exit $LASTEXITCODE" }
  $result.status = "ok"
  try { $result.browser = $text | ConvertFrom-Json } catch { $result.browserRaw = $text }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
}
finally {
  $cleanup = Invoke-MoviTestCleanup -SoHoje -Quiet
  $result.cleanup = $cleanup.detail
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result | ConvertTo-Json -Depth 10
  if ($result.status -ne "ok") { exit 1 }
}
