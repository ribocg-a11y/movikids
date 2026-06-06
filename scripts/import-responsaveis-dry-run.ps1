# Pacote K.1 — dry-run import RESPONSAVEIS (readonly na prática; sem escrita no GAS)
# Uso: .\scripts\import-responsaveis-dry-run.ps1
# Requer GAS v1.5.57+ publicado. Enquanto producao for v1.5.56, retorna action desconhecida.

param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
)

$ErrorActionPreference = "Stop"

function Invoke-MoviApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 45
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

Write-Host "K.1 dry-run import RESPONSAVEIS" -ForegroundColor Cyan

$ping = Invoke-MoviApi @{ action = "ping" }
if (-not $ping.ok) { throw "ping falhou" }
Write-Host ("GAS: " + $ping.versao) -ForegroundColor Gray

$lr = Invoke-MoviApi @{ action = "listarResponsaveis"; limite = "3" }
if (-not $lr.ok) { throw "listarResponsaveis falhou" }
Write-Host ("listarResponsaveis total (historico): " + $lr.total) -ForegroundColor Gray

$imp = Invoke-MoviApi @{
  action = "importarResponsaveisAdmin"
  adminPin = $AdminPin
  dryRun = "1"
  soNovos = "1"
}

if (-not $imp.ok) {
  if ($imp.erro -match "desconhecida|unknown|invalid") {
    Write-Host "Action ainda nao publicada — deploy GAS v1.5.57 necessario." -ForegroundColor Yellow
    exit 2
  }
  throw $imp.erro
}

$result = [ordered]@{
  gasVersao = $ping.versao
  listarTotal = $lr.total
  dryRun = $imp
  comparacao = @{
    deltaGruposVsListar = [int]$imp.gruposTelefone - [int]$lr.total
    ok = [Math]::Abs([int]$imp.gruposTelefone - [int]$lr.total) -le 10
  }
}

$result | ConvertTo-Json -Depth 5

if (-not $result.comparacao.ok) {
  Write-Host "AVISO: gruposTelefone difere de listarResponsaveis.total em mais de 10." -ForegroundColor Yellow
  exit 1
}

Write-Host "dry-run OK — seguro para import real fora do pico." -ForegroundColor Green
exit 0
