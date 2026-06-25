param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-KpiApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 45
}

$result = [ordered]@{
  suite = "TESTE_KPI_MES_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-KCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-KpiApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-KCheck "ping" "ok" $ping.versao
  if ($ping.versao -notmatch 'v1\.5\.7[1-9]') {
    Add-KCheck "gas.versao" "warn" "publique GAS v1.5.71+ para action kpiMes"
  }

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year

  $legacy = Invoke-KpiApi @{ action = "buscarKPIsAdmin"; adminPin = $AdminPin; mes = $mes; ano = $ano }
  if (-not $legacy.ok) { throw "buscarKPIsAdmin falhou: $($legacy.erro)" }
  Add-KCheck "buscarKPIsAdmin" "ok" ("fatMes=$($legacy.fatMes); nMes=$($legacy.nMes)")

  $kpi = Invoke-KpiApi @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano }
  if (-not $kpi.ok) {
    if ($kpi.erro -match 'action|invalid|Acesso') {
      Add-KCheck "kpiMes" "warn" "GAS sem v1.5.71 - $($kpi.erro)"
      $result.status = "warn"
      $result.summary = "Aguardando Nova versao Web GAS v1.5.71"
    } else {
      throw "kpiMes falhou: $($kpi.erro)"
    }
  } else {
    foreach ($field in @('fatMes', 'nMes', 'porSemana', 'porOperador', 'payback')) {
      if ($null -eq $kpi.$field) { throw "campo ausente em kpiMes: $field" }
      Add-KCheck ("kpi.$field") "ok" "presente"
    }
    if ($kpi.fatMes -ne $legacy.fatMes -or $kpi.nMes -ne $legacy.nMes) {
      throw "paridade: kpiMes fat=$($kpi.fatMes)/$($legacy.fatMes) n=$($kpi.nMes)/$($legacy.nMes)"
    }
    Add-KCheck "paridade.fatMes.nMes" "ok" "alinhado com buscarKPIsAdmin"
    $result.status = "ok"
    $result.summary = "kpiMes ok e paridade com buscarKPIsAdmin"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-KCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 4
if ($result.status -eq "fail") { exit 1 }
