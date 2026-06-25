# I60 — RELATORIOS readonly: audit + validarSchema + listarRelatorios
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
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 60
}

$result = [ordered]@{ startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); checks = @() }

function Add-RelCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-RelCheck "ping" "ok" $ping.versao

  $dry = Invoke-MkApi @{
    action = "repararRelatoriosPlanilhaAdmin"
    adminPin = $AdminPin
    dryRun = "1"
  }
  if (-not $dry.ok) { throw "dryRun repair falhou: $($dry.erro)" }
  Add-RelCheck "relatorios.audit" "ok" ("registros=" + $dry.audit.registros + " prob=" + @($dry.audit.problemas).Count)

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  $rel = $schema.resultado.RELATORIOS
  if ($rel.ok) { Add-RelCheck "validarSchema.RELATORIOS" "ok" ("registros=" + $rel.registros) }
  else { Add-RelCheck "validarSchema.RELATORIOS" "warn" ("faltando=" + @($rel.faltando).Count) }

  $lista = Invoke-MkApi @{ action = "listarRelatorios" }
  if (-not $lista.ok) { throw "listarRelatorios falhou" }
  Add-RelCheck "listarRelatorios" "ok" ("total=" + @($lista.relatorios).Count)

  $result.status = "ok"
  $result.summary = "RELATORIOS readonly OK - " + @($lista.relatorios).Count + " PDF(s) indexados"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-RelCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
if ($result.status -ne "ok") { exit 1 }
