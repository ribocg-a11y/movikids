param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-MoviApiF {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 30
}

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-FCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MoviApiF @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-FCheck "ping" "ok" $ping.versao

  $kpi = Invoke-MoviApiF @{ action = "buscarKPIsAdmin"; adminPin = $AdminPin }
  if (-not $kpi.ok) { throw "buscarKPIsAdmin falhou: $($kpi.erro)" }

  $required = @("porOperador", "cancelamentos", "ocupacaoFrota", "cusPorCategoria", "recorrenciaClientes", "horasPico")
  foreach ($field in $required) {
    if ($null -eq $kpi.$field) { throw "campo ausente: $field" }
    Add-FCheck "kpi.$field" "ok" "presente"
  }

  if ($null -eq $kpi.porSemana) {
    Add-FCheck "kpi.porSemana" "warn" "ausente - publique GAS v1.5.51+ (Nova versao Web)"
  } elseif ($kpi.porSemana.Count -lt 1) {
    Add-FCheck "kpi.porSemana" "warn" "lista vazia"
  } else {
    $s0 = $kpi.porSemana[0]
    $hasMelhor = ($null -ne $s0.melhorDia) -or ($kpi.porSemana | Where-Object { $_.fat -gt 0 } | Select-Object -First 1)
    Add-FCheck "kpi.porSemana" "ok" ("semanas=" + $kpi.porSemana.Count + "; melhorSemana=" + $kpi.melhorSemanaLabel)
    if ($s0.insights -and $s0.insights.Count -gt 0) {
      Add-FCheck "kpi.porSemana.insights" "ok" "presente"
    }
  }

  $preview = Invoke-MoviApiF @{ action = "buscarPreviewRelatorio"; mes = (Get-Date).Month; ano = (Get-Date).Year }
  if (-not $preview.ok -or -not $preview.html) { throw "preview relatorio falhou" }
  if ($preview.html -notmatch "Gestao Avancada") {
    Add-FCheck "pdf pacote-f" "warn" "HTML sem secao Gestao Avancada (implante GAS v1.5.48+)"
  } else {
    Add-FCheck "pdf pacote-f" "ok" "secao Gestao Avancada no HTML"
  }

  $inicioOp = Invoke-MoviApiF @{ action = "carregarInicio"; operador = "TESTE_PACOTE_F" }
  if (-not $inicioOp.ok) { throw "carregarInicio operador falhou" }
  if ($null -ne $inicioOp.statsHoje.fat) {
    Add-FCheck "operador sem fat home" "warn" "statsHoje.fat exposto ao operador"
  } else {
    Add-FCheck "operador sem fat home" "ok" "statsHoje so contagem"
  }

  $stamp = Get-Date -Format "HHmmss"
  $salvar = Invoke-MoviApiF @{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 01"
    pagamento = "PIX"; responsavel = "TESTE_PACOTE_F"; crianca = "PF_EDIT_$stamp"
    telefone = "98999999999"; observacao = "[TESTE] Pacote F operador edit"
    operador = "TESTE_PACOTE_F"
  }
  if (-not $salvar.ok) { throw "salvarLocacao teste Pacote F falhou" }
  $editOp = Invoke-MoviApiF @{
    action = "editarLocacao"; rowIndex = $salvar.rowIndex; pagamento = "Dinheiro"
    motivo = "Teste Pacote F operador editar"; operador = "TESTE_PACOTE_F"
  }
  if (-not $editOp.ok) {
    Add-FCheck "operador editar" "warn" ("falhou: " + $editOp.erro + "; publique GAS v1.5.52+")
  } else {
    Add-FCheck "operador editar" "ok" $editOp.locacao.pagamento
  }
  $cancelOp = Invoke-MoviApiF @{
    action = "cancelarLocacao"; rowIndex = $salvar.rowIndex
    motivo = "Teste Pacote F operador cancelar"; operador = "TESTE_PACOTE_F"
  }
  if (-not $cancelOp.ok) {
    Add-FCheck "operador cancelar" "warn" ("falhou: " + $cancelOp.erro + "; publique GAS v1.5.52+")
  } else {
    Add-FCheck "operador cancelar" "ok" $cancelOp.locacao.status
  }

  $result.status = "ok"
} catch {
  $result.status = "failed"
  $result.error = $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5
if ($result.status -eq "ok") { exit 0 } else { exit 1 }
