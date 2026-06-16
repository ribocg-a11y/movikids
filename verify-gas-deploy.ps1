# Atalho na raiz do repo (rode de qualquer pasta com caminho completo)
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
& powershell -NoProfile -File (Join-Path $repo "scripts\verify-gas-deploy.ps1") @args
exit $LASTEXITCODE
