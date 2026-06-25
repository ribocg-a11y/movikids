param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [string]$RepairBanco = "sim"
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 120
}

$result = [ordered]@{
  suite = "REPARAR_RH_PLANILHA_ADMIN"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  $result.pingVersao = $ping.versao

  try {
    $repair = Invoke-MkApi @{
      action = "repararRhPlanilhaAdmin"
      adminPin = $AdminPin
      repairBanco = $RepairBanco
      _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    }
    $result.repair = $repair
    $result.status = if ($repair.ok -ne $false) { "ok" } else { "fail" }
  } catch {
    if ($_.Exception.Message -match 'desconhecida|unknown') {
      Write-Host "API repararRhPlanilhaAdmin ausente em prod ($($result.pingVersao)). Rode: clasp push + Nova versao Web v1.5.139+ OU clasp run mkClaspRunRepararRh_" -ForegroundColor Yellow
      $result.status = "needs_gas_web"
      $result.detail = "Use clasp run mkClaspRunRepararRh_ no PC"
    } else {
      throw
    }
  }
} catch {
  $result.status = "fail"
  $result.erro = $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 10
