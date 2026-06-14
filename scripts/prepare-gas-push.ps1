# Agente: sync .gs canonico -> gas/ + clasp push (codigo no projeto Google, SEM publicar Web App).
# Publicacao Web: SO SOCIO — editor (Editar AKfycbwakQ...) ou deploy-gas-SOCIO.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

& "$root\scripts\sync-gas-to-clasp.ps1"

$gasCode = Join-Path $root "gas\Code.gs"
$gasId = (Select-String -Path $gasCode -Pattern "const DEPLOY_ID\s*=\s*'([^']+)'" | Select-Object -First 1).Matches.Groups[1].Value
if ($gasId -like 'AKfycbzc*') { Write-Error "DEPLOY_ID morto AKfycbzc no Code.gs" }
if ($gasId -like 'AKfycbwkvWg*') { Write-Error "DEPLOY_ID @139 proibido. Canonico: AKfycbwakQ..." }

clasp push --force
Write-Host "clasp push OK — codigo no editor. NAO publicou Web App." -ForegroundColor Green
Write-Host "Socio: Implantar -> Editar AKfycbwakQ... -> Nova versao (mesmo ID)" -ForegroundColor Yellow
