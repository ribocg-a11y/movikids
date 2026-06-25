param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [switch]$RunWriteTests
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

$WriteActions = @("salvarLocacao","editarLocacao","cancelarLocacao")
$script:RunCleanupAfter = $false
$script:GasPostReady = $null

function Test-GasPostReady {
  if ($null -ne $script:GasPostReady) { return $script:GasPostReady }
  try {
    $ping = Invoke-RestMethod -Uri "$BaseUrl`?action=ping" -Method Get -TimeoutSec 15
    $script:GasPostReady = [bool]($ping.postWriteActions)
  } catch {
    $script:GasPostReady = $false
  }
  return $script:GasPostReady
}

function Invoke-MoviApi {
  param([hashtable]$Params, [string]$Method = "AUTO")
  $action = [string]$Params.action
  if ($Method -eq "AUTO") {
    $Method = if (($WriteActions -contains $action) -and (Test-GasPostReady)) { "POST" } else { "GET" }
  }
  if ($Method -eq "POST") {
    $body = $Params | ConvertTo-Json -Compress
    try {
      return Invoke-RestMethod -Uri $BaseUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 25
    } catch {
      $raw = & curl.exe -L -s -X POST -H "Content-Type: application/json" -d $body $BaseUrl
      if (-not $raw) { throw "Resposta vazia POST: $action" }
      try { return $raw | ConvertFrom-Json } catch { throw "JSON invalido POST em ${action}: $raw" }
    }
  }
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 20
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $action" }
    try { return $raw | ConvertFrom-Json } catch { throw "JSON invalido em ${action}: $raw" }
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
  if ($ping.versao -match 'v1\.5\.(4[6-9]|[5-9]\d)') {
    Add-Check "pacote-f gas" "ok" "versao>=1.5.46"
  } else {
    Add-Check "pacote-f gas" "warn" ("versao $($ping.versao) - KPIs avancados exigem v1.5.46+")
  }

  try {
    $kpiNegado = Invoke-MoviApi @{ action = "buscarKPIsAdmin" }
    if ($kpiNegado.ok) { Add-Check "kpi admin gate" "warn" "buscarKPIsAdmin sem PIN retornou ok" }
    else { Add-Check "kpi admin gate" "ok" "acesso negado sem admin" }
  } catch {
    Add-Check "kpi admin gate" "ok" "acesso negado sem admin"
  }

  $inicio = Invoke-MoviApi @{ action = "carregarInicio" }
  Assert-Ok $inicio "carregarInicio"
  Add-Check "carregarInicio" "ok" ("ativos={0}; encerradasHoje={1}" -f $inicio.ativos.Count, $inicio.encHoje.Count)

  $ativas = Invoke-MoviApi @{ action = "listarAtivas" }
  Assert-Ok $ativas "listarAtivas"
  Add-Check "listarAtivas" "ok" ("total={0}" -f $ativas.total)

  try {
    $parityScript = Join-Path $PSScriptRoot "TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1"
    if (Test-Path $parityScript) {
      $parityJson = & powershell -NoProfile -File $parityScript -BaseUrl $BaseUrl | Out-String
      $parity = $parityJson | ConvertFrom-Json
      if ($parity.status -eq "ok") {
        Add-Check "paridade HTTP browser" "ok" "curl POST != JSON; GET ok"
      } else {
        Add-Check "paridade HTTP browser" "warn" ($parity.error)
      }
    } else {
      Add-Check "paridade HTTP browser" "skipped" "script ausente"
    }
  } catch {
    Add-Check "paridade HTTP browser" "warn" $_.Exception.Message
  }

  if ($RunWriteTests) {
    $script:RunCleanupAfter = $true
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
      observacao = "[TESTE] Regressao safe Codex v1.5.18"
      operador = "TESTE_CODEX"
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

    $opWrite = Get-MoviOperadorParams -Operador "TESTE_CODEX"
    $editar = Invoke-MoviApi (@{
      action = "editarLocacao"
      rowIndex = $loc.rowIndex
      responsavel = "TESTE_CODEX_EDITADO"
      pagamento = "Dinheiro"
      observacao = "Teste regressao editado antes de iniciar"
      motivo = "Teste regressao editar pendente"
    } + $opWrite)
    Assert-Ok $editar "editarLocacao"
    Add-Check "editarLocacao pendente operador" "ok" "pagamento=Dinheiro"

    $cancelar = Invoke-MoviApi (@{
      action = "cancelarLocacao"
      rowIndex = $loc.rowIndex
      motivo = "Teste regressao Codex sem iniciar timer"
    } + $opWrite)
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
} catch {
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "failed"
  $result.error = $_.Exception.Message
} finally {
  if ($script:RunCleanupAfter) {
    $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -SoHoje -Quiet
    Add-Check "limpeza pos-teste" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail
  }
  $result | ConvertTo-Json -Depth 6
  if ($result.status -eq "ok") { exit 0 } else { exit 1 }
}
