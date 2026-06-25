param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"
$repo = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not $OutDir) {
  $OutDir = Join-Path $repo "backups\rh"
}
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 120
}

$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$result = [ordered]@{
  suite = "BACKUP_RH_PLANILHA"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  $result.pingVersao = $ping.versao

  $export = Invoke-MkApi @{
    action = "exportarCadastroRhAdmin"
    adminPin = $AdminPin
    _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  $outFile = Join-Path $OutDir "cadastro-rh-$stamp.json"
  $export | ConvertTo-Json -Depth 12 | Set-Content -Path $outFile -Encoding UTF8
  $result.arquivo = $outFile
  $result.colaboradores = @($export.colaboradores).Count
  $result.status = if ($export.colaboradores) { "ok" } else { "warn_empty" }
} catch {
  $result.status = "fail"
  $result.erro = $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
Write-Host "Backup: $($result.arquivo)" -ForegroundColor Cyan
