# Protocolo Mestre MOVI KIDS - varredura sistemica F0-F14 + fases admin + cleanup
# Doc: docs/ativos/PROTOCOLO_DIAGNOSTICO_E_TESTES.md
#
# Uso:
#   .\scripts\testes\TESTE_PROTOCOLO_MESTRE.ps1
#   .\scripts\testes\TESTE_PROTOCOLO_MESTRE.ps1 -SkipWriteTests

param(
  [switch]$SkipWriteTests,
  [switch]$SkipBrowserTests
)

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$testDir = $PSScriptRoot
$logDir = Join-Path $root "financeiro\logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logDir "protocolo-mestre-$stamp.json"

$report = [ordered]@{
  protocolo = "PROTOCOLO_MESTRE"
  doc = "docs/ativos/PROTOCOLO_DIAGNOSTICO_E_TESTES.md"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  status = "ok"
  suites = @()
  tabletPendente = @(
    "F5: Iniciar responde na hora; RESTANTE 10:00 +/-1s (tablet fisico)",
    "F7: alerta 5min e expirado em plano 10min (beep + modal)",
    "F10: 2 abas PWA simultaneas - mesmo timer",
    "F11: portal celular +/-2s do balcao"
  )
  cleanup = $null
  diagnostico = @()
}

function Add-Suite {
  param(
    [string]$Grupo,
    [string]$Script,
    [string]$Status,
    [int]$Exit = 0,
    [string]$Detail = ""
  )
  $script:report.suites += [ordered]@{
    grupo = $Grupo
    script = $Script
    status = $Status
    exit = $Exit
    detail = $Detail
  }
  if ($Status -eq "fail") { $script:report.status = "fail" }
  elseif ($Status -eq "warn" -and $script:report.status -eq "ok") { $script:report.status = "warn" }
}

function Run-TestScript {
  param(
    [string]$Grupo,
    [string]$RelPath,
    [string[]]$ExtraArgs = @()
  )
  $name = Split-Path $RelPath -Leaf
  $path = Join-Path $testDir $RelPath
  if (-not (Test-Path $path)) {
    Add-Suite $Grupo $name "skip" 0 "ausente"
    return
  }
  Write-Host ""
  Write-Host "[$Grupo] $name" -ForegroundColor Cyan
  $out = & powershell -NoProfile -File $path @ExtraArgs 2>&1 | Out-String
  $exit = $LASTEXITCODE
  $tail = ($out.Trim() -split "`n" | Select-Object -Last 3) -join " | "
  if ($tail.Length -gt 280) { $tail = $tail.Substring($tail.Length - 280) }
  $st = if ($exit -eq 0) { "ok" } else { "fail" }
  Add-Suite $Grupo $name $st $exit $tail
  if ($exit -ne 0) { Write-Host "  FAIL exit=$exit" -ForegroundColor Red }
  else { Write-Host "  OK" -ForegroundColor Green }
}

function Run-RootScript {
  param(
    [string]$Grupo,
    [string]$RelPath,
    [string[]]$ExtraArgs = @()
  )
  $name = Split-Path $RelPath -Leaf
  $path = Join-Path $root $RelPath
  if (-not (Test-Path $path)) {
    Add-Suite $Grupo $name "skip" 0 "ausente"
    return
  }
  Write-Host ""
  Write-Host "[$Grupo] $name" -ForegroundColor Cyan
  $out = & powershell -NoProfile -File $path @ExtraArgs 2>&1 | Out-String
  $exit = $LASTEXITCODE
  $tail = ($out.Trim() -split "`n" | Select-Object -Last 2) -join " | "
  $st = if ($exit -eq 0) { "ok" } else { "fail" }
  Add-Suite $Grupo $name $st $exit $tail
}

Write-Host "=== PROTOCOLO MESTRE MOVI KIDS ===" -ForegroundColor Magenta
Write-Host "Log: $logPath"

# --- F0 Infra ---
Run-RootScript "F0" "scripts\check-operacao-livre.ps1"
Run-RootScript "F0" "scripts\pre-push-check.ps1"
Run-RootScript "F0" "scripts\verify-gas-deploy.ps1"
Run-RootScript "F0" "scripts\verify-pages-live.ps1"

# --- Orquestrador F0-F14 (inclui escrita I20, drawer, etc.) ---
Run-TestScript "F0-F14" "TESTE_PROTOCOLO_DIAGNOSTICO.ps1"

# --- F12 Admin / FASE 6-9 / folha / DRE ---
foreach ($s in @(
  "TESTE_FASE6_COCKPIT_READONLY.ps1",
  "TESTE_FASE7_LEADING_READONLY.ps1",
  "TESTE_FASE8_ALERTAS_READONLY.ps1",
  "TESTE_FASE9_FOLHA_READONLY.ps1",
  "TESTE_FOLHA_FORMULAS_READONLY.ps1",
  "TESTE_MINI_DRE_READONLY.ps1",
  "TESTE_B6_LOGIN_ADMIN_READONLY.ps1",
  "TESTE_OPERACAO_CONFIG_READONLY.ps1",
  "TESTE_P3_READONLY.ps1",
  "TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1",
  "TESTE_REAUDITORIA_PLANILHA.ps1"
)) {
  Run-TestScript "F12+" $s
}

# --- B7 write (FASE 5) ---
if (-not $SkipWriteTests) {
  Run-TestScript "F5/B7" "TESTE_B7_REGRESSAO_WRITE.ps1"
} else {
  Add-Suite "F5/B7" "TESTE_B7_REGRESSAO_WRITE.ps1" "skip" 0 "SkipWriteTests"
}

# --- Tablet GAS + alertas ---
Run-TestScript "F5-F11" "TESTE_TABLET_F5_F7_F10_F11.ps1"
if (-not $SkipBrowserTests) {
  Run-TestScript "F7" "TESTE_ALERTAS_TABLET.ps1" @("-GasOnly")
} else {
  Add-Suite "F7" "TESTE_ALERTAS_TABLET.ps1" "skip" 0 "SkipBrowserTests"
}

# --- Estatico JS ---
Write-Host ""
Write-Host "[F0] node --check mk-*.js" -ForegroundColor Cyan
$jsFails = @()
Get-ChildItem (Join-Path $root "mk-*.js") | ForEach-Object {
  $null = & node --check $_.FullName 2>&1
  if ($LASTEXITCODE -ne 0) { $jsFails += $_.Name }
}
if ($jsFails.Count -eq 0) {
  Add-Suite "F0" "node-check-mk-js" "ok" 0 "todos ok"
  Write-Host "  OK" -ForegroundColor Green
} else {
  Add-Suite "F0" "node-check-mk-js" "fail" 1 ($jsFails -join ",")
  Write-Host "  FAIL: $($jsFails -join ', ')" -ForegroundColor Red
}

# --- Cleanup residuos ---
Write-Host ""
Write-Host "=== CLEANUP ===" -ForegroundColor Yellow
. (Join-Path $testDir "_TestCleanup.ps1")
$cleanup = Invoke-MoviTestCleanup -Quiet:$false
$report.cleanup = $cleanup

Run-TestScript "F0" "LIMPAR_SESSOES_TESTE_AGORA.ps1"

$localRemoved = @()
foreach ($pat in @(
  ".tablet-cdp-payload.json",
  "test-controleFinanceiro.json"
)) {
  $p = Join-Path $testDir $pat
  if (Test-Path $p) {
    Remove-Item -LiteralPath $p -Force -ErrorAction SilentlyContinue
    $localRemoved += $pat
  }
}
$p2 = Join-Path $root "financeiro\logs\test-controleFinanceiro.json"
if (Test-Path $p2) {
  Remove-Item -LiteralPath $p2 -Force -ErrorAction SilentlyContinue
  $localRemoved += "financeiro/logs/test-controleFinanceiro.json"
}
if ($localRemoved.Count -gt 0) {
  Add-Suite "F0" "cleanup-local-artifacts" "ok" 0 ($localRemoved -join ", ")
}

# --- Diagnostico ---
$failures = @($report.suites | Where-Object { $_.status -eq "fail" })
$warns = @($report.suites | Where-Object { $_.status -eq "warn" })
if ($failures.Count -gt 0) {
  $report.diagnostico += "FALHAS ($($failures.Count)): " + (($failures | ForEach-Object { "$($_.script) ($($_.detail))" }) -join "; ")
}
if ($warns.Count -gt 0) {
  $report.diagnostico += "AVISOS ($($warns.Count)): " + (($warns | ForEach-Object { $_.script }) -join ", ")
}
if ($cleanup -and -not $cleanup.ok) {
  $report.diagnostico += "Cleanup GAS/planilha incompleto: $($cleanup.detail)"
}
$report.diagnostico += "Tablet fisico obrigatorio para F5/F7/F10-2abas/F11 - ver tabletPendente."
$report.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $logPath -Encoding UTF8

Write-Host ""
Write-Host "=== RESUMO PROTOCOLO MESTRE ===" -ForegroundColor Magenta
$ok = @($report.suites | Where-Object { $_.status -eq "ok" }).Count
$fail = @($report.suites | Where-Object { $_.status -eq "fail" }).Count
$skip = @($report.suites | Where-Object { $_.status -eq "skip" }).Count
Write-Host "OK=$ok FAIL=$fail SKIP=$skip STATUS=$($report.status)"
Write-Host "Log: $logPath"
foreach ($d in $report.diagnostico) { Write-Host $d -ForegroundColor $(if ($fail -gt 0) { "Yellow" } else { "Gray" }) }

if ($report.status -eq "fail") { exit 1 }
exit 0
