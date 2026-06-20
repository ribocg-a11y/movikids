param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
)

$ErrorActionPreference = "Stop"

function Invoke-MoviApiCfg {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 30
}

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-CfgCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

$expectedVeiculos = @(
  'Carro 01', 'Carro 02', 'Carro 03', 'Carro 04',
  'Triciclo 01', 'Triciclo 02',
  'Pelúcia 01', 'Pelúcia 02', 'Pelúcia 03', 'Pelúcia 04'
)

try {
  $ping = Invoke-MoviApiCfg @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-CfgCheck "ping" "ok" $ping.versao

  $diag = Invoke-MoviApiCfg @{ action = "diagnosticoConfigOperacional" }
  if (-not $diag.ok) { throw "diagnosticoConfigOperacional falhou: $($diag.erro)" }
  if (-not $diag.okConfig) {
    Add-CfgCheck "diag.okConfig" "fail" ($diag.problemas -join "; ")
    throw "CONFIG com problemas: $($diag.problemas -join '; ')"
  }
  Add-CfgCheck "diag.okConfig" "ok" "fonte=$($diag.fonte)"
  if ($diag.fonte -eq "fallback_parcial") {
    Add-CfgCheck "diag.fonte" "warn" "JSON invalido na planilha - usando fallback parcial"
  } else {
    Add-CfgCheck "diag.fonte" "ok" $diag.fonte
  }
  if ($diag.resumo.veiculos -ne 10) {
    Add-CfgCheck "diag.veiculos" "warn" "esperado 10, obtido $($diag.resumo.veiculos)"
  } else {
    Add-CfgCheck "diag.veiculos" "ok" "10 veiculos"
  }
  $tipos = @($diag.resumo.tipos)
  foreach ($t in @('Carro', 'Triciclo')) {
    if ($tipos -notcontains $t) { throw "tipo ausente no diagnostico: $t" }
  }
  $hasPelucia = ($tipos | Where-Object { $_ -like 'Pel*' } | Select-Object -First 1)
  if (-not $hasPelucia) { throw "tipo Pelucia ausente no diagnostico" }
  Add-CfgCheck "diag.tipos" "ok" ($tipos -join ", ")

  $cfg = Invoke-MoviApiCfg @{ action = "carregarOperacaoConfig" }
  if (-not $cfg.ok) { throw "carregarOperacaoConfig falhou: $($cfg.erro)" }
  $c = $cfg.config
  if ($null -eq $c.veiculos_validos -or $c.veiculos_validos.Count -lt 1) {
    throw "veiculos_validos vazio"
  }
  Add-CfgCheck "cfg.veiculos_validos" "ok" ("count=" + $c.veiculos_validos.Count)
  $frotaNorm = @($c.veiculos_validos | ForEach-Object { [string]$_ })
  foreach ($ev in $expectedVeiculos) {
    $found = $false
    foreach ($fv in $frotaNorm) {
      if ($fv -eq $ev) { $found = $true; break }
      if ($ev -like 'Pel*' -and $fv -like 'Pel*' -and ($fv -replace '\D', '') -eq ($ev -replace '\D', '')) {
        $found = $true; break
      }
    }
    if (-not $found) { Add-CfgCheck ("cfg.frota." + ($ev -replace '\s', '_')) "warn" "ausente na CONFIG ativa" }
  }
  if ($c.veiculosDef.Count -ne $c.veiculos_validos.Count) {
    throw "veiculosDef count diverge de veiculos_validos"
  }
  Add-CfgCheck "cfg.veiculosDef" "ok" ("count=" + $c.veiculosDef.Count)

  $carro3h = $c.precosFe.Carro.'3h'.v
  $pel3h = $null
  if ($c.precosFe.'Pelúcia') { $pel3h = $c.precosFe.'Pelúcia'.'3h'.v }
  elseif ($c.precosFe.PSObject.Properties.Name | Where-Object { $_ -like 'Pel*' }) {
    $pk = ($c.precosFe.PSObject.Properties.Name | Where-Object { $_ -like 'Pel*' } | Select-Object -First 1)
    $pel3h = $c.precosFe.$pk.'3h'.v
  }
  if ($carro3h -ne 130) {
    Add-CfgCheck "cfg.preco.carro.3h" "warn" "esperado 130, obtido $carro3h"
  } else {
    Add-CfgCheck "cfg.preco.carro.3h" "ok" "130"
  }
  if ($pel3h -ne 150) {
    Add-CfgCheck "cfg.preco.pelucia.3h" "warn" "esperado 150, obtido $pel3h"
  } else {
    Add-CfgCheck "cfg.preco.pelucia.3h" "ok" "150"
  }

  $inicio = Invoke-MoviApiCfg @{ action = "carregarInicio"; operador = "TESTE_CFG" }
  if (-not $inicio.ok) { throw "carregarInicio falhou: $($inicio.erro)" }
  $op = $inicio.operacaoConfig
  if ($null -eq $op) { throw "carregarInicio sem operacaoConfig" }
  if ($op.veiculos_validos.Count -ne $c.veiculos_validos.Count) {
    throw "paridade inicio vs cfg: veiculos $($op.veiculos_validos.Count) vs $($c.veiculos_validos.Count)"
  }
  $inicioCarro3h = $op.precosFe.Carro.'3h'.v
  if ($inicioCarro3h -ne $carro3h) {
    throw "paridade inicio vs cfg: Carro 3h $inicioCarro3h vs $carro3h"
  }
  Add-CfgCheck "inicio.operacaoConfig" "ok" "paridade com carregarOperacaoConfig"

  $kpi = Invoke-MoviApiCfg @{ action = "buscarKPIsAdmin"; adminPin = $AdminPin }
  if (-not $kpi.ok) { throw "buscarKPIsAdmin falhou: $($kpi.erro)" }
  if ($null -eq $kpi.ocupacaoFrota) { throw "KPI ocupacaoFrota ausente" }
  Add-CfgCheck "kpi.ocupacaoFrota" "ok" ("itens=" + $kpi.ocupacaoFrota.Count)

  $result.status = "ok"
  $result.summary = "CONFIG operacional OK - fonte $($diag.fonte), $($c.veiculos_validos.Count) veiculos"
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-CfgCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
if ($result.status -ne "ok") { exit 1 }
