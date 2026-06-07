# 4 testes reais — fluxos dos dois botoes no fim do cadastro (I20)
# T1: So salvar (Pendente parado) | T2: Salvar+iniciar | T3: Espera sem iniciar | T4: Portal paridade
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$Operador = "TESTE_CODEX"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

function Invoke-MoviGet {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 30
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

function Assert-Ok($r, [string]$step) {
  if (-not $r.ok) {
    $msg = if ($r.erro) { $r.erro } else { $r | ConvertTo-Json -Compress }
    throw "$step falhou: $msg"
  }
}

function Find-Ativa($d, $rowIndex) {
  return $d.ativos | Where-Object { [int]$_.rowIndex -eq [int]$rowIndex } | Select-Object -First 1
}

function Sim-RemainingSec($s) {
  $status = [string]$s.status
  $mins = [int]$s.mins
  $ts = [int64]$s.startTimestamp
  if ($status -eq 'Pendente') { return $mins * 60 }
  if ($ts -lt 1e12) { return $mins * 60 }
  $elapsed = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $ts) / 1000.0
  return [math]::Floor($mins * 60 - $elapsed)
}

$result = [ordered]@{
  suite = "TESTE_4_FLUXOS_CADASTRO_I20"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}
function Add-C([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

$op = Get-MoviOperadorParams -Operador $Operador
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$tel1 = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)
$tel2 = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)

try {
  # --- Ping / versao GAS ---
  $ping = Invoke-MoviGet @{ action = "ping" }
  Assert-Ok $ping "ping"
  Add-C "ping.versao" "ok" $ping.versao
  $gasOkI20 = $ping.versao -match 'v1\.5\.(6[4-9]|[7-9]\d|\d{3,})'
  Add-C "ping.i20.min" $(if ($gasOkI20) { "ok" } else { "warn" }) $(if ($gasOkI20) { "gte v1.5.64" } else { "PRODUCAO abaixo v1.5.64 - col C pode estar errada" })

  # --- T1: Botao "So salvar cadastro" (salvarLocacao apenas) ---
  $nome1 = "T1_SO_SALVAR_$stamp"
  $salvar1 = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 01"
    pagamento = "PIX"; responsavel = "TESTE I20"; crianca = $nome1; telefone = $tel1
    observacao = "[TESTE] T1 so salvar sem iniciarTimer"
  } + $op)
  Assert-Ok $salvar1 "T1.salvarLocacao"
  if ($salvar1.status -ne "Pendente") { throw "T1: status deveria ser Pendente, veio $($salvar1.status)" }
  if ($salvar1.horaInicio) { throw "T1: horaInicio deveria estar vazia no cadastro, veio '$($salvar1.horaInicio)'" }
  if ([int64]$salvar1.startTimestamp -ne 0) { throw "T1: startTimestamp deveria ser 0, veio $($salvar1.startTimestamp)" }
  Add-C "T1.salvar.resposta" "ok" "Pendente; horaInicio vazia; ts=0; row=$($salvar1.rowIndex)"

  $ini1 = Invoke-MoviGet @{ action = "carregarInicio" }
  Assert-Ok $ini1 "T1.carregarInicio"
  $a1 = Find-Ativa $ini1 $salvar1.rowIndex
  if (-not $a1) { throw "T1: locacao nao apareceu em carregarInicio.ativos" }
  if ($a1.status -ne "Pendente") { throw "T1 carregarInicio: status=$($a1.status)" }
  if ($a1.started) { throw "T1 carregarInicio: started=true (timer nao deveria iniciar)" }
  if ([int64]$a1.startTimestamp -ne 0) { throw "T1 carregarInicio: startTimestamp=$($a1.startTimestamp)" }
  $rem1 = Sim-RemainingSec $a1
  if ($rem1 -lt 590 -or $rem1 -gt 600) { throw "T1: remaining esperado ~600s, veio ${rem1}s" }
  Add-C "T1.carregarInicio" "ok" "started=false; rem=${rem1}s (plano 10min)"

  # --- T2: Botao "Enviar SMS e iniciar" (salvarLocacao + iniciarTimer) ---
  $nome2 = "T2_SMS_INICIAR_$stamp"
  $salvar2 = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Triciclo"; plano = "10min"; veiculo = "Triciclo 01"
    pagamento = "Dinheiro"; responsavel = "TESTE I20"; crianca = $nome2; telefone = $tel2
    observacao = "[TESTE] T2 salvar+iniciar"
  } + $op)
  Assert-Ok $salvar2 "T2.salvarLocacao"
  if ($salvar2.status -ne "Pendente") { throw "T2 pre-iniciar: status=$($salvar2.status)" }

  $tsClient = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  $iniciar2 = Invoke-MoviGet @{
    action = "iniciarTimer"; rowIndex = $salvar2.rowIndex; timestamp = $tsClient
  }
  Assert-Ok $iniciar2 "T2.iniciarTimer"
  if ([int64]$iniciar2.startTimestamp -lt 1e12) { throw "T2 iniciarTimer: startTimestamp invalido $($iniciar2.startTimestamp)" }
  if (-not $iniciar2.horaInicio) { throw "T2 iniciarTimer: horaInicio vazia apos iniciar" }
  Add-C "T2.iniciarTimer" "ok" "horaInicio=$($iniciar2.horaInicio); ts=$($iniciar2.startTimestamp)"

  $tIniciar = [int64]$iniciar2.startTimestamp
  Start-Sleep -Seconds 2
  $nowMs = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  $elapsedDesdeInicio = ($nowMs - $tIniciar) / 1000.0
  $ini2 = Invoke-MoviGet @{ action = "carregarInicio" }
  Assert-Ok $ini2 "T2.carregarInicio"
  $a2 = Find-Ativa $ini2 $salvar2.rowIndex
  if (-not $a2) { throw "T2: nao encontrada em ativos" }
  if ($a2.status -ne "Ativa") { throw "T2: status=$($a2.status)" }
  if (-not $a2.started) { throw "T2: started=false apos iniciarTimer" }
  if ([int64]$a2.startTimestamp -ne $tIniciar) {
    throw "T2: ts carregarInicio=$($a2.startTimestamp) diferente iniciarTimer=$tIniciar"
  }
  $rem2 = Sim-RemainingSec $a2
  $remEsperado = [math]::Floor(600 - $elapsedDesdeInicio)
  $diffRem = [math]::Abs($rem2 - $remEsperado)
  if ($rem2 -ge 600) { throw "T2: timer nao contou - rem=${rem2}s elapsed=${elapsedDesdeInicio}s" }
  if ($diffRem -gt 8) { throw "T2: rem=${rem2}s esperado~${remEsperado}s (elapsed=${elapsedDesdeInicio}s) diff=${diffRem}s" }
  Add-C "T2.carregarInicio.contando" "ok" "started=true; rem=${rem2}s; elapsed=${elapsedDesdeInicio}s"

  # --- T3: Espera 3s sem iniciar (anti auto-start no fluxo so salvar) ---
  Start-Sleep -Seconds 3
  $ini3 = Invoke-MoviGet @{ action = "carregarInicio" }
  Assert-Ok $ini3 "T3.carregarInicio"
  $a3 = Find-Ativa $ini3 $salvar1.rowIndex
  if (-not $a3) { throw "T3: T1 sumiu dos ativos" }
  if ($a3.status -ne "Pendente") { throw "T3: virou $($a3.status) sem iniciarTimer" }
  if ($a3.started) { throw "T3: started=true sem iniciar" }
  $rem3 = Sim-RemainingSec $a3
  if ($rem3 -lt 590 -or $rem3 -gt 600) { throw "T3: rem=${rem3}s - deveria parado em 600" }
  Add-C "T3.espera.sem.iniciar" "ok" "apos 3s: Pendente; rem=${rem3}s"

  # --- T4: Portal paridade (mesmo instante: carregarInicio + portal) ---
  $ini4 = Invoke-MoviGet @{ action = "carregarInicio" }
  $portal = Invoke-MoviGet @{ action = "buscarPortalResponsavel"; telefone = $tel2 }
  Assert-Ok $ini4 "T4.carregarInicio"
  Assert-Ok $portal "T4.buscarPortal"
  $a4 = Find-Ativa $ini4 $salvar2.rowIndex
  $pl = $portal.locacoes | Where-Object { [int]$_.rowIndex -eq [int]$salvar2.rowIndex } | Select-Object -First 1
  if (-not $a4) { throw "T4: balcao sem locacao ativa" }
  if (-not $pl) { throw "T4: locacao nao no portal" }
  $diffTs = [math]::Abs([int64]$pl.startTimestamp - [int64]$a4.startTimestamp)
  if ($diffTs -gt 1000) { throw "T4: startTimestamp portal=$($pl.startTimestamp) balcao=$($a4.startTimestamp)" }
  $remBalcao = Sim-RemainingSec $a4
  $remPortal = Sim-RemainingSec $pl
  $diffRem = [math]::Abs($remPortal - $remBalcao)
  if ($diffRem -gt 5) { throw "T4: paridade rem portal=$remPortal balcao=$remBalcao diff=${diffRem}s" }
  Add-C "T4.portal.parity" "ok" "ts diff=${diffTs}ms; rem diff=${diffRem}s"

  # Encerrar T2 para nao poluir
  $enc = Invoke-MoviGet (@{
    action = "encerrarLocacao"; rowIndex = $salvar2.rowIndex; minUsados = 10
  } + $op)
  if ($enc.ok) { Add-C "T2.cleanup.encerrar" "ok" "Encerrada" } else { Add-C "T2.cleanup.encerrar" "warn" $enc.erro }

  $result.status = "ok"
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} catch {
  $result.status = "failed"
  $result.error = $_.Exception.Message
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} finally {
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -SoHoje -Quiet
  Add-C "limpeza.pos-teste" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail
  $result | ConvertTo-Json -Depth 6
  if ($result.status -eq "ok") { exit 0 } else { exit 1 }
}
