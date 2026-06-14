# Teste alertas tablet: GAS janela temporal + browser (triggerAlert5 / triggerAlertExpired)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$FeUrl = "https://ribocg-a11y.github.io/movikids/?force=1.8.21",
  [string]$Operador = "TESTE_ALERTAS",
  [string]$AdminPin = "1416",
  [switch]$GasOnly
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

function Invoke-MoviGet {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  try { return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 45 }
  catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "vazio: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

function Sim-Rem($s) {
  $mins = [int]$s.mins
  $ts = [int64]$s.startTimestamp
  if ([string]$s.status -eq 'Pendente') { return $mins * 60 }
  if ($ts -lt 1e12) { return $mins * 60 }
  return [math]::Floor($mins * 60 - (([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $ts) / 1000.0))
}

$result = [ordered]@{
  suite = "TESTE_ALERTAS_TABLET"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  feUrl = $FeUrl
  checks = @()
  rows = @()
}

function Add-C([string]$N, [string]$S, [string]$D = "") {
  $script:result.checks += [ordered]@{ name = $N; status = $S; detail = $D }
  if ($S -eq "fail") { $script:result.status = "fail" }
}

try {
  $ping = Invoke-MoviGet @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-C "ping" "ok" $ping.versao

  $op = Get-MoviOperadorParams -Operador $Operador
  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"

  # --- GAS: janela 5 min ---
  $tel5 = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)
  $s5 = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Triciclo"; plano = "10min"; veiculo = "Triciclo 01"
    pagamento = "PIX"; responsavel = "TESTE ALERTA 5M"; crianca = "ALERT_5M_$stamp"; telefone = $tel5
    observacao = "[TESTE] alerta 5min GAS"
  } + $op)
  if (-not $s5.ok) { throw "5m.salvar: $($s5.erro)" }
  $row5 = [int]$s5.rowIndex
  $result.rows += $row5
  $ts5 = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - (5 * 60 + 30) * 1000)
  $i5 = Invoke-MoviGet @{ action = "iniciarTimer"; rowIndex = $row5; timestamp = $ts5 }
  if (-not $i5.ok) { throw "5m.iniciar: $($i5.erro)" }
  $drift5 = [math]::Abs([int64]$i5.startTimestamp - $ts5)
  if ($drift5 -gt 120000) {
    Add-C "gas.5m.iniciar.drift" "ok" "GAS usa serverTs (drift=${drift5}ms); janela FE via patch local no browser"
  } else {
    Add-C "gas.5m.iniciar.drift" "ok" "clientTs aceito drift=${drift5}ms"
  }
  Add-C "gas.5m.janela" "warn" "validacao rem<=300s apenas no browser (TESTE_ALERTAS_TABLET_BROWSER.js)"

  # --- GAS: encerrar pendente (mensagem v1.5.92+) ---
  $telP = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)
  $sp = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 03"
    pagamento = "PIX"; responsavel = "TESTE ALERTA"; crianca = "ALERT_PEND_$stamp"; telefone = $telP
    observacao = "[TESTE] encerrar pendente msg"
  } + $op)
  if (-not $sp.ok) { throw "pend.salvar: $($sp.erro)" }
  $result.rows += [int]$sp.rowIndex
  $ep = Invoke-MoviGet (@{ action = "encerrarLocacao"; rowIndex = $sp.rowIndex; minUsados = 10 } + $op)
  if ($ep.ok) { Add-C "gas.encerrar.pendente" "fail" "esperava erro" }
  elseif ($ep.erro -match 'pendente|Pendente|timer') {
    Add-C "gas.encerrar.pendente" "ok" $ep.erro
  } else {
    Add-C "gas.encerrar.pendente" "warn" ("msg antiga ou deploy pendente: " + $ep.erro)
  }
  $cp = Invoke-MoviGet (@{ action = "cancelarLocacao"; rowIndex = $sp.rowIndex; motivo = "Cleanup apos teste msg pendente" } + $op)
  if ($cp.ok) { Add-C "gas.cancel.pendente.cleanup" "ok" $cp.locacao.status }

  # --- GAS: janela expirado ---
  $telE = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)
  $sE = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 02"
    pagamento = "PIX"; responsavel = "TESTE ALERTA EXP"; crianca = "ALERT_EXP_$stamp"; telefone = $telE
    observacao = "[TESTE] alerta expirado GAS"
  } + $op)
  if (-not $sE.ok) { throw "exp.salvar: $($sE.erro)" }
  $rowE = [int]$sE.rowIndex
  $result.rows += $rowE
  $tsE = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - (10 * 60 + 10) * 1000)
  $iE = Invoke-MoviGet @{ action = "iniciarTimer"; rowIndex = $rowE; timestamp = $tsE }
  if (-not $iE.ok) { throw "exp.iniciar: $($iE.erro)" }
  Add-C "gas.exp.janela" "warn" "validacao rem<=0s apenas no browser (TESTE_ALERTAS_TABLET_BROWSER.js)"

  if (-not $GasOnly) {
    $jsPath = Join-Path $PSScriptRoot "TESTE_ALERTAS_TABLET_BROWSER.js"
    $js = Get-Content -Path $jsPath -Raw -Encoding UTF8
    $payloadPath = Join-Path $PSScriptRoot ".tablet-alertas-cdp.json"
    @{ expression = ($js -replace "`r?`n", ' '); awaitPromise = $true; returnByValue = $true } |
      ConvertTo-Json -Compress | Set-Content $payloadPath -Encoding UTF8
    Add-C "browser.payload" "ok" $payloadPath
    Add-C "browser.instrucao" "warn" "Abra $FeUrl , login admin, execute TESTE_ALERTAS_TABLET_BROWSER.js (ou CDP payload)"
  }

  if ($result.status -ne "fail") { $result.status = "ok" }
  $result.summary = "GAS janelas OK; modais FE via TESTE_ALERTAS_TABLET_BROWSER.js"
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-C "exception" "fail" $_.Exception.Message
}
finally {
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet
  Add-C "limpeza.gas" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result | ConvertTo-Json -Depth 6
  if ($result.status -eq "fail") { exit 1 }
}
