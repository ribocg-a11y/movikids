# Sincroniza planilhas Movi Kids + ZapClin → financeiro/data/finance-data.json
$AuthRoot = "C:\Users\riboc\Projects\google-drive-sheets-auth"
$RepoRoot = Split-Path $PSScriptRoot -Parent

if (-not (Test-Path $AuthRoot)) {
  Write-Error "Projeto OAuth não encontrado: $AuthRoot"
  exit 1
}

Push-Location $AuthRoot
try {
  node scripts/sync-controle-financeiro.js "--out=$RepoRoot\financeiro\data\finance-data.json"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "OK — JSON em financeiro/data/finance-data.json"
  Write-Host "Dashboard: $RepoRoot\financeiro\index.html"
  Write-Host "Publicado: https://ribocg-a11y.github.io/movikids/financeiro/"
} finally {
  Pop-Location
}
