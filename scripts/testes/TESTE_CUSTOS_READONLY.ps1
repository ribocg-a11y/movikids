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

function Add-CusCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-CusCheck "ping" "ok" $ping.versao

  $custos = Invoke-MkApi @{
    action = "listarCustos"
    adminPin = $AdminPin
    authRole = "admin"
    mes = [string](Get-Date).Month
    ano = [string](Get-Date).Year
  }
  if (-not $custos.ok) { throw "listarCustos falhou: $($custos.erro)" }
  Add-CusCheck "listarCustos" "ok" ("total=" + $custos.total + " soma=" + $custos.soma)

  $hoje = Get-Date -Format "dd/MM/yyyy"
  $resumo = Invoke-MkApi @{ action = "resumoDia"; data = $hoje; adminPin = $AdminPin }
  if (-not $resumo.ok) { throw "resumoDia falhou: $($resumo.erro)" }
  if ($null -eq $resumo.custos) { throw "resumoDia sem custos" }
  Add-CusCheck "resumoDia.custos" "ok" ("hoje=" + @($resumo.custos).Count)

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  $cus = $schema.resultado.CUSTOS
  if ($cus.ok) { Add-CusCheck "validarSchema.CUSTOS" "ok" "headers ok" }
  else { Add-CusCheck "validarSchema.CUSTOS" "warn" "schema incompleto" }

  $result.status = "ok"
  $result.summary = "CUSTOS readonly OK - mes $($custos.total) registros soma $($custos.soma)"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-CusCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
if ($result.status -ne "ok") { exit 1 }
