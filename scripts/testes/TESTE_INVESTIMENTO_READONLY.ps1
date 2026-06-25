# I58 — INVESTIMENTO readonly: audit + validarSchema + payback kpiMes
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 120
}

$result = [ordered]@{ startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); checks = @() }

function Add-InvCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-InvCheck "ping" "ok" $ping.versao

  $dry = Invoke-MkApi @{
    action = "repararInvestimentoPlanilhaAdmin"
    adminPin = $AdminPin
    dryRun = "1"
  }
  if (-not $dry.ok) { throw "dryRun repair falhou: $($dry.erro)" }
  $nProb = @($dry.audit.problemas).Count
  if ($nProb -eq 0) { Add-InvCheck "investimento.audit" "ok" ("total=" + $dry.audit.investimentoTotal) }
  else { Add-InvCheck "investimento.audit" "warn" ("problemas=" + $nProb) }

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  $inv = $schema.resultado.INVESTIMENTO
  if ($inv.ok) { Add-InvCheck "validarSchema.INVESTIMENTO" "ok" ("total=" + $inv.investimentoTotal) }
  else { Add-InvCheck "validarSchema.INVESTIMENTO" "warn" ("faltando=" + @($inv.faltando).Count) }

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year
  $kpi = Invoke-MkApi @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano; lite = "1" }
  if (-not $kpi.ok) { throw "kpiMes falhou: $($kpi.erro)" }
  $pb = $kpi.payback
  if ($null -eq $pb -or -not $pb.ok) { throw "payback ausente ou invalido" }
  if ($pb.investimentoTotal -le 0) { throw "investimentoTotal=0" }
  Add-InvCheck "payback" "ok" ("I=" + $pb.investimentoTotal + " pct=" + $pb.pctRecuperado)

  $result.status = "ok"
  $result.summary = "INVESTIMENTO readonly OK - I=R$ $($pb.investimentoTotal) pct=$($pb.pctRecuperado)%"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-InvCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
if ($result.status -ne "ok") { exit 1 }
