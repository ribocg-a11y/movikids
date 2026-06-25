# I63 - repair camada 5 RH resto: ESCALA, FALTAS, HOLERITES, METAS, COMUNICADOS, AVALIACOES
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [string]$LimparFaltasSync = "nao",
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
  action = "repararRhCamada5RestoPlanilhaAdmin"
  adminPin = $AdminPin
  limparFaltasSync = $LimparFaltasSync
}
if ($DryRun) { $params.dryRun = "1" }

$out = Invoke-MkApi $params
if (-not $out.ok) { throw $out.erro }

if ($out.dryRun) {
  Write-Host "DRY RUN camada 5 RH resto (I63)" -ForegroundColor Yellow
} else {
  Write-Host "Repair OK camada 5 resto - schemaOk=$($out.schemaOk)" -ForegroundColor Green
  if ($out.faltasSyncRemovidas) {
    Write-Host "faltasSyncRemovidas=$($out.faltasSyncRemovidas)" -ForegroundColor Cyan
  }
}

$schema = Invoke-MkApi @{ action = "validarSchema" }
foreach ($a in @("ESCALA_COLABORADORES", "FALTAS_AUSENCIAS", "HOLERITES", "METAS_COLABORADORES", "COMUNICADOS_RH", "AVALIACOES_RH")) {
  $s = $schema.resultado.$a
  if ($s) {
    $color = if ($s.ok) { "Green" } else { "Yellow" }
    Write-Host "validarSchema $a ok=$($s.ok) registros=$($s.registros)" -ForegroundColor $color
  }
}
Write-Host "validarSchema global schemaOk=$($schema.schemaOk) versao=$($schema.versao)" -ForegroundColor Cyan

$out | ConvertTo-Json -Depth 10
