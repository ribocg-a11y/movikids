# Copia o .gs canonico para gas/Code.gs (clasp envia essa pasta)
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$src = Join-Path $root "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
$dstDir = Join-Path $root "gas"
$dst = Join-Path $dstDir "Code.gs"
if (-not (Test-Path $src)) { Write-Error "Arquivo GAS nao encontrado: $src"; exit 1 }
New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
Copy-Item -Force $src $dst
Write-Host "OK: $dst"
