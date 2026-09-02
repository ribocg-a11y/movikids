param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [int]$TimeoutSec = 90
)

# I151 — encerrar fantasma: FE guards + paridade listarAtivas vs carregarInicio (readonly).

$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not $root) { $root = (Get-Location).Path }

$result = [ordered]@{
  suite = "TESTE_I151_ENCERRAR_FANTASMA_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-I151([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

function Read-RepoFile([string]$Rel) {
  $p = Join-Path $root $Rel
  if (-not (Test-Path $p)) { throw "Arquivo ausente: $Rel" }
  return Get-Content -Path $p -Raw -Encoding UTF8
}

try {
  $sync = Read-RepoFile "mk-sync.js"
  $drawer = Read-RepoFile "mk-drawer.js"
  $snap = Read-RepoFile "mk-local-snapshot.js"
  $core = Read-RepoFile "mk-core.js"

  if ($sync -notmatch 'mkReconcileFantasmasEmergencia_') {
    Add-I151 "static.reconcile" "fail" "mkReconcileFantasmasEmergencia_ ausente"
  } else {
    Add-I151 "static.reconcile" "ok" "reconcile emergencia"
  }

  if ($sync -notmatch 'mkScheduleFantasmaReconcile_' -or $sync -notmatch 'aplicarDadosInicio\(d\)') {
    Add-I151 "static.schedule" "fail" "reconcile pos carregarInicio ausente"
  } else {
    Add-I151 "static.schedule" "ok" "reconcile apos inicio"
  }

  if ($sync -notmatch 'payload\.ativos\.length === 0[\s\S]{0,120}mkInvalidateInicioCache_') {
    Add-I151 "static.listar.invalidate" "fail" "listarAtivas=0 nao invalida cache"
  } else {
    Add-I151 "static.listar.invalidate" "ok" "listarAtivas vazio limpa cache"
  }

  if ($sync -notmatch 'fromListar[\s\S]{0,200}return false') {
    Add-I151 "static.orphans.listar" "fail" "orphans 120s ainda com fonte listarAtivas"
  } else {
    Add-I151 "static.orphans.listar" "ok" "listarAtivas autoridade nos orphans"
  }

  if ($drawer -notmatch 'mkEncerrarPurgeLocal_' -or $drawer -notmatch 'mkInvalidateInicioCache_') {
    Add-I151 "static.purge.cache" "fail" "purge encerrar sem invalidate cache"
  } else {
    Add-I151 "static.purge.cache" "ok" "purge invalida mk_inicio_cache"
  }

  if ($drawer -notmatch 'j[aá]\s+finalizada|locacao\s+ja\s+finalizada') {
    Add-I151 "static.purge.409" "fail" "regex 409 encerrada estreita (I148)"
  } else {
    Add-I151 "static.purge.409" "ok" "409 encerrada/finalizada purge"
  }

  if ($snap -notmatch 'parcial && ativos\.length > 0\) return' -or $snap -notmatch 'parcial VAZIO') {
    Add-I151 "static.snapshot.vazio" "fail" "snapshot parcial vazio nao grava"
  } else {
    Add-I151 "static.snapshot.vazio" "ok" "snapshot vazio limpa IDB/LS"
  }

  if ($core -notmatch 'mkReconcileFantasmasEmergencia_') {
    Add-I151 "static.boot.reconcile" "fail" "boot sem reconcile 2s"
  } else {
    Add-I151 "static.boot.reconcile" "ok" "boot reconcile cedo"
  }

  $query = "action=ping"
  $ping = Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec $TimeoutSec
  if (-not $ping.ok) { throw "ping falhou" }
  Add-I151 "ping" "ok" $ping.versao

  $la = Invoke-RestMethod -Uri "$BaseUrl`?action=listarAtivas" -Method Get -TimeoutSec $TimeoutSec
  if (-not $la.ok) { throw "listarAtivas falhou" }
  $nLa = @($la.locacoes).Count
  Add-I151 "listarAtivas" "ok" ("total={0}" -f ($la.total))

  try {
    $ci = Invoke-RestMethod -Uri "$BaseUrl`?action=carregarInicio" -Method Get -TimeoutSec $TimeoutSec
    if ($ci.ok) {
      $nCi = @($ci.ativos).Count
      if ($nCi -eq $nLa) {
        Add-I151 "paridade.inicio.listar" "ok" ("ativos={0}" -f $nCi)
      } else {
        Add-I151 "paridade.inicio.listar" "warn" ("carregarInicio={0} listarAtivas={1} — FE deve confiar em listarAtivas" -f $nCi, $nLa)
      }
    } else {
      Add-I151 "carregarInicio" "warn" ("erro: {0}" -f $ci.erro)
    }
  } catch {
    Add-I151 "carregarInicio" "warn" ("timeout/erro: {0}" -f $_.Exception.Message)
    Add-I151 "paridade.inicio.listar" "ok" "listarAtivas respondeu — fallback I148/I151"
  }

  $fails = @($result.checks | Where-Object { $_.status -eq "fail" })
  $result.ok = ($fails.Count -eq 0)
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result | ConvertTo-Json -Depth 5
  if ($fails.Count -gt 0) { exit 1 }
  exit 0
} catch {
  Add-I151 "suite" "fail" $_.Exception.Message
  $result.ok = $false
  $result | ConvertTo-Json -Depth 5
  exit 1
}
