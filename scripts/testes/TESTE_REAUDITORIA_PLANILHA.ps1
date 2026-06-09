# Q3 — Reauditoria trimestral readonly (schema + diagnostico)
$ErrorActionPreference = 'Stop'
$base = 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec'

Write-Host '=== validarSchema ===' -ForegroundColor Cyan
$schema = Invoke-RestMethod -Uri "$base`?action=validarSchema" -Method Get -TimeoutSec 60
if (-not $schema.ok) { throw "validarSchema falhou: $($schema.erro)" }
Write-Host "schemaOk=$($schema.schemaOk)"
if (-not $schema.schemaOk) {
  $schema.resultado.PSObject.Properties | ForEach-Object {
    $v = $_.Value
    if (-not $v.ok) {
      Write-Host "  $($_.Name): $($v.erro)" -ForegroundColor Yellow
      if ($v.faltando) { $v.faltando | ForEach-Object { Write-Host "    col $($_.coluna) esperado=$($_.esperado) atual=$($_.atual)" } }
    }
  }
  throw 'Schema da planilha com divergencias — ver resultado acima'
}

Write-Host '=== diagnosticoSistema ===' -ForegroundColor Cyan
$diag = Invoke-RestMethod -Uri "$base`?action=diagnosticoSistema" -Method Get -TimeoutSec 30
if (-not $diag.ok) { throw "diagnosticoSistema falhou: $($diag.erro)" }
foreach ($aba in @('locacoes','custos','config','relatorios')) {
  if (-not $diag.abas.$aba) { throw "Aba ausente: $aba" }
}
Write-Host "locacoes=$($diag.linhas.locacoes) ativas=$($diag.locacoesAtivas) custos=$($diag.linhas.custos)"

Write-Host ''
Write-Host 'TESTE_REAUDITORIA_PLANILHA OK' -ForegroundColor Green
