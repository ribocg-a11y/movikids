param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
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

  $preview = Invoke-MoviApiF @{ action = "buscarPreviewRelatorio"; mes = (Get-Date).Month; ano = (Get-Date).Year }
  if (-not $preview.ok -or -not $preview.html) { throw "preview relatorio falhou" }
  if ($preview.html -notmatch "Gestao Avancada") {
    Add-FCheck "pdf pacote-f" "warn" "HTML sem secao Gestao Avancada (implante GAS v1.5.48+)"
  } else {
    Add-FCheck "pdf pacote-f" "ok" "secao Gestao Avancada no HTML"
  }

  $result.status = "ok"
} catch {
  $result.status = "failed"
  $result.error = $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5
if ($result.status -eq "ok") { exit 0 } else { exit 1 }
