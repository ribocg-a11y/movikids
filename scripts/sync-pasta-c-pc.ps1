# MOVI KIDS — Alinhar pasta C: do PC com origin/main (protocolo "atualize tudo")
# Uso:
#   .\scripts\sync-pasta-c-pc.ps1
#   .\scripts\sync-pasta-c-pc.ps1 -SkipPull   # só relatório local

param(
  [switch]$SkipPull
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "MOVI KIDS — sync pasta C / repo local" -ForegroundColor Cyan
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

function Read-MkVersion {
  param([string]$Path, [string]$Pattern)
  if (-not (Test-Path $Path)) { return $null }
  $m = Select-String -Path $Path -Pattern $Pattern | Select-Object -First 1
  if (-not $m) { return $null }
  return $m.Matches.Groups[1].Value
}

$mkVer = Read-MkVersion (Join-Path $root "mk-version.js") "MK_VERSION\s*=\s*'([^']+)'"
$swVer = Read-MkVersion (Join-Path $root "sw.js") "SW_VERSION\s*=\s*'([^']+)'"

Write-Host ""
Write-Host "mk-version.js: $mkVer"
Write-Host "sw.js:         $swVer"

try {
  $pages = Invoke-WebRequest -Uri "https://ribocg-a11y.github.io/movikids/mk-version.js?nocache=$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds())" -UseBasicParsing -TimeoutSec 20
  $live = [regex]::Match($pages.Content, "MK_VERSION\s*=\s*'([^']+)'").Groups[1].Value
  Write-Host "Pages live:    $live"
  if ($live -ne $mkVer) {
    Write-Host "AVISO: Pages ($live) != local ($mkVer) — aguardar propagação ou git pull atrasado" -ForegroundColor Yellow
  }
} catch {
  Write-Host "Pages: não verificado ($($_.Exception.Message))" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Tablet/PWA: https://ribocg-a11y.github.io/movikids/?force=$mkVer"
Write-Host "Concluído." -ForegroundColor Green
