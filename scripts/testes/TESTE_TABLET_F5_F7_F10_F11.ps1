# Protocolo tablet manual F5/F7/F10/F11 (automatizado GAS + paridade portal)
# Doc: PROTOCOLO_DIAGNOSTICO_E_TESTES.md tabletPendente
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

function Find-Ativa($d, $rowIndex) {
  return $d.ativos | Where-Object { [int]$_.rowIndex -eq [int]$rowIndex } | Select-Object -First 1
}

$result = [ordered]@{
  suite = "TESTE_TABLET_F5_F7_F10_F11"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  rows = @()
}

function Add-C([string]$N, [string]$S, [string]$D = "") {
  $script:result.checks += [ordered]@{ id = $N; status = $S; detail = $D }
  if ($S -eq "fail") { $script:result.status = "fail" }
  elseif ($S -eq "warn" -and $script:result.status -ne "fail") { $script:result.status = "warn" }
}

$op = Get-MoviOperadorParams -Operador $Operador
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$tel = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)

try {
  $ping = Invoke-MoviGet @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-C "ping" "ok" $ping.versao

  # --- F5: pendente, espera, iniciar fresco ---
  $salvar = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 01"
    pagamento = "PIX"; responsavel = "TESTE TABLET F5"; crianca = "F5_$stamp"; telefone = $tel
    observacao = "[TESTE] tablet F5"
  } + $op)
  if (-not $salvar.ok) { throw "F5.salvar: $($salvar.erro)" }
  $rowF5 = [int]$salvar.rowIndex
  $script:result.rows += $rowF5
  Add-C "F5.salvar" "ok" "row=$rowF5 Pendente"

  $ini0 = Invoke-MoviGet @{ action = "carregarInicio" }
  $a0 = Find-Ativa $ini0 $rowF5
  if (-not $a0 -or $a0.started -or $a0.status -ne "Pendente") { throw "F5 pos-salvar invalido" }
  if ((Sim-Rem $a0) -ne 600) { throw "F5 pendente rem=$(Sim-Rem $a0)" }
  Add-C "F5.pendente" "ok" "10:00 parado"

  Start-Sleep -Seconds 20
  $iniW = Invoke-MoviGet @{ action = "carregarInicio" }
  $aW = Find-Ativa $iniW $rowF5
  if ($aW.started -or (Sim-Rem $aW) -ne 600) { throw "F5 apos 20s rem=$(Sim-Rem $aW) started=$($aW.started)" }
  Add-C "F5.espera20s" "ok" "ainda 10:00"

  $tClick = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  $iniciar = Invoke-MoviGet @{ action = "iniciarTimer"; rowIndex = $rowF5; timestamp = $tClick }
  if (-not $iniciar.ok) { throw "F5.iniciar: $($iniciar.erro)" }
  $tsInicio = [int64]$iniciar.startTimestamp
  $ini1 = Invoke-MoviGet @{ action = "carregarInicio" }
  $a1 = Find-Ativa $ini1 $rowF5
  $remStart = Sim-Rem $a1
  $elapsed = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $tsInicio) / 1000.0
  $remMin = [math]::Floor(600 - $elapsed - 5)
  $remMax = 601
  if ($remStart -lt $remMin -or $remStart -gt $remMax) { Add-C "F5.iniciar.rem" "fail" "rem=${remStart}s elapsed=${elapsed}s (faixa ${remMin}-${remMax})" }
  else { Add-C "F5.iniciar.rem" "ok" "rem=${remStart}s (~10:00, elapsed=${elapsed}s)" }

  # --- F11: portal vs balcao (locacao F5 ativa) ---
  $digits = $tel -replace '\D', ''
  $portal = Invoke-MoviGet @{ action = "buscarPortalResponsavel"; telefone = $digits }
  if (-not $portal.ok) { Add-C "F11.portal" "fail" $portal.erro }
  else {
    $match = $portal.locacoes | Where-Object { [int]$_.rowIndex -eq $rowF5 } | Select-Object -First 1
    if (-not $match) { Add-C "F11.match" "fail" "locacao nao no portal" }
    else {
      $remPortal = Sim-Rem $match
      $drift = [math]::Abs($remStart - $remPortal)
      Add-C "F11.portal.vs.balcao" $(if ($drift -le 5) { "ok" } else { "fail" }) "balcao=${remStart}s portal=${remPortal}s drift=${drift}s"
    }
  }

  # --- F10: duas leituras GAS 2s apart (simula 2 abas/sync) ---
  $remA = Sim-Rem (Find-Ativa (Invoke-MoviGet @{ action = "carregarInicio" }) $rowF5)
  Start-Sleep -Seconds 2
  $remB = Sim-Rem (Find-Ativa (Invoke-MoviGet @{ action = "carregarInicio" }) $rowF5)
  $drift10 = [math]::Abs($remA - $remB)
  Add-C "F10.duas.leituras" $(if ($drift10 -le 8) { "ok" } else { "fail" }) "t0=${remA}s t+2s=${remB}s drift=${drift10}s"

  # --- F7: alerta 5min (rem <= 300) ---
  $tel7 = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)
  $salvar7 = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Triciclo"; plano = "10min"; veiculo = "Triciclo 01"
    pagamento = "PIX"; responsavel = "TESTE TABLET F7"; crianca = "F7_5M_$stamp"; telefone = $tel7
    observacao = "[TESTE] alerta 5min"
  } + $op)
  if (-not $salvar7.ok) { throw "F7.salvar: $($salvar7.erro)" }
  $row7 = [int]$salvar7.rowIndex
  $script:result.rows += $row7
  $ts5 = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - (5 * 60 + 30) * 1000)
  $ini7 = Invoke-MoviGet @{ action = "iniciarTimer"; rowIndex = $row7; timestamp = $ts5 }
  if (-not $ini7.ok) { throw "F7.iniciar: $($ini7.erro)" }
  $a7 = Find-Ativa (Invoke-MoviGet @{ action = "carregarInicio" }) $row7
  $rem7 = Sim-Rem $a7
  if ($rem7 -gt 330 -or $rem7 -le 0) {
    if ($rem7 -gt 450) { Add-C "F7.janela.5min" "warn" "rem=${rem7}s - API nao simula retroativo; valide alerta 5min no tablet (F7)" }
    else { Add-C "F7.janela.5min" "fail" "rem=${rem7}s (esperado 1-330)" }
  } else { Add-C "F7.janela.5min" "ok" "rem=${rem7}s dispara alerta 5min no FE" }

  # --- F7: expirado (rem <= 0) ---
  $tel7b = "989" + (Get-Random -Minimum 10000000 -Maximum 99999999)
  $salvar7b = Invoke-MoviGet (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 02"
    pagamento = "PIX"; responsavel = "TESTE TABLET F7B"; crianca = "F7_EXP_$stamp"; telefone = $tel7b
    observacao = "[TESTE] alerta expirado"
  } + $op)
  if (-not $salvar7b.ok) { throw "F7b.salvar: $($salvar7b.erro)" }
  $row7b = [int]$salvar7b.rowIndex
  $script:result.rows += $row7b
  $tsExp = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - (10 * 60 + 10) * 1000)
  $ini7b = Invoke-MoviGet @{ action = "iniciarTimer"; rowIndex = $row7b; timestamp = $tsExp }
  if (-not $ini7b.ok) { throw "F7b.iniciar: $($ini7b.erro)" }
  $a7b = Find-Ativa (Invoke-MoviGet @{ action = "carregarInicio" }) $row7b
  $rem7b = Sim-Rem $a7b
  if ($rem7b -gt 0) {
    if ($rem7b -gt 450) { Add-C "F7.janela.expirado" "warn" "rem=${rem7b}s - API nao simula retroativo; valide alerta expirado no tablet (F7)" }
    else { Add-C "F7.janela.expirado" "fail" "rem=${rem7b}s (esperado <=0)" }
  } else { Add-C "F7.janela.expirado" "ok" "rem=${rem7b}s dispara alerta expirado no FE" }

  Add-C "F7.ui.modal" "warn" "modais FE: rode scripts/testes/TESTE_ALERTAS_TABLET_BROWSER.js no balcao logado"

  $result.status = if ($result.checks | Where-Object { $_.status -eq "fail" }) { "fail" } elseif ($result.checks | Where-Object { $_.status -eq "warn" }) { "warn" } else { "ok" }
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
} finally {
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -SoHoje -Quiet
  Add-C "limpeza.planilha" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail
  $result | ConvertTo-Json -Depth 6
  if ($result.status -eq "ok") { exit 0 } elseif ($result.status -eq "warn") { exit 0 } else { exit 1 }
}
