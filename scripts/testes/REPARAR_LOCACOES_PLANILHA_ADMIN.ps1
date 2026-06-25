# I52 — repair aba LOCACOES: memorial, headers 28 cols, formatos, proteção, limpar testes
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [switch]$DryRun,
  [switch]$SkipLimparTeste
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 120
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

$ping = Invoke-MkApi @{ action = "ping" }
if (-not $ping.ok) { throw "ping falhou" }
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan

$params = @{
  action = "repararLocacoesPlanilhaAdmin"
  adminPin = $AdminPin
  motivo = "Repair LOCACOES I52 memorial formatos protecao $(Get-Date -Format yyyy-MM-dd)"
}
if ($DryRun) { $params.dryRun = "1" }
if (-not $SkipLimparTeste -and -not $DryRun) { $params.limparTeste = "1" }

$out = Invoke-MkApi $params
if (-not $out.ok) { throw $out.erro }

if ($out.dryRun) {
  Write-Host "DRY RUN — schemaOk=$($out.schemaOk) problemas=$($out.audit.problemas.Count)" -ForegroundColor Yellow
} else {
  Write-Host "Repair OK — linhas formatadas=$($out.formatos.linhas) schemaOk=$($out.schemaOk)" -ForegroundColor Green
  if ($out.limpeza) {
    Write-Host "Testes anulados: $($out.limpeza.total)" -ForegroundColor Green
  }
  if ($out.audit.problemas.Count -gt 0) {
    Write-Host "Avisos amostra (ultimas 30):" -ForegroundColor Yellow
    $out.audit.problemas | Select-Object -First 10 | ForEach-Object {
      Write-Host "  linha $($_.row) $($_.campo): $($_.valor)"
    }
  }
}

$schema = Invoke-MkApi @{ action = "validarSchema" }
Write-Host "validarSchema schemaOk=$($schema.schemaOk) versao=$($schema.versao)" -ForegroundColor $(if ($schema.schemaOk) { "Green" } else { "Yellow" })

$out | ConvertTo-Json -Depth 8
