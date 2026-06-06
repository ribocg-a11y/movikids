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

  $portalPath = Join-Path $root "acompanhar.html"
  if (Test-Path $portalPath) {
    $portalRaw = Get-Content -Path $portalPath -Raw -Encoding UTF8
    if ($portalRaw -notmatch 'function canonLoc_' -or $portalRaw -notmatch 'function calcStartTimestamp_') {
      Add-Check "guard.portal.canon" "fail" "acompanhar.html sem canonLoc_/calcStartTimestamp_ (I16)"
    } else {
      Add-Check "guard.portal.canon" "ok" "canonLoc_ presente"
    }
  } else {
    Add-Check "guard.portal.canon" "fail" "acompanhar.html ausente"
  }

  $gasCanon = Join-Path $root "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
  if (Test-Path $gasCanon) {
    $gasRaw = Get-Content -Path $gasCanon -Raw -Encoding UTF8
    if ($gasRaw -notmatch 'function buscarPortalResponsavel_[\s\S]{0,1200}timestampCanonico_') {
      Add-Check "guard.gas.portal.canon" "fail" "buscarPortalResponsavel_ sem timestampCanonico_ (I16)"
    } else {
      Add-Check "guard.gas.portal.canon" "ok" "timestampCanonico_ no portal GAS"
    }
  } else {
    Add-Check "guard.gas.portal.canon" "warn" ".gs canonico nao encontrado"
  }

  $authPath = Join-Path $root "mk-auth.js"
  if (Test-Path $authPath) {
    $authRaw = Get-Content -Path $authPath -Raw -Encoding UTF8
    if ($authRaw -notmatch 'mkHasLocacaoAbertaNoTablet_') {
      Add-Check "guard.idle.locacao" "fail" "mkHasLocacaoAbertaNoTablet_ ausente (I18)"
    } else {
      Add-Check "guard.idle.locacao" "ok" "idle bloqueado com locacao aberta"
    }
    if ($authRaw -notmatch 'mkAuthReconcileSessaoFantasma_') {
      Add-Check "guard.auth.fantasma" "fail" "mkAuthReconcileSessaoFantasma_ ausente (PWA sessao fantasma)"
    } else {
      Add-Check "guard.auth.fantasma" "ok" "reconcile sessao tablet x servidor"
    }
  } else {
    Add-Check "guard.idle.locacao" "fail" "mk-auth.js ausente"
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

    $cron = Join-Path $root "TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1"
    if (-not (Test-Path $cron)) { throw "TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1 nao encontrado" }
    $cronOut = & $cron 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { Add-Check "teste.cronometro" "fail" "exit $LASTEXITCODE" }
    else { Add-Check "teste.cronometro" "ok" "TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO" }
  } else {
    Add-Check "teste.paridade" "skip" "SkipNetworkTests"
    Add-Check "teste.portal" "skip" "SkipNetworkTests"
    Add-Check "teste.cronometro" "skip" "SkipNetworkTests"
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
