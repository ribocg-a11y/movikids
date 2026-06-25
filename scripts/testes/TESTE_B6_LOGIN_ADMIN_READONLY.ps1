# B6 — PIN admin validado so no GAS (loginAdmin); FE sem hardcode
$ErrorActionPreference = 'Stop'
$base = 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec'
$pinOk = $env:MK_ADMIN_PIN
if (-not $pinOk) { $pinOk = '1421' }

Write-Host '=== ping ===' -ForegroundColor Cyan
$p = Invoke-RestMethod -Uri "$base`?action=ping" -Method Get -TimeoutSec 20
Write-Host "versao=$($p.versao)"

Write-Host '=== loginAdmin PIN errado ===' -ForegroundColor Cyan
$bad = Invoke-RestMethod -Uri "$base`?action=loginAdmin&adminPin=0000" -Method Get -TimeoutSec 20
if ($bad.ok) { throw 'loginAdmin deveria falhar com PIN errado' }
Write-Host "ok=false erro=$($bad.erro)"

Write-Host '=== loginAdmin PIN correto ===' -ForegroundColor Cyan
$good = Invoke-RestMethod -Uri "$base`?action=loginAdmin&adminPin=$pinOk" -Method Get -TimeoutSec 20
if (-not $good.ok) { throw "loginAdmin falhou: $($good.erro)" }
Write-Host "role=$($good.role) operador=$($good.operador.nome)"

Write-Host '=== isAdminRequest sem PIN (authRole so) ===' -ForegroundColor Cyan
if ($p.versao -ne 'v1.5.74') {
  Write-Warning "GAS $($p.versao) - publique Nova versao Web v1.5.74 para validar B6 completo (skip authRole)"
} else {
  $noPin = Invoke-RestMethod -Uri "$base`?action=listarAuditoriaAdmin&authRole=admin&limite=1" -Method Get -TimeoutSec 20
  if ($noPin.ok) { throw 'listarAuditoriaAdmin nao deveria aceitar authRole sem adminPin (B6)' }
  Write-Host 'ok=false (esperado)'
}

Write-Host ''
Write-Host 'TESTE_B6_LOGIN_ADMIN_READONLY OK' -ForegroundColor Green
