# Pacote J - gate local antes de git push (versoes FE + paridade HTTP + portal readonly)
# Uso:
#   .\scripts\pre-push-check.ps1
#   .\scripts\pre-push-check.ps1 -SkipNetworkTests   # offline / so versao
#
# Pos-push (obrigatorio apos git push FE — Regra 8 / I24):
#   .\scripts\verify-publish-complete.ps1
#
# Hook opcional (uma vez no repo):
#   git config core.hooksPath githooks

param(
  [switch]$SkipNetworkTests,
  [switch]$ForceOperacao
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  status = "ok"
}

function Add-Check {
  param([string]$Name, [string]$Status, [string]$Detail = "")
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq "fail") { $script:result.status = "fail" }
}

function Read-MkVersion {
  param([string]$Path, [string]$Pattern)
  if (-not (Test-Path $Path)) { return $null }
  $m = Select-String -Path $Path -Pattern $Pattern | Select-Object -First 1
  if (-not $m) { return $null }
  return $m.Matches.Groups[1].Value
}

function Test-PageDivBalance {
  param([string]$Html, [string]$PageId)
  $idNeedle = "id=`"$PageId`""
  $start = $Html.IndexOf($idNeedle)
  if ($start -lt 0) { return $null }
  $divStart = $Html.LastIndexOf("<div", $start)
  if ($divStart -lt 0) { return $null }
  $tail = $Html.Substring($divStart)
  $nextPage = [regex]::Match($tail, '<!--[^>]*PAGE:')
  $len = if ($nextPage.Success) { $nextPage.Index } else { $tail.Length }
  $chunk = $tail.Substring(0, $len)
  $opens = ([regex]::Matches($chunk, "<div[\s>]")).Count
  $closes = ([regex]::Matches($chunk, "</div>")).Count
  return [ordered]@{ page = $PageId; opens = $opens; closes = $closes; balanced = ($opens -eq $closes) }
}

Write-Host "MOVI KIDS pre-push-check (Pacote J)" -ForegroundColor Cyan

try {
  $mkVer = Read-MkVersion (Join-Path $root "mk-version.js") "MK_VERSION\s*=\s*'([^']+)'"
  $swVer = Read-MkVersion (Join-Path $root "sw.js") "SW_VERSION\s*=\s*'([^']+)'"
  if (-not $mkVer) { throw "mk-version.js sem MK_VERSION" }
  if (-not $swVer) { throw "sw.js sem SW_VERSION" }

  if ($mkVer -ne $swVer) {
    Add-Check "versao.mk-vs-sw" "fail" "mk-version=$mkVer sw=$swVer"
  } else {
    Add-Check "versao.mk-vs-sw" "ok" $mkVer
  }

  $indexPath = Join-Path $root "index.html"
  $indexRaw = Get-Content -Path $indexPath -Raw -Encoding UTF8
  $scriptTags = [regex]::Matches($indexRaw, '\?(?:v|nocache)=([0-9]+\.[0-9]+(?:\.[0-9]+)?)')
  $badTags = @($scriptTags | ForEach-Object { $_.Groups[1].Value } | Where-Object { $_ -ne $mkVer })
  if ($badTags.Count -gt 0) {
    Add-Check "versao.index-cache-bust" "fail" ("desalinhado: " + ($badTags | Select-Object -Unique) -join ", ")
  } else {
    Add-Check "versao.index-cache-bust" "ok" ("?v=" + $mkVer)
  }

  $gpPath = Join-Path $root "gestao-pessoas.html"
  if (Test-Path $gpPath) {
    $gpRaw = Get-Content -Path $gpPath -Raw -Encoding UTF8
    $gpTags = [regex]::Matches($gpRaw, '\?(?:v|nocache)=([0-9]+\.[0-9]+(?:\.[0-9]+)?)')
    $gpBad = @($gpTags | ForEach-Object { $_.Groups[1].Value } | Where-Object { $_ -ne $mkVer })
    if ($gpBad.Count -gt 0) {
      Add-Check "versao.gestao-pessoas-cache-bust" "fail" ("desalinhado: " + ($gpBad | Select-Object -Unique) -join ", ")
    } else {
      Add-Check "versao.gestao-pessoas-cache-bust" "ok" ("?v=" + $mkVer)
    }
  } else {
    Add-Check "versao.gestao-pessoas-cache-bust" "fail" "gestao-pessoas.html ausente"
  }

  $i24Guard = Join-Path $root "scripts\guard-i24-publicacao.ps1"
  if (Test-Path $i24Guard) {
    & $i24Guard -Mode PrePush -SkipNetwork 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Add-Check "guard.i24.pre-push" "fail" "arquivos I3 sujos ou bump sem commit - ver guard-i24-publicacao"
    } else {
      Add-Check "guard.i24.pre-push" "ok" "I3 limpo para push"
    }
  }

  $apiPath = Join-Path $root "mk-api.js"
  $apiRaw = if (Test-Path $apiPath) { Get-Content -Path $apiPath -Raw -Encoding UTF8 } else { "" }
  if ($indexRaw -notmatch 'mkGuardEscritaBrowser_' -and $apiRaw -notmatch 'mkGuardEscritaBrowser_') {
    Add-Check "guard.post.escritas" "fail" "mkGuardEscritaBrowser_ ausente (index.html ou mk-api.js)"
  } else {
    Add-Check "guard.post.escritas" "ok" "presente"
  }
  if ($apiRaw -match 'method:\s*[''"]POST[''"]') {
    Add-Check "static.no-post-api" "fail" "mk-api.js contem method POST"
  } elseif (Test-Path $apiPath) {
    Add-Check "static.no-post-api" "ok" "sem POST explicito"
  }

  if ($indexRaw -match 'method:\s*[''"]POST[''"]') {
    Add-Check "static.no-post-index" "fail" "index.html contem method POST"
  } else {
    Add-Check "static.no-post-index" "ok" "sem POST explicito"
  }

  $pageIds = @("page-home", "page-nova", "page-dashboard")
  $htmlBalFail = $false
  $htmlBalDetail = @()
  foreach ($pageId in $pageIds) {
    $bal = Test-PageDivBalance -Html $indexRaw -PageId $pageId
    if ($null -eq $bal) {
      $htmlBalFail = $true
      $htmlBalDetail += "$pageId ausente"
    } elseif (-not $bal.balanced) {
      $htmlBalFail = $true
      $htmlBalDetail += ("{0} div={1}/{2}" -f $pageId, $bal.opens, $bal.closes)
    }
  }
  $dashIdx = $indexRaw.IndexOf('id="page-dashboard"')
  $leadIdx = $indexRaw.IndexOf('id="mk-leading-row"')
  $relIdx = $indexRaw.IndexOf('id="page-relatorio"')
  if ($dashIdx -ge 0 -and $leadIdx -ge 0 -and $relIdx -ge 0) {
    if ($leadIdx -lt $dashIdx -or $leadIdx -gt $relIdx) {
      $htmlBalFail = $true
      $htmlBalDetail += "mk-leading-row fora de page-dashboard"
    }
  }
  if ($htmlBalFail) {
    Add-Check "guard.html.page-balance" "fail" (($htmlBalDetail -join "; ") + " (I22)")
  } else {
    Add-Check "guard.html.page-balance" "ok" "page-home/nova/dashboard balanceados"
  }

  $portalPath = Join-Path $root "acompanhar.html"
  if (Test-Path $portalPath) {
    $portalRaw = Get-Content -Path $portalPath -Raw -Encoding UTF8
    if ($portalRaw -notmatch 'function canonLoc_' -or $portalRaw -notmatch 'function calcStartTimestamp_') {
      Add-Check "guard.portal.canon" "fail" "acompanhar.html sem canonLoc_/calcStartTimestamp_ (I16)"
    } else {
      Add-Check "guard.portal.canon" "ok" "canonLoc_ presente"
    }
  } else {
    Add-Check "guard.portal.canon" "fail" "acompanhar.html ausente"
  }

  $sessaoPath = Join-Path $root "mk-sessao.js"
  if (Test-Path $sessaoPath) {
    $sessaoRaw = Get-Content -Path $sessaoPath -Raw -Encoding UTF8
    if ($sessaoRaw -notmatch 'function canonSessao_' -or $sessaoRaw -notmatch 'canonSessao_\(s\)') {
      Add-Check "guard.balcao.canon" "fail" "mk-sessao.js sem canonSessao_/calcRemaining canon (I16)"
    } else {
      Add-Check "guard.balcao.canon" "ok" "canonSessao_ no balcao"
    }
  } else {
    Add-Check "guard.balcao.canon" "fail" "mk-sessao.js ausente"
  }

  $gasCanon = Join-Path $root "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
  if (Test-Path $gasCanon) {
    $gasRaw = Get-Content -Path $gasCanon -Raw -Encoding UTF8
    if ($gasRaw -notmatch 'function buscarPortalResponsavel_[\s\S]{0,1200}timestampCanonico_') {
      Add-Check "guard.gas.portal.canon" "fail" "buscarPortalResponsavel_ sem timestampCanonico_ (I16)"
    } else {
      Add-Check "guard.gas.portal.canon" "ok" "timestampCanonico_ no portal GAS"
    }
    if ($gasRaw -notmatch 'function iniciarTimer_[\s\S]{0,3500}canonTs') {
      Add-Check "guard.gas.iniciar.clientTs" "fail" "iniciarTimer_ sem canonTs/clientTs (I20 latencia API)"
    } elseif ($gasRaw -notmatch 'function iniciarTimer_[\s\S]{0,3500}clientTs') {
      Add-Check "guard.gas.iniciar.clientTs" "fail" "iniciarTimer_ nao usa clientTs no clique (I20)"
    } else {
      Add-Check "guard.gas.iniciar.clientTs" "ok" "iniciarTimer grava instante do clique"
    }
    $novaRaw = Join-Path $root "mk-nova.js"
    if (Test-Path $novaRaw) {
      $novaJs = Get-Content -Path $novaRaw -Raw -Encoding UTF8
      if ($novaJs -match 'confirmarLocacaoEIniciar_' -or $novaJs -notmatch 'confirmarLocacaoEEnviarSms_') {
        Add-Check "guard.nova.sms.sem.autoStart" "fail" "mk-nova.js: cadastro nao pode auto-iniciar timer (I20)"
      } else {
        Add-Check "guard.nova.sms.sem.autoStart" "ok" "SMS cadastro separado do iniciarTimer"
      }
    }
    $opRaw = Join-Path $root "mk-operacao.js"
    if (Test-Path $opRaw) {
      $opJs = Get-Content -Path $opRaw -Raw -Encoding UTF8
      if ($opJs -match 'enviarBvEIniciar|pularBvEIniciar') {
        Add-Check "guard.modal.bv.sem.autoStart" "fail" "modal BV ainda acopla SMS+iniciar (I20)"
      } else {
        Add-Check "guard.modal.bv.sem.autoStart" "ok" "modal BV: SMS e iniciar separados"
      }
      if ($opJs -notmatch 'iniciarContagemDireto_') {
        Add-Check "guard.iniciar.direto" "fail" "mk-operacao sem iniciarContagemDireto_ (I20)"
      } else {
        Add-Check "guard.iniciar.direto" "ok" "inicia sem modal SMS"
      }
      if ($opJs -notmatch '_localTimerStart' -or $opJs -notmatch 'const clickTs = Date\.now\(\)') {
        Add-Check "guard.fe.iniciar.otimista" "fail" "mk-operacao sem inicio otimista clickTs/_localTimerStart (I20)"
      } else {
        Add-Check "guard.fe.iniciar.otimista" "ok" "inicio otimista no clique"
      }
    }
    $syncPath = Join-Path $root "mk-sync.js"
    if (Test-Path $syncPath) {
      $syncRaw = Get-Content -Path $syncPath -Raw -Encoding UTF8
      if ($syncRaw -notmatch '_localTimerStart' -or $syncRaw -notmatch '_iniciandoTimer') {
        Add-Check "guard.sync.localTimer" "fail" "mergeSessaoCanonica sem preservar _localTimerStart (I20)"
      } else {
        Add-Check "guard.sync.localTimer" "ok" "merge preserva instante do clique"
      }
      if ($syncRaw -notmatch 'isAtiva && \(!startTimestamp') {
        Add-Check "guard.sync.i43" "fail" "mergeSessaoCanonica sem guard Ativa sem ts (I43)"
      } else {
        Add-Check "guard.sync.i43" "ok" "merge preserva ts se Ativa sem col Y"
      }
    }
    if (Test-Path $sessaoPath) {
      $sessaoRaw2 = Get-Content -Path $sessaoPath -Raw -Encoding UTF8
      if ($sessaoRaw2 -notmatch 'function effectiveStartTs_') {
        Add-Check "guard.sessao.effectiveStart" "fail" "mk-sessao.js sem effectiveStartTs_ (I20)"
      } else {
        Add-Check "guard.sessao.effectiveStart" "ok" "calcRemaining usa effectiveStartTs_"
      }
    }
    if ($gasRaw -notmatch 'function salvarLocacao_[\s\S]{0,3500}fmtData_\(agora\),\s*''') {
      Add-Check "guard.gas.salvar.horaVazia" "fail" "salvarLocacao_ grava hora na col C (I20)"
    } else {
      Add-Check "guard.gas.salvar.horaVazia" "ok" "col C vazia no cadastro"
    }
    if ($gasRaw -notmatch 'function timestampCanonico_[\s\S]{0,500}return 0') {
      Add-Check "guard.gas.timestamp.noFallback" "fail" "timestampCanonico_ sem return 0 / fallback I20"
    } elseif ($gasRaw -match 'function timestampCanonico_[\s\S]{0,500}(parseDataStr_|calcStartTimestamp_)') {
      Add-Check "guard.gas.timestamp.noFallback" "fail" "timestampCanonico_ ainda infere por data/hora (I20)"
    } else {
      Add-Check "guard.gas.timestamp.noFallback" "ok" "timestampCanonico so col Y"
    }
    # I43 — carregarInicio: r[24] exige COL_LOC_READ_ (nao so COL_CONTA_ID_)
    if ($gasRaw -match 'function carregarInicio_') {
      if ($gasRaw -notmatch 'const COL_LOC_READ_\s*=\s*28') {
        Add-Check "guard.gas.carregarInicio.colY" "fail" "COL_LOC_READ_=28 ausente (I43)"
      } elseif ($gasRaw -match 'function carregarInicio_[\s\S]{0,15000}getRange\([^\)]*COL_CONTA_ID_\)[\s\S]{0,3000}r\[24\]') {
        Add-Check "guard.gas.carregarInicio.colY" "fail" "carregarInicio getRange COL_CONTA_ID_ + r[24] (I43)"
      } elseif ($gasRaw -match 'function carregarInicio_[\s\S]{0,15000}r\[24\]' -and $gasRaw -notmatch 'function carregarInicio_[\s\S]{0,15000}COL_LOC_READ_') {
        Add-Check "guard.gas.carregarInicio.colY" "fail" "carregarInicio usa r[24] sem COL_LOC_READ_ (I43)"
    } else {
      Add-Check "guard.gas.carregarInicio.colY" "ok" "COL_LOC_READ_ em carregarInicio"
    }
    if ($gasRaw -match 'function listarAtivas_[\s\S]{0,1200}getRange\([^\)]*,\s*26\)') {
      Add-Check "guard.gas.listarAtivas.colY" "fail" "listarAtivas getRange 26 cols (I43/I52)"
    } elseif ($gasRaw -notmatch 'function listarAtivas_[\s\S]{0,1200}COL_LOC_READ_') {
      Add-Check "guard.gas.listarAtivas.colY" "fail" "listarAtivas sem COL_LOC_READ_ (I52)"
    } else {
      Add-Check "guard.gas.listarAtivas.colY" "ok" "COL_LOC_READ_ em listarAtivas"
    }
    if ($gasRaw -notmatch 'LOC_HEADERS_') {
      Add-Check "guard.gas.validarSchema.loc28" "fail" "LOC_HEADERS_ ausente (I52)"
    } elseif ($gasRaw -notmatch 'function repararLocacoesPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.loc28" "fail" "repararLocacoesPlanilhaAdmin ausente (I52)"
    } else {
      Add-Check "guard.gas.validarSchema.loc28" "ok" "schema LOC 28 cols + repair"
    }
    if ($gasRaw -notmatch 'function validarConfigSchema_') {
      Add-Check "guard.gas.validarSchema.config" "fail" "validarConfigSchema_ ausente (I53)"
    } elseif ($gasRaw -notmatch 'function repararConfigPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.config" "fail" "repararConfigPlanilhaAdmin ausente (I53)"
    } elseif ($gasRaw -notmatch 'function cfgDataStartRow_') {
      Add-Check "guard.gas.validarSchema.config" "fail" "cfgDataStartRow_ ausente (I53)"
    } else {
      Add-Check "guard.gas.validarSchema.config" "ok" "CONFIG memorial + repair I53"
    }
    if ($gasRaw -notmatch 'function validarOpsSchema_') {
      Add-Check "guard.gas.validarSchema.ops" "fail" "validarOpsSchema_ ausente (I54)"
    } elseif ($gasRaw -notmatch 'function repararOperadoresSistemaPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.ops" "fail" "repararOperadoresSistemaPlanilhaAdmin ausente (I54)"
    } elseif ($gasRaw -notmatch 'function opsDataStartRow_') {
      Add-Check "guard.gas.validarSchema.ops" "fail" "opsDataStartRow_ ausente (I54)"
    } else {
      Add-Check "guard.gas.validarSchema.ops" "ok" "OPERADORES_SISTEMA memorial + repair I54"
    }
    if ($gasRaw -notmatch 'function validarCustosSchema_') {
      Add-Check "guard.gas.validarSchema.cus" "fail" "validarCustosSchema_ ausente (I55)"
    } elseif ($gasRaw -notmatch 'function repararCustosPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.cus" "fail" "repararCustosPlanilhaAdmin ausente (I55)"
    } elseif ($gasRaw -notmatch 'CUS_HEADERS_') {
      Add-Check "guard.gas.validarSchema.cus" "fail" "CUS_HEADERS_ ausente (I55)"
    } else {
      Add-Check "guard.gas.validarSchema.cus" "ok" "CUSTOS memorial + repair I55"
    }
    if ($gasRaw -notmatch 'function validarDashboardSchema_') {
      Add-Check "guard.gas.validarSchema.dash" "fail" "validarDashboardSchema_ ausente (I56)"
    } elseif ($gasRaw -notmatch 'function repararDashboardPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.dash" "fail" "repararDashboardPlanilhaAdmin ausente (I56)"
    } elseif ($gasRaw -notmatch 'DASH_KPI_ROWS_') {
      Add-Check "guard.gas.validarSchema.dash" "fail" "DASH_KPI_ROWS_ ausente (I56)"
    } else {
      Add-Check "guard.gas.validarSchema.dash" "ok" "DASHBOARD memorial + audit I56"
    }
    if ($gasRaw -notmatch 'function validarFolhaSchema_') {
      Add-Check "guard.gas.validarSchema.folha" "fail" "validarFolhaSchema_ ausente (I57)"
    } elseif ($gasRaw -notmatch 'function repararFolhaPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.folha" "fail" "repararFolhaPlanilhaAdmin ausente (I57)"
    } elseif ($gasRaw -notmatch 'FOLHA_KEY_CELLS_') {
      Add-Check "guard.gas.validarSchema.folha" "fail" "FOLHA_KEY_CELLS_ ausente (I57)"
    } else {
      Add-Check "guard.gas.validarSchema.folha" "ok" "FOLHA memorial + audit I57"
    }
    if ($gasRaw -notmatch 'function validarInvestimentoSchema_') {
      Add-Check "guard.gas.validarSchema.inv" "fail" "validarInvestimentoSchema_ ausente (I58)"
    } elseif ($gasRaw -notmatch 'function repararInvestimentoPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.inv" "fail" "repararInvestimentoPlanilhaAdmin ausente (I58)"
    } elseif ($gasRaw -notmatch 'INV_HEADERS_') {
      Add-Check "guard.gas.validarSchema.inv" "fail" "INV_HEADERS_ ausente (I58)"
    } else {
      Add-Check "guard.gas.validarSchema.inv" "ok" "INVESTIMENTO memorial + repair I58"
    }
    if ($gasRaw -notmatch 'function validarResponsaveisSchema_') {
      Add-Check "guard.gas.validarSchema.resp" "fail" "validarResponsaveisSchema_ ausente (I59)"
    } elseif ($gasRaw -notmatch 'function repararResponsaveisPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.resp" "fail" "repararResponsaveisPlanilhaAdmin ausente (I59)"
    } elseif ($gasRaw -notmatch 'RESP_HEADERS_') {
      Add-Check "guard.gas.validarSchema.resp" "fail" "RESP_HEADERS_ ausente (I59)"
    } else {
      Add-Check "guard.gas.validarSchema.resp" "ok" "RESPONSAVEIS header + audit I59"
    }
    if ($gasRaw -notmatch 'function validarRelatoriosSchema_') {
      Add-Check "guard.gas.validarSchema.rel" "fail" "validarRelatoriosSchema_ ausente (I60)"
    } elseif ($gasRaw -notmatch 'function repararRelatoriosPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.rel" "fail" "repararRelatoriosPlanilhaAdmin ausente (I60)"
    } elseif ($gasRaw -notmatch 'REL_HEADERS_') {
      Add-Check "guard.gas.validarSchema.rel" "fail" "REL_HEADERS_ ausente (I60)"
    } else {
      Add-Check "guard.gas.validarSchema.rel" "ok" "RELATORIOS header + audit I60"
    }
    if ($gasRaw -notmatch 'function validarAuditoriaSchema_') {
      Add-Check "guard.gas.validarSchema.aud" "fail" "validarAuditoriaSchema_ ausente (I61)"
    } elseif ($gasRaw -notmatch 'function repararAudCamada4PlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.aud" "fail" "repararAudCamada4PlanilhaAdmin ausente (I61)"
    } elseif ($gasRaw -notmatch 'AUD_HEADERS_') {
      Add-Check "guard.gas.validarSchema.aud" "fail" "AUD_HEADERS_ ausente (I61)"
    } else {
      Add-Check "guard.gas.validarSchema.aud" "ok" "Camada 4 AUD_* I61"
    }
    if ($gasRaw -notmatch 'function validarColaboradoresRhSchema_') {
      Add-Check "guard.gas.validarSchema.rh" "fail" "validarColaboradoresRhSchema_ ausente (I62)"
    } elseif ($gasRaw -notmatch 'function repararRhCamada5PlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.rh" "fail" "repararRhCamada5PlanilhaAdmin ausente (I62)"
    } elseif ($gasRaw -notmatch 'COLAB_RH_HEADERS_') {
      Add-Check "guard.gas.validarSchema.rh" "fail" "COLAB_RH_HEADERS_ ausente (I62)"
    } else {
      Add-Check "guard.gas.validarSchema.rh" "ok" "Camada 5 RH P0 I62"
    }
    if ($gasRaw -notmatch 'function validarEscalaSchema_') {
      Add-Check "guard.gas.validarSchema.rhResto" "fail" "validarEscalaSchema_ ausente (I63)"
    } elseif ($gasRaw -notmatch 'function repararRhCamada5RestoPlanilhaAdmin_') {
      Add-Check "guard.gas.validarSchema.rhResto" "fail" "repararRhCamada5RestoPlanilhaAdmin ausente (I63)"
    } elseif ($gasRaw -notmatch 'ESCALA_HEADERS_') {
      Add-Check "guard.gas.validarSchema.rhResto" "fail" "ESCALA_HEADERS_ ausente (I63)"
    } elseif ($gasRaw -notmatch '/\^-\?\\d\+h\\d\{2\}\$/') {
      Add-Check "guard.gas.validarSchema.rhResto" "fail" "auditBancoHoras saldo negativo ausente (I63)"
    } else {
      Add-Check "guard.gas.validarSchema.rhResto" "ok" "Camada 5 RH resto I63"
    }
    if ($gasRaw -match "PIN admin 1416") {
      Add-Check "guard.pin.leak.gas" "fail" "GAS ainda cita PIN 1416 em erro (I64)"
    } else {
      Add-Check "guard.pin.leak.gas" "ok" "Erros GAS sem PIN literal I64"
    }
    $hdrM = [regex]::Match($gasRaw, 'Apps Script v([0-9]+\.[0-9]+\.[0-9]+)')
    $pingM = [regex]::Match($gasRaw, "function ping_\(\)[\s\S]{0,400}versao:\s*'v([0-9]+\.[0-9]+\.[0-9]+)'")
    if ($hdrM.Success -and $pingM.Success) {
      if ($hdrM.Groups[1].Value -ne $pingM.Groups[1].Value) {
        Add-Check "guard.gas.ping.versao" "fail" "header v$($hdrM.Groups[1].Value) != ping_ v$($pingM.Groups[1].Value)"
      } else {
        Add-Check "guard.gas.ping.versao" "ok" "ping_ alinhado ao header"
      }
    } else {
      Add-Check "guard.gas.ping.versao" "warn" "nao foi possivel comparar header x ping_"
    }
    $fePinLeak = @(
      (Get-Content (Join-Path $root "index.html") -Raw),
      (Get-Content (Join-Path $root "gestao-pessoas.html") -Raw),
      (Get-Content (Join-Path $root "mk-gestao-pessoas-ui.js") -Raw)
    ) -join ""
    if ($fePinLeak -match '1416') {
      Add-Check "guard.pin.leak.fe" "fail" "PIN 1416 em index/gestao-pessoas/ui (I64)"
    } else {
      Add-Check "guard.pin.leak.fe" "ok" "UI producao sem PIN literal I64"
    }
    } else {
      Add-Check "guard.gas.carregarInicio.colY" "fail" "carregarInicio_ ausente no GAS"
    }
    # I49 — VA teto R$400: gpVaMensalColab_ deve retornar teto (va_diario*só para log/trava)
    if ($gasRaw -notmatch 'function gpVaMensalTeto_') {
      Add-Check "guard.va.teto400" "fail" "gpVaMensalTeto_ ausente (I49)"
    } elseif ($gasRaw -notmatch 'TRAVA va_diario planilha infla VA') {
      Add-Check "guard.va.teto400" "fail" "trava VA planilha ausente (I49)"
    } elseif ($gasRaw -match 'function gpVaMensalColab_[\s\S]{0,600}return\s+teto') {
      Add-Check "guard.va.teto400" "ok" "VA mensal = teto memorial 400"
    } elseif ($gasRaw -match 'function gpVaMensalColab_[\s\S]{0,400}return[\s\S]{0,80}vaDiario \* gpVaDiasBase_') {
      Add-Check "guard.va.teto400" "fail" "gpVaMensalColab_ retorna va_diario*dias (I49 regressao 520)"
    } else {
      Add-Check "guard.va.teto400" "fail" "gpVaMensalColab_ sem return teto (I49)"
    }
    # I51 — falta automatica em dia de escala sem ponto; abono so ADM
    if ($gasRaw -notmatch "sit = 'Falta'") {
      Add-Check "guard.faltas.auto" "fail" "jornada sem Falta auto (I51)"
    } elseif ($gasRaw -notmatch 'function abonarFaltaRhAdmin_') {
      Add-Check "guard.faltas.auto" "fail" "abonarFaltaRhAdmin ausente"
    } elseif ($gasRaw -notmatch 'function salvarPontoRhAdmin_') {
      Add-Check "guard.faltas.auto" "fail" "salvarPontoRhAdmin ausente"
    } else {
      Add-Check "guard.faltas.auto" "ok" "falta auto + abono ADM"
    }
    if ($gasRaw -notmatch 'function importarResponsaveisAdmin_') {
      Add-Check "guard.k1.import" "fail" "importarResponsaveisAdmin_ ausente (Pacote K.1)"
    } else {
      Add-Check "guard.k1.import" "ok" "import K.1 presente no GAS"
    }
  } else {
    Add-Check "guard.gas.portal.canon" "warn" ".gs canonico nao encontrado"
  }

  $authPath = Join-Path $root "mk-auth.js"
  if (Test-Path $authPath) {
    $authRaw = Get-Content -Path $authPath -Raw -Encoding UTF8
    if ($authRaw -notmatch 'mkHasLocacaoAbertaNoTablet_') {
      Add-Check "guard.idle.locacao" "fail" "mkHasLocacaoAbertaNoTablet_ ausente (I18)"
    } else {
      Add-Check "guard.idle.locacao" "ok" "idle bloqueado com locacao aberta"
    }
    if ($authRaw -notmatch 'mkAuthReconcileSessaoFantasma_') {
      Add-Check "guard.auth.fantasma" "fail" "mkAuthReconcileSessaoFantasma_ ausente (PWA sessao fantasma)"
    } else {
      Add-Check "guard.auth.fantasma" "ok" "reconcile sessao tablet x servidor"
    }
    if ($authRaw -notmatch 'mkAuthIdleRemainingMs_') {
      Add-Check "guard.idle.wallclock" "fail" "mkAuthIdleRemainingMs_ ausente (idle relogio real)"
    } else {
      Add-Check "guard.idle.wallclock" "ok" "idle admin+operador por timestamp"
    }
    if ($authRaw -notmatch 'mkAuthReleaseBalcaoServer_') {
      Add-Check "guard.idle.gas.release" "fail" "mkAuthReleaseBalcaoServer_ ausente"
    } else {
      Add-Check "guard.idle.gas.release" "ok" "logout libera balcao no GAS"
    }
    if ($authRaw -match 'function mkAuthEnsureAdminPin_[\s\S]{0,800}prompt\s*\(') {
      Add-Check "guard.auth.no-prompt-pin" "fail" "mkAuthEnsureAdminPin_ usa prompt() (I28 tablet/PWA)"
    } elseif ($authRaw -notmatch 'mkAuthEnsureAdminPin_') {
      Add-Check "guard.auth.no-prompt-pin" "fail" "mkAuthEnsureAdminPin_ ausente"
    } else {
      Add-Check "guard.auth.no-prompt-pin" "ok" "PIN admin sem prompt() no tablet"
    }
    if ($authRaw -notmatch 'mkAuthRestoreAdminPin_') {
      Add-Check "guard.auth.pin-persist" "fail" "mkAuthRestoreAdminPin_ ausente (I28 PWA perde PIN)"
    } elseif ($authRaw -notmatch 'ADMIN_PIN_PERSIST_KEY|mk_admin_pin_persist_v1') {
      Add-Check "guard.auth.pin-persist" "fail" "PIN admin sem persist 24h (I28)"
    } else {
      Add-Check "guard.auth.pin-persist" "ok" "PIN admin restaura apos PWA"
    }
    if ($authRaw -notmatch 'mkOpDeslogarBalcao[\s\S]{0,1200}liberarSessaoOperador[\s\S]{0,600}mkAuthEnsureAdminPin_') {
      Add-Check "guard.auth.deslogar-api-first" "fail" "mkOpDeslogarBalcao ordem API/PIN errada (I28)"
    } else {
      Add-Check "guard.auth.deslogar-api-first" "ok" "deslogar tenta liberar antes do PIN"
    }
    if ($authRaw -notmatch 'mkAuthLiberarSessaoOperadorAdmin_') {
      Add-Check "guard.auth.liberar-admin" "fail" "mkAuthLiberarSessaoOperadorAdmin_ ausente (I28)"
    } else {
      Add-Check "guard.auth.liberar-admin" "ok" "liberar sessao via pagina Operadores"
    }
  } else {
    Add-Check "guard.idle.locacao" "fail" "mk-auth.js ausente"
    Add-Check "guard.auth.fantasma" "fail" "mk-auth.js ausente"
  }

  $indexAuth = Join-Path $root "index.html"
  if (Test-Path $indexAuth) {
    $indexAuthRaw = Get-Content -Path $indexAuth -Raw -Encoding UTF8
    if ($indexAuthRaw -notmatch 'id="hd-turno-chip"') {
      Add-Check "guard.turno.chip" "fail" "hd-turno-chip ausente (I19)"
    } else {
      Add-Check "guard.turno.chip" "ok" "chip turno no header mobile"
    }
    if ($indexAuthRaw -notmatch 'id="mk-ops-sessao-banner"' -or $indexAuthRaw -notmatch 'mk-liberar-sessao-btn') {
      Add-Check "guard.auth.liberar-admin" "fail" "pagina Operadores sem liberar sessao (I28)"
    } else {
      Add-Check "guard.auth.liberar-admin" "ok" "Operadores: banner + liberar sessao"
    }
    $adminPath = Join-Path $root "mk-admin.js"
    if (Test-Path $adminPath) {
      $adminRaw = Get-Content -Path $adminPath -Raw -Encoding UTF8
      if ($adminRaw -notmatch 'mkAdminPinModalAsk_') {
        Add-Check "guard.auth.pin-modal" "fail" "mkAdminPinModalAsk_ ausente (I28 tablet)"
      } else {
        Add-Check "guard.auth.pin-modal" "ok" "PIN admin via modal numerico"
      }
    } else {
      Add-Check "guard.auth.pin-modal" "fail" "mk-admin.js ausente"
    }
    $relPath = Join-Path $root "mk-relacionamento.js"
    $relRaw = if (Test-Path $relPath) { Get-Content -Path $relPath -Raw -Encoding UTF8 } else { "" }
    $relK3Src = $indexAuthRaw + $relRaw
    if ($relK3Src -notmatch 'rel-badge' -or $relK3Src -notmatch 'cadastroCanonico') {
      Add-Check "guard.k3.rel-badge" "fail" "badge Cadastro ausente em Relacionamento (K.3)"
    } else {
      Add-Check "guard.k3.rel-badge" "ok" "card CRM com cadastroCanonico"
    }
  } else {
    Add-Check "guard.turno.chip" "fail" "index.html ausente"
  }

  $b6Fail = $false
  $b6Detail = @()
  foreach ($f in @('mk-admin.js', 'mk-auth.js', 'mk-core.js')) {
    $fp = Join-Path $root $f
    if (-not (Test-Path $fp)) { continue }
    $rawB6 = Get-Content -Path $fp -Raw -Encoding UTF8
    if ($rawB6 -match "ADMIN_PIN\s*=\s*['\`"]1416['\`"]" -or $rawB6 -match "adminPin:\s*['\`"]1416['\`"]") {
      $b6Fail = $true
      $b6Detail += $f
    }
  }
  $authB6 = Join-Path $root 'mk-auth.js'
  if (Test-Path $authB6) {
    $authB6Raw = Get-Content -Path $authB6 -Raw -Encoding UTF8
    if ($authB6Raw -notmatch 'mkAuthStoreAdminPin_') {
      $b6Fail = $true
      $b6Detail += 'mkAuthStoreAdminPin_ ausente'
    }
  }
  if ($b6Fail) {
    Add-Check "guard.b6.pin-gas" "fail" ($b6Detail -join ', ')
  } else {
    Add-Check "guard.b6.pin-gas" "ok" "sem PIN 1416 hardcoded no FE"
  }

  $operCheck = Join-Path $root "scripts\check-operacao-livre.ps1"
  $feCriticoNames = @("index.html", "mk-home.js", "mk-sync.js", "mk-sessao.js", "mk-core.js")
  $feAlterado = $false
  try {
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $porcelain = git -C $root status --porcelain -- @feCriticoNames 2>$null
    $ErrorActionPreference = $prevEap
    if ($porcelain -and ($porcelain.Trim().Length -gt 0)) {
      $feAlterado = $true
    }
  } catch {
    Add-Check "git.status-fe-critico" "fail" $_.Exception.Message
  }
  if ($feAlterado -and (Test-Path $operCheck) -and -not $SkipNetworkTests) {
    if ($ForceOperacao) { & $operCheck -Force 2>&1 | Out-Null }
    else { & $operCheck 2>&1 | Out-Null }
    if ($LASTEXITCODE -ne 0) {
      Add-Check "guard.operacao.livre" "fail" "locacoes Ativa/Pendente - Regra 14 (I22); use -Force no check so hotfix P0"
    } else {
      Add-Check "guard.operacao.livre" "ok" "sem locacoes abertas"
    }
  } elseif ($feAlterado) {
    Add-Check "guard.operacao.livre" "skip" "SkipNetworkTests ou script ausente"
  } else {
    Add-Check "guard.operacao.livre" "ok" "FE critico nao alterado neste push"
  }

  if (-not $SkipNetworkTests) {
    $testDir = Join-Path $root "scripts\testes"
    $paridade = Join-Path $testDir "TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1"
    $portal = Join-Path $testDir "TESTE_PORTAL_READONLY.ps1"
    if (-not (Test-Path $paridade)) { throw "TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1 nao encontrado" }
    if (-not (Test-Path $portal)) { throw "TESTE_PORTAL_READONLY.ps1 nao encontrado" }

    $parOut = & $paridade 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { Add-Check "teste.paridade" "fail" "exit $LASTEXITCODE" }
    else { Add-Check "teste.paridade" "ok" "TESTE_PARIDADE_HTTP_BROWSER_GAS" }

    $portOut = & $portal 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { Add-Check "teste.portal" "fail" "exit $LASTEXITCODE" }
    else { Add-Check "teste.portal" "ok" "TESTE_PORTAL_READONLY" }

    $cron = Join-Path $testDir "TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1"
    if (-not (Test-Path $cron)) { throw "TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1 nao encontrado" }
    $cronOut = & $cron 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { Add-Check "teste.cronometro" "fail" "exit $LASTEXITCODE" }
    else { Add-Check "teste.cronometro" "ok" "TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO" }

    $i43 = Join-Path $testDir "TESTE_I43_CARREGAR_INICIO_READONLY.ps1"
    if (-not (Test-Path $i43)) { throw "TESTE_I43_CARREGAR_INICIO_READONLY.ps1 nao encontrado" }
    $i43Out = & $i43 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) { Add-Check "teste.i43" "fail" "exit $LASTEXITCODE" }
    else { Add-Check "teste.i43" "ok" "TESTE_I43_CARREGAR_INICIO_READONLY" }
  } else {
    Add-Check "teste.paridade" "skip" "SkipNetworkTests"
    Add-Check "teste.portal" "skip" "SkipNetworkTests"
    Add-Check "teste.cronometro" "skip" "SkipNetworkTests"
    Add-Check "teste.i43" "skip" "SkipNetworkTests"
  }
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5

if ($result.status -ne "ok") {
  Write-Host ""
  Write-Host "pre-push-check FALHOU - corrija antes do push." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "pre-push-check OK - pode publicar." -ForegroundColor Green
Write-Host "Apos git push: .\scripts\verify-publish-complete.ps1  (Regra 8 / I24)" -ForegroundColor Yellow
exit 0
