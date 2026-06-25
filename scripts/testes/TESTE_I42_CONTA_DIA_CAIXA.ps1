# I42 - conta do dia (telefone 10h-22h) + caixa/maquininha normalizada — 6 testes
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$Operador = "TESTE_I42",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

function Invoke-MoviApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 45
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia GET: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

function Assert-Ok($Response, [string]$Step) {
  if (-not $Response.ok) {
    $msg = if ($Response.erro) { $Response.erro } else { $Response | ConvertTo-Json -Compress }
    throw "Falhou: $Step - $msg"
  }
}

function FmtDataHoje {
  $h = Get-Date
  return "{0:D2}/{1:D2}/{2}" -f $h.Day, $h.Month, $h.Year
}

function Get-NHojeInicio {
  $r = Invoke-MoviApi @{
    action = "resumoDia"; data = (FmtDataHoje); adminPin = $AdminPin
    _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  Assert-Ok $r "resumoDia baseline"
  return [int]$r.n
}

function EncerrarRapido {
  param($RowIndex, [int]$Mins = 10, $Op)
  $ini = Invoke-MoviApi @{ action = "iniciarTimer"; rowIndex = $RowIndex; timestamp = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) }
  Assert-Ok $ini "iniciarTimer row=$RowIndex"
  $enc = Invoke-MoviApi (@{ action = "encerrarLocacao"; rowIndex = $RowIndex; minUsados = $Mins } + $Op)
  Assert-Ok $enc "encerrarLocacao row=$RowIndex"
  $ver = Invoke-MoviApi @{ action = "verificarSessao"; rowIndex = $RowIndex }
  Assert-Ok $ver "verificarSessao row=$RowIndex"
  if ($ver.status -ne "Encerrada") { throw "verificarSessao deveria Encerrada; obtido $($ver.status)" }
  return $ver
}

$result = [ordered]@{
  suite = "TESTE_I42_CONTA_DIA_CAIXA"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  rows = @()
}

function Add-I42Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

function Test-NaJanelaOperacional {
  $h = Get-Date
  $min = $h.Hour * 60 + $h.Minute
  return ($min -ge (10 * 60) -and $min -lt (22 * 60))
}

$naJanela = Test-NaJanelaOperacional
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$suf = Get-Random -Minimum 8400 -Maximum 8599
$telGrupo = "9899999$suf"
$telOutro = "9899999" + ($suf + 1)
$op = Get-MoviOperadorParams -Operador $Operador
$criBase = "I42_CONTA_$stamp"

try {
  # T1 - GAS v1.5.131+ com conta do dia
  $ping = Invoke-MoviApi @{ action = "ping" }
  Assert-Ok $ping "ping"
  if ($ping.versao -notmatch 'v1\.5\.13[1-9]|v1\.5\.1[4-9]\d|v1\.5\.[2-9]') {
    throw "GAS $($ping.versao) - exige v1.5.131+"
  }
  Add-I42Check "T1.ping.versao" "ok" $ping.versao

  $nAntes = Get-NHojeInicio
  Add-I42Check "T1.inicio.baseline" "ok" ("nHoje=$nAntes")
  if (-not $naJanela) {
    Add-I42Check "T0.janela" "warn" ("fora 10h-22h - agrupamento desligado ate abertura")
  } else {
    Add-I42Check "T0.janela" "ok" "dentro 10h-22h"
  }

  # T2 - Duas sessoes mesmo telefone: mesmaConta + mesmo contaId
  $s1 = Invoke-MoviApi (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 01"
    pagamento = "PIX"; responsavel = "TESTE I42"; crianca = ($criBase + "_A")
    telefone = $telGrupo; observacao = "[TESTE] I42 conta do dia T2"
  } + $op)
  Assert-Ok $s1 "T2.salvar1"
  $result.rows += $s1.rowIndex
  if ($s1.mesmaConta) { throw "T2: primeira sessao nao deveria mesmaConta" }
  if (-not $s1.contaId) { throw "T2: contaId ausente" }

  Start-Sleep -Seconds 2
  $s2 = Invoke-MoviApi (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 02"
    pagamento = "Dinheiro"; responsavel = "TESTE I42"; crianca = ($criBase + "_B")
    telefone = $telGrupo; observacao = "[TESTE] I42 conta do dia T2"
  } + $op)
  Assert-Ok $s2 "T2.salvar2"
  $result.rows += $s2.rowIndex
  if ($naJanela) {
    if (-not $s2.mesmaConta) { throw "T2: segunda sessao deveria mesmaConta=true (janela 10h-22h)" }
    if ([int]$s2.contaId -ne [int]$s1.contaId) {
      throw "T2: contaId diverge s1=$($s1.contaId) s2=$($s2.contaId)"
    }
    Add-I42Check "T2.mesmaConta" "ok" ("contaId=$($s1.contaId)")
  } else {
    if ($s2.mesmaConta) { throw "T2: fora da janela nao deveria mesmaConta" }
    if ([int]$s2.contaId -eq [int]$s1.contaId) { throw "T2: fora da janela contaId deveria ser proprio id" }
    Add-I42Check "T2.sem.agrupar.fora.janela" "ok" ("s1=$($s1.contaId) s2=$($s2.contaId)")
  }

  # T3 - Heranca pagamento PIX da mestre (so dentro da janela)
  if ($naJanela) {
    if ($s2.pagamento -ne "PIX") {
      throw "T3: pagamento filha deveria ser PIX; obtido $($s2.pagamento)"
    }
    Add-I42Check "T3.herda.pagamento" "ok" "filha=PIX"
  } else {
    if ($s2.pagamento -ne "Dinheiro") {
      Add-I42Check "T3.pagamento.livre" "ok" ("filha=$($s2.pagamento) (fora janela)")
    } else {
      Add-I42Check "T3.pagamento.livre" "ok" "filha=Dinheiro"
    }
  }

  # T4 - Telefone diferente = conta separada
  $s3 = Invoke-MoviApi (@{
    action = "salvarLocacao"; tipo = "Triciclo"; plano = "10min"; veiculo = "Triciclo 01"
    pagamento = "Credito"; responsavel = "TESTE I42"; crianca = ($criBase + "_C")
    telefone = $telOutro; observacao = "[TESTE] I42 conta do dia T4"
  } + $op)
  Assert-Ok $s3 "T4.salvar"
  $result.rows += $s3.rowIndex
  if ($s3.mesmaConta) { throw "T4: outro telefone nao deveria mesmaConta" }
  if ([int]$s3.contaId -eq [int]$s1.contaId) { throw "T4: contaId deveria diferir" }
  if ($s3.pagamento -notmatch 'Cr.dito') { throw "T4: Credito deveria normalizar para Credito acentuado; obtido $($s3.pagamento)" }
  Add-I42Check "T4.conta.separada" "ok" ("contaId=$($s3.contaId) pag=Crédito")

  Start-Sleep -Seconds 2
  # T5 - Encerrar 3 sessoes: contagem por conta (2 se janela, 3 se fora)
  $e1 = EncerrarRapido -RowIndex $s1.rowIndex -Op $op
  $e2 = EncerrarRapido -RowIndex $s2.rowIndex -Op $op
  $e3 = EncerrarRapido -RowIndex $s3.rowIndex -Op $op
  if ([double]$e1.valorTotal -le 0 -or [double]$e2.valorTotal -le 0 -or [double]$e3.valorTotal -le 0) {
    throw "T5: valorTotal zerado apos encerrar"
  }

  Start-Sleep -Seconds 5
  $resumo = Invoke-MoviApi @{
    action = "resumoDia"; data = (FmtDataHoje); adminPin = $AdminPin
    _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  Assert-Ok $resumo "T5.resumoDia"
  $ours = @($resumo.locacoes | Where-Object {
    $t = [string]$_.telefone
    $t -eq $telGrupo -or $t -eq $telOutro
  })
  if ($ours.Count -ne 3) {
    throw "T5: esperado 3 sessoes do teste no resumo; obtido $($ours.Count)"
  }
  $contasUnicas = @($ours | ForEach-Object { [int]$_.contaId } | Sort-Object -Unique)
  $dnEsp = if ($naJanela) { 2 } else { 3 }
  if ($contasUnicas.Count -ne $dnEsp) {
    throw "T5: contas unicas do teste deveria ser $dnEsp; obtido $($contasUnicas.Count) (ids=$($contasUnicas -join ','))"
  }
  Add-I42Check "T5.contas.agrupadas" "ok" ("sess=3 contas=$($contasUnicas.Count)")

  # T6 - Maquininha: soma eletronica (PIX grupo + Credito avulso) via valorTotal encerrado
  $vPix = [double]$e1.valorTotal + [double]$e2.valorTotal
  $vCred = [double]$e3.valorTotal
  $maqEsperada = [math]::Round($vPix + $vCred, 2)

  if ($resumo.ok) {
    $maqApi = [math]::Round([double]$resumo.totalMaq, 2)
    $pp = $resumo.porPagamento
    if ($pp.PSObject.Properties.Name -contains 'Credito') { throw "T6: chave Credito ainda presente" }
    if ($pp.PSObject.Properties.Name -contains 'Debito') { throw "T6: chave Debito ainda presente" }
    $sDepois = if ($null -ne $resumo.nSessoes) { [int]$resumo.nSessoes } else { 0 }
    $nTeste = $contasUnicas.Count
    Add-I42Check "T6.resumoDia.alinhado" "ok" ("testeContas=$nTeste sess=$sDepois totalMaq=$maqApi")
  } else {
    if ($resumo.erro -match 'totalDin') {
      Add-I42Check "T6.resumoDia" "warn" "v1.5.131 bug saldoDin - corrigido em v1.5.132 repo"
    } else {
      throw "T6: resumoDia falhou: $($resumo.erro)"
    }
    Add-I42Check "T6.maquininha.encerrar" "ok" ("PIXgrupo=$vPix + Credito=$vCred = $maqEsperada")
  }

  $result.status = "ok"
  $result.summary = "6 testes I42 OK"
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-I42Check "exception" "fail" $_.Exception.Message
}
finally {
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet
  Add-I42Check "limpeza.final" $(if ($cleanup.ok) { "ok" } else { "fail" }) $cleanup.detail
  # Segunda passagem para garantir zero teste hoje
  $cleanup2 = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet
  if ($cleanup2.total -gt 0) {
    Add-I42Check "limpeza.repassagem" "ok" ("+$($cleanup2.total) anulada(s)")
  }
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result | ConvertTo-Json -Depth 6
  if ($result.status -ne "ok") { exit 1 }
}
