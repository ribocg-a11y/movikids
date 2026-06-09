param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
)

$ErrorActionPreference = "Stop"

function Invoke-F6Api {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 45
}

$result = [ordered]@{
  suite = "TESTE_FASE6_COCKPIT_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-F6Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-F6Api @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-F6Check "ping" "ok" $ping.versao

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year
  $kpi = Invoke-F6Api @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano }
  if (-not $kpi.ok) { throw "kpiMes falhou: $($kpi.erro)" }

  foreach ($field in @('narrativaExecutiva', 'ocupacaoMediaFrota', 'cockpit')) {
    if ($null -eq $kpi.$field) {
      if ($ping.versao -match 'v1\.5\.7[5-9]') { throw "campo ausente: $field" }
      Add-F6Check "kpi.$field" "warn" "publique GAS v1.5.75 (Nova versao Web)"
      $result.status = "warn"
      $result.summary = "Aguardando GAS v1.5.75 em producao"
      $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
      $result | ConvertTo-Json -Depth 4
      exit 0
    }
    Add-F6Check "kpi.$field" "ok" "presente"
  }

  $nar = [string]$kpi.narrativaExecutiva
  if ($nar.Length -lt 40) { throw "narrativaExecutiva curta demais: $nar" }
  Add-F6Check "narrativa.tamanho" "ok" ("len=" + $nar.Length)

  if ($null -eq $kpi.cockpit.deltaFatMesPct -and $kpi.fatMesAnt -gt 0) {
    Add-F6Check "cockpit.deltaFat" "warn" "deltaFatMesPct null com fatMesAnt"
  } else {
    Add-F6Check "cockpit.deltaFat" "ok" ("delta=" + $kpi.cockpit.deltaFatMesPct)
  }

  $result.status = "ok"
  $result.summary = "FASE 6 cockpit OK — narrativa + ocupacaoMediaFrota + cockpit"
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-F6Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 4
if ($result.status -eq "fail") { exit 1 }
