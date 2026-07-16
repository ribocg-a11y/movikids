param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$TimeoutSec = 90
)

# I121 — paridade Meta/kpiMes × Centro/comando (pay-first Ativa/Pendente).
# Readonly. Em Web < v1.5.200: warn (nao fail) ate Nova versao.

$ErrorActionPreference = "Stop"

function Invoke-I121Api {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec $TimeoutSec
}

$result = [ordered]@{
  suite = "TESTE_I121_DASH_SYNC_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-I121([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-I121Api @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-I121 "ping" "ok" $ping.versao

  $ver200 = $false
  if ($ping.versao -match 'v1\.5\.(\d+)') {
    $n = [int]$Matches[1]
    if ($n -ge 200) { $ver200 = $true; Add-I121 "gas.versao.i121" "ok" $ping.versao }
    else { Add-I121 "gas.versao.i121" "warn" ("Web {0} — publique v1.5.200 (kpiMes pay-first)" -f $ping.versao) }
  }

  $hoje = Get-Date
  $dataFmt = "{0}/{1}/{2}" -f $hoje.Day.ToString("00"), $hoje.Month.ToString("00"), $hoje.Year
  $mes = $hoje.Month
  $ano = $hoje.Year

  $cmd = Invoke-I121Api @{ action = "comandoOperacional"; adminPin = $AdminPin; _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  if (-not $cmd.ok) { throw "comandoOperacional: $($cmd.erro)" }
  Add-I121 "comando" "ok" ("nHoje=$($cmd.nHoje) fat=$($cmd.fatHoje) abertas=$($cmd.locacoes.abertas)")

  $kpi = Invoke-I121Api @{ action = "kpiMes"; mes = $mes; ano = $ano; lite = "1"; adminPin = $AdminPin; _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  if (-not $kpi.ok) { throw "kpiMes: $($kpi.erro)" }
  Add-I121 "kpiMes" "ok" ("nHoje=$($kpi.nHoje) fat=$($kpi.fatHoje)")

  if ($null -ne $kpi.PSObject.Properties['caixaIncluiAbertas'] -and $kpi.caixaIncluiAbertas) {
    Add-I121 "kpi.caixaIncluiAbertas" "ok" "true"
  } elseif ($ver200) {
    Add-I121 "kpi.caixaIncluiAbertas" "fail" "campo ausente apos v1.5.200"
  } else {
    Add-I121 "kpi.caixaIncluiAbertas" "warn" "aguardando Web 200"
  }

  $nCmd = [int]($cmd.nHoje)
  $nKpi = [int]($kpi.nHoje)
  $fatCmd = [double]($cmd.fatHoje)
  $fatKpi = [double]($kpi.fatHoje)

  if ($nCmd -eq $nKpi) {
    Add-I121 "paridade.nHoje" "ok" ("n=$nCmd")
  } elseif ($ver200) {
    Add-I121 "paridade.nHoje" "fail" ("comando=$nCmd kpi=$nKpi — Meta vs Centro divergentes")
  } else {
    Add-I121 "paridade.nHoje" "warn" ("comando=$nCmd kpi=$nKpi — tipico ate I121 Web")
  }

  $fatDiff = [math]::Abs($fatCmd - $fatKpi)
  if ($fatDiff -le 0.05) {
    Add-I121 "paridade.fatHoje" "ok" ("fat=$fatCmd")
  } elseif ($ver200) {
    Add-I121 "paridade.fatHoje" "fail" ("comando=$fatCmd kpi=$fatKpi")
  } else {
    Add-I121 "paridade.fatHoje" "warn" ("comando=$fatCmd kpi=$fatKpi")
  }

  $beCmd = $null
  if ($cmd.leadingDia) { $beCmd = $cmd.leadingDia.breakEvenLocacoesDia }
  $beKpi = $null
  if ($kpi.leadingFinanceiro) { $beKpi = $kpi.leadingFinanceiro.breakEvenLocacoesDia }
  if ($null -ne $beCmd -and $null -ne $beKpi) {
    if ([int]$beCmd -eq [int]$beKpi) {
      Add-I121 "paridade.breakEven" "ok" ("be=$beCmd")
    } else {
      # ticket pode diferir centavos → BE ceil diverge 1; warn nao fail
      Add-I121 "paridade.breakEven" "warn" ("comando=$beCmd kpi=$beKpi")
    }
  } else {
    Add-I121 "paridade.breakEven" "warn" "leading ausente num dos lados"
  }

  $dia = $hoje.Day
  $fatDia = @($kpi.fatPorDia | Where-Object { [int]$_.dia -eq $dia } | Select-Object -First 1)
  if ($fatDia -and [math]::Abs([double]$fatDia.valor - $fatKpi) -le 0.05) {
    Add-I121 "fatPorDia.hoje" "ok" ("dia=$dia valor=$($fatDia.valor)")
  } elseif ($fatDia) {
    Add-I121 "fatPorDia.hoje" "warn" ("dia=$dia fatPorDia=$($fatDia.valor) nHoje.fat=$fatKpi")
  } else {
    Add-I121 "fatPorDia.hoje" "warn" "sem ponto do dia em fatPorDia"
  }

  $fail = @($result.checks | Where-Object { $_.status -eq "fail" })
  $warn = @($result.checks | Where-Object { $_.status -eq "warn" })
  if ($fail.Count -gt 0) {
    $result.status = "fail"
    $result.summary = "Falhas I121: $($fail.Count)"
  } elseif ($warn.Count -gt 0) {
    $result.status = "ok_with_warnings"
    $result.summary = "I121 parcial; $($warn.Count) aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "kpiMes × comando alinhados (I121)"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-I121 "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
