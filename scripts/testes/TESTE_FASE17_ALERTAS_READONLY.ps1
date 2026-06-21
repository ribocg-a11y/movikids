param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416",
  [string]$RepoRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
)

$ErrorActionPreference = "Stop"

function Invoke-CmdApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 60
}

$result = [ordered]@{
  suite = "TESTE_FASE17_ALERTAS_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  status = "ok"
}

function Add-C17Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq "fail") { $script:result.status = "fail" }
  elseif ($Status -eq "warn" -and $script:result.status -eq "ok") { $script:result.status = "warn" }
}

$gsPath = Join-Path $RepoRoot "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
foreach ($pair in @(
  @{ file = $gsPath; needle = "function alertasInteligentes_"; name = "gas.alertasInteligentes" },
  @{ file = $gsPath; needle = "function isGestaoRequest_"; name = "gas.isGestaoRequest" },
  @{ file = $gsPath; needle = "perfil !== 'gestor'"; name = "gas.perfilGestor" },
  @{ file = Join-Path $RepoRoot "mk-auth.js"; needle = "mkAuthIsGestor"; name = "fe.mkAuthIsGestor" },
  @{ file = Join-Path $RepoRoot "mk-nav.js"; needle = "showGestorSidebar"; name = "fe.showGestorSidebar" },
  @{ file = Join-Path $RepoRoot "mk-design.css"; needle = "mk-alert-intel-badge"; name = "fe.intel-css" }
)) {
  if (-not (Test-Path $pair.file)) {
    Add-C17Check $pair.name "fail" ("arquivo ausente: " + $pair.file)
  } elseif (-not (Select-String -Path $pair.file -Pattern $pair.needle -Quiet)) {
    Add-C17Check $pair.name "fail" ("nao encontrado: " + $pair.needle)
  } else {
    Add-C17Check $pair.name "ok" $pair.needle
  }
}

try {
  $ping = Invoke-CmdApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-C17Check "ping" "ok" $ping.versao

  $cmd = Invoke-CmdApi @{ action = "comandoOperacional"; adminPin = $AdminPin }
  if (-not $cmd.ok) {
    if ($cmd.erro -match "desconhecida") {
      Add-C17Check "comandoOperacional" "warn" "publique GAS v1.5.119+ Nova versao Web"
      $result.summary = "FE OK - GAS Web pendente"
    } else {
      throw "comandoOperacional: $($cmd.erro)"
    }
  } else {
    $intel = @($cmd.alertas | Where-Object { $_.inteligente -eq $true })
    Add-C17Check "comandoOperacional" "ok" ("alertas=" + $cmd.alertas.Count)
    Add-C17Check "alertas.inteligentes" $(if ($intel.Count -gt 0) { "ok" } else { "warn" }) ("n=" + $intel.Count)
    $result.summary = "FASE 17 alertas OK"
  }

  $kpi = Invoke-CmdApi @{ action = "kpiMes"; adminPin = $AdminPin; lite = "1" }
  if ($kpi.ok -and $kpi.alertas) {
    $intelK = @($kpi.alertas | Where-Object { $_.inteligente -eq $true })
    Add-C17Check "kpiMes.alertas" "ok" ("total=" + $kpi.alertas.Count + " intel=" + $intelK.Count)
  } elseif ($kpi.erro -match "desconhecida|gestao") {
    Add-C17Check "kpiMes.alertas" "warn" $kpi.erro
  }
} catch {
  Add-C17Check "gas.suite" "fail" $_.Exception.Message
  $result.summary = $_.Exception.Message
}

if (-not $result.summary) {
  if ($result.status -eq "ok") { $result.summary = "FASE 17 FE+repo OK" }
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
