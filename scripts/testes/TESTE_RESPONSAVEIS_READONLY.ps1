# I59 — RESPONSAVEIS readonly: audit + validarSchema + listarResponsaveis
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
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 120
}

$result = [ordered]@{ startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); checks = @() }

function Add-RespCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-RespCheck "ping" "ok" $ping.versao

  $dry = Invoke-MkApi @{
    action = "repararResponsaveisPlanilhaAdmin"
    adminPin = $AdminPin
    dryRun = "1"
  }
  if (-not $dry.ok) { throw "dryRun repair falhou: $($dry.erro)" }
  $nProb = @($dry.audit.problemas).Count
  Add-RespCheck "responsaveis.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("cadastros=" + $dry.audit.cadastrosPlanilha + " prob=" + $nProb)

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  $resp = $schema.resultado.RESPONSAVEIS
  if ($resp.ok) { Add-RespCheck "validarSchema.RESPONSAVEIS" "ok" ("cadastros=" + $resp.cadastros) }
  else { Add-RespCheck "validarSchema.RESPONSAVEIS" "warn" ("faltando=" + @($resp.faltando).Count) }

  $lista = Invoke-MkApi @{ action = "listarResponsaveis"; limite = "20" }
  if (-not $lista.ok) { throw "listarResponsaveis falhou: $($lista.erro)" }
  if ($lista.total -lt 1) { throw "listarResponsaveis total=0" }
  Add-RespCheck "listarResponsaveis" "ok" ("total=" + $lista.total)

  $result.status = "ok"
  $result.summary = "RESPONSAVEIS readonly OK - total=" + $lista.total + " cadastros planilha=" + $resp.cadastros
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-RespCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
if ($result.status -ne "ok") { exit 1 }
