# Compara MK_VERSION local vs GitHub Pages (pos-push / Regra 8)
# Uso:
#   .\scripts\verify-pages-live.ps1
#   .\scripts\verify-pages-live.ps1 -ExpectedVersion 1.8.18
#   .\scripts\verify-pages-live.ps1 -MaxAttempts 8 -DelaySeconds 20

param(
  [string]$PagesBase = "https://ribocg-a11y.github.io/movikids",
  [string]$ExpectedVersion = "",
  [int]$MaxAttempts = 5,
  [int]$DelaySeconds = 15
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

function Read-LocalMkVersion {
  $path = Join-Path $root "mk-version.js"
  if (-not (Test-Path $path)) { return $null }
  $m = Select-String -Path $path -Pattern "MK_VERSION\s*=\s*'([^']+)'" | Select-Object -First 1
  if (-not $m) { return $null }
  return $m.Matches.Groups[1].Value
}

function Read-RemoteMkVersion {
  param([string]$Url)
  $req = [System.Net.HttpWebRequest]::Create($Url)
  $req.Method = "GET"
  $req.Timeout = 20000
  $req.UserAgent = "MOVIKIDS-verify-pages-live/1"
  $req.Headers.Add("Cache-Control", "no-cache")
  $req.Headers.Add("Pragma", "no-cache")
  $resp = $req.GetResponse()
  try {
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $body = $reader.ReadToEnd()
    $reader.Close()
  } finally {
    $resp.Close()
  }
  $m = [regex]::Match($body, "MK_VERSION\s*=\s*'([^']+)'")
  if (-not $m.Success) { return $null }
  return $m.Groups[1].Value
}

$localVer = if ($ExpectedVersion) { $ExpectedVersion } else { Read-LocalMkVersion }
if (-not $localVer) {
  Write-Host "verify-pages-live FALHOU: mk-version.js local sem MK_VERSION" -ForegroundColor Red
  exit 1
}

$remoteVer = $null
$lastUrl = ""
for ($i = 1; $i -le $MaxAttempts; $i++) {
  $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $lastUrl = ($PagesBase.TrimEnd("/") + "/mk-version.js?t=" + $ts)
  try {
    $remoteVer = Read-RemoteMkVersion -Url $lastUrl
  } catch {
    $remoteVer = $null
  }
  if ($remoteVer -eq $localVer) {
    $msg = "verify-pages-live OK: Pages=" + $remoteVer + " tentativa " + $i + "/" + $MaxAttempts
    Write-Host $msg -ForegroundColor Green
    exit 0
  }
  if ($i -lt $MaxAttempts) {
    $pagesLabel = if ($remoteVer) { $remoteVer } else { "n/a" }
    $waitMsg = "Pages=" + $pagesLabel + " local=" + $localVer + " aguardando deploy " + $i + "/" + $MaxAttempts
    Write-Host $waitMsg -ForegroundColor Yellow
    Start-Sleep -Seconds $DelaySeconds
  }
}

Write-Host ""
Write-Host "verify-pages-live FALHOU" -ForegroundColor Red
Write-Host ("  local:  " + $localVer)
if ($remoteVer) {
  Write-Host ("  Pages:  " + $remoteVer)
} else {
  Write-Host "  Pages:  indisponivel"
}
Write-Host ("  URL:    " + $lastUrl)
Write-Host "  Acao: git push origin main; aguarde deploy; repita este script." -ForegroundColor Yellow
exit 1
