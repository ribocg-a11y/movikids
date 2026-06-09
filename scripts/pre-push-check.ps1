# Pacote J - gate local antes de git push (versoes FE + paridade HTTP + portal readonly)
# Uso:
#   .\scripts\pre-push-check.ps1
#   .\scripts\pre-push-check.ps1 -SkipNetworkTests   # offline / so versao
#
# Hook opcional (uma vez no repo):
#   git config core.hooksPath githooks

param(
  [switch]$SkipNetworkTests
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
        Add-Check "guard.iniciar.direto" "ok" "▶ inicia sem modal SMS"
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
  } else {
    Add-Check "teste.paridade" "skip" "SkipNetworkTests"
    Add-Check "teste.portal" "skip" "SkipNetworkTests"
    Add-Check "teste.cronometro" "skip" "SkipNetworkTests"
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
exit 0
