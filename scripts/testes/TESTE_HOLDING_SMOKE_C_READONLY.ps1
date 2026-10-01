# Holding smoke C — Caixa dual (Golden ≠ zerado por filtro LV) + sinais Avulso FE
# Readonly: resumoDia golden/laville/all · guards FE avulso Drift/Dino
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path (Join-Path $root "mk-avulso.js"))) {
  $root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

function Invoke-SmokeCApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 90
}

$result = [ordered]@{
  suite = "TESTE_HOLDING_SMOKE_C_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-C([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-SmokeCApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-C "ping" "ok" $ping.versao

  $hoje = Get-Date -Format "dd/MM/yyyy"
  $adm = @{ adminPin = $AdminPin; authRole = "admin"; data = $hoje }

  $g = Invoke-SmokeCApi ($adm + @{ action = "resumoDia"; unidadeId = "golden" })
  if (-not $g.ok) { throw "resumoDia golden: $($g.erro)" }
  Add-C "caixa.golden" "ok" ("fat=$($g.fat) n=$($g.n)")

  $lv = Invoke-SmokeCApi ($adm + @{ action = "resumoDia"; unidadeId = "laville" })
  if (-not $lv.ok) { throw "resumoDia laville: $($lv.erro)" }
  Add-C "caixa.laville" "ok" ("fat=$($lv.fat) n=$($lv.n)")

  $all = Invoke-SmokeCApi ($adm + @{ action = "resumoDia"; unidadeId = "all" })
  if (-not $all.ok) { throw "resumoDia all: $($all.erro)" }
  Add-C "caixa.all" "ok" ("fat=$($all.fat) n=$($all.n)")

  # Holding: filtro LV não pode apagar o dia Golden quando LV=0
  $fatG = [double]($g.fat)
  $fatLv = [double]($lv.fat)
  $fatAll = [double]($all.fat)
  if ($fatLv -eq 0 -and $fatG -gt 0 -and [math]::Abs($fatAll - $fatG) -gt 0.01) {
    Add-C "filtro.holding" "fail" "all=$fatAll != golden=$fatG com LV=0"
  } else {
    Add-C "filtro.holding" "ok" "all ≈ golden quando LV=0 (ou ambos zero)"
  }

  $av = Get-Content (Join-Path $root "mk-avulso.js") -Raw -Encoding UTF8
  if ($av -notmatch "tipo:\s*'Drift'" -or $av -notmatch "tipo:\s*'Dino'") {
    Add-C "fe.avulso.laville.tipos" "fail" "mk-avulso.js sem Drift/Dino para laville"
  } else {
    Add-C "fe.avulso.laville.tipos" "ok" "Drift + Dino no grid La Ville"
  }

  $dual = Get-Content (Join-Path $root "mk-dual-ui.js") -Raw -Encoding UTF8
  if ($dual -notmatch "mkDualMountPills_") {
    Add-C "fe.dual.pills" "fail" "mkDualMountPills_ ausente"
  } else {
    Add-C "fe.dual.pills" "ok" "pills dual presentes"
  }

  $opsLv = Invoke-SmokeCApi @{ action = "listarOperadoresLogin"; unidadeId = "laville" }
  $nOps = 0
  if ($opsLv.operadores) { $nOps = @($opsLv.operadores).Count }
  elseif ($opsLv.lista) { $nOps = @($opsLv.lista).Count }
  if ($nOps -eq 0) {
    Add-C "ops.laville" "warn" "equipe LV=0 (P2 contratação)"
  } else {
    Add-C "ops.laville" "ok" ("n=$nOps")
  }

  $fails = @($result.checks | Where-Object { $_.status -eq "fail" }).Count
  $warns = @($result.checks | Where-Object { $_.status -eq "warn" }).Count
  if ($fails -gt 0) {
    $result.status = "fail"
    $result.summary = "Smoke C: $fails falha(s)"
  } elseif ($warns -gt 0) {
    $result.status = "ok_with_warnings"
    $result.summary = "Smoke C OK com $warns aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "Holding smoke C OK"
  }
} catch {
  Add-C "exception" "fail" $_.Exception.Message
  $result.status = "fail"
  $result.summary = $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
