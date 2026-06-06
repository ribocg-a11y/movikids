# I16 — Paridade cronometro: carregarInicio.ativos vs buscarPortalResponsavel
# Readonly. Falha se startTimestamp/mins divergirem ou GAS < v1.5.55.
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [int]$MaxElapsedDriftSec = 2
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -TimeoutSec 45
}

function Parse-GasVersion {
  param([string]$Versao)
  $m = [regex]::Match($Versao, '(\d+)\.(\d+)\.(\d+)')
  if (-not $m.Success) { return $null }
  return [int]$m.Groups[1].Value * 10000 + [int]$m.Groups[2].Value * 100 + [int]$m.Groups[3].Value
}

function RestanteSec-Canon {
  param($Loc)
  $status = [string]$Loc.status
  $mins = [double]($Loc.mins)
  $ext = [double]($Loc.extendedMins)
  if ($null -ne $Loc.originalMins) {
    $mins = [double]$Loc.originalMins + $ext
  }
  if ($status -eq 'Pendente') { return [int]($mins * 60) }
  $ts = [double]($Loc.startTimestamp)
  $now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  if ($ts -lt 1e12 -or $ts -gt ($now + 300000)) { return [int]($mins * 60) }
  $elapsed = ($now - $ts) / 1000.0
  return [int][Math]::Floor($mins * 60 - $elapsed)
}

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-CCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  $gasNum = Parse-GasVersion $ping.versao
  $minGas = Parse-GasVersion "v1.5.55"
  if ($null -eq $gasNum -or $gasNum -lt $minGas) {
    throw "GAS $($ping.versao) menor que v1.5.55 - portal cronometro nao alinhado. Nova versao Web no editor."
  }
  Add-CCheck "gas.versao_min" "ok" $ping.versao

  $ci = Invoke-MkApi @{ action = "carregarInicio" }
  if (-not $ci.ok) { throw "carregarInicio falhou" }
  $ativos = @($ci.ativos)
  Add-CCheck "balcao.ativos" "ok" ("count=" + $ativos.Count)

  $portalHtml = Join-Path $PSScriptRoot "acompanhar.html"
  if (-not (Test-Path $portalHtml)) { throw "acompanhar.html ausente" }
  $src = Get-Content -Path $portalHtml -Raw -Encoding UTF8
  foreach ($needle in @('function canonLoc_', 'function calcStartTimestamp_', 'function restante(')) {
    if ($src -notmatch [regex]::Escape($needle)) { throw "acompanhar.html sem $needle" }
  }
  Add-CCheck "fe.portal.canon" "ok" "canonLoc_ + calcStartTimestamp_ + restante"

  $gasFile = Join-Path $PSScriptRoot "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
  if (Test-Path $gasFile) {
    $gs = Get-Content -Path $gasFile -Raw -Encoding UTF8
    if ($gs -notmatch 'function buscarPortalResponsavel_[\s\S]{0,1200}timestampCanonico_') {
      throw "GAS local: buscarPortalResponsavel_ sem timestampCanonico_"
    }
    Add-CCheck "gas.local.portal.canon" "ok" "timestampCanonico_ em buscarPortalResponsavel_"
  } else {
    Add-CCheck "gas.local.portal.canon" "warn" "arquivo .gs canonico nao encontrado"
  }

  $compared = 0
  foreach ($a in $ativos) {
    $tel = [string]$a.telefone
    if (-not $tel) { continue }
    $digits = ($tel -replace '\D', '')
    if ($digits.Length -lt 10) { continue }

    $portal = Invoke-MkApi @{ action = "buscarPortalResponsavel"; telefone = $digits }
    if (-not $portal.ok) { throw "portal falhou tel=$digits : $($portal.erro)" }

    $match = $portal.locacoes | Where-Object { $_.id -eq $a.id -or $_.rowIndex -eq $a.rowIndex } | Select-Object -First 1
    if (-not $match) {
      Add-CCheck ("portal.match." + $a.id) "warn" "locacao balcao nao retornada no portal"
      continue
    }

    $compared++
    $fields = @('startTimestamp', 'mins', 'originalMins', 'extendedMins', 'status')
    foreach ($f in $fields) {
      $bv = $a.$f
      $pv = $match.$f
      if ([string]$bv -ne [string]$pv) {
        throw "Campo $f diverge id=$($a.id): balcao=$bv portal=$pv"
      }
    }

    $rb = RestanteSec-Canon $a
    $rp = RestanteSec-Canon $match
    $drift = [Math]::Abs($rb - $rp)
    if ($drift -gt $MaxElapsedDriftSec) {
      throw "Restante diverge id=$($a.id): balcao=${rb}s portal=${rp}s drift=${drift}s"
    }
    Add-CCheck ("paridade." + $a.id) "ok" "restante~${rb}s drift=${drift}s"
  }

  if ($compared -eq 0) {
    Add-CCheck "paridade.locacoes" "warn" "nenhuma ativa com telefone para comparar (ok se loja vazia)"
  } else {
    Add-CCheck "paridade.locacoes" "ok" "comparadas=$compared"
  }

  $result.status = "ok"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-CCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -ne "ok") { exit 1 }
