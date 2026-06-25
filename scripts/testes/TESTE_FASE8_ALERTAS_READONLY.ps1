param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-F8Api {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 60
}

$result = [ordered]@{
  suite = "TESTE_FASE8_ALERTAS_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-F8Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-F8Api @{ action = "ping" }
  Add-F8Check "ping" "ok" $ping.versao

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year

  $kpi = Invoke-F8Api @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano; lite = "1" }
  if (-not $kpi.ok) { throw "kpiMes: $($kpi.erro)" }

  if ($null -eq $kpi.alertas) {
    if ($ping.versao -notmatch 'v1\.5\.79') {
      Add-F8Check "alertas" "warn" "publique GAS v1.5.79"
      $result.status = "warn"
      $result.summary = "Aguardando Nova versao Web v1.5.79"
    } else { throw "kpiMes.alertas ausente" }
  } else {
    if ($kpi.alertas -isnot [Array]) { throw "alertas nao e array" }
    Add-F8Check "alertas" "ok" ("n=" + $kpi.alertas.Count)
    if ($kpi.alertas.Count -gt 0) {
      $a0 = $kpi.alertas[0]
      foreach ($f in @('nivel', 'codigo', 'titulo', 'mensagem', 'acionavel')) {
        if (-not $a0.PSObject.Properties.Name.Contains($f)) { throw "alertas[0].$f ausente" }
      }
      Add-F8Check "alertas.schema" "ok" $a0.codigo
    }
  }

  if ($null -eq $kpi.sinalEmpresa) {
    if ($ping.versao -match 'v1\.5\.79') { throw "sinalEmpresa ausente" }
    Add-F8Check "sinalEmpresa" "warn" "GAS antigo"
  } else {
    foreach ($f in @('nivel', 'label', 'motivo')) {
      if ($null -eq $kpi.sinalEmpresa.$f) { throw "sinalEmpresa.$f ausente" }
    }
    Add-F8Check "sinalEmpresa" "ok" ($kpi.sinalEmpresa.nivel + " / " + $kpi.sinalEmpresa.label)
  }

  if ($result.status -ne "warn") {
    $result.status = "ok"
    $result.summary = "FASE 8 alertas OK"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-F8Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5
if ($result.status -eq "fail") { exit 1 }
