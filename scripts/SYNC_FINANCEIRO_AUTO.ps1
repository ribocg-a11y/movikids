# Sync automático: planilhas → JSON → git push (a cada 10 min via Agendador de Tarefas)
$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$LogDir = Join-Path $RepoRoot "financeiro\logs"
$LogFile = Join-Path $LogDir "sync-auto.log"
$JsonPath = Join-Path $RepoRoot "financeiro\data\finance-data.json"

function Write-Log([string]$msg) {
  if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }
  $line = "{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg
  Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

try {
  Write-Log "INICIO sync"
  & (Join-Path $PSScriptRoot "SYNC_FINANCEIRO.ps1")
  if ($LASTEXITCODE -ne 0) { throw "SYNC_FINANCEIRO falhou (exit $LASTEXITCODE)" }

  Push-Location $RepoRoot
  try {
    git add "financeiro/data/finance-data.json" 2>&1 | Out-Null
    $status = git status --porcelain "financeiro/data/finance-data.json"
    if (-not $status) {
      Write-Log "OK sem mudancas no JSON"
      exit 0
    }

    git commit -m "Atualiza dashboard financeiro (sync automatico)." 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "git commit falhou" }

    git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "git push falhou" }

    Write-Log "OK publicado no GitHub"
  } finally {
    Pop-Location
  }
} catch {
  Write-Log "ERRO: $($_.Exception.Message)"
  exit 1
}
