# Encerramento de sessao MOVI KIDS — versoes + trava I24 (publicacao FE)
# Uso (agente, toda sessao com trabalho no repo):
#   .\scripts\encerramento-sessao.ps1
#   .\scripts\encerramento-sessao.ps1 -SkipNetwork
#
# Exit 0 = pode encerrar · Exit 1 = publicacao FE incompleta (I24)

param(
  [switch]$SkipNetwork,
  [switch]$AllowUnpublished
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host "MOVI KIDS encerramento-sessao" -ForegroundColor Cyan

if ($SkipNetwork) {
  & (Join-Path $root "scripts\relatorio-versoes.ps1") -Markdown -Strict -SkipNetwork
} else {
  & (Join-Path $root "scripts\relatorio-versoes.ps1") -Markdown -Strict
}
$relExit = $LASTEXITCODE

if ($AllowUnpublished) {
  Write-Host "AllowUnpublished: guard I24 ignorado (excecao documentada)" -ForegroundColor Yellow
  exit $relExit
}

if ($SkipNetwork) {
  & (Join-Path $root "scripts\guard-i24-publicacao.ps1") -Mode Sessao -SkipNetwork
} else {
  & (Join-Path $root "scripts\guard-i24-publicacao.ps1") -Mode Sessao
}
$guardExit = $LASTEXITCODE

if ($relExit -ne 0 -or $guardExit -ne 0) {
  Write-Host ""
  Write-Host "encerramento-sessao BLOQUEADO (I24) - publicar FE antes de declarar tarefa concluida." -ForegroundColor Red
  exit 1
}

Write-Host "encerramento-sessao OK" -ForegroundColor Green
exit 0
