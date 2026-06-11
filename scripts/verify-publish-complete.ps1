# Gate pos-publicacao FE — fecha buraco I3 (commit sem push / Pages desatualizada)
# Ordem obrigatoria apos git push:
#   .\scripts\pre-push-check.ps1
#   git push origin main
#   .\scripts\verify-publish-complete.ps1
#
# Uso:
#   .\scripts\verify-publish-complete.ps1
#   .\scripts\verify-publish-complete.ps1 -SkipPagesWait   # so git, sem rede Pages

param(
  [switch]$SkipPagesWait,
  [string]$Branch = "main",
  [string]$Remote = "origin"
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

function Read-LocalMkVersion {
  $path = Join-Path $root "mk-version.js"
  $m = Select-String -Path $path -Pattern "MK_VERSION\s*=\s*'([^']+)'" | Select-Object -First 1
  if (-not $m) { return $null }
  return $m.Matches.Groups[1].Value
}

Write-Host "MOVI KIDS verify-publish-complete (pos-push)" -ForegroundColor Cyan

try {
  $mkVer = Read-LocalMkVersion
  if (-not $mkVer) { throw "mk-version.js sem MK_VERSION" }
  Add-Check "versao.local" "ok" $mkVer

  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  git -C $root fetch $Remote $Branch 2>&1 | Out-Null
  $fetchOk = ($LASTEXITCODE -eq 0)
  $ErrorActionPreference = $prevEap
  if ($fetchOk) {
    Add-Check "git.fetch" "ok" ($Remote + "/" + $Branch)
  } else {
    Add-Check "git.fetch" "fail" ("fetch falhou " + $Remote + "/" + $Branch)
  }

  $localHead = (git -C $root rev-parse HEAD 2>$null).Trim()
  $remoteRef = "${Remote}/${Branch}"
  $remoteHead = (git -C $root rev-parse $remoteRef 2>$null).Trim()

  if (-not $localHead -or -not $remoteHead) {
    Add-Check "git.not-ahead-of-origin" "fail" "nao foi possivel comparar HEAD vs $remoteRef"
  } elseif ($localHead -ne $remoteHead) {
    $ahead = @(git -C $root rev-list --count "${remoteRef}..HEAD" 2>$null)
    $behind = @(git -C $root rev-list --count "HEAD..${remoteRef}" 2>$null)
    if ($ahead -gt 0) {
      Add-Check "git.not-ahead-of-origin" "fail" ("ahead $ahead commit(s) - push pendente (I24)")
    } elseif ($behind -gt 0) {
      Add-Check "git.not-ahead-of-origin" "fail" ("behind $behind - git pull antes de publicar")
    } else {
      Add-Check "git.not-ahead-of-origin" "fail" "HEAD diverge de $remoteRef"
    }
  } else {
    Add-Check "git.not-ahead-of-origin" "ok" ("HEAD = " + $localHead.Substring(0, [Math]::Min(8, $localHead.Length)))
  }

  if ($SkipPagesWait) {
    Add-Check "pages.version-live" "skip" "SkipPagesWait"
  } else {
    $pagesScript = Join-Path $root "scripts\verify-pages-live.ps1"
    if (-not (Test-Path $pagesScript)) {
      Add-Check "pages.version-live" "fail" "verify-pages-live.ps1 ausente"
    } else {
      & $pagesScript -ExpectedVersion $mkVer 2>&1 | Out-Host
      if ($LASTEXITCODE -ne 0) {
        Add-Check "pages.version-live" "fail" ("Pages != " + $mkVer + " (I24)")
      } else {
        Add-Check "pages.version-live" "ok" ("Pages confirma " + $mkVer)
      }
    }
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
  Write-Host "verify-publish-complete FALHOU - entrega FE incompleta (Regra 8)." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "verify-publish-complete OK - Pages confirma versao $mkVer." -ForegroundColor Green
exit 0
