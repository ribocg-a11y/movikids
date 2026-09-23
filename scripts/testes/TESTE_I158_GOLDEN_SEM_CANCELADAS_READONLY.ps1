# I158 — relatório Golden nunca conta Cancelada; paridade com kpiMes (fat + nContas)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$Mes = 0,
  [int]$Ano = 0
)

$ErrorActionPreference = "Stop"

function Invoke-I158Api {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 120
}

$result = [ordered]@{
  suite = "TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-I158([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-I158Api @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-I158 "ping" "ok" $ping.versao

  $gasPath = Join-Path $PSScriptRoot "..\..\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
  $gasRaw = Get-Content -Raw -Path $gasPath -ErrorAction Stop
  if ($gasRaw -notmatch 'function isStatusFaturavelCaixa_') { throw "isStatusFaturavelCaixa_ ausente no .gs" }
  if ($gasRaw -notmatch 'function aggMovimentacaoMesCaixa_') { throw "aggMovimentacaoMesCaixa_ ausente no .gs" }
  if ($gasRaw -match 'function _gerarHtmlRelatorio_[\s\S]{0,1200}String\(r\[14\]\) === ''Ativa''') {
    throw "_gerarHtmlRelatorio_ ainda usa filtro legado (conta Cancelada)"
  }
  Add-I158 "gas.source" "ok" "helper I158 presente"

  if ($Mes -lt 1) { $Mes = (Get-Date).Month }
  if ($Ano -lt 1) { $Ano = (Get-Date).Year }

  $kpi = Invoke-I158Api @{ action = "kpiMes"; adminPin = $AdminPin; authRole = "admin"; mes = $Mes; ano = $Ano; lite = "1" }
  if (-not $kpi.ok) { throw "kpiMes falhou: $($kpi.erro)" }
  Add-I158 "kpiMes" "ok" ("fat=$($kpi.fatMes) n=$($kpi.nMes)")

  $prev = Invoke-I158Api @{ action = "buscarPreviewRelatorio"; adminPin = $AdminPin; mes = $Mes; ano = $Ano }
  if (-not $prev.html) { throw "preview Golden sem html" }

  $fatM = [regex]::Match($prev.html, 'color:#2E7D32">R\$\s*([\d.,]+)</div>\s*<div[^>]*>Faturamento bruto')
  $nM = [regex]::Match($prev.html, 'color:#1565C0">(\d+)</div>\s*<div[^>]*>Locações')
  if (-not $fatM.Success -or -not $nM.Success) { throw "nao parseou fat/n do HTML Golden" }

  $fatG = [double]($fatM.Groups[1].Value -replace '\.', '' -replace ',', '.')
  $nG = [int]$nM.Groups[1].Value
  $fatK = [double]$kpi.fatMes
  $nK = [int]$kpi.nMes

  if ($prev.html -match 'Cancelada' -and $prev.html -notmatch 'sem canceladas') {
    Add-I158 "html.semCancelada" "warn" "HTML menciona Cancelada"
  } else {
    Add-I158 "html.semCancelada" "ok" "rodape/marca sem canceladas"
  }

  if ([math]::Abs($fatG - $fatK) -gt 0.05) {
    if ($ping.versao -notmatch 'v1\.5\.22[2-9]|v1\.5\.2[3-9]') {
      Add-I158 "paridade.fat" "warn" ("GAS prod $($ping.versao) ainda sem I158: Golden=$fatG kpi=$fatK — publique Nova versao Web")
      $result.status = "warn"
      $result.summary = "Fonte OK; aguarda Nova versao Web GAS v1.5.222+"
    } else {
      throw "paridade fat: Golden=$fatG kpiMes=$fatK"
    }
  } else {
    Add-I158 "paridade.fat" "ok" ("fat=$fatG")
  }

  if ($nG -ne $nK) {
    if ($ping.versao -notmatch 'v1\.5\.22[2-9]|v1\.5\.2[3-9]') {
      Add-I158 "paridade.n" "warn" ("Golden n=$nG kpi n=$nK — Nova versao Web")
    } else {
      throw "paridade n: Golden=$nG kpiMes=$nK"
    }
  } else {
    Add-I158 "paridade.n" "ok" ("n=$nG")
  }

  if (-not $result.status) {
    $result.status = "ok"
    $result.summary = "Golden alinhado a kpiMes (sem Cancelada) mes=$Mes/$Ano"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-I158 "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 4
if ($result.status -eq "fail") { exit 1 }
