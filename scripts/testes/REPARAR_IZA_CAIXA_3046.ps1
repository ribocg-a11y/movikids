# I148 — Converte locacao Cancelada (Iza row 3046) → Encerrada para caixa bater
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$RowIndex = 3046,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 120
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

$ping = Invoke-MkApi @{ action = "ping" }
if (-not $ping.ok) { throw "ping falhou" }
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan
if ($ping.versao -lt "v1.5.213") {
  Write-Host "AVISO: publique GAS v1.5.213+ (Nova versao Web) antes de executar" -ForegroundColor Yellow
}

$before = Invoke-MkApi @{ action = "verificarSessao"; rowIndex = $RowIndex }
Write-Host "Antes: row=$RowIndex status=$($before.status) crianca=$($before.crianca) valorPlano=$($before.valorPlano)"

$resumoAntes = Invoke-MkApi @{ action = "resumoDia"; data = "29/08/2026"; adminPin = $AdminPin; force = "1" }
Write-Host "Caixa antes: fat=$($resumoAntes.fat) n=$($resumoAntes.n) porPag=$($resumoAntes.porPagamento | ConvertTo-Json -Compress)"

if ($DryRun) {
  Write-Host "DRY RUN — nenhuma escrita" -ForegroundColor Yellow
  exit 0
}

$motivo = "Encerramento correto Iza 29/08 bug GAS I148 extras nao cobrados"
$fix = Invoke-MkApi @{
  action = "corrigirCanceladaParaEncerradaAdmin"
  adminPin = $AdminPin
  authRole = "admin"
  rowIndex = $RowIndex
  motivo = $motivo
  horaFim = "18:22"
  cancelarExtras = "true"
  justificativaExtras = "Nao cobrar minutos extras operacional 29/08"
  valorTotal = "22"
  minAdicionais = "0"
  valorAdicional = "0"
}

if (-not $fix.ok) { throw "corrigirCanceladaParaEncerradaAdmin falhou: $($fix.erro)" }
Write-Host "Corrigido: status=$($fix.locacao.status) valorTotal=$($fix.locacao.valorTotal)" -ForegroundColor Green

$resumoDepois = Invoke-MkApi @{ action = "resumoDia"; data = "29/08/2026"; adminPin = $AdminPin; force = "1" }
Write-Host "Caixa depois: fat=$($resumoDepois.fat) n=$($resumoDepois.n) porPag=$($resumoDepois.porPagamento | ConvertTo-Json -Compress)"
$fix | ConvertTo-Json -Depth 6
