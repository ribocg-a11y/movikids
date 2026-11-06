# I203c — após Nova versão Web >= v1.5.239: alinha valorPlano da loc 5356 (Carro 12→15)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)
$ErrorActionPreference = "Stop"
function Invoke-MkApi([hashtable]$Params) {
  $q = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$q&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -TimeoutSec 120
}
$ping = Invoke-MkApi @{ action = "ping" }
Write-Host "GAS $($ping.versao)"
$verNum = [version](($ping.versao -replace '[^0-9.]',''))
if ($verNum -lt [version]"1.5.239") {
  throw "Web ainda $($ping.versao) — publique Nova versão v1.5.239 antes (valorPlano no corrigirFinanceiro)"
}
$r = Invoke-MkApi @{
  action = "corrigirFinanceiroLocacaoAdmin"
  adminPin = $AdminPin
  rowIndex = "5237"
  valorPlano = "15"
  valorTotal = "15"
  minAdicionais = "0"
  valorAdicional = "0"
  motivo = "I203c valorPlano Carro 5356 12->15 (cobrado no real com tabela nova)"
}
if (-not $r.ok) { throw ($r.erro | Out-String) }
Write-Host "OK id=$($r.locacao.id) plano=$($r.locacao.valorPlano) total=$($r.locacao.valorTotal)" -ForegroundColor Green
