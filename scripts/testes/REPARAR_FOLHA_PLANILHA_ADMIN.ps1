# I57 — repair aba FOLHA: memorial, formulas USER_ENTERED (I25), audit B68/B25
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
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 180
  } catch {
    $raw = & curl.exe -L -s $url --max-time 180
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

$ping = Invoke-MkApi @{ action = "ping" }
if (-not $ping.ok) { throw "ping falhou" }
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan

$params = @{
  action = "repararFolhaPlanilhaAdmin"
  adminPin = $AdminPin
}
if ($DryRun) { $params.dryRun = "1" }

$out = Invoke-MkApi $params
if (-not $out.ok) { throw $out.erro }

if ($out.dryRun) {
  Write-Host "DRY RUN - schemaOk=$($out.schema.ok) problemas=$($out.audit.problemas.Count) precisaRepair=$($out.audit.precisaRepair)" -ForegroundColor Yellow
} else {
  Write-Host "Repair OK - schemaOk=$($out.schemaOk) B68=$($out.formulas.b68) B25=$($out.formulas.b25)" -ForegroundColor Green
  if ($out.folhaPlanejamento.fonte -eq "FOLHA") {
    Write-Host "folhaPlanejamento: custo=$($out.folhaPlanejamento.custoMensal) vaDia=$($out.folhaPlanejamento.vaDia)" -ForegroundColor Cyan
  }
  if ($out.audit.problemas.Count -gt 0) {
    Write-Host "Avisos audit:" -ForegroundColor Yellow
    $out.audit.problemas | Select-Object -First 10 | ForEach-Object {
      Write-Host "  $($_.campo): $($_.valor)"
    }
  }
}

$schema = Invoke-MkApi @{ action = "validarSchema" }
$folSchema = $schema.resultado.FOLHA
$color = if ($folSchema.ok) { "Green" } else { "Yellow" }
Write-Host "validarSchema FOLHA ok=$($folSchema.ok) schemaOk=$($schema.schemaOk) versao=$($schema.versao)" -ForegroundColor $color

$out | ConvertTo-Json -Depth 8
