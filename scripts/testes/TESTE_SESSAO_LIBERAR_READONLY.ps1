param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
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
  suite = "TESTE_SESSAO_LIBERAR_READONLY"
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

  $opsBefore = Invoke-MkApi @{ action = "listarOperadoresLogin"; _t = [string][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  if (-not $opsBefore.ok) { throw "listarOperadoresLogin falhou" }
  Add-SCheck "listarOperadoresLogin" "ok" ("operadores=" + $opsBefore.operadores.Count)
  if ($null -ne $opsBefore.sessaoAtiva -and $opsBefore.sessaoAtiva.nome) {
    Add-SCheck "sessaoAtiva.antes" "ok" ("nome=" + $opsBefore.sessaoAtiva.nome)
  } else {
    Add-SCheck "sessaoAtiva.antes" "ok" "livre"
  }

  $lib = Invoke-MkApi @{ action = "liberarSessaoOperadorAdmin"; adminPin = $AdminPin; _t = [string][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  if (-not $lib.ok) { throw "liberarSessaoOperadorAdmin falhou: $($lib.erro)" }
  Add-SCheck "liberarSessaoOperadorAdmin" "ok" ($lib.mensagem)

  $opsAfter = Invoke-MkApi @{ action = "listarOperadoresLogin"; _t = [string][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  if (-not $opsAfter.ok) { throw "listarOperadoresLogin pos-liberar falhou" }
  if ($null -ne $opsAfter.sessaoAtiva -and $opsAfter.sessaoAtiva.nome) {
    Add-SCheck "sessaoAtiva.depois" "warn" ("ainda=" + $opsAfter.sessaoAtiva.nome)
  } else {
    Add-SCheck "sessaoAtiva.depois" "ok" "livre"
  }

  $libSemPin = Invoke-MkApi @{ action = "liberarSessaoOperadorAdmin"; _t = [string][DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  if ($libSemPin.ok) {
    Add-SCheck "liberar.semPin" "warn" "aceitou sem PIN (revisar GAS)"
  } else {
    Add-SCheck "liberar.semPin" "ok" ($libSemPin.erro)
  }

  $result.status = "ok"
  $result.summary = "API liberar sessao admin OK (I28)"
} catch {
  $result.status = "fail"
  $result.summary = $_.Exception.Message
  Add-SCheck "erro" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6

if ($result.status -ne "ok") { exit 1 }
