# Instala abas Gestão Pessoas via GAS (requer GAS v1.5.98 publicado)
$GasUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
$Pin = "1416"
Write-Host "Instalando abas Gestao Pessoas via GAS admin..."
try {
  $r = Invoke-RestMethod "$GasUrl`?action=instalarAbasGestaoPessoasAdmin&adminPin=$Pin&_t=$(Get-Date -UFormat %s)" -MaximumRedirection 5
  $r | ConvertTo-Json -Depth 5
} catch {
  Write-Host "Falhou (GAS ainda nao publicado v1.5.98?). Alternativa OAuth:"
  Write-Host "  cd C:\Users\riboc\Projects\google-drive-sheets-auth && npm run auth"
  Write-Host "  .\scripts\criar-abas-gestao-pessoas.ps1"
  throw
}
