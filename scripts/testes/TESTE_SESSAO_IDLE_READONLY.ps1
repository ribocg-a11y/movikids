param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 30
}

$result = [ordered]@{
  suite = "TESTE_SESSAO_IDLE_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-SCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-SCheck "ping" "ok" $ping.versao
  if ($ping.versao -notmatch 'v1\.5\.72') {
    Add-SCheck "gas.versao" "warn" "publique GAS v1.5.72 (Nova versao Web) para idle 1h no servidor"
  }

  $ops = Invoke-MkApi @{ action = "listarOperadoresLogin" }
  if (-not $ops.ok) { throw "listarOperadoresLogin falhou" }
  Add-SCheck "listarOperadoresLogin" "ok" "operadores=$($ops.operadores.Count)"
  if ($null -ne $ops.sessaoAtiva) {
    Add-SCheck "sessaoAtiva.campo" "ok" ("nome=" + $ops.sessaoAtiva.nome)
  } else {
    Add-SCheck "sessaoAtiva.campo" "ok" "livre"
  }

  $touch = Invoke-MkApi @{ action = "touchSessaoOperador"; operadorId = "1" }
  if ($touch.ok) {
    Add-SCheck "touch.semSessao" "warn" "touch ok sem sessao — revisar GAS"
  } else {
    Add-SCheck "touch.semSessao" "ok" ($touch.erro)
  }

  $lib = Invoke-MkApi @{ action = "liberarSessaoOperadorAdmin"; adminPin = $AdminPin }
  if (-not $lib.ok) { throw "liberarSessaoOperadorAdmin falhou: $($lib.erro)" }
  Add-SCheck "liberarSessaoOperadorAdmin" "ok" ($lib.mensagem)

  $result.status = "ok"
  $result.summary = "APIs de sessao/idle presentes; GAS v1.5.72+ recomendado"
} catch {
  $result.status = "fail"
  $result.summary = $_.Exception.Message
  Add-SCheck "erro" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6

if ($result.status -ne "ok") { exit 1 }
