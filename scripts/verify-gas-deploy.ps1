# Gate GAS: implantacao canonica DEVE bater com versao no .gs (evita editor @92 / producao @91).
# Uso:
#   .\scripts\verify-gas-deploy.ps1
#   .\scripts\verify-gas-deploy.ps1 -ExpectedVersion v1.5.92
#   .\scripts\verify-gas-deploy.ps1 -StrictLivePing   # falha se ping HTTP indisponivel
param(
  [string]$CanonicalGs = "",
  [string]$DeployId = "AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y",
  [string]$ExpectedVersion = "",
  [switch]$StrictLivePing
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not $CanonicalGs) {
  $CanonicalGs = Join-Path $root "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
}

$result = [ordered]@{
  suite = "verify-gas-deploy"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  status = "ok"
  checks = @()
}

function Add-C([string]$N, [string]$S, [string]$D = "") {
  $script:result.checks += [ordered]@{ name = $N; status = $S; detail = $D }
  if ($S -eq "fail") { $script:result.status = "fail" }
  elseif ($S -eq "warn" -and $script:result.status -eq "ok") { $script:result.status = "warn" }
}

function Parse-PingJson([string]$Body) {
  if (-not $Body) { return $null }
  if ($Body -match 'accounts\.google\.com/v3/signin') { return $null }
  $m = [regex]::Match($Body, '\{"ok"\s*:\s*true[^}]*"versao"\s*:\s*"([^"]+)"')
  if (-not $m.Success) {
    $m = [regex]::Match($Body, '\{"ok"\s*:\s*true[\s\S]{0,800}?\}')
  }
  if (-not $m.Success) { return $null }
  try { return $m.Value | ConvertFrom-Json } catch { return $null }
}

function Test-AnonymousGasAccess {
  param([string]$DeployId)
  $url = "https://script.google.com/macros/s/$DeployId/exec?action=ping"
  $head = & curl.exe -sI --max-time 20 $url 2>&1 | Out-String
  if ($head -match 'Location:\s*(https://accounts\.google\.com/ServiceLogin[^\r\n]*)') {
    return [ordered]@{ ok = $false; detail = "ServiceLogin redirect - Web App nao e Anyone anonimo" }
  }
  if ($head -match 'Location:\s*(https://script\.googleusercontent\.com[^\r\n]*)') {
    return [ordered]@{ ok = $true; detail = "redirect googleusercontent (anonimo OK)" }
  }
  $body = & curl.exe -sL --max-time 25 $url 2>&1 | Out-String
  if ($body -match '"ok"\s*:\s*true') {
    return [ordered]@{ ok = $true; detail = "JSON anonimo OK" }
  }
  if ($body -match 'accounts\.google\.com') {
    return [ordered]@{ ok = $false; detail = "HTML login Google - app GitHub Pages quebrado" }
  }
  return [ordered]@{ ok = $false; detail = "resposta anonima inconclusiva" }
}

function Get-LivePing {
  param([string]$Url)
  $raw = $null
  try {
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 45 -MaximumRedirection 8
    $raw = [string]$resp.Content
  } catch {
    $raw = & curl.exe -L -s --max-time 45 $Url
  }
  return Parse-PingJson $raw
}

try {
  if (-not (Test-Path $CanonicalGs)) { throw "Canonico ausente: $CanonicalGs" }
  $m = Select-String -Path $CanonicalGs -Pattern "versao:\s*'(v[^']+)'" | Select-Object -First 1
  if (-not $m) { throw "ping_ versao nao encontrada em $CanonicalGs" }
  $repoVer = $m.Matches.Groups[1].Value
  Add-C "repo.ping_versao" "ok" $repoVer

  if ($ExpectedVersion -and $ExpectedVersion -ne $repoVer) {
    Add-C "expected.vs.repo" "fail" "ExpectedVersion=$ExpectedVersion repo=$repoVer"
  }

  $depOut = clasp deployments 2>&1 | Out-String
  if ($depOut -match "$([regex]::Escape($DeployId))\s+@(\d+)\s+-\s+([^\r\n]+)") {
    $depLine = $Matches[0].Trim()
    $depDesc = $Matches[2].Trim()
    Add-C "clasp.deployment" "ok" $depLine
    if ($depDesc -match [regex]::Escape($repoVer)) {
      Add-C "clasp.desc.vs.repo" "ok" ("desc contem " + $repoVer)
    } else {
      Add-C "clasp.desc.vs.repo" "warn" ("desc='" + $depDesc + "' esperado " + $repoVer + " - confira no Editor")
    }
  } else {
    Add-C "clasp.deployment" "warn" "clasp nao autenticado ou implantacao nao listada - cd repo && clasp login"
  }

  $anon = Test-AnonymousGasAccess -DeployId $DeployId
  if ($anon.ok) {
    Add-C "live.anonymous" "ok" $anon.detail
  } else {
    Add-C "live.anonymous" "fail" ($anon.detail + " - Editor: Editar AKfycbwakQ... Quem tem acesso = Qualquer pessoa")
    Add-C "live.vs.repo" "fail" "acesso anonimo quebrado - fetch() no tablet/Pages falha (I27)"
  }

  $url = "https://script.google.com/macros/s/$DeployId/exec?action=ping&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  $ping = Get-LivePing -Url $url
  if ($ping -and $ping.ok) {
    $liveVer = [string]$ping.versao
    Add-C "live.ping" "ok" $liveVer
    if ($liveVer -ne $repoVer) {
      Add-C "live.vs.repo" "fail" ("PRODUCAO=" + $liveVer + " REPO=" + $repoVer + " - rode deploy-gas.ps1")
    } else {
      Add-C "live.vs.repo" "ok" "alinhado $liveVer"
    }
  } elseif ($StrictLivePing) {
    Add-C "live.ping" "fail" "ping HTTP indisponivel (login Google?) - abra URL no browser"
    Add-C "live.vs.repo" "fail" "StrictLivePing exige ping HTTP"
  } else {
    Add-C "live.ping" "warn" "ping HTTP bloqueado neste ambiente - confirme no browser"
    $pingUrl = "https://script.google.com/macros/s/$DeployId/exec?action=ping"
    Add-C "live.vs.repo" "skip" ("abra no browser logado: " + $pingUrl)
  }
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-C "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5
if ($result.status -eq "fail") { exit 1 }
exit 0
