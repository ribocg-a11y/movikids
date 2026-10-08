# Isolamento multi-loja — matriz dual (Regra 20 / PROTOCOLO §1.5.1)
# Readonly: golden vs laville nas actions críticas. Falha se totais idênticos quando só Golden tem movimento.
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-IsoApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $raw = (Invoke-WebRequest -Uri "$BaseUrl`?$query" -UseBasicParsing -TimeoutSec 120).Content
  return ($raw | ConvertFrom-Json)
}

$result = [ordered]@{
  suite = "TESTE_ISOLAMENTO_MULTIUNIDADE_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  status = "ok"
}

function Add-Iso([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq "fail") { $script:result.status = "fail" }
}

try {
  $ping = Invoke-IsoApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-Iso "ping" "ok" $ping.versao

  $hoje = Get-Date -Format "dd/MM/yyyy"
  $adm = @{ adminPin = $AdminPin; authRole = "admin"; bustCache = "1"; force = "1" }

  $iniG = Invoke-IsoApi (@{ action = "carregarInicio"; unidadeId = "golden" } + $adm)
  $iniL = Invoke-IsoApi (@{ action = "carregarInicio"; unidadeId = "laville" } + $adm)
  $dG = if ($iniG.data) { $iniG.data } else { $iniG }
  $dL = if ($iniL.data) { $iniL.data } else { $iniL }
  $nG = [int]($dG.statsHoje.nSessoes)
  $nL = [int]($dL.statsHoje.nSessoes)
  if ($dG.unidadeId -ne "golden" -or $dL.unidadeId -ne "laville") {
    Add-Iso "inicio.unidadeId" "fail" ("G=$($dG.unidadeId) L=$($dL.unidadeId)")
  } else {
    Add-Iso "inicio.unidadeId" "ok" "tags corretas"
  }
  $idsG = @()
  $idsL = @()
  foreach ($e in @($dG.encHoje) + @($dG.ativos)) { if ($e.id) { $idsG += [string]$e.id } }
  foreach ($e in @($dL.encHoje) + @($dL.ativos)) { if ($e.id) { $idsL += [string]$e.id } }
  $shared = @($idsG | Where-Object { $idsL -contains $_ })
  if ($shared.Count -gt 0) {
    Add-Iso "inicio.isolamento" "fail" ("ids em comum: " + ($shared -join ","))
  } elseif ($nG -gt 0 -and $nG -eq $nL -and $idsG.Count -eq 0 -and $idsL.Count -eq 0) {
    Add-Iso "inicio.isolamento" "fail" "nSessoes G=L=$nG sem ids para conferir"
  } else {
    Add-Iso "inicio.isolamento" "ok" ("G=$nG L=$nL ids distintos")
  }

  $hG = Invoke-IsoApi (@{ action = "listarHistorico"; unidadeId = "golden"; startDate = $hoje; endDate = $hoje } + $adm)
  $hL = Invoke-IsoApi (@{ action = "listarHistorico"; unidadeId = "laville"; startDate = $hoje; endDate = $hoje } + $adm)
  $hdG = if ($hG.data) { $hG.data } else { $hG }
  $hdL = if ($hL.data) { $hL.data } else { $hL }
  if ($hdG.unidadeId -ne "golden" -or $hdL.unidadeId -ne "laville") {
    Add-Iso "hist.unidadeId" "fail" ("G=$($hdG.unidadeId) L=$($hdL.unidadeId) — I172")
  } else {
    Add-Iso "hist.unidadeId" "ok" "I172 tags"
  }
  $snG = [int]($hdG.stats.n)
  $snL = [int]($hdL.stats.n)
  if ($snG -gt 0 -and $snG -eq $snL -and [double]$hdG.stats.totalFat -eq [double]$hdL.stats.totalFat) {
    Add-Iso "hist.isolamento" "fail" "stats identicos G=L (I172 regressao)"
  } else {
    Add-Iso "hist.isolamento" "ok" ("statsN G=$snG L=$snL")
  }

  $cG = Invoke-IsoApi (@{ action = "comandoOperacional"; unidadeId = "golden" } + $adm)
  $cL = Invoke-IsoApi (@{ action = "comandoOperacional"; unidadeId = "laville" } + $adm)
  if ($cG.unidadeId -ne "golden" -or $cL.unidadeId -ne "laville") {
    Add-Iso "comando.unidadeId" "fail" ("G=$($cG.unidadeId) L=$($cL.unidadeId)")
  } else {
    Add-Iso "comando.unidadeId" "ok" "tags"
  }
  $cnG = [int]$cG.nHoje
  $cnL = [int]$cL.nHoje
  if ($cnG -gt 0 -and $cnG -eq $cnL) {
    Add-Iso "comando.isolamento" "fail" "nHoje G=L=$cnG (I173 — builder global)"
  } else {
    Add-Iso "comando.isolamento" "ok" ("nHoje G=$cnG L=$cnL")
  }

  $kG = Invoke-IsoApi (@{ action = "kpiMes"; unidadeId = "golden"; lite = "1" } + $adm)
  $kL = Invoke-IsoApi (@{ action = "kpiMes"; unidadeId = "laville"; lite = "1" } + $adm)
  $kdG = if ($kG.data) { $kG.data } else { $kG }
  $kdL = if ($kL.data) { $kL.data } else { $kL }
  $knG = [int]$kdG.nHoje
  $knL = [int]$kdL.nHoje
  if ($kdG.unidadeId -and $kdG.unidadeId -ne "golden") {
    Add-Iso "kpi.unidadeId" "fail" "golden tag=$($kdG.unidadeId)"
  } elseif ($kdL.unidadeId -and $kdL.unidadeId -ne "laville") {
    Add-Iso "kpi.unidadeId" "fail" "laville tag=$($kdL.unidadeId)"
  } else {
    Add-Iso "kpi.unidadeId" "ok" ("G=$($kdG.unidadeId) L=$($kdL.unidadeId)")
  }
  if ($knG -gt 0 -and $knG -eq $knL) {
    Add-Iso "kpi.isolamento" "fail" "nHoje G=L=$knG (I178)"
  } else {
    Add-Iso "kpi.isolamento" "ok" ("nHoje G=$knG L=$knL")
  }

  $gas = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
  if (-not (Test-Path $gas)) { $gas = Join-Path ((Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path) "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs" }
  $raw = Get-Content $gas -Raw -Encoding UTF8
  if ($raw -notmatch 'buildPainelComandoOperacional_\(uid' -and $raw -notmatch 'function buildPainelComandoOperacional_\(uidFilterOpt\)') {
    Add-Iso "guard.i173.builder" "fail" "builder sem uid"
  } else {
    Add-Iso "guard.i173.builder" "ok" "I173 builder recebe uid"
  }
  if ($raw -notmatch 'findContaMestreParaNovaLoc_\([^\)]*unidadeIdOpt' -and $raw -notmatch 'function findContaMestreParaNovaLoc_\(telefone, dataFmt, agora, unidadeIdOpt\)') {
    Add-Iso "guard.i174.conta" "fail" "conta mestre sem unidadeIdOpt"
  } else {
    Add-Iso "guard.i174.conta" "ok" "I174 conta por loja"
  }
} catch {
  Add-Iso "exception" "fail" $_.Exception.Message
  $result.status = "fail"
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -ne "ok") { exit 1 }
exit 0
