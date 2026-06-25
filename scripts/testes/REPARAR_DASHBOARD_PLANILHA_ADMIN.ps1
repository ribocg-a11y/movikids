# I56 — repair aba DASHBOARD: memorial, sync KPI C5-C11, audit formulas (sem tocar formulas)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 120
  } catch {
    $raw = & curl.exe -L -s $url --max-time 120
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

$ping = Invoke-MkApi @{ action = "ping" }
if (-not $ping.ok) { throw "ping falhou" }
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan

$params = @{
  action = "repararDashboardPlanilhaAdmin"
  adminPin = $AdminPin
}
if ($DryRun) { $params.dryRun = "1" }

$out = Invoke-MkApi $params
if (-not $out.ok) { throw $out.erro }

if ($out.dryRun) {
  Write-Host "DRY RUN - schemaOk=$($out.schema.ok) errosFormula=$($out.audit.problemas.Count)" -ForegroundColor Yellow
} else {
  Write-Host "Repair OK - schemaOk=$($out.schemaOk) memorial=$($out.memorial.layout)" -ForegroundColor Green
  if ($out.audit.problemas.Count -gt 0) {
    Write-Host "Avisos audit:" -ForegroundColor Yellow
    $out.audit.problemas | Select-Object -First 10 | ForEach-Object {
      Write-Host "  linha $($_.row) col $($_.col) $($_.campo): $($_.valor)"
    }
  }
  if ($out.kpiSync.kpis) {
    Write-Host "KPI sync C5-C11:" -ForegroundColor Cyan
    $out.kpiSync.kpis.PSObject.Properties | ForEach-Object {
      Write-Host "  $($_.Name) = $($_.Value)"
    }
  }
}

$schema = Invoke-MkApi @{ action = "validarSchema" }
$dashSchema = $schema.resultado.DASHBOARD
$color = if ($dashSchema.ok) { "Green" } else { "Yellow" }
Write-Host "validarSchema DASHBOARD ok=$($dashSchema.ok) schemaOk=$($schema.schemaOk) versao=$($schema.versao)" -ForegroundColor $color

$out | ConvertTo-Json -Depth 8
