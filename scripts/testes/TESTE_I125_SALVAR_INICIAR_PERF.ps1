# TESTE_I125_SALVAR_INICIAR_PERF.ps1
# Mede salvarLocacao + iniciarTimer com padrao TESTE_ e limpa depois.
# Nao impacta operacao real (anula via limparLocacoesTesteAdmin).
# Gates (apos Nova versao Web GAS v1.5.202+): salvar < 8000ms, iniciar < 5000ms.
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$SalvarMaxMs = 8000,
  [int]$IniciarMaxMs = 5000,
  [switch]$SkipWrite
)

$ErrorActionPreference = "Stop"
$fail = 0
function Ok($m) { Write-Host "OK  $m" -ForegroundColor Green }
function Bad($m) { Write-Host "FAIL $m" -ForegroundColor Red; $script:fail++ }

function Invoke-Mk([hashtable]$Params, [int]$TimeoutSec = 60) {
  $u = $BaseUrl + "?" + (($Params.GetEnumerator() | ForEach-Object {
    [uri]::EscapeDataString($_.Key) + "=" + [uri]::EscapeDataString([string]$_.Value)
  }) -join "&")
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $j = Invoke-RestMethod -Uri $u -Method Get -TimeoutSec $TimeoutSec
  $sw.Stop()
  return @{ json = $j; ms = [int]$sw.ElapsedMilliseconds }
}

Write-Host "=== TESTE I125 salvar/iniciar perf ===" -ForegroundColor Cyan
$ping = Invoke-Mk @{ action = "ping" }
Ok ("ping $($ping.json.versao) em $($ping.ms)ms")
$gasOk = [string]$ping.json.versao -match 'v1\.5\.(20[2-9]|2[1-9][0-9])'
if (-not $gasOk) {
  Write-Host "AVISO: Web ainda $($ping.json.versao) — gates de tempo so valem apos Nova versao v1.5.202+" -ForegroundColor Yellow
}

if ($SkipWrite) {
  Write-Host "SkipWrite: so ping/estatico."
  if ($fail -gt 0) { exit 1 } else { exit 0 }
}

$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$la = Invoke-Mk @{ action = "listarAtivas"; _t = $stamp }
$ocup = @{}
@($la.json.locacoes) | ForEach-Object { if ($_.veiculo) { $ocup[[string]$_.veiculo] = $true } }
$veiculo = @("Carro 05","Carro 04","Carro 03","Triciclo 02","Pelúcia 05") | Where-Object { -not $ocup.ContainsKey($_) } | Select-Object -First 1
if (-not $veiculo) { $veiculo = "Carro 05" }

$salv = Invoke-Mk @{
  action = "salvarLocacao"
  operador = "TESTE_CODEX_I125"
  tipo = "Carro"
  plano = "10min"
  veiculo = $veiculo
  pagamento = "PIX"
  observacao = "[TESTE] I125 perf $stamp"
  responsavel = "TESTE_CODEX"
  crianca = "TESTE_I125_$stamp"
  telefone = "98999999998"
  valorPlano = "12"
  mins = "10"
  adicionalPorMin = "1"
} 90

if (-not $salv.json.ok) { Bad ("salvar: $($salv.json.erro)"); exit 1 }
Ok ("salvarLocacao $($salv.ms)ms id=$($salv.json.id) row=$($salv.json.rowIndex)")
if ($gasOk -and $salv.ms -gt $SalvarMaxMs) { Bad "salvar $($salv.ms)ms > $SalvarMaxMs" }
elseif ($gasOk) { Ok "salvar dentro do gate ${SalvarMaxMs}ms" }

$clickTs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$ini = Invoke-Mk @{
  action = "iniciarTimer"
  operador = "TESTE_CODEX_I125"
  rowIndex = [string]$salv.json.rowIndex
  timestamp = [string]$clickTs
} 60

if (-not $ini.json.ok) { Bad ("iniciarTimer: $($ini.json.erro)") }
else {
  Ok ("iniciarTimer $($ini.ms)ms ts=$($ini.json.startTimestamp)")
  if ($gasOk -and $ini.ms -gt $IniciarMaxMs) { Bad "iniciar $($ini.ms)ms > $IniciarMaxMs" }
  elseif ($gasOk) { Ok "iniciar dentro do gate ${IniciarMaxMs}ms" }
}

$limp = Invoke-Mk @{
  action = "limparLocacoesTesteAdmin"
  adminPin = $AdminPin
  motivo = "Limpeza automatica apos TESTE_I125_SALVAR_INICIAR_PERF"
  soHoje = "1"
} 90
Ok ("limpeza total=$($limp.json.total) msg=$($limp.json.mensagem)")

$la2 = Invoke-Mk @{ action = "listarAtivas"; _t = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) }
$fantasma = @($la2.json.locacoes) | Where-Object { [string]$_.crianca -like "TESTE_I125_*" }
if ($fantasma.Count -gt 0) { Bad "TESTE ainda Ativa/Pendente apos limpeza" } else { Ok "sem TESTE aberto" }

if ($fail -gt 0) { Write-Host "RESULT FAIL ($fail)" -ForegroundColor Red; exit 1 }
Write-Host "RESULT PASS" -ForegroundColor Green
exit 0
