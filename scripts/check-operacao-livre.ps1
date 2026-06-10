# MOVI KIDS - Gate operacional (I22)
# Verifica se ha locacoes Ativa/Pendente em producao antes de push FE critico.
#
# Uso:
#   .\scripts\check-operacao-livre.ps1
#   .\scripts\check-operacao-livre.ps1 -Force   # hotfix P0 com aprovacao explicita
#
# Saida: exit 0 = operacao livre; exit 1 = locacoes abertas (nao publicar feature)

param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

function Invoke-MoviGet {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 20
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

Write-Host "MOVI KIDS check-operacao-livre (I22)" -ForegroundColor Cyan

$ping = Invoke-MoviGet @{ action = "ping" }
if (-not $ping.ok) { throw "ping falhou: $($ping.erro)" }
Write-Host ("GAS ping OK versao={0}" -f $ping.versao)

$ativas = Invoke-MoviGet @{ action = "listarAtivas" }
if (-not $ativas.ok) { throw "listarAtivas falhou: $($ativas.erro)" }

$abertas = @($ativas.locacoes | Where-Object {
  $st = [string]$_.status
  $st -eq "Ativa" -or $st -eq "Pendente"
})

$detalhe = @($abertas | ForEach-Object {
  "{0} row={1} {2}" -f $_.status, $_.rowIndex, $_.nomeCrianca
})

Write-Host ("Locacoes abertas (Ativa/Pendente): {0}" -f $abertas.Count)

if ($abertas.Count -eq 0) {
  Write-Host "Operacao LIVRE - pode publicar FE critico (Regra 14)." -ForegroundColor Green
  exit 0
}

Write-Host ""
Write-Host "BLOQUEADO - operacao com locacoes ativas:" -ForegroundColor Red
$detalhe | ForEach-Object { Write-Host ("  - {0}" -f $_) }

if ($Force) {
  Write-Host ""
  Write-Host "Force ativo - prosseguindo por hotfix P0 aprovado." -ForegroundColor Yellow
  exit 0
}

Write-Host ""
Write-Host "Regra 14: nao publicar feature/mudanca em index.html com locacoes abertas." -ForegroundColor Red
Write-Host "Hotfix P0: repetir com -Force somente apos aprovacao explicita do responsavel." -ForegroundColor Yellow
exit 1
