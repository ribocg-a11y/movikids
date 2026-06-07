# Instala tarefa do Windows: sync financeiro a cada 10 minutos
# Rode uma vez: .\scripts\INSTALAR_AGENDAMENTO_SYNC_10MIN.ps1
# Requer PowerShell como usuario logado (git push usa suas credenciais)

$TaskName = "MoviKids-SyncFinanceiro10min"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$ScriptPath = Join-Path $PSScriptRoot "SYNC_FINANCEIRO_AUTO.ps1"

if (-not (Test-Path $ScriptPath)) {
  Write-Error "Script nao encontrado: $ScriptPath"
  exit 1
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host "Tarefa anterior removida."
}

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`"" `
  -WorkingDirectory $RepoRoot

$start = (Get-Date).AddMinutes(1)
$trigger = New-ScheduledTaskTrigger `
  -Once `
  -At $start `
  -RepetitionInterval (New-TimeSpan -Minutes 10) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Sync Movi Kids + ZapClin → dashboard financeiro (10 min)" | Out-Null

Write-Host "Tarefa instalada: $TaskName"
Write-Host "Intervalo: a cada 10 minutos"
Write-Host "Script: $ScriptPath"
Write-Host "Log: $RepoRoot\financeiro\logs\sync-auto.log"
Write-Host ""
Write-Host "Testar agora:"
Write-Host "  powershell -File `"$ScriptPath`""
Write-Host ""
Write-Host "Remover:"
Write-Host "  Unregister-ScheduledTask -TaskName $TaskName -Confirm:`$false"
