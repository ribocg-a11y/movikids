param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$Operador = "TESTE_CODEX",
  [string]$AdminPin = "1421",
  [switch]$UseGetFallback
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

function Invoke-MoviApi {
  param([hashtable]$Params, [string]$Method = "GET")
  if ($Method -eq "POST") {
    $body = $Params | ConvertTo-Json -Compress
    try {
      return Invoke-RestMethod -Uri $BaseUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 25
    } catch {
      $raw = & curl.exe -L -s -X POST -H "Content-Type: application/json" -d $body $BaseUrl
      if (-not $raw) { throw "Resposta vazia POST: $($Params.action)" }
      return $raw | ConvertFrom-Json
    }
  }
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 25
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia GET: $($Params.action)" }
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

$script:GasPostReady = $null

function Test-GasPostReady {
  if ($null -ne $script:GasPostReady) { return $script:GasPostReady }
  try {
    $ping = Invoke-RestMethod -Uri "$BaseUrl`?action=ping" -Method Get -TimeoutSec 15
    $script:GasPostReady = [bool]($ping.postWriteActions)
  } catch { $script:GasPostReady = $false }
  return $script:GasPostReady
}

function Write-Method([string]$Action) {
  if ($UseGetFallback) { return "GET" }
  $writes = @("salvarLocacao","editarLocacao","cancelarLocacao","encerrarLocacao","estenderLocacao")
  if (($writes -contains $Action) -and (Test-GasPostReady)) { return "POST" }
  return "GET"
}

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  baseUrl = $BaseUrl
  operador = $Operador
  useGetFallback = [bool]$UseGetFallback
  checks = @()
}

function Add-Check {
  param([string]$Name, [string]$Status, [string]$Detail = "")
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MoviApi @{ action = "ping" }
  Assert-Ok $ping "ping"
  Add-Check "ping" "ok" $ping.versao

  if (Test-GasPostReady) {
    $semOp = Invoke-MoviApi @{ action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 01"; responsavel = "X"; crianca = "Y" } "POST"
    if ($semOp.ok) { throw "salvarLocacao sem operador deveria falhar" }
    Add-Check "bloqueio sem operador" "ok" $semOp.erro
  } else {
    Add-Check "bloqueio sem operador" "skipped" "GAS ainda sem v1.5.44 Web - publique Nova versao"
  }

  $stamp = Get-Date -Format "HHmmss"
  $nomeTeste = "DRAWER_E_$stamp"
  $op = Get-MoviOperadorParams -Operador $Operador
  $adminOp = Get-MoviAdminSupervisorParams -AdminPin $AdminPin

  # Pendente — drawer: Editar/Cancelar ok; Encerrar/Estender desabilitados (UI)
  $salvar = Invoke-MoviApi (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 01"
    pagamento = "PIX"; responsavel = "TESTE"; crianca = $nomeTeste; telefone = "98999999999"
    observacao = "[TESTE] Pacote E drawer encerrar"
  } + $op) (Write-Method "salvarLocacao")
  Assert-Ok $salvar "salvarLocacao pendente"
  Add-Check "salvar pendente POST" "ok" ("id={0}; row={1}" -f $salvar.id, $salvar.rowIndex)

  $editar = Invoke-MoviApi (@{
    action = "editarLocacao"; rowIndex = $salvar.rowIndex; responsavel = "TESTE_EDIT"; motivo = "Teste drawer editar"
  } + $op) (Write-Method "editarLocacao")
  Assert-Ok $editar "editarLocacao pendente"
  Add-Check "editar pendente operador" "ok" $editar.locacao.responsavel

  $iniciar = Invoke-MoviApi @{
    action = "iniciarTimer"; rowIndex = $salvar.rowIndex; timestamp = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  } "GET"
  Assert-Ok $iniciar "iniciarTimer"
  Add-Check "iniciar timer" "ok" "Ativa"

  $estender = Invoke-MoviApi (@{
    action = "estenderLocacao"; rowIndex = $salvar.rowIndex; extMins = 10; extValor = 12; extPlano = "10min"
  } + $op) (Write-Method "estenderLocacao")
  Assert-Ok $estender "estenderLocacao"
  Add-Check "estender ativa" "ok" ("totalMins={0}" -f $estender.totalMins)

  $ativasPre = Invoke-MoviApi @{ action = "listarAtivas" }
  Assert-Ok $ativasPre "listarAtivas pre-encerrar"
  $aindaAtiva = ($ativasPre.locacoes | Where-Object { $_.rowIndex -eq $salvar.rowIndex -and $_.status -eq "Ativa" } | Select-Object -First 1)
  if (-not $aindaAtiva) {
    Add-Check "encerrar ativa" "skipped" ("row {0} nao esta Ativa (encerrada por outro dispositivo?)" -f $salvar.rowIndex)
  } else {
    $encerrar = Invoke-MoviApi (@{
      action = "encerrarLocacao"; rowIndex = $salvar.rowIndex; minUsados = $estender.totalMins
    } + $op) (Write-Method "encerrarLocacao")
    Assert-Ok $encerrar "encerrarLocacao"
    Add-Check "encerrar ativa" "ok" "Encerrada"
  }

  # Segundo pendente para cancelar
  $salvar2 = Invoke-MoviApi (@{
    action = "salvarLocacao"; tipo = "Triciclo"; plano = "10min"; veiculo = "Triciclo 01"
    pagamento = "Dinheiro"; responsavel = "TESTE"; crianca = ($nomeTeste + "_C"); telefone = "98999999998"
    observacao = "[TESTE] Pacote E drawer cancelar"
  } + $op) (Write-Method "salvarLocacao")
  Assert-Ok $salvar2 "salvar2 pendente"

  $cancelar = Invoke-MoviApi (@{
    action = "cancelarLocacao"; rowIndex = $salvar2.rowIndex; motivo = "Teste drawer cancelar Pacote E"
  } + $op) (Write-Method "cancelarLocacao")
  Assert-Ok $cancelar "cancelarLocacao"
  if ($cancelar.locacao.status -ne "Cancelada") { throw "Cancelamento nao retornou Cancelada" }
  Add-Check "cancelar pendente operador" "ok" $cancelar.locacao.status

  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "ok"
} catch {
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "failed"
  $result.error = $_.Exception.Message
} finally {
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -SoHoje -Quiet
  Add-Check "limpeza pos-teste" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail
  $result | ConvertTo-Json -Depth 6
  if ($result.status -eq "ok") { exit 0 } else { exit 1 }
}
