# MOVI KIDS - Alinhar pasta C: do PC com origin/main (protocolo "atualize tudo")
# Uso:
#   .\scripts\sync-pasta-c-pc.ps1
#   .\scripts\sync-pasta-c-pc.ps1 -SkipPull

param(
  [switch]$SkipPull
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "MOVI KIDS - sync pasta C / repo local" -ForegroundColor Cyan
Write-Host "Repo: $root"

if (-not $SkipPull) {
  git fetch origin main 2>&1 | Out-Host
  git pull origin main 2>&1 | Out-Host
}

$head = git rev-parse --short HEAD
$branch = git branch --show-current
$dirty = git status --porcelain

Write-Host ""
Write-Host "Branch: $branch"
Write-Host "HEAD:   $head"
if ($dirty) {
  Write-Host "Working tree: DIRTY" -ForegroundColor Yellow
  git status --short
} else {
  Write-Host "Working tree: clean" -ForegroundColor Green
}

function Read-MkVersionFile {
  param(
    [string]$Path,
    [string]$Key
  )
  if (-not (Test-Path $Path)) { return $null }
  $line = Select-String -Path $Path -Pattern $Key -SimpleMatch:$false | Select-Object -First 1
  if (-not $line) { return $null }
  $text = $line.Line
  $pat = [regex]::Escape($Key) + '\s*=\s*[''""]?([0-9]+\.[0-9]+\.[0-9]+)[''""]?'
  $m = [regex]::Match($text, $pat)
  if ($m.Success) { return $m.Groups[1].Value }
  return $null
}

$mkVer = Read-MkVersionFile (Join-Path $root "mk-version.js") "MK_VERSION"
$swVer = Read-MkVersionFile (Join-Path $root "sw.js") "SW_VERSION"

Write-Host ""
Write-Host "mk-version.js: $mkVer"
Write-Host "sw.js:         $swVer"

try {
  $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $uri = "https://ribocg-a11y.github.io/movikids/mk-version.js?nocache=$ts"
  $pages = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 20
  $livePat = 'MK_VERSION\s*=\s*[''""]?([0-9]+\.[0-9]+\.[0-9]+)[''""]?'
  $liveM = [regex]::Match($pages.Content, $livePat)
  $live = if ($liveM.Success) { $liveM.Groups[1].Value } else { $null }
  Write-Host "Pages live:    $live"
  if ($live -and $mkVer -and ($live -ne $mkVer)) {
    Write-Host "AVISO: Pages ($live) != local ($mkVer) - aguardar propagacao ou git pull atrasado" -ForegroundColor Yellow
  }
} catch {
  Write-Host "Pages: nao verificado ($($_.Exception.Message))" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tablet/PWA: https://ribocg-a11y.github.io/movikids/?force=$mkVer"
Write-Host "Concluido." -ForegroundColor Green
