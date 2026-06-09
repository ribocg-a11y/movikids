# Q2 — F10 sync multi-canal: duas leituras carregarInicio em paralelo (proxy 2 abas)
$ErrorActionPreference = 'Stop'
$base = 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec'

function Sim-Rem($s) {
  $mins = [int]$s.mins
  $ts = [int64]$s.startTimestamp
  if ([string]$s.status -eq 'Pendente') { return $mins * 60 }
  if ($ts -lt 1e12) { return $mins * 60 }
  return [math]::Floor($mins * 60 - (([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() - $ts) / 1000.0))
}

function Get-Ativas {
  $d = Invoke-RestMethod -Uri "$base`?action=carregarInicio&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -TimeoutSec 45
  if (-not $d.ok) { throw "carregarInicio: $($d.erro)" }
  return @($d.ativos | Where-Object { [string]$_.status -eq 'Ativa' -and [int64]$_.startTimestamp -gt 0 })
}

Write-Host '=== F10 duas leituras paralelas ===' -ForegroundColor Cyan
$j1 = Start-Job { param($u) Invoke-RestMethod -Uri $u -Method Get -TimeoutSec 45 } -ArgumentList "$base`?action=carregarInicio&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
$j2 = Start-Job { param($u) Invoke-RestMethod -Uri $u -Method Get -TimeoutSec 45 } -ArgumentList "$base`?action=carregarInicio&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
$d1 = Receive-Job $j1 -Wait -AutoRemoveJob
$d2 = Receive-Job $j2 -Wait -AutoRemoveJob
if (-not $d1.ok -or -not $d2.ok) { throw 'carregarInicio falhou numa das leituras' }

$ativas1 = @($d1.ativos | Where-Object { [string]$_.status -eq 'Ativa' -and [int64]$_.startTimestamp -gt 0 })
$ativas2 = @($d2.ativos | Where-Object { [string]$_.status -eq 'Ativa' -and [int64]$_.startTimestamp -gt 0 })
if ($ativas1.Count -eq 0) {
  Write-Host 'Sem locacao Ativa no momento — F10 skip (ok em janela vazia)' -ForegroundColor Yellow
  Write-Host 'TESTE_F10_DUAS_ABAS OK (skip)' -ForegroundColor Green
  exit 0
}

$maxDrift = 0
foreach ($a in $ativas1) {
  $ri = [int]$a.rowIndex
  $b = $ativas2 | Where-Object { [int]$_.rowIndex -eq $ri } | Select-Object -First 1
  if (-not $b) { throw "row $ri ausente na 2a leitura" }
  $drift = [math]::Abs((Sim-Rem $a) - (Sim-Rem $b))
  if ($drift -gt $maxDrift) { $maxDrift = $drift }
  Write-Host "row=$ri drift=${drift}s"
}
if ($maxDrift -gt 2) { throw "F10 drift max=${maxDrift}s (>2s)" }

Write-Host ''
Write-Host "TESTE_F10_DUAS_ABAS OK maxDrift=${maxDrift}s" -ForegroundColor Green
