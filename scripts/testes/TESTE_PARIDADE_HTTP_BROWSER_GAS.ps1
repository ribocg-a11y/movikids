param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
)

# Paridade HTTP: browser (fetch) vs PowerShell/curl.
# GAS Web App: POST retorna 302; fetch no tablet perde body ou falha CORS.
# Invoke-RestMethod POST nos testes NAO prova o tablet.
# Incidente 05/06/2026: Pacote E v1.7.26-v1.7.33 usou POST no FE.

$ErrorActionPreference = "Stop"

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  baseUrl = $BaseUrl
  checks = @()
}

function Add-Check {
  param([string]$Name, [string]$Status, [string]$Detail = "")
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

function Test-JsonOk {
  param([string]$Raw)
  try {
    $j = $Raw | ConvertFrom-Json
    return [bool]$j.ok
  } catch {
    return $false
  }
}

try {
  $pingGet = Invoke-RestMethod -Uri "$BaseUrl`?action=ping" -Method Get -TimeoutSec 15
  if (-not $pingGet.ok) { throw "ping GET falhou" }
  Add-Check "ping GET" "ok" $pingGet.versao

  if ([bool]$pingGet.postWriteActions) {
    $pw = ($pingGet.postWriteActions | ForEach-Object { $_ }) -join ", "
    Add-Check "postWriteActions" "ok" $pw
  } else {
    Add-Check "postWriteActions" "warn" "ausente"
  }

  $body = '{"action":"ping"}'
  $curlPost = & curl.exe -s -L -X POST -H "Content-Type: application/json" -d $body $BaseUrl
  if (Test-JsonOk $curlPost) {
    Add-Check "curl POST proxy browser" "warn" "POST retornou JSON ok"
  } else {
    Add-Check "curl POST proxy browser" "ok" "POST nao retorna JSON valido"
  }

  try {
    $irmPost = Invoke-RestMethod -Uri $BaseUrl -Method Post -Body $body -ContentType "application/json" -TimeoutSec 15
    if ($irmPost.ok) {
      Add-Check "Invoke-RestMethod POST" "warn" "OK no PowerShell - nao prova tablet"
    } else {
      Add-Check "Invoke-RestMethod POST" "ok" "POST falhou no IRM"
    }
  } catch {
    Add-Check "Invoke-RestMethod POST" "ok" "POST falhou no IRM"
  }

  $semOpBody = '{"action":"salvarLocacao","tipo":"Carro","plano":"10min","veiculo":"Carro 01","responsavel":"X","crianca":"Y","telefone":"98999999999"}'
  $curlSalvar = & curl.exe -s -L -X POST -H "Content-Type: application/json" -d $semOpBody $BaseUrl
  if (Test-JsonOk $curlSalvar) {
    throw "curl POST salvarLocacao retornou JSON"
  }
  Add-Check "curl POST salvarLocacao" "ok" "nao-JSON no proxy browser"

  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "ok"
} catch {
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "failed"
  $result.error = $_.Exception.Message
}

$result | ConvertTo-Json -Depth 6
if ($result.status -eq "ok") { exit 0 } else { exit 1 }
