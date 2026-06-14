# SO SOCIO — sync + clasp push + republicar MESMA Web App (Deploy ID fixo AKfycbwakQ...).
# Agente NAO deve executar este script.
param(
  [switch]$SkipVerify
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$confirm = Read-Host "Republicar Web GAS AKfycbwakQ... (digite SIM para continuar)"
if ($confirm -ne 'SIM') {
  Write-Host "Abortado." -ForegroundColor Yellow
  exit 1
}

& "$root\scripts\sync-gas-to-clasp.ps1"

$canonical = Join-Path $root "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
$gasCode = Join-Path $root "gas\Code.gs"
$canonId = (Select-String -Path $canonical -Pattern "const DEPLOY_ID\s*=\s*'([^']+)'" | Select-Object -First 1).Matches.Groups[1].Value
$gasId = (Select-String -Path $gasCode -Pattern "const DEPLOY_ID\s*=\s*'([^']+)'" | Select-Object -First 1).Matches.Groups[1].Value
$gasVer = (Select-String -Path $canonical -Pattern "versao:\s*'(v[^']+)'" | Select-Object -First 1).Matches.Groups[1].Value

$FORBIDDEN = 'AKfycbwkvWgfu2UvgzzxDXRI5_CcDdRE-b3UGzu86FjyuwiVTgQc0L9XGd4wgIZD1UWjOKA2'
if ($gasId -eq $FORBIDDEN) { Write-Error "DEPLOY_ID errado (@139). Use AKfycbwakQ..." }
if (-not $canonId -or $canonId -ne $gasId) {
  Write-Error "gas/Code.gs DEPLOY_ID ($gasId) diferente do canonico ($canonId)."
}
if ($gasId -like 'AKfycbzc*') {
  Write-Error "gas/Code.gs ainda usa URL morta AKfycbzc. Abortando."
}

clasp push --force
Write-Host "clasp push OK" -ForegroundColor Green

$desc = if ($gasVer) { "$gasVer producao" } else { "Movi Kids producao" }
$deployOut = clasp deploy -i $gasId -d $desc 2>&1 | Out-String
Write-Host $deployOut.TrimEnd()
if ($deployOut -notmatch 'Deployed\s+' + [regex]::Escape($gasId)) {
  Write-Error "clasp deploy -i falhou. Verifique clasp login."
}

if (-not $SkipVerify) {
  Write-Host ""
  Write-Host "Verificando ping vs repo..." -ForegroundColor Cyan
  & "$root\scripts\verify-gas-deploy.ps1"
  if ($LASTEXITCODE -ne 0) {
    Write-Error "GAS publicado mas verify falhou. Confira acesso Qualquer pessoa no editor (I27)."
  }
}

Write-Host ""
Write-Host "Web App OK — $gasVer em $gasId" -ForegroundColor Green
Write-Host "  https://script.google.com/macros/s/$gasId/exec?action=ping"
