# I159s — apos Nova Web v1.5.229: Milena/gestor → unidade all (login La Ville)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)
$ErrorActionPreference = "Stop"
$t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$ping = Invoke-RestMethod -Uri "$BaseUrl`?action=ping&_t=$t" -TimeoutSec 45
Write-Host "ping $($ping.versao)"
if ($ping.versao -notmatch '1\.5\.22[9]|1\.5\.2[3-9]') {
  Write-Warning "Precisa Web >= v1.5.229 (agora $($ping.versao)). Faca Nova versao e rode de novo."
  exit 2
}
$q = "action=seedEquipeHoldingAdmin&adminPin=$AdminPin&operador=Administrador&authRole=admin&_t=$t"
$seed = Invoke-RestMethod -Uri "$BaseUrl`?$q" -TimeoutSec 60
$seed | ConvertTo-Json -Depth 6
$lv = Invoke-RestMethod -Uri "$BaseUrl`?action=listarOperadoresLogin&unidadeId=laville&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -TimeoutSec 45
Write-Host ("ops laville n={0}" -f @($lv.operadores).Count)
@($lv.operadores) | ForEach-Object { Write-Host (" - {0} ({1})" -f $_.nome, $_.unidadeId) }
if (-not $seed.ok) { exit 1 }
