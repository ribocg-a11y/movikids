param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec",
  [switch]$RunWriteTests
)

$ErrorActionPreference = "Stop"

function Invoke-MoviApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 20
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    try { return $raw | ConvertFrom-Json } catch { throw "JSON invalido em $($Params.action): $raw" }
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
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  baseUrl = $BaseUrl
  writeTests = [bool]$RunWriteTests
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

  $inicio = Invoke-MoviApi @{ action = "carregarInicio" }
  Assert-Ok $inicio "carregarInicio"
  Add-Check "carregarInicio" "ok" ("ativos={0}; encerradasHoje={1}" -f $inicio.ativos.Count, $inicio.encHoje.Count)

  $ativas = Invoke-MoviApi @{ action = "listarAtivas" }
  Assert-Ok $ativas "listarAtivas"
  Add-Check "listarAtivas" "ok" ("total={0}" -f $ativas.total)

  if ($RunWriteTests) {
    $stamp = Get-Date -Format "HHmmss"
    $nomeTeste = "TESTE_CODEX_$stamp"

    $salvar = Invoke-MoviApi @{
      action = "salvarLocacao"
      tipo = "Carro"
      plano = "10min"
      veiculo = "Triciclo 01"
      pagamento = "PIX"
      responsavel = "TESTE_CODEX"
      crianca = $nomeTeste
      telefone = "98999999999"
      observacao = "Teste regressao safe v1.5.18"
    }
    Assert-Ok $salvar "salvarLocacao"
    if ($salvar.status -ne "Pendente") { throw "salvarLocacao deveria retornar Pendente; retornou $($salvar.status)" }
    if ([int64]$salvar.startTimestamp -ne 0) { throw "startTimestamp deveria ser 0; retornou $($salvar.startTimestamp)" }
    Add-Check "salvarLocacao pendente" "ok" ("id={0}" -f $salvar.id)

    Start-Sleep -Seconds 1
    $ativas2 = Invoke-MoviApi @{ action = "listarAtivas" }
    Assert-Ok $ativas2 "listarAtivas pos salvar"
    $loc = $ativas2.locacoes | Where-Object { $_.id -eq $salvar.id } | Select-Object -First 1
    if (-not $loc) { throw "Locacao de teste nao apareceu em listarAtivas" }
    if ($loc.status -ne "Pendente" -or $loc.started -ne $false -or [int64]$loc.startTimestamp -ne 0) {
      throw "Locacao pendente inconsistente: $($loc | ConvertTo-Json -Compress)"
    }
    Add-Check "listarAtivas pendente" "ok" ("rowIndex={0}" -f $loc.rowIndex)

    $editar = Invoke-MoviApi @{
      action = "editarLocacao"
      rowIndex = $loc.rowIndex
      responsavel = "TESTE_CODEX_EDITADO"
      pagamento = "Dinheiro"
      observacao = "Teste regressao editado antes de iniciar"
    }
    Assert-Ok $editar "editarLocacao"
    Add-Check "editarLocacao pendente" "ok" "pagamento=Dinheiro"

    $cancelar = Invoke-MoviApi @{
      action = "cancelarLocacao"
      rowIndex = $loc.rowIndex
      motivo = "Teste regressao Codex sem iniciar timer"
    }
    Assert-Ok $cancelar "cancelarLocacao"
    if ($cancelar.locacao.status -ne "Cancelada") { throw "Cancelamento retornou status $($cancelar.locacao.status)" }
    Add-Check "cancelarLocacao" "ok" ("id={0}" -f $cancelar.locacao.id)

    $ativas3 = Invoke-MoviApi @{ action = "listarAtivas" }
    Assert-Ok $ativas3 "listarAtivas pos cancelar"
    $sobrou = $ativas3.locacoes | Where-Object { $_.id -eq $salvar.id } | Select-Object -First 1
    if ($sobrou) { throw "Locacao de teste ainda aparece como ativa/pendente apos cancelar" }
    Add-Check "limpeza teste" "ok" "sem locacao teste ativa"
  } else {
    Add-Check "write tests" "skipped" "Use -RunWriteTests para criar/editar/cancelar uma locacao de teste"
  }

  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "ok"
  $result | ConvertTo-Json -Depth 6
  exit 0
} catch {
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "failed"
  $result.error = $_.Exception.Message
  $result | ConvertTo-Json -Depth 6
  exit 1
}
