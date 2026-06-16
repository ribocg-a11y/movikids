# Atalho na raiz - Protocolo Mestre (varredura completa de testes)
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
& powershell -NoProfile -File (Join-Path $repo "scripts\testes\TESTE_PROTOCOLO_MESTRE.ps1") @args
exit $LASTEXITCODE
