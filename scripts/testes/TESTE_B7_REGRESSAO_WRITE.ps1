# B7 (FASE 5) - regressao write controlada: salvar, iniciar, estender, encerrar, cancelar
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$Operador = "TESTE_B7",
  [string]$AdminPin = "1421",
  [switch]$UseGetFallback
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

$WriteActions = @("salvarLocacao","editarLocacao","cancelarLocacao","encerrarLocacao","estenderLocacao")
$script:GasPostReady = $null

function Test-GasPostReady {
  if ($null -ne $script:GasPostReady) { return $script:GasPostReady }
  try {
    $ping = Invoke-RestMethod -Uri "$BaseUrl`?action=ping" -Method Get -TimeoutSec 15
    $script:GasPostReady = [bool]($ping.postWriteActions)
  } catch { $script:GasPostReady = $false }
  return $script:GasPostReady
}

function Invoke-MoviApi {
  param([hashtable]$Params, [string]$Method = "AUTO")
  $action = [string]$Params.action
  if ($Method -eq "AUTO") {
    if ($UseGetFallback) { $Method = "GET" }
    elseif (($WriteActions -contains $action) -and (Test-GasPostReady)) { $Method = "POST" }
    else { $Method = "GET" }
  }
  if ($Method -eq "POST") {
    $body = $Params | ConvertTo-Json -Compress
    try {
      return Invoke-RestMethod -Uri $BaseUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    } catch {
      $raw = & curl.exe -L -s -X POST -H "Content-Type: application/json" -d $body $BaseUrl
      if (-not $raw) { throw "Resposta vazia POST: $action" }
      return $raw | ConvertFrom-Json
    }
  }
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 30
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia GET: $action" }
    return $raw | ConvertFrom-Json
  }
}

function Assert-Ok {
  param($Response, [string]$Step)
  if (-not $Response.ok) {
    $msg = if ($Response.erro) { $Response.erro } else { $Response | ConvertTo-Json -Compress }
    throw "Falhou: $Step - $msg"
  }
}

$result = [ordered]@{
  suite = "TESTE_B7_REGRESSAO_WRITE"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  operador = $Operador
  checks = @()
}

function Add-B7Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MoviApi @{ action = "ping" }
  Assert-Ok $ping "ping"
  Add-B7Check "ping" "ok" $ping.versao

  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $nomeTeste = "B7_WRITE_$stamp"
  $op = Get-MoviOperadorParams -Operador $Operador
  $clientTs = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())

  $salvar = Invoke-MoviApi (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 02"
    pagamento = "PIX"; responsavel = "TESTE B7"; crianca = $nomeTeste; telefone = "98999999997"
    observacao = "[TESTE] B7 regressao write"
  } + $op)
  Assert-Ok $salvar "salvarLocacao"
  if ($salvar.status -ne "Pendente") { throw "esperado Pendente; obtido $($salvar.status)" }
  Add-B7Check "salvar.pendente" "ok" ("row={0}" -f $salvar.rowIndex)

  $ver0 = Invoke-MoviApi @{ action = "verificarSessao"; rowIndex = $salvar.rowIndex }
  Assert-Ok $ver0 "verificarSessao pendente"
  if ($ver0.status -ne "Pendente" -or $ver0.started) { throw "verificarSessao pendente inconsistente" }
  Add-B7Check "verificar.pendente" "ok" "sem timer"

  $iniciar = Invoke-MoviApi @{
    action = "iniciarTimer"; rowIndex = $salvar.rowIndex; timestamp = $clientTs
  }
  Assert-Ok $iniciar "iniciarTimer"
  $ts1 = [int64]$iniciar.startTimestamp
  if ($ts1 -lt 1e12) { throw "startTimestamp invalido apos iniciar" }
  Add-B7Check "iniciar.timer" "ok" ("ts={0}" -f $ts1)

  $iniciar2 = Invoke-MoviApi @{
    action = "iniciarTimer"; rowIndex = $salvar.rowIndex; timestamp = $clientTs
  }
  Assert-Ok $iniciar2 "iniciarTimer idempotente"
  if ([int64]$iniciar2.startTimestamp -ne $ts1) {
    throw "idempotencia iniciarTimer: ts $($iniciar2.startTimestamp) != $ts1"
  }
  Add-B7Check "iniciar.idempotente" "ok" "mesmo startTimestamp"

  $ver1 = Invoke-MoviApi @{ action = "verificarSessao"; rowIndex = $salvar.rowIndex }
  Assert-Ok $ver1 "verificarSessao ativa"
  if ($ver1.status -ne "Ativa" -or -not $ver1.started) { throw "verificarSessao nao Ativa" }
  Add-B7Check "verificar.ativa" "ok" ("mins={0}" -f $ver1.mins)

  $estender = Invoke-MoviApi (@{
    action = "estenderLocacao"; rowIndex = $salvar.rowIndex; extMins = 10; extValor = 10; extPlano = "10min"
  } + $op)
  Assert-Ok $estender "estenderLocacao"
  $totalMins = [int]$estender.totalMins
  if ($totalMins -lt 20) { throw "totalMins apos estender deveria ser >= 20; obtido $totalMins" }
  Add-B7Check "estender.ativa" "ok" ("totalMins={0}" -f $totalMins)

  $ver2 = Invoke-MoviApi @{ action = "verificarSessao"; rowIndex = $salvar.rowIndex }
  Assert-Ok $ver2 "verificarSessao pos-estender"
  if ([int]$ver2.mins -ne $totalMins) {
    throw "verificarSessao mins=$($ver2.mins) != estender totalMins=$totalMins"
  }
  Add-B7Check "verificar.pos.estender" "ok" ("mins={0}" -f $ver2.mins)

  $encerrar = Invoke-MoviApi (@{
    action = "encerrarLocacao"; rowIndex = $salvar.rowIndex; minUsados = $totalMins
  } + $op)
  Assert-Ok $encerrar "encerrarLocacao"
  Add-B7Check "encerrar.ativa" "ok" "Encerrada"

  $ver3 = Invoke-MoviApi @{ action = "verificarSessao"; rowIndex = $salvar.rowIndex }
  Assert-Ok $ver3 "verificarSessao encerrada"
  if ($ver3.status -ne "Encerrada") { throw "verificarSessao deveria ser Encerrada" }
  Add-B7Check "verificar.encerrada" "ok" $ver3.status

  $ativas = Invoke-MoviApi @{ action = "listarAtivas" }
  Assert-Ok $ativas "listarAtivas pos-encerrar"
  $sobrou = $ativas.locacoes | Where-Object { [int]$_.rowIndex -eq [int]$salvar.rowIndex } | Select-Object -First 1
  if ($sobrou) { throw "locacao encerrada ainda em listarAtivas" }
  Add-B7Check "listarAtivas.sem.encerrada" "ok" "ausente"

  $salvar2 = Invoke-MoviApi (@{
    action = "salvarLocacao"; tipo = "Pelúcia"; plano = "10min"; veiculo = "Pelúcia 01"
    pagamento = "Dinheiro"; responsavel = "TESTE B7"; crianca = ($nomeTeste + "_C"); telefone = "98999999996"
    observacao = "[TESTE] B7 cancelar pendente"
  } + $op)
  Assert-Ok $salvar2 "salvar2 pendente"

  $cancelar = Invoke-MoviApi (@{
    action = "cancelarLocacao"; rowIndex = $salvar2.rowIndex; motivo = "Teste B7 cancelar pendente"
  } + $op)
  Assert-Ok $cancelar "cancelarLocacao"
  if ($cancelar.locacao.status -ne "Cancelada") { throw "cancelar nao retornou Cancelada" }
  Add-B7Check "cancelar.pendente" "ok" $cancelar.locacao.status

  $result.status = "ok"
  $result.summary = "B7 write cycle ok - iniciar/estender/encerrar/cancelar"
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-B7Check "exception" "fail" $_.Exception.Message
}
finally {
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet
  Add-B7Check "limpeza.pos-teste" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result | ConvertTo-Json -Depth 6
  if ($result.status -ne "ok") { exit 1 }
}
