# Relatorio de versoes MOVI KIDS - encerramento de sessao / toda resposta do agente
# Uso:
#   .\scripts\relatorio-versoes.ps1
#   .\scripts\relatorio-versoes.ps1 -Markdown
#   .\scripts\relatorio-versoes.ps1 -SkipNetwork

param(
  [switch]$Markdown,
  [switch]$SkipNetwork,
  [switch]$Strict,
  [string]$GasPingUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping",
  [string]$PagesBase = "https://ribocg-a11y.github.io/movikids"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

function Read-VerFromFile {
  param([string]$Path, [string]$Pattern)
  if (-not (Test-Path $Path)) { return $null }
  $m = Select-String -Path $Path -Pattern $Pattern | Select-Object -First 1
  if (-not $m) { return $null }
  return $m.Matches.Groups[1].Value
}

function Read-HtmlCacheVersions {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return @() }
  $uniq = @{}
  $lines = Select-String -Path $Path -Pattern '\?v=([0-9]+\.[0-9]+\.[0-9]+)' -AllMatches
  foreach ($line in $lines) {
    foreach ($m in $line.Matches) { $uniq[$m.Groups[1].Value] = $true }
  }
  $keys = @($uniq.Keys | Sort-Object | ForEach-Object { [string]$_ })
  return ,$keys
}

function Status-Alinhado {
  param([string]$Valor, [string]$Esperado)
  if (-not $Valor) { return "ausente" }
  if ($Valor -eq $Esperado) { return "OK" }
  return "desalinhado ($Valor)"
}

$mkVer = Read-VerFromFile (Join-Path $root "mk-version.js") "MK_VERSION\s*=\s*'([^']+)'"
$swVer = Read-VerFromFile (Join-Path $root "sw.js") "SW_VERSION\s*=\s*'([^']+)'"
$gasHeader = Read-VerFromFile (Join-Path $root "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs") "Apps Script v([0-9]+\.[0-9]+\.[0-9]+)"
if ($gasHeader) { $gasHeader = "v$gasHeader" }

$idxVers = Read-HtmlCacheVersions (Join-Path $root "index.html")
$gpVers = Read-HtmlCacheVersions (Join-Path $root "gestao-pessoas.html")
$idxLabel = if ($idxVers.Count -eq 1) { $idxVers[0] } elseif ($idxVers.Count -eq 0) { "n/a" } else { ($idxVers -join ", ") }
$gpLabel = if ($gpVers.Count -eq 1) { $gpVers[0] } elseif ($gpVers.Count -eq 0) { "n/a" } else { ($gpVers -join ", ") }

$idxOk = ($idxVers.Count -eq 1 -and $idxVers[0] -eq $mkVer)
$gpOk = ($gpVers.Count -eq 1 -and $gpVers[0] -eq $mkVer)
$swOk = ($swVer -eq $mkVer)

$gasPing = $null
$pagesVer = $null
$gitAhead = 0

if (-not $SkipNetwork) {
  try {
    $ping = Invoke-RestMethod -Uri $GasPingUrl -TimeoutSec 25
    $gasPing = $ping.versao
  } catch { $gasPing = "erro ping" }

  try {
    $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $url = ($PagesBase.TrimEnd("/") + "/mk-version.js?t=" + $ts)
    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.Method = "GET"
    $req.Timeout = 20000
    $req.UserAgent = "MOVIKIDS-relatorio-versoes/1"
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $body = $reader.ReadToEnd()
    $reader.Close()
    $resp.Close()
    $m = [regex]::Match($body, "MK_VERSION\s*=\s*'([^']+)'")
    if ($m.Success) { $pagesVer = $m.Groups[1].Value }
  } catch { $pagesVer = "indisponivel" }
}

try {
  git -C $root fetch origin main 2>&1 | Out-Null
  $ahead = (git -C $root rev-list --count origin/main..HEAD 2>$null)
  if ($ahead -match '^\d+$') { $gitAhead = [int]$ahead }
} catch { $gitAhead = 0 }

$pagesStatus = if ($SkipNetwork) { "nao verificado" }
  elseif ($pagesVer -eq $mkVer) { "confirmado" }
  elseif ($gitAhead -gt 0) { "push pendente ($gitAhead commit)" }
  elseif ($pagesVer -and $pagesVer -ne $mkVer) { "Pages=$pagesVer local=$mkVer" }
  else { "pendente" }

$pagesEmoji = if ($pagesStatus -eq "confirmado") { "confirmado" } else { $pagesStatus }
$gasPath = "C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"

$mkSt = if ($mkVer) { "OK" } else { "ausente" }
$swSt = if ($swOk) { "OK" } else { Status-Alinhado $swVer $mkVer }
$idxSt = if ($idxOk) { "OK" } else { Status-Alinhado $idxLabel $mkVer }
$gpSt = if ($gpOk) { "OK" } else { Status-Alinhado $gpLabel $mkVer }
$gasPingVal = if ($gasPing) { $gasPing } else { "n/a" }
if ($gasPing -and $gasHeader -and $gasPing -eq $gasHeader) { $gasPingSt = "alinhado" }
elseif ($gasPing -and $gasPing -ne "erro ping") { $gasPingSt = "verificar" }
else { $gasPingSt = "n/a" }
$pagesVal = if ($pagesVer -and $pagesVer -ne "indisponivel") { $pagesVer } else { "n/a" }

if ($Markdown) {
  Write-Output "## Versoes (encerramento)"
  Write-Output ""
  Write-Output "| Artefato | Versao | Status |"
  Write-Output "|----------|--------|--------|"
  Write-Output "| mk-version.js | $mkVer | $mkSt |"
  Write-Output "| sw.js | $swVer | $swSt |"
  Write-Output "| index.html (?v=) | $idxLabel | $idxSt |"
  Write-Output "| gestao-pessoas.html (?v=) | $gpLabel | $gpSt |"
  Write-Output "| GAS repo (header) | $gasHeader | |"
  Write-Output "| GAS ping producao | $gasPingVal | $gasPingSt |"
  Write-Output "| GitHub Pages | $pagesVal | $pagesEmoji |"
  Write-Output ""
  Write-Output "---"
  Write-Output "**Mudanca no AppScript:** [sim | nao - preencher na resposta]"
  Write-Output "**Link canonico (.gs):** [$gasPath se sim | - se nao]"
} else {
  Write-Host "MOVI KIDS - relatorio-versoes" -ForegroundColor Cyan
  Write-Host "mk-version.js     : $mkVer"
  Write-Host "sw.js             : $swVer $(if (-not $swOk) { '[DESALINHADO]' })"
  Write-Host "index.html ?v=    : $idxLabel $(if (-not $idxOk) { '[DESALINHADO]' })"
  Write-Host "gestao-pessoas ?v=: $gpLabel $(if (-not $gpOk) { '[DESALINHADO]' })"
  Write-Host "GAS header        : $gasHeader"
  Write-Host "GAS ping          : $gasPing"
  Write-Host "GitHub Pages      : $pagesVer ($pagesStatus)"
  if ($gitAhead -gt 0) { Write-Host "git               : ahead $gitAhead commit(s) - push pendente" -ForegroundColor Yellow }
}

$strictFail = $false
if ($Strict) {
  if (-not $SkipNetwork -and $pagesVer -and $mkVer -and $pagesVer -ne $mkVer) {
    $strictFail = $true
    if ($Markdown) {
      Write-Output ""
      Write-Output "**I24 BLOQUEIO:** GitHub Pages ($pagesVer) != local ($mkVer) - banner Nova versao nao aparece ate git push + verify-publish-complete."
    } else {
      Write-Host "I24 BLOQUEIO: Pages != local - publicar FE" -ForegroundColor Red
    }
  }
  if ($gitAhead -gt 0) {
    $strictFail = $true
    if ($Markdown) {
      Write-Output "**I24 BLOQUEIO:** git ahead $gitAhead commit(s) - push pendente."
    } else {
      Write-Host "I24 BLOQUEIO: push pendente - $gitAhead commit(s)" -ForegroundColor Red
    }
  }
}

if ($strictFail) { exit 1 }
exit 0
