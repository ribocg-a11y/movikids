# Cria abas Gestão de Pessoas (FASE 15) na MOVIKIDS_Planilha_Base
$AuthRoot = "C:\Users\riboc\Projects\google-drive-sheets-auth"
$Script = Join-Path $AuthRoot "scripts\criar-abas-gestao-pessoas-movikids.js"
if (-not (Test-Path $Script)) {
  Write-Error "Script nao encontrado: $Script"
  exit 1
}
Push-Location $AuthRoot
try {
  node scripts/criar-abas-gestao-pessoas-movikids.js @args
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
