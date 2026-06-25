# I56 — DASHBOARD: validarSchema + audit formulas + KPI memoria (kpiMes)
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
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 60
}

$result = [ordered]@{ startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); checks = @() }

function Add-DashCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-DashCheck "ping" "ok" $ping.versao

  $dry = Invoke-MkApi @{
    action = "repararDashboardPlanilhaAdmin"
    adminPin = $AdminPin
    dryRun = "1"
  }
  if (-not $dry.ok) { throw "dryRun repair falhou: $($dry.erro)" }
  $nProb = @($dry.audit.problemas).Count
  if ($nProb -eq 0) { Add-DashCheck "dashboard.audit" "ok" "sem erros formula" }
  else { Add-DashCheck "dashboard.audit" "warn" ("problemas=" + $nProb) }

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  $dash = $schema.resultado.DASHBOARD
  if ($dash.ok) { Add-DashCheck "validarSchema.DASHBOARD" "ok" "memorial+formulas ok" }
  else { Add-DashCheck "validarSchema.DASHBOARD" "warn" ("erros=" + @($dash.faltando).Count) }

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year
  $legacy = Invoke-MkApi @{ action = "buscarKPIsAdmin"; adminPin = $AdminPin; mes = $mes; ano = $ano }
  if (-not $legacy.ok) { throw "buscarKPIsAdmin falhou: $($legacy.erro)" }
  Add-DashCheck "buscarKPIsAdmin" "ok" ("fatMes=$($legacy.fatMes) nMes=$($legacy.nMes)")

  $kpi = Invoke-MkApi @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano }
  if (-not $kpi.ok) { throw "kpiMes falhou: $($kpi.erro)" }
  Add-DashCheck "kpiMes" "ok" ("fatMes=$($kpi.fatMes) nMes=$($kpi.nMes)")

  if ($kpi.fatMes -ne $legacy.fatMes -or $kpi.nMes -ne $legacy.nMes) {
    throw "paridade KPI: kpiMes vs buscarKPIsAdmin"
  }
  Add-DashCheck "paridade.kpi" "ok" "memoria alinhada"

  $result.status = "ok"
  $result.summary = "DASHBOARD readonly OK - audit $nProb problema(s) KPI fat=$($kpi.fatMes)"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-DashCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
if ($result.status -ne "ok") { exit 1 }
