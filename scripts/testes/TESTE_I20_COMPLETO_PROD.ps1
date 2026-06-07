# I20 completo — botao 2 (so salvar), espera, SMS sem iniciar, iniciar fresco, idempotencia
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
  try { return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 35 }
  catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "vazio: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

function Assert-Ok($r, [string]$step) {
  if (-not $r.ok) { throw "$step : $(if ($r.erro) { $r.erro } else { $r | ConvertTo-Json -Compress })" }
}

function Find-Ativa($d, $rowIndex) {
  return $d.ativos | Where-Object { [int]$_.rowIndex -eq [int]$rowIndex } | Select-Object -First 1
}

function Sim-Rem($s) {
  $mins = [int]$s.mins
  $ts = [int64]$s.startTimestamp
  if ([string]$s.status -eq 'Pendente') { return $mins * 60 }
  if ($ts -lt 1e12) { return $mins * 60 }
  return [math]::Floor($mins * 60 - (([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $ts) / 1000.0))
}

$result = [ordered]@{ suite = "TESTE_I20_COMPLETO_PROD"; startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); checks = @() }
function Add-C([string]$N, [string]$S, [string]$D = "") { $script:result.checks += [ordered]@{ name = $N; status = $S; detail = $D } }

$op = Get-MoviOperadorParams -Operador $Operador
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$tel = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)

try {
  $ping = Invoke-MoviGet @{ action = "ping" }
  Assert-Ok $ping "ping"
  Add-C "ping" "ok" $ping.versao
  $gasIdempotent = $ping.versao -match 'v1\.5\.(6[5-9]|[7-9]\d)'
  $gasClientTs = $ping.versao -match 'v1\.5\.(6[6-9]|[7-9]\d)'

  # --- B2: So salvar + espera 5s + iniciar (reproduz modal antigo) ---
  $nomeB2 = "B2_SO_SALVAR_$stamp"
  $salvarB2 = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 01"
    pagamento = "PIX"; responsavel = "TESTE I20 B2"; crianca = $nomeB2; telefone = $tel
    observacao = "[TESTE] botao 2 so salvar"
  } + $op)
  Assert-Ok $salvarB2 "B2.salvar"
  if ($salvarB2.status -ne "Pendente" -or $salvarB2.horaInicio) {
    throw "B2 salvar: status=$($salvarB2.status) horaInicio=$($salvarB2.horaInicio)"
  }
  Add-C "B2.salvar" "ok" "Pendente row=$($salvarB2.rowIndex)"

  $ini0 = Invoke-MoviGet @{ action = "carregarInicio" }
  $a0 = Find-Ativa $ini0 $salvarB2.rowIndex
  if (-not $a0 -or $a0.started -or $a0.status -ne "Pendente") {
    throw "B2 pos-salvar: started=$($a0.started) status=$($a0.status)"
  }
  if ((Sim-Rem $a0) -ne 600) { throw "B2 pos-salvar rem=$(Sim-Rem $a0)" }
  Add-C "B2.pos.salvar" "ok" "Pendente rem=600"

  Start-Sleep -Seconds 5
  $ini5 = Invoke-MoviGet @{ action = "carregarInicio" }
  $a5 = Find-Ativa $ini5 $salvarB2.rowIndex
  if ($a5.started -or $a5.status -ne "Pendente") {
    throw "B2 apos 5s sem iniciar: started=$($a5.started) status=$($a5.status)"
  }
  if ((Sim-Rem $a5) -ne 600) { throw "B2 apos 5s rem=$(Sim-Rem $a5) - timer adiantou sozinho" }
  Add-C "B2.espera.5s" "ok" "Pendente rem=600 apos 5s (sem auto-start)"

  $tAntes = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  $iniciarB2 = Invoke-MoviGet @{
    action = "iniciarTimer"; rowIndex = $salvarB2.rowIndex; timestamp = $tAntes
  }
  Assert-Ok $iniciarB2 "B2.iniciar"
  $tsInicio = [int64]$iniciarB2.startTimestamp
  if ($tsInicio -lt 1e12) { throw "B2 ts invalido" }

  $iniPos = Invoke-MoviGet @{ action = "carregarInicio" }
  $aPos = Find-Ativa $iniPos $salvarB2.rowIndex
  if (-not $aPos.started -or $aPos.status -ne "Ativa") { throw "B2 pos-iniciar nao Ativa" }
  if ([int64]$aPos.startTimestamp -ne $tsInicio) {
    throw "B2 ts carregar=$($aPos.startTimestamp) diferente iniciar=$tsInicio"
  }
  $nowMs = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  $elapsedInicio = ($nowMs - $tsInicio) / 1000.0
  $remPos = Sim-Rem $aPos
  $remEsp = [math]::Floor(600 - $elapsedInicio)
  if ($remPos -gt 600) { throw "B2 rem=${remPos} maior que plano" }
  if ([math]::Abs($remPos - $remEsp) -gt 10) {
    throw "B2 pos-iniciar rem=${remPos}s esperado~${remEsp}s (elapsed=${elapsedInicio}s desde iniciar)"
  }
  if ($elapsedInicio -gt 120) { throw "B2 elapsed desde iniciar muito alto: ${elapsedInicio}s" }
  Add-C "B2.iniciar.fresco" "ok" "rem=${remPos}s elapsed=${elapsedInicio}s desde iniciar (nao desde cadastro)"
  $driftTs = [math]::Abs($tsInicio - $tAntes)
  if ($gasClientTs) {
    if ($driftTs -gt 5000) { throw "B2 v1.5.66+: startTimestamp deveria ~= clientTs; drift=${driftTs}ms" }
    Add-C "B2.clientTs" "ok" "col Y ~= timestamp enviado (drift ${driftTs}ms)"
  } else {
    Add-C "B2.clientTs" "warn" "GAS $($ping.versao) grava serverTs — deploy v1.5.66 para fix 09:33"
  }

  # --- B1: Salvar + SMS sem iniciar ---
  $tel2 = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)
  $nomeB1 = "B1_SMS_$stamp"
  $salvarB1 = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Triciclo"; plano = "10min"; veiculo = "Triciclo 01"
    pagamento = "Dinheiro"; responsavel = "TESTE I20 B1"; crianca = $nomeB1; telefone = $tel2
    observacao = "[TESTE] botao 1 salvar+sms"
  } + $op)
  Assert-Ok $salvarB1 "B1.salvar"
  $smsB1 = Invoke-MoviGet (@{
    action = "enviarSmsResponsavel"; rowIndex = $salvarB1.rowIndex; tipo = "portal"
    origem = "teste"; versao = "I20"
  } + $op)
  Assert-Ok $smsB1 "B1.sms"
  Start-Sleep -Seconds 2
  $iniB1 = Invoke-MoviGet @{ action = "carregarInicio" }
  $aB1 = Find-Ativa $iniB1 $salvarB1.rowIndex
  if ($aB1.started -or $aB1.status -ne "Pendente") {
    throw "B1 apos SMS: started=$($aB1.started) status=$($aB1.status)"
  }
  if ((Sim-Rem $aB1) -ne 600) { throw "B1 apos SMS rem=$(Sim-Rem $aB1)" }
  Add-C "B1.sms.sem.iniciar" "ok" "SMS ok; Pendente rem=600"

  $encB1 = Invoke-MoviGet (@{ action = "encerrarLocacao"; rowIndex = $salvarB1.rowIndex; minUsados = 0 } + $op)
  if ($encB1.ok) { Add-C "B1.cleanup" "ok" "cancelada/encerrada" }

  # --- Idempotencia: segundo iniciarTimer nao reinicia relogio ---
  $iniciar2 = Invoke-MoviGet @{
    action = "iniciarTimer"; rowIndex = $salvarB2.rowIndex; timestamp = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  }
  Assert-Ok $iniciar2 "idempot.iniciar2"
  $ts2 = [int64]$iniciar2.startTimestamp
  if ($gasIdempotent) {
    if ($ts2 -ne $tsInicio) { throw "v1.5.65+: segundo iniciar alterou ts $tsInicio -> $ts2" }
    Add-C "idempot.gas.65" "ok" "jaIniciada ts preservado"
  } else {
    $diffTs = [math]::Abs($ts2 - $tsInicio)
    if ($diffTs -lt 1000) { Add-C "idempot.gas.64" "ok" "ts similar (GAS $ping.versao)" }
    else { Add-C "idempot.gas.64" "warn" "GAS $($ping.versao) reinicia ts no 2o iniciar - deploy v1.5.65 recomendado" }
  }

  $encB2 = Invoke-MoviGet (@{ action = "encerrarLocacao"; rowIndex = $salvarB2.rowIndex; minUsados = 10 } + $op)
  if ($encB2.ok) { Add-C "B2.cleanup" "ok" "Encerrada" }

  # --- FE producao ---
  $feVer = & curl.exe -L -s "https://ribocg-a11y.github.io/movikids/mk-version.js"
  if ($feVer -match "MK_VERSION = '1\.7\.77'") { Add-C "fe.pages" "ok" "v1.7.77" }
  elseif ($feVer -match "MK_VERSION = '([^']+)'") { Add-C "fe.pages" "warn" "v$($Matches[1]) - tablet precisa ?force=1.7.77" }
  else { Add-C "fe.pages" "fail" "mk-version.js ilegivel" }

  $feOp = & curl.exe -L -s "https://ribocg-a11y.github.io/movikids/mk-operacao.js"
  if ($feOp -match 'const clickTs = Date\.now\(\)' -and $feOp -match 'iniciarContagemDireto_') {
    Add-C "fe.iniciar.otimista" "ok" "inicio otimista no clique (I20 latencia)"
  } elseif ($feOp -match 'iniciarContagemDireto_' -and $feOp -notmatch 'enviarBvEIniciar') {
    Add-C "fe.iniciar.otimista" "warn" "FE sem inicio otimista - deploy v1.7.77"
  } else { Add-C "fe.iniciar.otimista" "fail" "FE producao sem fix I20" }

  $result.status = "ok"
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} catch {
  $result.status = "failed"
  $result.error = $_.Exception.Message
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} finally {
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -SoHoje -Quiet
  Add-C "limpeza" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail
  $result | ConvertTo-Json -Depth 6
  if ($result.status -eq "ok") { exit 0 } else { exit 1 }
}
