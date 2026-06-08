param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
)

$ErrorActionPreference = "Stop"

function Invoke-ResumoApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 30
}

$hoje = Get-Date
$dataFmt = "{0}/{1}/{2}" -f $hoje.Day.ToString("00"), $hoje.Month.ToString("00"), $hoje.Year

$result = [ordered]@{
  suite = "TESTE_RESUMO_DIA_READONLY"
  data = $dataFmt
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-RCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-ResumoApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-RCheck "ping" "ok" $ping.versao
  if ($ping.versao -notmatch 'v1\.5\.7[0-9]') {
    Add-RCheck "gas.versao" "warn" "publique GAS v1.5.70+ (Nova versao Web) para resumoDia"
  }

  $kpi = Invoke-ResumoApi @{ action = "buscarKPIsAdmin"; adminPin = $AdminPin }
  if (-not $kpi.ok) { throw "buscarKPIsAdmin falhou: $($kpi.erro)" }
  Add-RCheck "kpi.ok" "ok" ("nHoje=$($kpi.nHoje); fatHoje=$($kpi.fatHoje)")

  $resumo = Invoke-ResumoApi @{ action = "resumoDia"; data = $dataFmt; adminPin = $AdminPin }
  if (-not $resumo.ok) {
    if ($resumo.erro -match 'action|invalid') {
      Add-RCheck "resumoDia" "warn" "GAS ainda sem v1.5.70 - $($resumo.erro)"
      $result.status = "warn"
      $result.summary = "Aguardando Nova versao Web GAS v1.5.70"
    } else {
      throw "resumoDia falhou: $($resumo.erro)"
    }
  } else {
    if ($null -eq $resumo.n -or $null -eq $resumo.fat) { throw "campos n/fat ausentes" }
    if ($resumo.n -ne $kpi.nHoje) {
      Add-RCheck "paridade.n" "fail" "resumo=$($resumo.n) kpi=$($kpi.nHoje)"
      throw "n diverge: resumoDia=$($resumo.n) KPI=$($kpi.nHoje)"
    }
    Add-RCheck "paridade.n" "ok" $resumo.n
    $fatDiff = [math]::Abs([double]$resumo.fat - [double]$kpi.fatHoje)
    if ($fatDiff -gt 0.01) {
      throw "fat diverge: resumoDia=$($resumo.fat) KPI=$($kpi.fatHoje)"
    }
    Add-RCheck "paridade.fat" "ok" $resumo.fat
    if ($null -eq $resumo.locacoes -or $null -eq $resumo.custos) { throw "locacoes/custos ausentes" }
    Add-RCheck "resumo.estrutura" "ok" ("loc=$($resumo.locacoes.Count); cus=$($resumo.custos.Count)")
    $result.status = "ok"
    $result.summary = "resumoDia alinhado com buscarKPIsAdmin"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-RCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
