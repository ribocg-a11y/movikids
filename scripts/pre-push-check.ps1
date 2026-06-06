# Pacote J - gate local antes de git push (versoes FE + paridade HTTP + portal readonly)
# Uso:
#   .\scripts\pre-push-check.ps1
#   .\scripts\pre-push-check.ps1 -SkipNetworkTests   # offline / so versao
#
# Hook opcional (uma vez no repo):
#   git config core.hooksPath githooks

param(
  [switch]$SkipNetworkTests
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  status = "ok"
}

function Add-Check {
  param([string]$Name, [string]$Status, [string]$Detail = "")
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq "fail") { $script:result.status = "fail" }
}

function Read-MkVersion {
  param([string]$Path, [string]$Pattern)
  if (-not (Test-Path $Path)) { return $null }
  $m = Select-String -Path $Path -Pattern $Pattern | Select-Object -First 1
  if (-not $m) { return $null }
  return $m.Matches.Groups[1].Value
}

Write-Host "MOVI KIDS pre-push-check (Pacote J)" -ForegroundColor Cyan

try {
  $mkVer = Read-MkVersion (Join-Path $root "mk-version.js") "MK_VERSION\s*=\s*'([^']+)'"
  $swVer = Read-MkVersion (Join-Path $root "sw.js") "SW_VERSION\s*=\s*'([^']+)'"
  if (-not $mkVer) { throw "mk-version.js sem MK_VERSION" }
  if (-not $swVer) { throw "sw.js sem SW_VERSION" }

  if ($mkVer -ne $swVer) {
    Add-Check "versao.mk-vs-sw" "fail" "mk-version=$mkVer sw=$swVer"
  } else {
    Add-Check "versao.mk-vs-sw" "ok" $mkVer
  }

  $indexPath = Join-Path $root "index.html"
  $indexRaw = Get-Content -Path $indexPath -Raw -Encoding UTF8
  $scriptTags = [regex]::Matches($indexRaw, '\?(?:v|nocache)=([0-9]+\.[0-9]+(?:\.[0-9]+)?)')
  $badTags = @($scriptTags | ForEach-Object { $_.Groups[1].Value } | Where-Object { $_ -ne $mkVer })
  if ($badTags.Count -gt 0) {
    Add-Check "versao.index-cache-bust" "fail" ("desalinhado: " + ($badTags | Select-Object -Unique) -join ", ")
  } else {
    Add-Check "versao.index-cache-bust" "ok" ("?v=" + $mkVer)
  }

  if ($indexRaw -notmatch 'mkGuardEscritaBrowser_') {
    Add-Check "guard.post.escritas" "fail" "mkGuardEscritaBrowser_ ausente em index.html"
  } else {
    Add-Check "guard.post.escritas" "ok" "presente"
  }

  if ($indexRaw -match 'method:\s*[''"]POST[''"]') {
    Add-Check "static.no-post-index" "fail" "index.html contem method POST"
  } else {
    Add-Check "static.no-post-index" "ok" "sem POST explicito"
  }

  if (-not $SkipNetworkTests) {
    $paridade = Join-Path $root "TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1"
    $portal = Join-Path $root "TESTE_PORTAL_READONLY.ps1"
    if (-not (Test-Path $paridade)) { throw "TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1 nao encontrado" }
    if (-not (Test-Path $portal)) { throw "TESTE_PORTAL_READONLY.ps1 nao encontrado" }

    $parOut = & $paridade 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { Add-Check "teste.paridade" "fail" "exit $LASTEXITCODE" }
    else { Add-Check "teste.paridade" "ok" "TESTE_PARIDADE_HTTP_BROWSER_GAS" }

    $portOut = & $portal 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { Add-Check "teste.portal" "fail" "exit $LASTEXITCODE" }
    else { Add-Check "teste.portal" "ok" "TESTE_PORTAL_READONLY" }
  } else {
    Add-Check "teste.paridade" "skip" "SkipNetworkTests"
    Add-Check "teste.portal" "skip" "SkipNetworkTests"
  }
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5

if ($result.status -ne "ok") {
  Write-Host ""
  Write-Host "pre-push-check FALHOU - corrija antes do push." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "pre-push-check OK - pode publicar." -ForegroundColor Green
exit 0
