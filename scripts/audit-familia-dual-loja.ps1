<#
.SYNOPSIS
  Audit automático da família dual-loja / fantasma / parcial (I191–I198).
  Ir além do fix pontual: detecta anti-padrões que ainda podem explodir.

.USAGE
  .\scripts\audit-familia-dual-loja.ps1
  Chamado pelo pre-push-check (guard.i198.familia).
#>
[CmdletBinding()]
param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Continue"
$fails = New-Object System.Collections.Generic.List[string]
$oks = New-Object System.Collections.Generic.List[string]

function Read-Text([string]$rel) {
  $p = Join-Path $Root $rel
  if (-not (Test-Path $p)) { return $null }
  return Get-Content -Path $p -Raw -Encoding UTF8
}

# 1) Firebase não pode aplicar ativos
$fb = Read-Text "mk-firebase.js"
if ($null -eq $fb) {
  $fails.Add("mk-firebase.js ausente")
} elseif ($fb -match 'aplicarDadosInicio\(\{[^}]*ativos') {
  $fails.Add("Firebase ainda chama aplicarDadosInicio com ativos (fantasma)")
} elseif ($fb -notmatch 'mkSyncListarAtivasFallback_') {
  $fails.Add("Firebase sem reconcile listarAtivas")
} else {
  $oks.Add("Firebase: so listarAtivas")
}

# 2) Política única de cache frio
$sync = Read-Text "mk-sync.js"
if ($null -eq $sync) {
  $fails.Add("mk-sync.js ausente")
} else {
  if ($sync -notmatch 'mkInicioCacheSafeForApply_') {
    $fails.Add("sync sem mkInicioCacheSafeForApply_ (politica I198)")
  } elseif ($sync -match 'if \(cached\) aplicarDadosInicio\(cached\)') {
    $fails.Add("sync ainda aplica cache cru com Ativa")
  } else {
    $oks.Add("sync: cache safe helper")
  }
  # I197: completar unidadeId so se ausente — nao sobrescrever GAS/all
  if ($sync -match 'payload\.unidadeId\s*=\s*mkUnidadeId_\(\)' -and $sync -notmatch 'if \(!payload\.unidadeId') {
    $fails.Add("listarAtivas restampa unidadeId sem guardar se GAS ja mandou")
  } else {
    $oks.Add("sync: unidadeId listarAtivas preserva GAS")
  }
}

# 3) Holding: mapa sessoesAtivas exportado
$auth = Read-Text "mk-auth.js"
if ($null -eq $auth) {
  $fails.Add("mk-auth.js ausente")
} elseif ($auth -notmatch 'window\.applySessaoAtivaFromApi_' -or $auth -notmatch 'sessoesAtivasRemotas') {
  $fails.Add("auth sem mapa/export sessoesAtivas")
} elseif ($auth -match 'uidOp === ''all''\) uidOp = ''golden''') {
  $fails.Add("deslogar ainda all→golden literal")
} else {
  $oks.Add("auth: mapa + sem all→golden literal")
}

# 4) GP badges via mapa
$gp = Read-Text "mk-gestao-pessoas-admin.js"
if ($null -ne $gp) {
  if ($gp -match 'logadoBalcao:\s*sessaoId\s*===\s*Number' -or $gp -notmatch 'gpAdmLogadosBalcaoIds_') {
    $fails.Add("GP badges ainda so sessaoAtiva singular")
  } else {
    $oks.Add("GP: logados via mapa")
  }
}

# 5) IDB por unidade
$idb = Read-Text "mk-idb-store.js"
if ($null -ne $idb) {
  if ($idb -notmatch 'mkIdbSnapshotKey_' -or $idb -notmatch 'snapshot_v1_') {
    $fails.Add("IDB snapshot global (mistura lojas)")
  } else {
    $oks.Add("IDB: snapshot por uid")
  }
}

# 6) Auth engolindo unidadeId (padrão I196) em custos
$cus = Read-Text "mk-custos.js"
if ($null -ne $cus) {
  if ($cus -match "unidadeId:\s*'all'\s*,\s*\.\.\.apiParamsComAuth_" -or
      $cus -match 'unidadeId:\s*custoUnidadeSel_\s*,\s*\.\.\.apiParamsComAuth_') {
    $fails.Add("custos: auth depois de unidadeId (I196)")
  } else {
    $oks.Add("custos: unidadeId apos auth")
  }
}

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  okCount   = $oks.Count
  failCount = $fails.Count
  oks       = @($oks)
  fails     = @($fails)
  status    = $(if ($fails.Count -eq 0) { "ok" } else { "fail" })
}

$result | ConvertTo-Json -Depth 4
if ($fails.Count -gt 0) { exit 1 }
exit 0
