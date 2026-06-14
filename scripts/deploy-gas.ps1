# BLOQUEADO para agente Cursor — publicacao Web GAS e SO DO SOCIO (Regra 9 / I1 / I27).
# O agente NAO pode implantar nem reimplantar. Use prepare-gas-push.ps1 so para sync+push de codigo.
#
# Socio (humano) — republicar MESMA URL:
#   .\scripts\deploy-gas-SOCIO.ps1
#
# Ou no editor: Implantar -> Gerenciar -> EDITAR (lapis) AKfycbwakQ... -> Nova versao
# NUNCA "Nova implantacao" (cria URL nova — incidente I1).

$ErrorActionPreference = 'Stop'
Write-Host ""
Write-Host "deploy-gas.ps1 BLOQUEADO — agente nao publica Web App GAS." -ForegroundColor Red
Write-Host ""
Write-Host "Producao (unica URL valida):" -ForegroundColor Cyan
Write-Host "  AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y"
Write-Host ""
Write-Host "Implantacao errada @139 (NAO usar — arquivar no editor):" -ForegroundColor Yellow
Write-Host "  AKfycbwkvWgfu2UvgzzxDXRI5_CcDdRE-b3UGzu86FjyuwiVTgQc0L9XGd4wgIZD1UWjOKA2"
Write-Host ""
Write-Host "Agente: .\scripts\prepare-gas-push.ps1  (so codigo no projeto, sem publicar Web)"
Write-Host "Socio:  .\scripts\deploy-gas-SOCIO.ps1   (clasp deploy -i AKfycbwakQ...)"
Write-Host ""
exit 1
