# Suite ~40 testes reais La Ville (GAS Web) — cronometro, planos, extra, caixa, multi, avulso.
# Usa GET (paridade browser I15). Limpa [TESTE]/TESTE_* no finally.
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$Operador = "TESTE_LAVILLE",
  [string]$AdminPin = "1421",
  [string]$UnidadeId = "laville"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

function Invoke-MoviApi {
  param([hashtable]$Params, [int]$Retries = 3)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $lastErr = ""
  for ($attempt = 1; $attempt -le $Retries; $attempt++) {
    $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
    $raw = & curl.exe -L -s --max-time 120 $url
    if (-not $raw) {
      $lastErr = "Resposta vazia GET: $($Params.action)"
      Start-Sleep -Seconds (2 * $attempt)
      continue
    }
    if ($raw -match '^\s*<') {
      $lastErr = "GAS HTML (timeout/quota) em $($Params.action) tentativa $attempt"
      Start-Sleep -Seconds (3 * $attempt)
      continue
    }
    try {
      return $raw | ConvertFrom-Json
    } catch {
      $lastErr = "JSON invalido em $($Params.action): $($_.Exception.Message)"
      Start-Sleep -Seconds (2 * $attempt)
    }
  }
  throw $lastErr
}

function Cancel-Soft {
  param([int]$RowIndex, [string]$Name)
  if ($RowIndex -lt 1) { Add-Check $Name "skip" "sem row"; return }
  $c = Invoke-MoviApi (@{ action = "cancelarLocacao"; rowIndex = $RowIndex; motivo = "Suite40 liberar frota" } + $op)
  if ($c.ok) { Add-Check $Name "ok" "Cancelada"; return }
  $msg = [string]$c.erro
  if ($msg -match 'finalizada|Cancelada|Encerrada') { Add-Check $Name "ok" ("ja finalizada: $msg"); return }
  Add-Check $Name "fail" $msg
}

$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$op = Get-MoviOperadorParams -Operador $Operador
$adm = Get-MoviAdminSupervisorParams -AdminPin $AdminPin
$uid = @{ unidadeId = $UnidadeId }
$telBase = 9899100000 + (Get-Random -Minimum 1000 -Maximum 8999)
$telN = 0
function Next-Tel {
  $script:telN++
  return [string]($script:telBase + $script:telN)
}

$result = [ordered]@{
  suite = "TESTE_LAVILLE_SUITE40_PROD"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  unidadeId = $UnidadeId
  gasVersao = ""
  checks = @()
  pass = 0
  fail = 0
  skip = 0
}

function Add-Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq "ok") { $script:result.pass++ }
  elseif ($Status -eq "fail") { $script:result.fail++ }
  else { $script:result.skip++ }
  $icon = if ($Status -eq "ok") { "OK" } elseif ($Status -eq "fail") { "FAIL" } else { "SKIP" }
  Write-Host ("[{0}] {1} — {2}" -f $icon, $Name, $Detail)
}

function Expect-Ok($Response, [string]$Name, [string]$DetailOk = "") {
  if (-not $Response -or -not $Response.ok) {
    $msg = if ($Response.erro) { $Response.erro } else { ($Response | ConvertTo-Json -Compress -Depth 4) }
    Add-Check $Name "fail" $msg
    return $false
  }
  Add-Check $Name "ok" $(if ($DetailOk) { $DetailOk } else { "ok" })
  return $true
}

function Expect-Fail($Response, [string]$Name, [string]$ExpectSubstring = "") {
  if ($Response -and $Response.ok) {
    Add-Check $Name "fail" "deveria falhar mas ok=true"
    return $false
  }
  $msg = if ($Response.erro) { [string]$Response.erro } else { "erro" }
  if ($ExpectSubstring -and ($msg -notmatch [regex]::Escape($ExpectSubstring))) {
    Add-Check $Name "fail" ("erro inesperado: $msg")
    return $false
  }
  Add-Check $Name "ok" $msg
  return $true
}

function New-SalvarParams {
  param(
    [string]$Tipo, [string]$Plano, [string]$Veiculo,
    [string]$Pagamento = "PIX", [string]$Tel = "",
    [string]$CriancaSuffix = ""
  )
  if (-not $Tel) { $Tel = Next-Tel }
  $cri = "TESTE_LV_$stamp$CriancaSuffix"
  return (@{
    action = "salvarLocacao"
    tipo = $Tipo; plano = $Plano; veiculo = $Veiculo
    pagamento = $Pagamento
    responsavel = "TESTE LA VILLE"
    crianca = $cri
    telefone = $Tel
    observacao = "[TESTE] suite40 laville $stamp"
  } + $op + $uid)
}

try {
  # ── 1–4: sanity / frota / equipes ───────────────────────────
  $ping = Invoke-MoviApi @{ action = "ping" }
  if (-not (Expect-Ok $ping "01.ping" $ping.versao)) { throw "ping falhou" }
  $result.gasVersao = [string]$ping.versao
  if ($ping.versao -notmatch '1\.5\.22[6-9]|1\.5\.2[3-9]') {
    Add-Check "02.ping.versao.min" "fail" ("esperado >= v1.5.226; got $($ping.versao)")
  } else {
    Add-Check "02.ping.versao.min" "ok" $ping.versao
  }

  $ativas0 = Invoke-MoviApi (@{ action = "listarAtivas" } + $uid)
  Expect-Ok $ativas0 "03.listarAtivas.laville" ("n=" + @($ativas0.locacoes).Count) | Out-Null

  $opsLv = Invoke-MoviApi (@{ action = "listarOperadoresLogin" } + $uid)
  Expect-Ok $opsLv "04.ops.login.laville" ("n=" + @($opsLv.operadores).Count) | Out-Null

  $opsG = Invoke-MoviApi @{ action = "listarOperadoresLogin"; unidadeId = "golden" }
  Expect-Ok $opsG "05.ops.login.golden" ("n=" + @($opsG.operadores).Count) | Out-Null

  try {
    $colLv = Invoke-MoviApi (@{ action = "listarColaboradoresGestao" } + $uid)
    Expect-Ok $colLv "06.colab.gestao.laville" ("n=" + @($colLv.colaboradores).Count) | Out-Null
  } catch {
    Add-Check "06.colab.gestao.laville" "fail" $_.Exception.Message
  }
  Start-Sleep -Seconds 2

  # ── 7–11: preços por tipo (planos LV) ───────────────────────
  $matrix = @(
    @{ t = "Carro"; p = "10min"; v = "LV Carro 01"; valor = 15; mins = 10 },
    @{ t = "Triciclo"; p = "20min"; v = "LV Triciclo 01"; valor = 25; mins = 20 },
    @{ t = "Pelúcia"; p = "30min"; v = "LV Pelúcia 01"; valor = 35; mins = 30 },
    @{ t = "Drift"; p = "40min"; v = "LV Drift 01"; valor = 45; mins = 40 },
    @{ t = "Dino"; p = "10min"; v = "LV Dino 01"; valor = 20; mins = 10 }
  )
  $rowsPend = @()
  $n = 7
  foreach ($m in $matrix) {
    try {
      $s = Invoke-MoviApi (New-SalvarParams -Tipo $m.t -Plano $m.p -Veiculo $m.v -CriancaSuffix ("_P$n"))
      if (Expect-Ok $s ("{0}.salvar.{1}.{2}" -f $n, $m.t, $m.p) ("row=$($s.rowIndex) valor=$($s.valorPlano)")) {
        if ([int]$s.valorPlano -ne $m.valor) {
          Add-Check ("{0}b.preco.{1}" -f $n, $m.t) "fail" ("valor=$($s.valorPlano) esperado=$($m.valor)")
        } else {
          Add-Check ("{0}b.preco.{1}" -f $n, $m.t) "ok" ("R$ $($m.valor)")
        }
        if ([int]$s.mins -ne $m.mins) {
          Add-Check ("{0}c.mins.{1}" -f $n, $m.t) "fail" ("mins=$($s.mins)")
        } else {
          Add-Check ("{0}c.mins.{1}" -f $n, $m.t) "ok" ("$($m.mins)min")
        }
        $rowsPend += [int]$s.rowIndex
      }
    } catch {
      Add-Check ("{0}.salvar.{1}.{2}" -f $n, $m.t, $m.p) "fail" $_.Exception.Message
    }
    Start-Sleep -Milliseconds 600
    $n++
  }

  # cancelar os 5 pendentes para liberar frota (idempotente)
  $ci = 12
  foreach ($r in $rowsPend) {
    Cancel-Soft -RowIndex $r -Name ("{0}.cancelar.pendente.row$r" -f $ci)
    Start-Sleep -Milliseconds 400
    $ci++
  }

  # ── 17–18: rejeicoes (Golden veiculo / plano 3h) ────────────
  $badV = Invoke-MoviApi (New-SalvarParams -Tipo "Carro" -Plano "10min" -Veiculo "Carro 01" -CriancaSuffix "_BADV")
  Expect-Fail $badV "17.reject.veiculo.golden" "Ve" | Out-Null

  $badP = Invoke-MoviApi (New-SalvarParams -Tipo "Carro" -Plano "3h" -Veiculo "LV Carro 02" -CriancaSuffix "_BADP")
  Expect-Fail $badP "18.reject.plano.3h" "Plano" | Out-Null

  # Blocos pesados: falha isolada nao aborta o resto
  $blocos = @(
    {
      $telCiclo = Next-Tel
      $s1 = Invoke-MoviApi (New-SalvarParams -Tipo "Carro" -Plano "10min" -Veiculo "LV Carro 01" -Tel $telCiclo -CriancaSuffix "_CICLO")
      if (-not (Expect-Ok $s1 "19.salvar.ciclo" ("row=$($s1.rowIndex)"))) { throw "ciclo salvar falhou" }
      $row1 = [int]$s1.rowIndex
      $ver0 = Invoke-MoviApi @{ action = "verificarSessao"; rowIndex = $row1 }
      if ((Expect-Ok $ver0 "20.verificar.pendente") -and ($ver0.status -ne "Pendente" -or $ver0.started)) {
        Add-Check "20b.verificar.pendente.status" "fail" ("status=$($ver0.status)")
      } else { Add-Check "20b.verificar.pendente.status" "ok" "Pendente" }
      $clickTs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
      $ini = Invoke-MoviApi (@{ action = "iniciarTimer"; rowIndex = $row1; timestamp = $clickTs } + $op)
      if (-not (Expect-Ok $ini "21.iniciarTimer" ("ts=$($ini.startTimestamp)"))) { throw "iniciar falhou" }
      $ts1 = [int64]$ini.startTimestamp
      if ($ts1 -lt 1e12) { Add-Check "21b.ts.ms" "fail" "$ts1" } else { Add-Check "21b.ts.ms" "ok" "$ts1" }
      $ini2 = Invoke-MoviApi (@{ action = "iniciarTimer"; rowIndex = $row1; timestamp = $clickTs } + $op)
      if ((Expect-Ok $ini2 "22.iniciar.idempotente") -and ([int64]$ini2.startTimestamp -ne $ts1)) {
        Add-Check "22b.ts.igual" "fail" ("$($ini2.startTimestamp) != $ts1")
      } else { Add-Check "22b.ts.igual" "ok" "mesmo ts" }
      Start-Sleep -Seconds 2
      $ciAdm = Invoke-MoviApi (@{ action = "carregarInicio" } + $adm + $uid)
      if (Expect-Ok $ciAdm "23.carregarInicio.laville" ("ativos=" + @($ciAdm.ativos).Count)) {
        $ativo = @($ciAdm.ativos | Where-Object { [int]$_.rowIndex -eq $row1 } | Select-Object -First 1)
        if (-not $ativo) { Add-Check "23b.ativo.na.lista" "fail" "ausente" }
        elseif ([int64]$ativo.startTimestamp -lt 1e12) { Add-Check "23b.ativo.na.lista" "fail" "I43 ts=0" }
        else { Add-Check "23b.ativo.na.lista" "ok" ("ts=$($ativo.startTimestamp) $($ativo.status)") }
      }
      $ext = Invoke-MoviApi (@{ action = "estenderLocacao"; rowIndex = $row1; extMins = 10; extValor = 15; extPlano = "10min" } + $op)
      if (Expect-Ok $ext "24.estender.10min" ("totalMins=$($ext.totalMins)")) {
        if ([int]$ext.totalMins -lt 20) { Add-Check "24b.totalMins" "fail" "$($ext.totalMins)" }
        else { Add-Check "24b.totalMins" "ok" "$($ext.totalMins)" }
      }
      $ver2 = Invoke-MoviApi @{ action = "verificarSessao"; rowIndex = $row1 }
      if ((Expect-Ok $ver2 "25.verificar.pos.estender") -and ([int]$ver2.mins -lt 20)) {
        Add-Check "25b.mins" "fail" "mins=$($ver2.mins)"
      } else { Add-Check "25b.mins" "ok" "mins=$($ver2.mins)" }
      $enc = Invoke-MoviApi (@{ action = "encerrarLocacao"; rowIndex = $row1; minUsados = 22; extraPagamento = "PIX" } + $op)
      Expect-Ok $enc "26.encerrar.com.extra" ("total=$($enc.valorTotal) status=$($enc.status)") | Out-Null
    },
    {
      Start-Sleep -Seconds 1
      $s2 = Invoke-MoviApi (New-SalvarParams -Tipo "Dino" -Plano "20min" -Veiculo "LV Dino 02" -CriancaSuffix "_SP")
      Expect-Ok $s2 "27.salvar.dino20" ("valor=$($s2.valorPlano)") | Out-Null
      if ([int]$s2.valorPlano -ne 35) { Add-Check "27b.preco.dino20" "fail" "$($s2.valorPlano)" }
      else { Add-Check "27b.preco.dino20" "ok" "R$35" }
      $row2 = [int]$s2.rowIndex
      $i2 = Invoke-MoviApi (@{ action = "iniciarTimer"; rowIndex = $row2; timestamp = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) } + $op)
      Expect-Ok $i2 "28.iniciar.dino" "ok" | Out-Null
      $encSp = Invoke-MoviApi (@{ action = "encerrarLocacao"; rowIndex = $row2; minUsados = 45; somentePlano = "true"; confirmarCurto = "1" } + $op)
      Expect-Ok $encSp "29.encerrar.somentePlano" ("status=$($encSp.status)") | Out-Null
    },
    {
      Start-Sleep -Seconds 1
      $s3 = Invoke-MoviApi (New-SalvarParams -Tipo "Carro" -Plano "10min" -Veiculo "LV Carro 02" -CriancaSuffix "_CX")
      Expect-Ok $s3 "30.salvar.cancelExtras" ("row=$($s3.rowIndex)") | Out-Null
      $row3 = [int]$s3.rowIndex
      $i3 = Invoke-MoviApi (@{ action = "iniciarTimer"; rowIndex = $row3; timestamp = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) } + $op)
      Expect-Ok $i3 "31.iniciar.cancelExtras" "ok" | Out-Null
      $encCx = Invoke-MoviApi (@{
        action = "encerrarLocacao"; rowIndex = $row3; minUsados = 10
        cancelarExtras = "true"; justificativaExtras = "Suite40 teste cancelar extras La Ville"; minExtraCancelados = 15
        confirmarCurto = "1"
      } + $op)
      Expect-Ok $encCx "32.encerrar.cancelarExtras" ("status=$($encCx.status)") | Out-Null
    },
    {
      Start-Sleep -Seconds 1
      # libera frota LV de testes orfaos antes do multi
      try {
        $at = Invoke-MoviApi @{ action = "listarAtivas"; unidadeId = "laville" }
        foreach ($a in @($at.locacoes)) {
          if ([string]$a.crianca -like "TESTE_*" -or [string]$a.observacao -match '\[TESTE\]') {
            Cancel-Soft -RowIndex ([int]$a.rowIndex) -Name ("33pre.libera.$($a.rowIndex)")
          }
        }
      } catch {}
      $telMulti = Next-Tel
      $itensJson = @(
        @{ tipo = "Pelúcia"; plano = "10min"; veiculo = "LV Pelúcia 02" },
        @{ tipo = "Triciclo"; plano = "10min"; veiculo = "LV Triciclo 02" }
      ) | ConvertTo-Json -Compress
      $multi = Invoke-MoviApi (@{
        action = "salvarLocacoesMulti"; itens = $itensJson
        responsavel = "TESTE LA VILLE MULTI"; crianca = "TESTE_LV_${stamp}_MULTI"
        telefone = $telMulti; pagamento = "Debito"; observacao = "[TESTE] suite40 multi $stamp"
      } + $op + $uid)
      if (Expect-Ok $multi "33.multi.2veiculos" ("n=$($multi.n)")) {
        $locs = @($multi.locacoes)
        if ($locs.Count -lt 2) { Add-Check "33b.multi.count" "fail" "$($locs.Count)" }
        else {
          Add-Check "33b.multi.count" "ok" "2"
          $cids = @($locs | ForEach-Object { $_.contaId }) | Select-Object -Unique
          if ($cids.Count -eq 1) { Add-Check "34.multi.mesmaConta" "ok" "contaId=$($cids[0])" }
          else { Add-Check "34.multi.mesmaConta" "fail" ("cids=" + ($cids -join ",")) }
        }
        foreach ($L in $locs) { Cancel-Soft -RowIndex ([int]$L.rowIndex) -Name ("35.cancel.multi.$($L.rowIndex)") }
      } else {
        Add-Check "34.multi.mesmaConta" "skip" "multi falhou"
        Add-Check "35.cancel.multi" "skip" "multi falhou"
      }
    },
    {
      Start-Sleep -Seconds 1
      $s4 = Invoke-MoviApi (New-SalvarParams -Tipo "Carro" -Plano "10min" -Veiculo "LV Carro 01" -CriancaSuffix "_ED")
      Expect-Ok $s4 "36.salvar.editar" ("row=$($s4.rowIndex)") | Out-Null
      $ed = Invoke-MoviApi (@{ action = "editarLocacao"; rowIndex = $s4.rowIndex; plano = "30min" } + $op)
      Expect-Ok $ed "37.editar.plano.30min" "ok" | Out-Null
      Cancel-Soft -RowIndex ([int]$s4.rowIndex) -Name "38.cancelar.pos.editar"
    },
    {
      Start-Sleep -Seconds 1
      $av = Invoke-MoviApi (@{
        action = "salvarLancamentoAvulso"; tipo = "Carro"; plano = "10min"; veiculo = "LV Carro 02"
        pagamento = "Dinheiro"; responsavel = "TESTE LA VILLE"; crianca = "TESTE_LV_${stamp}_AV"
        telefone = (Next-Tel); motivo = "Suite40 avulso La Ville homologacao"; observacao = "[TESTE] suite40 avulso"
      } + $op + $uid)
      if (Expect-Ok $av "39.avulso.laville" ("row=$($av.rowIndex)")) {
        Cancel-Soft -RowIndex ([int]$av.rowIndex) -Name "39b.cancel.avulso"
      }
    },
    {
      Start-Sleep -Seconds 2
      $hoje = Get-Date -Format "dd/MM/yyyy"
      $rdLv = Invoke-MoviApi (@{ action = "resumoDia"; data = $hoje } + $adm + $uid)
      Expect-Ok $rdLv "40.resumoDia.laville" ("fat=" + $rdLv.faturamento + " n=" + $rdLv.nLocacoes) | Out-Null
      $rdG = Invoke-MoviApi (@{ action = "resumoDia"; data = $hoje; unidadeId = "golden" } + $adm)
      Expect-Ok $rdG "41.resumoDia.golden" ("fat=" + $rdG.faturamento + " n=" + $rdG.nLocacoes) | Out-Null
      $rdAll = Invoke-MoviApi (@{ action = "resumoDia"; data = $hoje; unidadeId = "all" } + $adm)
      Expect-Ok $rdAll "42.resumoDia.all" ("fat=" + $rdAll.faturamento) | Out-Null
      $listLv = Invoke-MoviApi (@{ action = "listarAtivas" } + $uid)
      Expect-Ok $listLv "43.listarAtivas.final" ("n=" + @($listLv.locacoes).Count) | Out-Null
    },
    {
      foreach ($f in @(
        @{ t = "Pelúcia"; p = "10min"; v = "LV Pelúcia 03"; i = 44 },
        @{ t = "Drift"; p = "10min"; v = "LV Drift 02"; i = 45 }
      )) {
        $sf = Invoke-MoviApi (New-SalvarParams -Tipo $f.t -Plano $f.p -Veiculo $f.v -CriancaSuffix ("_F$($f.i)"))
        if (Expect-Ok $sf ("{0}.frota" -f $f.i) ("row=$($sf.rowIndex)")) {
          Cancel-Soft -RowIndex ([int]$sf.rowIndex) -Name ("{0}b.cancel.frota" -f $f.i)
        }
        Start-Sleep -Milliseconds 500
      }
    },
    {
      $sDup = Invoke-MoviApi (New-SalvarParams -Tipo "Carro" -Plano "10min" -Veiculo "LV Carro 01" -CriancaSuffix "_DUP1")
      Expect-Ok $sDup "46.salvar.dup.base" ("row=$($sDup.rowIndex)") | Out-Null
      $sDup2 = Invoke-MoviApi (New-SalvarParams -Tipo "Carro" -Plano "10min" -Veiculo "LV Carro 01" -CriancaSuffix "_DUP2")
      Expect-Fail $sDup2 "47.reject.veiculo.ocupado" "" | Out-Null
      Cancel-Soft -RowIndex ([int]$sDup.rowIndex) -Name "48.cancel.dup.base"
    },
    {
      foreach ($pag in @("Credito", "PIX")) {
        $sp = Invoke-MoviApi (New-SalvarParams -Tipo "Triciclo" -Plano "60min" -Veiculo "LV Triciclo 01" -Pagamento $pag -CriancaSuffix "_$pag")
        if (Expect-Ok $sp ("49.pag.$pag") ("valor=$($sp.valorPlano)")) {
          if ([int]$sp.valorPlano -ne 65) { Add-Check "49b.preco.60min.$pag" "fail" "$($sp.valorPlano)" }
          else { Add-Check "49b.preco.60min.$pag" "ok" "R$65" }
          Cancel-Soft -RowIndex ([int]$sp.rowIndex) -Name ("49c.cancel.$pag")
        }
        Start-Sleep -Milliseconds 500
      }
    }
  )

  foreach ($bloco in $blocos) {
    try { & $bloco }
    catch { Add-Check "bloco.exception" "fail" $_.Exception.Message }
    Start-Sleep -Seconds 1
  }

  $result.status = if ($result.fail -eq 0) { "ok" } else { "fail" }
  $result.summary = ("pass={0} fail={1} skip={2} total={3}" -f $result.pass, $result.fail, $result.skip, $result.checks.Count)
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-Check "exception" "fail" $_.Exception.Message
}
finally {
  Write-Host "`n=== LIMPEZA ==="
  try {
    Start-Sleep -Seconds 3
    $ativasF = Invoke-MoviApi @{ action = "listarAtivas" }
    foreach ($a in @($ativasF.locacoes)) {
      $c = [string]$a.crianca
      $o = [string]$a.observacao
      $isTest = ($c -like "TESTE_*") -or ($o -match '\[TESTE\]')
      if (-not $isTest) { continue }
      try {
        Invoke-MoviApi (@{ action = "cancelarLocacao"; rowIndex = $a.rowIndex; motivo = "Suite40 finally" } + $op) | Out-Null
      } catch {}
    }
  } catch {
    Add-Check "99.pre.limpeza.ativas" "fail" $_.Exception.Message
  }

  try {
    $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet
    Add-Check "99.limpeza.gas" $(if ($cleanup.ok) { "ok" } else { "fail" }) $cleanup.detail
  } catch {
    Add-Check "99.limpeza.gas" "fail" $_.Exception.Message
  }

  try {
    Start-Sleep -Seconds 3
    $livres = Invoke-MoviApi @{ action = "listarAtivas" }
    $nAbertas = @($livres.locacoes).Count
    Add-Check "99c.operacao.abertas" $(if ($nAbertas -eq 0) { "ok" } else { "fail" }) "abertas=$nAbertas"
  } catch {
    Add-Check "99c.operacao.abertas" "fail" $_.Exception.Message
  }

  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $outPath = Join-Path $PSScriptRoot ("..\..\entregas\TESTE_LAVILLE_SUITE40_$stamp.json")
  $outPath = [IO.Path]::GetFullPath($outPath)
  $dir = Split-Path $outPath -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $result | ConvertTo-Json -Depth 8 | Set-Content -Path $outPath -Encoding UTF8
  Write-Host "`nResultado: $($result.summary)"
  Write-Host "JSON: $outPath"
  $result | ConvertTo-Json -Depth 8
  if ($result.status -ne "ok") { exit 1 }
}
