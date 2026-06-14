param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
)

$ErrorActionPreference = "Stop"

function Invoke-F9Api {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 90
}

$result = [ordered]@{
  suite = "TESTE_FASE9_FOLHA_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-F9Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-F9Api @{ action = "ping" }
  Add-F9Check "ping" "ok" $ping.versao
  if ($ping.versao -match 'v1\.5\.(8[1-9]|9[0-9])') {
    Add-F9Check "gas.versao" "ok" $ping.versao
  } else {
    Add-F9Check "gas.versao" "warn" ("esperado v1.5.81+ (atual: $($ping.versao))")
  }

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year
  $kpi = Invoke-F9Api @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano; lite = "1" }
  if (-not $kpi.ok) { throw "kpiMes: $($kpi.erro)" }

  $v = $kpi.viabilidadeContratacao
  if ($null -eq $v -or -not $v.ok) {
    if ($ping.versao -match 'v1\.5\.(8[0-9]|9[0-9])') { throw "viabilidadeContratacao ausente ou ok=false" }
    Add-F9Check "viabilidadeContratacao" "warn" "publique GAS v1.5.81+"
  } else {
    foreach ($f in @('nivel', 'label', 'motivo', 'recomendacao', 'folhaMensal', 'projecaoResComFolha', 'margemProjComFolha', 'gates')) {
      if ($null -eq $v.$f) { throw "viabilidadeContratacao.$f ausente" }
    }
    Add-F9Check "viabilidadeContratacao" "ok" ($v.nivel + " / " + $v.label)
    if ($null -eq $v.folhaProRata) { throw "folhaProRata ausente (GAS v1.5.81+)" }
    Add-F9Check "folhaMensal" "ok" ("R$ " + $v.folhaMensal)
    Add-F9Check "folhaProRata" "ok" ("R$ " + $v.folhaProRata)
    Add-F9Check "resultadoComFolha" "ok" ("R$ " + $v.resultadoComFolha + " parcial")
    Add-F9Check "projecaoResComFolha" "ok" ("R$ " + $v.projecaoResComFolha + " marg=" + $v.margemProjComFolha + "%")
    Add-F9Check "gates" "ok" ("{0}/{1}" -f [int]$v.gatesOk, [int]$v.gatesTotal)
  }

  $f = $kpi.folhaPlanejamento
  if ($null -eq $f -or $f.custoMensal -le 0) { throw "folhaPlanejamento ausente" }
  Add-F9Check "folhaPlanejamento" "ok" ($f.fonte + " n=" + $f.nFuncionarios)

  $contrat = @($kpi.alertas | Where-Object { $_.codigo -match '^CONTRATACAO_' })
  if ($contrat.Count -lt 1) { throw "alerta CONTRATACAO_* ausente" }
  Add-F9Check "alerta.contratacao" "ok" $contrat[0].codigo

  $lf = $kpi.leadingFinanceiro
  if ($null -eq $lf.breakEvenComFolha -or $lf.folhaMensalSimulada -le 0) {
    throw "leadingFinanceiro.breakEvenComFolha ou folhaMensalSimulada ausente"
  }
  Add-F9Check "leading.breakEvenComFolha" "ok" ("be=" + $lf.breakEvenComFolha + " loc/dia")

  $result.status = "ok"
  $result.summary = "FASE 9 folha CLT OK - " + $v.label
  $result.viabilidade = @{
    nivel = $v.nivel
    label = $v.label
    motivo = $v.motivo
    recomendacao = $v.recomendacao
    gates = $v.gates
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-F9Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
