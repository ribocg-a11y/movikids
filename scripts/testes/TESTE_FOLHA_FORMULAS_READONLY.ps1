param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-FolhaApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 120
}

function Is-FormulaError([object]$Val) {
  $s = [string]$Val
  return ($s -match '^#')
}

$result = [ordered]@{
  suite = "TESTE_FOLHA_FORMULAS_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-FCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-FolhaApi @{ action = "ping" }
  Add-FCheck "ping.online" "ok" $ping.versao
  if ($ping.versao -notmatch 'v1\.5\.9[1-9]|v1\.5\.[1-9][0-9]{2,}') {
    Add-FCheck "gas.versao" "fail" ("Web App em " + $ping.versao + " - publique Nova versao v1.5.91+")
  } else {
    Add-FCheck "gas.versao" "ok" $ping.versao
  }

  $repair = Invoke-FolhaApi @{ action = "repairFolhaAdmin"; adminPin = $AdminPin }
  if (-not $repair.ok) { throw "repairFolhaAdmin: $($repair.erro)" }
  Add-FCheck "repair.locale" "ok" $repair.locale

  foreach ($cell in @(
    @{ name = "B25"; val = $repair.b25; fx = $repair.b25Formula }
    @{ name = "B68"; val = $repair.b68; fx = $null }
    @{ name = "D36"; val = $repair.d36; fx = $repair.d36Formula }
  )) {
    if ($null -ne $cell.val -and (Is-FormulaError $cell.val)) {
      Add-FCheck ("celula." + $cell.name) "fail" ("valor=" + $cell.val)
    } elseif ($null -eq $cell.val -and $ping.versao -notmatch 'v1\.5\.9[1-9]') {
      Add-FCheck ("celula." + $cell.name) "warn" "campo ausente na resposta (Web v1.5.90)"
    } else {
      Add-FCheck ("celula." + $cell.name) "ok" ([string]$cell.val)
    }
  }

  if ($repair.b25Formula -notmatch 'SE|IF') {
    Add-FCheck "formula.B25" "fail" $repair.b25Formula
  } else {
    Add-FCheck "formula.B25" "ok" $repair.b25Formula
  }

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year
  $kpi = Invoke-FolhaApi @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano; lite = "1" }
  if (-not $kpi.ok) { throw "kpiMes: $($kpi.erro)" }

  $f = $kpi.folhaPlanejamento
  if ($null -eq $f) { throw "folhaPlanejamento ausente" }

  if (-not $f.ok) {
    Add-FCheck "folhaPlanejamento.ok" "fail" ("fonte=" + $f.fonte + " - B68 nao legivel na planilha")
  } else {
    Add-FCheck "folhaPlanejamento.ok" "ok" "fonte=FOLHA"
  }

  if ($f.fonte -ne "FOLHA") {
    Add-FCheck "folhaPlanejamento.fonte" "fail" $f.fonte
  } else {
    Add-FCheck "folhaPlanejamento.fonte" "ok" "FOLHA"
  }

  $vaEsperado = [math]::Round($f.vaMensal / $f.diasVa, 2)
  if ([math]::Abs($f.vaDia - $vaEsperado) -gt 0.05) {
    Add-FCheck "folha.vaDia" "fail" ("vaDia=" + $f.vaDia + " esperado~=" + $vaEsperado)
  } else {
    Add-FCheck "folha.vaDia" "ok" ("R$ " + $f.vaDia + " (" + $f.vaMensal + "/" + $f.diasVa + ")")
  }

  if ($f.diasVa -lt 15 -or $f.diasVa -gt 31) {
    Add-FCheck "folha.diasVa" "fail" $f.diasVa
  } else {
    Add-FCheck "folha.diasVa" "ok" $f.diasVa
  }

  if ($f.custoMensal -lt 1000) {
    Add-FCheck "folha.custoMensal" "fail" $f.custoMensal
  } else {
    Add-FCheck "folha.custoMensal" "ok" ("R$ " + $f.custoMensal)
  }

  $failCount = @($result.checks | Where-Object { $_.status -eq "fail" }).Count
  if ($failCount -gt 0) {
    $result.status = "fail"
    $result.summary = "$failCount falha(s) - planilha FOLHA com formulas quebradas ou Web App desatualizado"
  } else {
    $result.status = "ok"
    $result.summary = "FOLHA formulas e leitura API OK"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-FCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
