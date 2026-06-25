param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-KpiApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 45
}

$result = [ordered]@{
  suite = "TESTE_MINI_DRE_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-KCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-KpiApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-KCheck "ping" "ok" $ping.versao
  if ($ping.versao -notmatch 'v1\.5\.8[2-9]') {
    Add-KCheck "gas.versao" "warn" "publique GAS v1.5.82+ (Nova versao Web) para miniDre"
  }

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year
  $kpi = Invoke-KpiApi @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano }
  if (-not $kpi.ok) { throw "kpiMes falhou: $($kpi.erro)" }

  foreach ($field in @('miniDre', 'margemBruta', 'margemBrutaPct', 'margemOperacional', 'margemOperacionalPct')) {
    if ($null -eq $kpi.$field) {
      Add-KCheck ("kpi.$field") "warn" "ausente - GAS v1.5.82?"
      continue
    }
    Add-KCheck ("kpi.$field") "ok" "presente"
  }

  if ($kpi.miniDre) {
    $md = $kpi.miniDre
    Add-KCheck "miniDre.planoFonte" "ok" ($md.planoFonte)
    $diff = [Math]::Abs([double]$md.margemOperacional - [double]$kpi.resultado)
    if ($diff -gt 0.02) {
      throw "paridade: margemOperacional=$($md.margemOperacional) resultado=$($kpi.resultado)"
    }
    Add-KCheck "paridade.margemOperacional" "ok" ("diff=" + $diff)
    if ($md.cusCMV -lt 0 -or $md.cusOPEX -lt 0) { throw "CMV/OPEX negativos" }
    Add-KCheck "miniDre.cmvOpex" "ok" ("CMV=$($md.cusCMV) OPEX=$($md.cusOPEX)")
  }

  $result.status = if ($result.checks | Where-Object { $_.status -eq "warn" }) { "warn" } else { "ok" }
  $result.summary = "mini-DRE FASE 14 readonly OK"
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-KCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5
if ($result.status -eq "fail") { exit 1 }
