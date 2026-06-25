# Auditoria célula a célula — 3 camadas (schema + amostra GAS + OAuth opcional)
# Doc: docs/ativos/PROTOCOLO_AUDITORIA_CELULA_PLANILHA.md
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [string]$Aba = "",
  [switch]$OAuthFull,
  [switch]$SkipOAuth,
  [string]$OutFile = ""
)

$ErrorActionPreference = "Stop"
$testDir = $PSScriptRoot
$root = Split-Path -Parent (Split-Path -Parent $testDir)

$abasOrdem = @(
  "LOCACOES", "CONFIG", "OPERADORES_SISTEMA", "CUSTOS", "DASHBOARD", "FOLHA", "INVESTIMENTO",
  "RESPONSAVEIS", "RELATORIOS", "AUDITORIA", "AUD_TURNO", "AUD_SMS", "AUD_WHATSAPP", "AUD_RESPONSAVEIS",
  "COLABORADORES_RH", "FOLHA_PONTO", "BANCO_HORAS", "ESCALA_COLABORADORES", "FALTAS_AUSENCIAS",
  "HOLERITES", "METAS_COLABORADORES", "COMUNICADOS_RH", "AVALIACOES_RH"
)

if ($Aba) {
  $abasOrdem = @($Aba.Trim().ToUpper())
}

$result = [ordered]@{
  suite = "AUDITORIA_CELULA_PLANILHA"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  camada1 = @{}
  camada2 = @()
  camada3 = $null
  status = "ok"
}

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 120
  } catch {
    $raw = & curl.exe -L -s $url --max-time 120
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

try {
  # --- Camada 1: schema global ---
  $ping = Invoke-MkApi @{ action = "ping" }
  $result.camada1.ping = $ping.versao
  $schema = Invoke-MkApi @{ action = "validarSchema" }
  $result.camada1.schemaOk = [bool]$schema.schemaOk
  $diag = Invoke-MkApi @{ action = "diagnosticoPlanilhaCompletoAdmin"; adminPin = $AdminPin }
  if ($diag.ok -eq $false) { throw $diag.erro }
  $result.camada1.totalAbas = $diag.totalAbas
  $result.camada1.locDataRows = ($diag.abas | Where-Object { $_.nome -eq "LOCACOES" } | Select-Object -First 1).dataRows
  if (-not $result.camada1.schemaOk) { $result.status = "fail" }

  # --- Camada 2: dry-run por aba ---
  foreach ($nome in $abasOrdem) {
    $entry = [ordered]@{ aba = $nome; status = "skip"; problemas = $null; detail = "" }
    $tmpJson = Join-Path $testDir ("_proto-tmp-" + $nome + ".json")
    $attempts = 0
    $maxAttempts = 3
    while ($attempts -lt $maxAttempts) {
      $attempts++
      try {
        if ($attempts -gt 1) { Start-Sleep -Seconds (10 * $attempts) }
        & "$testDir\TESTE_PROTOCOLO_ABA_PLANILHA.ps1" -Aba $nome -DryRun -SomenteLeitura -SkipRepair -BaseUrl $BaseUrl -AdminPin $AdminPin -ResultFile $tmpJson | Out-Null
        if (-not (Test-Path $tmpJson)) { throw "ResultFile ausente" }
        $parsed = Get-Content -Path $tmpJson -Raw -Encoding UTF8 | ConvertFrom-Json

        $entry.status = switch ($parsed.status) {
          "ok" { "ok" }
          "ok_with_warnings" { "warn" }
          default { "fail" }
        }
        $auditCheck = @($parsed.checks | Where-Object { $_.name -match '\.audit$' } | Select-Object -First 1)
        if ($auditCheck -and $auditCheck.detail -match 'problemas=(\d+)') {
          $entry.problemas = [int]$Matches[1]
        }
        $entry.detail = $parsed.summary
        if ($entry.status -eq "fail" -and $attempts -lt $maxAttempts) { continue }
        break
      } catch {
        $entry.status = "fail"
        $entry.detail = $_.Exception.Message
        if ($attempts -lt $maxAttempts) { continue }
      } finally {
        Remove-Item -Path $tmpJson -Force -ErrorAction SilentlyContinue
      }
    }
    if ($entry.status -eq "fail") { $result.status = "fail" }
    elseif ($entry.status -eq "warn" -and $result.status -eq "ok") { $result.status = "ok_with_warnings" }
    $result.camada2 += $entry
    Write-Host ("[{0}] {1} problemas={2}" -f $entry.status, $nome, $entry.problemas) -ForegroundColor $(switch ($entry.status) { "ok" { "Green" } "fail" { "Red" } default { "Yellow" } })
    Start-Sleep -Seconds 2
  }

  # --- Camada 3: OAuth varredura completa (opcional) ---
  if ($OAuthFull -and -not $SkipOAuth) {
    $oauthScript = "C:\Users\riboc\Projects\google-drive-sheets-auth\scripts\auditar-planilha-movikids.js"
    if (-not (Test-Path $oauthScript)) {
      $result.camada3 = @{ status = "skip"; detail = "OAuth script ausente: $oauthScript" }
    } else {
      Write-Host "Camada 3 OAuth (todas celulas LOCACOES + ops)..." -ForegroundColor Cyan
      try {
        $oauthOut = & node $oauthScript 2>&1 | Out-String
        $parsed = $oauthOut | ConvertFrom-Json
        $result.camada3 = $parsed
        $nIssues = @($parsed.issues).Count
        if ($nIssues -gt 0) {
          if ($result.status -eq "ok") { $result.status = "ok_with_warnings" }
          Write-Host "OAuth issues: $nIssues" -ForegroundColor Yellow
        } else {
          Write-Host "OAuth: 0 issues" -ForegroundColor Green
        }
      } catch {
        $result.camada3 = @{ status = "fail"; detail = $_.Exception.Message; hint = "npm run auth em google-drive-sheets-auth" }
        if ($_.Exception.Message -match "invalid_grant") {
          Write-Host "OAuth expirado - rode npm run auth em google-drive-sheets-auth" -ForegroundColor Yellow
        }
      }
    }
  }
} catch {
  $result.status = "fail"
  $result.erro = $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$outPath = if ($OutFile) { $OutFile } else { Join-Path $testDir "_auditoria-celula-last.json" }
$result | ConvertTo-Json -Depth 12 | Set-Content -Path $outPath -Encoding UTF8
Write-Host "`nRelatorio: $outPath" -ForegroundColor Cyan
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
