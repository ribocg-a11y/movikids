# Cria aba FOLHA na MOVIKIDS_Planilha_Base (Google Sheets API)
# Requer: google-drive-sheets-auth com npm run auth feito uma vez
$AuthRoot = "C:\Users\riboc\Projects\google-drive-sheets-auth"
$Script = Join-Path $AuthRoot "scripts\criar-aba-folha-movikids.js"
if (-not (Test-Path $Script)) {
  Write-Error "Script nao encontrado: $Script"
  exit 1
}
Push-Location $AuthRoot
try {
  node scripts/criar-aba-folha-movikids.js @args
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
