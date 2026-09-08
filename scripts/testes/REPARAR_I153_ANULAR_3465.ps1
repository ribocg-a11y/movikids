# I153 — Anula Encerrada duplicata #3465 (Arthur Carro 01 12:31-12:31)
# Requer GAS Web >= v1.5.218 (anularLocacaoEncerradaAdmin).
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [string]$Id = "3465",
  [string]$Motivo = "Duplicata Arthur Carro01 12:31-12:31 I153"
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
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

$ping = Invoke-MkApi @{ action = "ping" }
if (-not $ping.ok) { throw "ping falhou" }
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan
$verNum = [regex]::Match([string]$ping.versao, '1\.5\.(\d+)').Groups[1].Value
if (-not $verNum -or [int]$verNum -lt 218) {
  throw "Precisa Nova versao Web GAS >= v1.5.218 (ping=$($ping.versao)). Cole o .gs canônico e Editar implantacao."
}

$out = Invoke-MkApi @{
  action = "anularLocacaoEncerradaAdmin"
  adminPin = $AdminPin
  id = $Id
  motivo = $Motivo
}
if (-not $out.ok) { throw ("anular falhou: " + $out.erro) }
Write-Host "OK id=$($out.id) rowIndex=$($out.rowIndex) jaAnulada=$($out.jaAnulada) — $($out.mensagem)" -ForegroundColor Green

$ini = Invoke-MkApi @{ action = "carregarInicio"; force = "1" }
$stats = $ini.statsHoje
Write-Host ("statsHoje n={0} nSessoes={1}" -f $stats.n, $stats.nSessoes) -ForegroundColor Cyan
$ainda = @($ini.encHoje | Where-Object { [string]$_.id -eq $Id })
if ($ainda.Count -gt 0) {
  throw "id $Id ainda aparece em encHoje — anular nao refletiu"
}
Write-Host "id $Id fora de encHoje — I153 dados OK" -ForegroundColor Green
$out | ConvertTo-Json -Depth 6
