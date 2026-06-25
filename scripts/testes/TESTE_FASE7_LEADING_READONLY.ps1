param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-F7Api {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 60
}

$result = [ordered]@{
  suite = "TESTE_FASE7_LEADING_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-F7Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-F7Api @{ action = "ping" }
  Add-F7Check "ping" "ok" $ping.versao

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year
  $hoje = Get-Date -Format "dd/MM/yyyy"

  $kpi = Invoke-F7Api @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano }
  if (-not $kpi.ok) { throw "kpiMes: $($kpi.erro)" }

  $lf = $kpi.leadingFinanceiro
  if ($null -eq $lf) {
    if ($ping.versao -notmatch 'v1\.5\.7[6-9]') {
      Add-F7Check "leadingFinanceiro" "warn" "publique GAS v1.5.76+"
      $result.status = "warn"
      $result.summary = "Aguardando Nova versao Web v1.5.76"
    } else { throw "leadingFinanceiro ausente" }
  } else {
    foreach ($f in @('ticketMedio', 'receitaPorHoraOperada', 'custoPorLocacao', 'breakEvenLocacoesDia', 'sensibilidade')) {
      if ($null -eq $lf.$f) { throw "leadingFinanceiro.$f ausente" }
      Add-F7Check "leading.$f" "ok" "presente"
    }
    Add-F7Check "leading.ticket" "ok" ("ticket=" + $lf.ticketMedio)
  }

  $rd = Invoke-F7Api @{ action = "resumoDia"; adminPin = $AdminPin; data = $hoje }
  if (-not $rd.ok) { throw "resumoDia: $($rd.erro)" }
  if ($null -eq $rd.leadingDia) {
    if ($ping.versao -match 'v1\.5\.7[6-9]') { throw "resumoDia.leadingDia ausente" }
    Add-F7Check "resumoDia.leadingDia" "warn" "GAS antigo"
  } else {
    Add-F7Check "resumoDia.leadingDia" "ok" ("be=" + $rd.leadingDia.breakEvenLocacoesDia)
  }

  if ($result.status -ne "warn") {
    $result.status = "ok"
    $result.summary = "FASE 7 leading OK"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-F7Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5
if ($result.status -eq "fail") { exit 1 }
