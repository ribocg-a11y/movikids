# P3 readonly — auditoria, PDF executivo, recorrente CRM (GAS v1.5.73+)
$ErrorActionPreference = 'Stop'
$base = 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec'
$pin = '1416'

Write-Host '=== ping ===' -ForegroundColor Cyan
$p = Invoke-RestMethod -Uri "$base`?action=ping" -Method Get -TimeoutSec 20
Write-Host "versao=$($p.versao) ok=$($p.ok)"
if ($p.versao -ne 'v1.5.73') { Write-Warning 'Esperado v1.5.73 — publique Nova versao Web se necessario' }

Write-Host '=== listarAuditoriaAdmin ===' -ForegroundColor Cyan
$a = Invoke-RestMethod -Uri "$base`?action=listarAuditoriaAdmin&adminPin=$pin&limite=5" -Method Get -TimeoutSec 30
if (-not $a.ok) { throw "listarAuditoriaAdmin falhou: $($a.erro)" }
Write-Host "eventos=$($a.eventos.Count) operadores=$($a.operadores.Count) total=$($a.total)"

Write-Host '=== buscarPreviewRelatorioExecutivo ===' -ForegroundColor Cyan
$e = Invoke-RestMethod -Uri "$base`?action=buscarPreviewRelatorioExecutivo&adminPin=$pin&mes=6&ano=2026" -Method Get -TimeoutSec 60
if (-not $e.ok -or -not $e.html) { throw "preview executivo falhou: $($e.erro)" }
if ($e.html -notmatch 'Payback') { throw 'HTML executivo sem secao Payback' }
Write-Host "htmlLen=$($e.html.Length) payback=OK"

Write-Host '=== listarResponsaveis recorrente ===' -ForegroundColor Cyan
$r = Invoke-RestMethod -Uri "$base`?action=listarResponsaveis&limite=20" -Method Get -TimeoutSec 30
if (-not $r.ok) { throw "listarResponsaveis falhou: $($r.erro)" }
$rec = @($r.responsaveis | Where-Object { $_.recorrente -eq $true }).Count
Write-Host "responsaveis=$($r.responsaveis.Count) recorrentes=$rec"

Write-Host ''
Write-Host 'TESTE_P3_READONLY OK' -ForegroundColor Green
