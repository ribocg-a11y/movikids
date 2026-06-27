# I24 — FE bump sem GitHub Pages = banner "Nova versão" nunca aparece
# Uso:
#   .\scripts\guard-i24-publicacao.ps1              # modo Sessao (encerramento agente)
#   .\scripts\guard-i24-publicacao.ps1 -Mode PrePush
#   .\scripts\guard-i24-publicacao.ps1 -Mode PosPush
#
# Exit 0 = OK · Exit 1 = publicação incompleta (bloquear encerramento / alertar)

param(
  [ValidateSet('Sessao', 'PrePush', 'PosPush')]
  [string]$Mode = 'Sessao',
  [switch]$SkipNetwork
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$VERSION_FILES = @(
  'mk-version.js',
  'sw.js',
  'index.html',
  'gestao-pessoas.html'
)

$result = [ordered]@{
  guard = "guard-i24-publicacao"
  mode = $Mode
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  status = "ok"
}

function Add-I24Check {
  param([string]$Name, [string]$Status, [string]$Detail = "")
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq "fail") { $script:result.status = "fail" }
}

function Get-VerParts {
  param([string]$V)
  return @([int]([regex]::Match($V, '^(\d+)').Groups[1].Value),
    [int]([regex]::Match($V, '^\d+\.(\d+)').Groups[1].Value),
    [int]([regex]::Match($V, '^\d+\.\d+\.(\d+)').Groups[1].Value))
}

function Test-VerNewer {
  param([string]$A, [string]$B)
  $pa = Get-VerParts $A
  $pb = Get-VerParts $B
  for ($i = 0; $i -lt 3; $i++) {
    if ($pa[$i] -gt $pb[$i]) { return $true }
    if ($pa[$i] -lt $pb[$i]) { return $false }
  }
  return $false
}

function Read-LocalMkVersion {
  $path = Join-Path $root "mk-version.js"
  if (-not (Test-Path $path)) { return $null }
  $m = Select-String -Path $path -Pattern "MK_VERSION\s*=\s*'([^']+)'" | Select-Object -First 1
  if (-not $m) { return $null }
  return $m.Matches.Groups[1].Value
}

function Read-PagesMkVersion {
  param([string]$PagesBase = "https://ribocg-a11y.github.io/movikids")
  $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $url = ($PagesBase.TrimEnd("/") + "/mk-version.js?t=" + $ts)
  $req = [System.Net.HttpWebRequest]::Create($url)
  $req.Method = "GET"
  $req.Timeout = 20000
  $req.UserAgent = "MOVIKIDS-guard-i24/1"
  $req.Headers.Add("Cache-Control", "no-cache")
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

function Get-DirtyVersionFiles {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $porcelain = git -C $root status --porcelain -- @VERSION_FILES 2>$null
  $ErrorActionPreference = $prev
  if (-not $porcelain) { return @() }
  return @($porcelain -split "`n" | Where-Object { $_.Trim().Length -gt 0 })
}

function Get-GitAheadCount {
  try {
    git -C $root fetch origin main 2>&1 | Out-Null
    $ahead = git -C $root rev-list --count origin/main..HEAD 2>$null
    if ($ahead -match '^\d+$') { return [int]$ahead }
  } catch { }
  return 0
}

function Test-AheadTouchesVersion {
  param([int]$Ahead)
  if ($Ahead -le 0) { return $false }
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $names = git -C $root diff --name-only origin/main..HEAD -- @VERSION_FILES 2>$null
  $ErrorActionPreference = $prev
  return ($names -and ($names.Trim().Length -gt 0))
}

$localVer = Read-LocalMkVersion
if (-not $localVer) {
  Add-I24Check "local.version" "fail" "mk-version.js ausente ou sem MK_VERSION"
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result | ConvertTo-Json -Depth 4
  exit 1
}
Add-I24Check "local.version" "ok" $localVer

$dirty = Get-DirtyVersionFiles
if ($dirty.Count -gt 0) {
  Add-I24Check "git.version-files-dirty" "fail" ("nao commitado: " + ($dirty.Count) + " arquivo(s) I3")
} else {
  Add-I24Check "git.version-files-dirty" "ok" "limpo"
}

$ahead = Get-GitAheadCount
if ($ahead -gt 0) {
  Add-I24Check "git.ahead-of-origin" "fail" ("push pendente: $ahead commit(s) (I24)")
} else {
  Add-I24Check "git.ahead-of-origin" "ok" "HEAD = origin/main"
}

$aheadTouchesVersion = Test-AheadTouchesVersion -Ahead $ahead
if ($ahead -gt 0 -and $aheadTouchesVersion) {
  Add-I24Check "git.ahead-touches-i3" "fail" "commits locais alteram mk-version/sw/index/gestao-pessoas"
} elseif ($ahead -gt 0) {
  Add-I24Check "git.ahead-touches-i3" "warn" "ahead sem arquivos I3 no diff"
} else {
  Add-I24Check "git.ahead-touches-i3" "ok" "n/a"
}

$pagesVer = $null
if (-not $SkipNetwork) {
  try {
    $pagesVer = Read-PagesMkVersion
    if ($pagesVer) {
      Add-I24Check "pages.version" "ok" $pagesVer
    } else {
      Add-I24Check "pages.version" "warn" "nao foi possivel ler mk-version.js na Pages"
    }
  } catch {
    Add-I24Check "pages.version" "warn" $_.Exception.Message
  }
} else {
  Add-I24Check "pages.version" "skip" "SkipNetwork"
}

if ($pagesVer -and $pagesVer -ne $localVer) {
  $detail = "Pages=$pagesVer local=$localVer"
  if (Test-VerNewer $localVer $pagesVer) {
    Add-I24Check "pages.vs-local" "fail" ($detail + " - banner Nova versao impossivel ate git push + verify-publish-complete")
  } else {
    Add-I24Check "pages.vs-local" "warn" ($detail + " - local mais antigo que Pages")
  }
} elseif ($pagesVer) {
  Add-I24Check "pages.vs-local" "ok" ("Pages confirma " + $localVer)
}

# Modo PosPush: exige alinhamento exato
if ($Mode -eq 'PosPush' -and $pagesVer -and $pagesVer -ne $localVer) {
  Add-I24Check "pospush.alinhado" "fail" "apos push, Pages ainda != local - aguarde deploy ou rode verify-publish-complete"
} elseif ($Mode -eq 'PosPush') {
  Add-I24Check "pospush.alinhado" "ok" "publicado"
}

# Modo PrePush: bloqueia bump I3 sujo na working tree
if ($Mode -eq 'PrePush' -and $dirty.Count -gt 0) {
  $result.summary = "I24: commit arquivos I3 antes do pre-push-check"
}

# Modo Sessao: regra dura — local > Pages OU push pendente com I3
if ($Mode -eq 'Sessao') {
  if ($dirty.Count -gt 0) {
    $result.summary = "I24 BLOQUEIO: bump FE nao commitado - commit + push + verify-publish-complete"
  } elseif ($ahead -gt 0 -and ($aheadTouchesVersion -or (Test-VerNewer $localVer $pagesVer))) {
    $result.summary = "I24 BLOQUEIO: git push pendente - banner Nova versao nao aparece no tablet"
  } elseif ($pagesVer -and (Test-VerNewer $localVer $pagesVer)) {
    $result.summary = "I24 BLOQUEIO: repo local ($localVer) > GitHub Pages ($pagesVer) - publicar FE"
  } elseif ($result.status -eq "ok") {
    $result.summary = "I24 OK - FE alinhado com Pages ou publicacao completa"
  }
}

if (-not $result.summary) {
  if ($result.status -eq "fail") {
    $result.summary = "I24: corrigir checks fail antes de encerrar sessao"
  } else {
    $result.summary = "I24 parcial - ver warns"
  }
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5

if ($result.status -eq "fail") {
  Write-Host ""
  Write-Host $result.summary -ForegroundColor Red
  Write-Host "Fluxo: pre-push-check -> git commit -> git push -> verify-publish-complete.ps1" -ForegroundColor Yellow
  exit 1
}
exit 0
