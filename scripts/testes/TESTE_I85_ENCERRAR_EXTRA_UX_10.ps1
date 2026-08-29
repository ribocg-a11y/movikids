# I85 UX v1.9.98 — 10 testes reais distintos + limpeza
# Valida travas GAS (I85) alinhadas ao novo guia FE encerrar extras

param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$PagesBase = "https://ribocg-a11y.github.io/movikids",
  [string]$Operador = "TESTE_CODEX",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

function Invoke-MkApi {
  param([hashtable]$Params, [int]$TimeoutSec = 90)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec $TimeoutSec
  } catch {
    $raw = & curl.exe -L -s --max-time $TimeoutSec $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

function Invoke-PagesGet {
  param([string]$Path)
  $url = "$PagesBase/$Path"
  try {
    return (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30).Content
  } catch {
    $raw = & curl.exe -L -s --max-time 30 $url
    if (-not $raw) { throw "Pages vazio: $Path" }
    return $raw
  }
}

$result = [ordered]@{
  protocolo = "TESTE_I85_ENCERRAR_EXTRA_UX_10"
  versaoFeAlvo = "1.9.98"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  tests = @()
  rowsCriadas = @()
  status = "ok"
}

function Add-Test {
  param([string]$Id, [string]$Nome, [string]$Status, [string]$Detail = "")
  $script:result.tests += [ordered]@{
    id = $Id; nome = $Nome; status = $Status; detail = $Detail
  }
  if ($Status -eq "fail") { $script:result.status = "fail" }
  elseif ($Status -eq "warn" -and $script:result.status -eq "ok") { $script:result.status = "warn" }
  $icon = switch ($Status) { "ok" { "OK" } "fail" { "FAIL" } default { "WARN" } }
  Write-Host "[$icon] $Id — $Nome" -ForegroundColor $(if ($Status -eq "ok") { "Green" } elseif ($Status -eq "fail") { "Red" } else { "Yellow" })
  if ($Detail) { Write-Host "      $Detail" }
}

function New-TestLoc {
  param(
    [string]$Suffix,
    [string]$Pagamento = "PIX",
    [string]$Tipo = "Carro",
    [string]$Veiculo = "Carro 04"
  )
  $stamp = Get-Date -Format "HHmmss"
  $crianca = "I85UX_${Suffix}_$stamp"
  $op = Get-MoviOperadorParams -Operador $Operador
  $salvar = Invoke-MkApi (@{
    action = "salvarLocacao"
    tipo = $Tipo
    plano = "10min"
    veiculo = $Veiculo
    pagamento = $Pagamento
    responsavel = "TESTE_I85"
    crianca = $crianca
    telefone = "98999000001"
    observacao = "[TESTE] I85 encerrar extra UX v1.9.98"
  } + $op)
  if (-not $salvar.ok) { throw "salvarLocacao $Suffix : $($salvar.erro)" }
  $script:result.rowsCriadas += $salvar.rowIndex
  $ini = Invoke-MkApi @{
    action = "iniciarTimer"
    rowIndex = $salvar.rowIndex
    timestamp = [int64]([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
  }
  if (-not $ini.ok) { throw "iniciarTimer $Suffix : $($ini.erro)" }
  return [ordered]@{
    rowIndex = $salvar.rowIndex
    id = $salvar.id
    crianca = $crianca
    mins = 10
    pagamento = $Pagamento
  }
}

try {
  # T01 — Pages versão FE
  $verJs = Invoke-PagesGet "mk-version.js"
  if ($verJs -match "MK_VERSION = '1\.9\.98'") {
    Add-Test "T01" "GitHub Pages mk-version.js = v1.9.98" "ok" "live confirmado"
  } else {
    Add-Test "T01" "GitHub Pages mk-version.js = v1.9.98" "fail" "conteudo inesperado"
  }

  # T02 — módulo mk-enc-extra.js publicado
  $extraJs = Invoke-PagesGet "mk-enc-extra.js"
  if ($extraJs -match "mkEncExtraPickPag_" -and $extraJs -match "mkEncExtraUpdateConfirmBtn_") {
    Add-Test "T02" "mk-enc-extra.js no Pages com funções guia" "ok" "modulo I85 UX presente"
  } else {
    Add-Test "T02" "mk-enc-extra.js no Pages com funções guia" "fail" "arquivo ausente ou incompleto"
  }

  # T03 — index.html UI alerta + checklist
  $html = Invoke-PagesGet "index.html"
  if ($html -match "alert-enc-extra-wrap" -and $html -match "enc-checklist" -and $html -match "enc-extra-same-btn") {
    Add-Test "T03" "index.html alerta extras + checklist + atalho mesmo pagamento" "ok" "markup guia operador"
  } else {
    Add-Test "T03" "index.html alerta extras + checklist + atalho mesmo pagamento" "fail" "markup nao encontrado"
  }

  # T04 — GAS: encerrar sem operador
  $semOp = Invoke-MkApi @{ action = "encerrarLocacao"; rowIndex = 99999; minUsados = 10 }
  if (-not $semOp.ok -and $semOp.code -eq 401) {
    Add-Test "T04" "GAS bloqueia encerrar sem operador (401)" "ok" $semOp.erro
  } else {
    Add-Test "T04" "GAS bloqueia encerrar sem operador (401)" "fail" ($semOp | ConvertTo-Json -Compress)
  }

  $op = Get-MoviOperadorParams -Operador $Operador

  # T05 — extras sem extraPagamento -> 400 I85
  $locA = New-TestLoc -Suffix "SEM_PAG" -Veiculo "Carro 01"
  $bloq = Invoke-MkApi (@{
    action = "encerrarLocacao"
    rowIndex = $locA.rowIndex
    minUsados = 15
  } + $op)
  if (-not $bloq.ok -and ($bloq.code -eq 400 -or $bloq.erro -match "pagos")) {
    Add-Test "T05" "GAS rejeita extra sem forma de pagamento (I85)" "ok" $bloq.erro
  } else {
    Add-Test "T05" "GAS rejeita extra sem forma de pagamento (I85)" "fail" ($bloq | ConvertTo-Json -Compress)
  }

  # T06 — extras com PIX -> encerrada
  $okPix = Invoke-MkApi (@{
    action = "encerrarLocacao"
    rowIndex = $locA.rowIndex
    minUsados = 15
    extraPagamento = "PIX"
  } + $op)
  if ($okPix.ok -and $okPix.status -eq "Encerrada") {
    Add-Test "T06" "GAS encerra com extraPagamento=PIX" "ok" ("id={0}; valorTotal={1}" -f $okPix.id, $okPix.valorTotal)
  } else {
    Add-Test "T06" "GAS encerra com extraPagamento=PIX" "fail" ($okPix.erro)
  }

  # T07 — só plano (minUsados=10) sem extraPagamento -> ok
  $locB = New-TestLoc -Suffix "SO_PLANO" -Veiculo "Carro 03"
  $okPlano = Invoke-MkApi (@{
    action = "encerrarLocacao"
    rowIndex = $locB.rowIndex
    minUsados = 10
  } + $op)
  if ($okPlano.ok -and $okPlano.status -eq "Encerrada") {
    Add-Test "T07" "GAS encerra sem extra quando minUsados = plano" "ok" ("row={0}" -f $locB.rowIndex)
  } else {
    Add-Test "T07" "GAS encerra sem extra quando minUsados = plano" "fail" ($okPlano.erro)
  }

  # T08 — cancelar extras justificativa curta -> 400
  $locC = New-TestLoc -Suffix "CANCEL" -Veiculo "Triciclo 01"
  $justCurta = Invoke-MkApi (@{
    action = "encerrarLocacao"
    rowIndex = $locC.rowIndex
    minUsados = 14
    cancelarExtras = "true"
    justificativaExtras = "abc"
  } + $op)
  if (-not $justCurta.ok -and $justCurta.code -eq 400) {
    Add-Test "T08" "GAS rejeita cancelar extras com justificativa curta" "ok" $justCurta.erro
  } else {
    Add-Test "T08" "GAS rejeita cancelar extras com justificativa curta" "fail" ($justCurta | ConvertTo-Json -Compress)
  }

  # T09 — cancelar extras (paridade FE: minUsados = mins do plano)
  $justOk = Invoke-MkApi (@{
    action = "encerrarLocacao"
    rowIndex = $locC.rowIndex
    minUsados = $locC.mins
    cancelarExtras = "true"
    justificativaExtras = "Teste I85 UX — acordo operacional validacao"
    minExtraCancelados = 4
  } + $op)
  if ($justOk.ok -and $justOk.status -eq "Encerrada") {
    Add-Test "T09" "GAS encerra cancelando extras com justificativa valida" "ok" ("minAdicionais pos={0}" -f $justOk.minAdicionais)
  } else {
    Add-Test "T09" "GAS encerra cancelando extras com justificativa valida" "fail" ($justOk.erro)
  }

  # T10 — mesmo pagamento do plano (Debito) + extra
  $locD = New-TestLoc -Suffix "DEBITO" -Pagamento "Debito" -Veiculo "Pelúcia 02"
  $okDeb = Invoke-MkApi (@{
    action = "encerrarLocacao"
    rowIndex = $locD.rowIndex
    minUsados = 13
    extraPagamento = "Debito"
  } + $op)
  if ($okDeb.ok -and $okDeb.status -eq "Encerrada") {
    Add-Test "T10" "GAS encerra extra com mesmo pagamento Debito (atalho FE)" "ok" ("valorAdicional={0}" -f $okDeb.valorAdicional)
  } else {
    Add-Test "T10" "GAS encerra extra com mesmo pagamento Debito (atalho FE)" "fail" ($okDeb.erro)
  }

} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
} finally {
  Write-Host "`n--- Limpeza ---" -ForegroundColor Cyan
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje
  Add-Test "LIMPEZA" "limparLocacoesTesteAdmin (so hoje)" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail

  $ativas = Invoke-MkApi @{ action = "listarAtivas" }
  $testeAtivas = @()
  if ($ativas.ok -and $ativas.locacoes) {
    $testeAtivas = @($ativas.locacoes | Where-Object {
      $_.crianca -match "I85UX_" -or $_.responsavel -eq "TESTE_I85"
    })
  }
  if ($testeAtivas.Count -eq 0) {
    Add-Test "POS" "Nenhuma locacao I85UX ativa apos limpeza" "ok" "total ativas=$($ativas.total)"
  } else {
    Add-Test "POS" "Nenhuma locacao I85UX ativa apos limpeza" "warn" ("ainda ativas: " + ($testeAtivas.crianca -join ", "))
  }

  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $okN = @($result.tests | Where-Object { $_.status -eq "ok" }).Count
  $result.summary = "$okN/$($result.tests.Count) ok; status=$($result.status)"
  Write-Host "`n$result.summary" -ForegroundColor Cyan
  $result | ConvertTo-Json -Depth 8
  if ($result.status -eq "fail") { exit 1 }
  exit 0
}
