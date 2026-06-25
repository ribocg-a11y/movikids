# Admin — salvar/atualizar uma batida FOLHA_PONTO (salvarPontoRhAdmin)
param(
  [Parameter(Mandatory = $true)][int]$OperadorId,
  [Parameter(Mandatory = $true)][string]$Data,
  [Parameter(Mandatory = $true)][string]$Entrada,
  [Parameter(Mandatory = $true)][string]$Saida,
  [string]$Situacao = "OK",
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
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
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan

$out = Invoke-MkApi @{
  action = "salvarPontoRhAdmin"
  adminPin = $AdminPin
  operadorId = $OperadorId
  data = $Data
  entrada = $Entrada
  saida = $Saida
  situacao = $Situacao
}
if (-not $out.ok) { throw $out.erro }
$out | ConvertTo-Json -Depth 6
