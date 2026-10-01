# I148 — Corrige row 3046 (Iza) na planilha via OAuth — SEM Nova versao Web GAS
param([switch]$DryRun)

$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'corrigir-locacao-3046-oauth.cjs'
if (-not (Test-Path $script)) { throw "Script ausente: $script" }

$nodeArgs = @($script)
if ($DryRun) { $nodeArgs += '--dry-run' }

$authRoot = Join-Path $env:USERPROFILE 'Projects\google-drive-sheets-auth'
if (Test-Path (Join-Path $authRoot 'node_modules\googleapis')) {
  Push-Location $authRoot
  try {
    & node $script @($DryRun ? '--dry-run' : $null) 2>&1 | Where-Object { $_ -ne $null }
  } finally { Pop-Location }
} else {
  & node @nodeArgs
}

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host 'Concluido — recarregue Caixa do dia no app admin.' -ForegroundColor Green
