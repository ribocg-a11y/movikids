param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [string]$RepoRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
)

$ErrorActionPreference = "Stop"

function Invoke-CmdApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 45
}

$result = [ordered]@{
  suite = "TESTE_FASE16_COMANDO_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  status = "ok"
}

function Add-C16Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq "fail") { $script:result.status = "fail" }
  elseif ($Status -eq "warn" -and $script:result.status -eq "ok") { $script:result.status = "warn" }
}

# --- FE estatico (16.1 + 16.6) ---
$indexPath = Join-Path $RepoRoot "index.html"
$mkAdminPath = Join-Path $RepoRoot "mk-admin.js"
$mkDesignPath = Join-Path $RepoRoot "mk-design.css"
$mkVersionPath = Join-Path $RepoRoot "mk-version.js"

foreach ($pair in @(
  @{ file = $indexPath; needle = "mk-command-center"; name = "fe.command-center" },
  @{ file = $indexPath; needle = "mk-admin-mob-cmd"; name = "fe.admin-mob-cmd" },
  @{ file = $indexPath; needle = "mk-admin-mob-loc"; name = "fe.admin-mob-kpis" },
  @{ file = $mkAdminPath; needle = "carregarAdminMobCmd_"; name = "fe.admin-mob-loader" },
  @{ file = $mkDesignPath; needle = "mk-admin-mob-cmd"; name = "fe.admin-mob-css" },
  @{ file = $mkDesignPath; needle = "--mk-widget-val-size"; name = "fe.widget-tokens" },
  @{ file = $indexPath; needle = "mk-caixa-command"; name = "fe.caixa-widgets" },
  @{ file = $indexPath; needle = "mk-hist-widgets"; name = "fe.hist-widgets" },
  @{ file = $mkAdminPath; needle = "calcPrevisaoMes7d_"; name = "fe.previsao-7d" },
  @{ file = $indexPath; needle = "mk-previsao-mes"; name = "fe.previsao-widget" },
  @{ file = (Join-Path $RepoRoot "gestao-pessoas.html"); needle = "gp-colab-hub-oneui"; name = "fe.gp-hub-oneui" },
  @{ file = (Join-Path $RepoRoot "mk-gestao-pessoas-ui.js"); needle = "gpHubHeroStatus_"; name = "fe.gp-hub-hero" },
  @{ file = (Join-Path $RepoRoot "mk-holerite.js"); needle = "mkHolWidgetHero_"; name = "fe.hol-widget-hero" }
)) {
  if (-not (Test-Path $pair.file)) {
    Add-C16Check $pair.name "fail" ("arquivo ausente: " + $pair.file)
  } elseif (-not (Select-String -Path $pair.file -Pattern $pair.needle -Quiet)) {
    Add-C16Check $pair.name "fail" ("nao encontrado: " + $pair.needle)
  } else {
    Add-C16Check $pair.name "ok" $pair.needle
  }
}

if (Test-Path $mkVersionPath) {
  $verLine = (Get-Content $mkVersionPath -Raw)
  if ($verLine -match "MK_VERSION\s*=\s*'([^']+)'") {
    Add-C16Check "fe.version" "ok" $Matches[1]
  } else {
    Add-C16Check "fe.version" "fail" "MK_VERSION nao encontrado"
  }
}

# --- GAS readonly ---
try {
  $ping = Invoke-CmdApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-C16Check "ping" "ok" $ping.versao

  $cmd = Invoke-CmdApi @{ action = "comandoOperacional"; adminPin = $AdminPin }
  if ($cmd.erro -and $cmd.erro -match "desconhecida") {
    Add-C16Check "comandoOperacional" "warn" "action ausente - publique GAS v1.5.118+ Nova versao Web"
    $result.summary = "FE OK - GAS Web pendente para comando completo"
  } elseif (-not $cmd.ok) {
    throw "comandoOperacional falhou: $($cmd.erro)"
  } else {
    foreach ($field in @("data", "locacoes", "fatHoje", "equipe", "frota", "widgets", "comparativo30d")) {
      if ($null -eq $cmd.$field) { throw "campo ausente: $field" }
    }
    if ($null -eq $cmd.frota.detalhe) { throw "frota.detalhe ausente" }
    Add-C16Check "comandoOperacional" "ok" ("abertas=" + $cmd.locacoes.abertas + " fatHoje=" + $cmd.fatHoje)
    Add-C16Check "frota.detalhe" "ok" ("n=" + $cmd.frota.detalhe.Count)
    Add-C16Check "comparativo30d" "ok" ("media=" + $cmd.comparativo30d.media)
    $result.summary = "FASE 16 FE + GAS comando OK"
  }
} catch {
  Add-C16Check "gas.suite" "fail" $_.Exception.Message
  $result.summary = $_.Exception.Message
}

if (-not $result.summary) {
  if ($result.status -eq "ok") { $result.summary = "FASE 16 FE OK" }
  elseif ($result.status -eq "warn") { $result.summary = "FASE 16 parcial - ver warns" }
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
