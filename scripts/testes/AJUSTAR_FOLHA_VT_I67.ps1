# I67 - Ajusta B9/B10/B12 na FOLHA via GAS Web App (requer GAS v1.5.167+ publicado)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params, [int]$TimeoutSec = 120)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -TimeoutSec $TimeoutSec
}

$ping = Invoke-MkApi @{ action = "ping" }
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan
if ($ping.versao -lt "v1.5.166") {
  Write-Warning "Publique Nova versao Web GAS v1.5.167+ (Implantar > Editar > Nova versao) antes de ajustar VT."
}

$out = Invoke-MkApi @{ action = "ajustarFolhaVtAdmin"; adminPin = $AdminPin }
if (-not $out.ok) { throw ($out.erro -or "ajustarFolhaVtAdmin falhou") }

Write-Host $out.mensagem -ForegroundColor Green
Write-Host ("vtPassesMes=" + $out.vtPassesMes + " tarifa=" + $out.folhaPlanejamento.vtTarifa + " diasVt=" + $out.folhaPlanejamento.diasVt) -ForegroundColor Cyan
Write-Host ("B25=" + $out.formulas.b25 + " B68=" + $out.formulas.b68) -ForegroundColor Cyan

& (Join-Path $PSScriptRoot "TESTE_INVESTIGACAO_VT_COLABORADORES.ps1") -AdminPin $AdminPin
