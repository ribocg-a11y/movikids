# I43 — carregarInicio deve devolver startTimestamp apos iniciarTimer (regressao I42/I20)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$Operador = "TESTE_I43",
  [string]$AdminPin = "1416"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$GasFile = Join-Path $RepoRoot "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"

function Invoke-MoviApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
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

$result = [ordered]@{
  suite = "TESTE_I43_CARREGAR_INICIO_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-I43Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  if (-not (Test-Path $GasFile)) { throw "GAS canonico ausente" }
  $gs = Get-Content -Path $GasFile -Raw -Encoding UTF8
  if ($gs -notmatch 'const COL_LOC_READ_\s*=\s*28') {
    throw "COL_LOC_READ_ = 28 ausente no .gs (I43)"
  }
  if ($gs -match 'function carregarInicio_[\s\S]{0,12000}getRange\([^\)]*COL_CONTA_ID_\)[\s\S]{0,2000}r\[24\]') {
    throw "carregarInicio: getRange COL_CONTA_ID_ com r[24] - regressao I43"
  }
  if ($gs -notmatch 'function carregarInicio_[\s\S]{0,12000}COL_LOC_READ_') {
    throw "carregarInicio sem COL_LOC_READ_ (I43)"
  }
  Add-I43Check "static.COL_LOC_READ_" "ok" "28 cols"

  $syncFile = Join-Path $RepoRoot "mk-sync.js"
  if (Test-Path $syncFile) {
    $sync = Get-Content -Path $syncFile -Raw -Encoding UTF8
    if ($sync -notmatch 'isAtiva && \(!startTimestamp') {
      throw "mk-sync.js sem guard I43 Ativa sem startTimestamp"
    }
    Add-I43Check "static.mk-sync.i43" "ok" "merge preserva ts local"
  }

  $ping = Invoke-MoviApi @{ action = "ping" }
  Assert-Ok $ping "ping"
  Add-I43Check "ping" "ok" $ping.versao

  $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
  $tel = "9899999" + (Get-Random -Minimum 8600 -Maximum 8699)
  $op = Get-MoviOperadorParams -Operador $Operador

  $salvar = Invoke-MoviApi (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "Carro 01"
    pagamento = "PIX"; responsavel = "TESTE I43"; crianca = "TESTE_I43_$stamp"
    telefone = $tel; observacao = "[TESTE] I43 carregarInicio col Y"
  } + $op)
  Assert-Ok $salvar "salvarLocacao"
  $row = [int]$salvar.rowIndex
  Add-I43Check "salvarLocacao" "ok" ("row=$row")

  Start-Sleep -Seconds 2
  $clickTs = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $iniciar = Invoke-MoviApi (@{ action = "iniciarTimer"; rowIndex = $row; timestamp = $clickTs } + $op)
  Assert-Ok $iniciar "iniciarTimer"
  $tsInicio = [int64]$iniciar.startTimestamp
  if ($tsInicio -lt 1e12) { throw "iniciarTimer startTimestamp invalido: $tsInicio" }
  Add-I43Check "iniciarTimer" "ok" ("ts=$tsInicio")

  Start-Sleep -Seconds 2
  $adm = Get-MoviAdminSupervisorParams -AdminPin $AdminPin
  $ci = Invoke-MoviApi (@{ action = "carregarInicio"; _t = $clickTs } + $adm)
  Assert-Ok $ci "carregarInicio"
  $ativo = @($ci.ativos | Where-Object { [int]$_.rowIndex -eq $row } | Select-Object -First 1)
  if (-not $ativo) { throw "locacao nao apareceu em carregarInicio.ativos" }
  if ($ativo.status -ne "Ativa") { throw "carregarInicio status=$($ativo.status) esperado Ativa" }
  $tsCi = [int64]$ativo.startTimestamp
  if ($tsCi -lt 1e12) {
    throw "I43 REGRESSAO: carregarInicio startTimestamp=0 com status Ativa (col Y fora do getRange?)"
  }
  if ($tsCi -ne $tsInicio) {
    throw "ts diverge: iniciar=$tsInicio carregar=$tsCi"
  }
  if (-not $ativo.started) { throw "carregarInicio started=false com ts valido" }
  Add-I43Check "carregarInicio.paridade" "ok" ("ts=$tsCi started=true")

  $result.status = "ok"
  $result.summary = "I43 carregarInicio col Y OK"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-I43Check "exception" "fail" $_.Exception.Message
} finally {
  $cleanup = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet
  Add-I43Check "limpeza" $(if ($cleanup.ok) { "ok" } else { "warn" }) $cleanup.detail
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result | ConvertTo-Json -Depth 6
  if ($result.status -ne "ok") { exit 1 }
}
