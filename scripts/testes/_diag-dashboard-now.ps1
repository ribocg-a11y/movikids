# Diagnostico rapido — fontes do Centro de Comando
$ErrorActionPreference = 'Stop'
$Base = 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec'

function Invoke-Mk($Params) {
  $q = ($Params.GetEnumerator() | ForEach-Object {
    '{0}={1}' -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join '&'
  $url = "$Base`?$q&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 60
}

$ping = Invoke-Mk @{ action = 'ping' }
Write-Host "PING: $($ping.versao)"

$co = Invoke-Mk @{ action = 'comandoOperacional'; adminPin = '1421'; authRole = 'admin' }
Write-Host '--- comandoOperacional ---'
Write-Host "equipe: presentes=$($co.equipe.presentes) total=$($co.equipe.total)"
Write-Host "sessaoBalcao: $($co.equipe.sessaoBalcao | ConvertTo-Json -Compress)"
Write-Host "fatHoje=$($co.fatHoje) nHoje=$($co.nHoje) locAbertas=$($co.locacoes.abertas)"
Write-Host 'alertas:'
foreach ($a in @($co.alertas)) {
  Write-Host "  [$($a.codigo)] $($a.titulo) - $($a.mensagem)"
}

$ops = Invoke-Mk @{ action = 'listarOperadores'; adminPin = '1421' }
Write-Host '--- listarOperadores.sessaoAtiva ---'
Write-Host ($ops.sessaoAtiva | ConvertTo-Json -Compress)

$gp = Invoke-Mk @{ action = 'gpPainelAdmin'; adminPin = '1421'; authRole = 'admin' }
Write-Host '--- gpPainelAdmin ---'
if ($gp.kpis) { Write-Host "kpis presentes=$($gp.kpis.presentes) total=$($gp.kpis.total)" }
if ($gp.colaboradores) {
  foreach ($c in @($gp.colaboradores)) {
    if ($c.nome -match 'Milena|Raykelly') {
      Write-Host "  $($c.nome): ponto=$($c.ponto.status) banco=$($c.bancoSaldo) logadoBalcao=$($c.logadoBalcao)"
    }
  }
}

$ponto = Invoke-Mk @{ action = 'gpAlertasPonto'; adminPin = '1421'; authRole = 'admin' }
Write-Host '--- gpAlertasPonto ---'
Write-Host "total=$($ponto.total)"
foreach ($a in @($ponto.alertas)) { Write-Host "  $($a.nome): $($a.mensagem)" }

$res = Invoke-Mk @{ action = 'resumoDia'; adminPin = '1421'; authRole = 'admin'; data = (Get-Date -Format 'dd/MM/yyyy') }
Write-Host '--- resumoDia hoje ---'
Write-Host "fat=$($res.fat) n=$($res.n) totalCus=$($res.totalCus)"
