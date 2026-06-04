# Deploy GAS: copia codigo + push (NAO usa clasp deploy — quebra URL /exec)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

& "$root\scripts\sync-gas-to-clasp.ps1"
clasp push --force

Write-Host ""
Write-Host "Codigo enviado ao Google." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE: abra Apps Script e publique a Web App manualmente:" -ForegroundColor Yellow
Write-Host "  1) Extensoes > Apps Script (planilha MoviKids)"
Write-Host "  2) Implantar > Gerenciar implantacoes"
Write-Host "  3) Editar a implantacao Web (ID AKfycbwakQ...)"
Write-Host "  4) Nova versao > Implantar"
Write-Host ""
Write-Host "Teste no Chrome:" -ForegroundColor Cyan
Write-Host "  https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping"
Write-Host "  Deve mostrar JSON com ok:true e versao v1.5.37"
