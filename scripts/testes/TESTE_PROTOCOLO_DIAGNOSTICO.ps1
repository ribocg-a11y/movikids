# Protocolo de diagnostico MOVI KIDS — orquestra testes por fluxo (F0-F14)
# Doc: docs/ativos/PROTOCOLO_DIAGNOSTICO_E_TESTES.md
#
# Uso:
#   .\scripts\testes\TESTE_PROTOCOLO_DIAGNOSTICO.ps1
#   .\scripts\testes\TESTE_PROTOCOLO_DIAGNOSTICO.ps1 -Foco cronometro
#   .\scripts\testes\TESTE_PROTOCOLO_DIAGNOSTICO.ps1 -Foco infra
#   .\scripts\testes\TESTE_PROTOCOLO_DIAGNOSTICO.ps1 -Foco iniciarTimer
#   .\scripts\testes\TESTE_PROTOCOLO_DIAGNOSTICO.ps1 -SkipNetworkTests

param(
  [ValidateSet("completo", "cronometro", "infra", "iniciarTimer", "cadastro", "http")]
  [string]$Foco = "completo",
  [switch]$SkipNetworkTests
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$testDir = $PSScriptRoot

$result = [ordered]@{
  protocolo = "TESTE_PROTOCOLO_DIAGNOSTICO"
  doc = "docs/ativos/PROTOCOLO_DIAGNOSTICO_E_TESTES.md"
  foco = $Foco
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  fases = @()
  tabletPendente = @()
  status = "ok"
}

function Add-Fase {
  param([string]$Id, [string]$Nome, [string]$Status, [string]$Detail = "", [string[]]$Scripts = @())
  $script:result.fases += [ordered]@{
    fluxo = $Id
    nome = $Nome
    status = $Status
    detail = $Detail
    scripts = $Scripts
  }
  if ($Status -eq "fail") { $script:result.status = "fail" }
  elseif ($Status -eq "warn" -and $script:result.status -eq "ok") { $script:result.status = "warn" }
}

function Run-Script {
  param([string]$Path, [string]$Label)
  if (-not (Test-Path $Path)) {
    return @{ exit = 1; output = "ausente: $Path" }
  }
  $out = & $Path 2>&1 | Out-String
  return @{ exit = $LASTEXITCODE; output = $out }
}

function Should-Run {
  param([string[]]$Fluxos)
  if ($Foco -eq "completo") { return $true }
  $map = @{
    infra = @("F0", "F14")
    cronometro = @("F0", "F5", "F6", "F11", "F2", "F3", "F4")
    iniciarTimer = @("F0", "F5", "F6", "F10", "F11")
    cadastro = @("F0", "F2", "F3", "F4")
    http = @("F0", "F14")
  }
  $allowed = $map[$Foco]
  if (-not $allowed) { return $true }
  return ($Fluxos | Where-Object { $allowed -contains $_ }).Count -gt 0
}

Write-Host "MOVI KIDS - Protocolo diagnostico (foco: $Foco)" -ForegroundColor Cyan

try {
  # --- F0 Infraestrutura ---
  if (Should-Run @("F0")) {
    $preArgs = @("-NoProfile", "-File", (Join-Path $root "scripts\pre-push-check.ps1"))
    if ($SkipNetworkTests) { $preArgs += "-SkipNetworkTests" }
    $preOut = & powershell @preArgs 2>&1 | Out-String
    $preExit = $LASTEXITCODE
    Add-Fase "F0" "Infra / pre-push / versoes" $(if ($preExit -eq 0) { "ok" } else { "fail" }) "exit=$preExit" @("pre-push-check.ps1")

    if (-not $SkipNetworkTests) {
      $pingUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping"
      try {
        $ping = Invoke-RestMethod -Uri $pingUrl -Method Get -TimeoutSec 20
        $gasVer = $ping.versao
        $gasOk = $gasVer -match 'v1\.5\.(6[6-9]|[7-9]\d|\d{2,})'
        Add-Fase "F0" "Ping GAS" $(if ($gasOk) { "ok" } else { "warn" }) $gasVer
      } catch {
        Add-Fase "F0" "Ping GAS" "fail" $_.Exception.Message
      }

      try {
        $feRaw = & curl.exe -L -s "https://ribocg-a11y.github.io/movikids/mk-version.js"
        $repoRaw = Get-Content (Join-Path $root "mk-version.js") -Raw
        $verPat = 'window\.MK_VERSION\s*=\s*''([^'']+)'''
        if ($feRaw -match $verPat) { $fePages = $Matches[1] } else { $fePages = "?" }
        if ($repoRaw -match $verPat) { $feRepo = $Matches[1] } else { $feRepo = "?" }
        $aligned = ($fePages -eq $feRepo)
        Add-Fase "F0" "FE Pages vs repo" $(if ($aligned) { "ok" } else { "warn" }) "pages=$fePages repo=$feRepo"
      } catch {
        Add-Fase "F0" "FE Pages vs repo" "warn" $_.Exception.Message
      }
    } else {
      Add-Fase "F0" "Ping GAS" "skip" "SkipNetworkTests"
      Add-Fase "F0" "FE Pages vs repo" "skip" "SkipNetworkTests"
    }
  }

  if ($SkipNetworkTests) {
    Add-Fase "F14" "HTTP browser" "skip" "SkipNetworkTests"
    Add-Fase "F11" "Portal readonly" "skip" "SkipNetworkTests"
    Add-Fase "F6/F11" "Paridade cronometro" "skip" "SkipNetworkTests"
    Add-Fase "F2-F5" "I20 completo" "skip" "SkipNetworkTests"
    Add-Fase "F2/F3" "4 fluxos cadastro" "skip" "SkipNetworkTests"
    Add-Fase "F13" "Relacionamento" "skip" "SkipNetworkTests"
    Add-Fase "F12" "KPI readonly" "skip" "SkipNetworkTests"
    Add-Fase "F9" "Drawer E" "skip" "SkipNetworkTests"
  } else {
    # --- F14 HTTP ---
    if (Should-Run @("F14")) {
      $r = Run-Script (Join-Path $testDir "TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1") "http"
      Add-Fase "F14" "HTTP GET browser" $(if ($r.exit -eq 0) { "ok" } else { "fail" }) "exit=$($r.exit)" @("TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1")
    }

    # --- F11 Portal ---
    if (Should-Run @("F11")) {
      $r = Run-Script (Join-Path $testDir "TESTE_PORTAL_READONLY.ps1") "portal"
      Add-Fase "F11" "Portal readonly" $(if ($r.exit -eq 0) { "ok" } else { "fail" }) "exit=$($r.exit)" @("TESTE_PORTAL_READONLY.ps1")
    }

    # --- F6 + F11 Paridade cronometro ---
    if (Should-Run @("F6", "F11")) {
      $r = Run-Script (Join-Path $testDir "TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1") "cronometro"
      Add-Fase "F6/F11" "Paridade cronometro portal x balcao" $(if ($r.exit -eq 0) { "ok" } else { "fail" }) "exit=$($r.exit)" @("TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1")
    }

    # --- F2-F5 I20 ---
    if (Should-Run @("F2", "F3", "F4", "F5")) {
      $r = Run-Script (Join-Path $testDir "TESTE_I20_COMPLETO_PROD.ps1") "i20"
      Add-Fase "F2-F5" "I20 cadastro SMS iniciar" $(if ($r.exit -eq 0) { "ok" } else { "fail" }) "exit=$($r.exit)" @("TESTE_I20_COMPLETO_PROD.ps1")
    }

    if (Should-Run @("F2", "F3")) {
      $r = Run-Script (Join-Path $testDir "TESTE_4_FLUXOS_CADASTRO_I20.ps1") "cadastro"
      Add-Fase "F2/F3" "4 fluxos cadastro I20" $(if ($r.exit -eq 0) { "ok" } else { "warn" }) "exit=$($r.exit)" @("TESTE_4_FLUXOS_CADASTRO_I20.ps1")
    }

    # --- F13 ---
    if ($Foco -eq "completo") {
      $rel = Join-Path $testDir "TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1"
      if (Test-Path $rel) {
        $r = Run-Script $rel "rel"
        Add-Fase "F13" "Relacionamento readonly" $(if ($r.exit -eq 0) { "ok" } else { "warn" }) "exit=$($r.exit)"
      }
      $kpi = Join-Path $testDir "TESTE_PACOTE_F_KPI_READONLY.ps1"
      if (Test-Path $kpi) {
        $r = Run-Script $kpi "kpi"
        Add-Fase "F12" "KPI readonly" $(if ($r.exit -eq 0) { "ok" } else { "warn" }) "exit=$($r.exit)"
      }
    }

    # --- F9 Drawer (completo only) ---
    if ($Foco -eq "completo") {
      $dr = Join-Path $testDir "TESTE_DRAWER_E_PACOTE_E.ps1"
      if (Test-Path $dr) {
        $r = Run-Script $dr "drawer"
        Add-Fase "F9" "Drawer encerrar Pacote E" $(if ($r.exit -eq 0) { "ok" } else { "warn" }) "exit=$($r.exit)"
      }
    }

    # --- F1 B8 idle sessao (I21) ---
    if ($Foco -eq "completo") {
      $idle = Join-Path $testDir "TESTE_SESSAO_IDLE_READONLY.ps1"
      if (Test-Path $idle) {
        $r = Run-Script $idle "idle"
        Add-Fase "F1" "B8 idle sessao readonly" $(if ($r.exit -eq 0) { "ok" } else { "fail" }) "exit=$($r.exit)" @("TESTE_SESSAO_IDLE_READONLY.ps1")
      }
      foreach ($b in @(
        @{ f = "B1"; s = "TESTE_RESUMO_DIA_READONLY.ps1" },
        @{ f = "B2"; s = "TESTE_KPI_MES_READONLY.ps1" }
      )) {
        $p = Join-Path $testDir $b.s
        if (Test-Path $p) {
          $r = Run-Script $p $b.f
          Add-Fase $b.f "FASE5 $($b.f) readonly" $(if ($r.exit -eq 0) { "ok" } else { "warn" }) "exit=$($r.exit)" @($b.s)
        }
      }
    }
  }

  # Tablet sempre pendente para fluxos que exigem
  $tabletFluxos = @("F1", "F5", "F6", "F7", "F10", "F11")
  if ($Foco -eq "completo" -or $Foco -eq "cronometro" -or $Foco -eq "iniciarTimer") {
    $result.tabletPendente = @(
      "F5: Iniciar responde na hora; RESTANTE 10:00 +/-1s (HOMOLOGACAO secao H)",
      "F7: alerta 5min e expirado em plano 10min",
      "F11: portal celular +/-2s do balcao",
      "F10: recarregar tablet / 2 abas - mesmo timer"
    )
  }

  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.maturidade = "nivel 3-4 - automatizado F0-F14 parcial; tablet manual obrigatorio"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}

$result | ConvertTo-Json -Depth 6

Write-Host ""
switch ($result.status) {
  "ok"   { Write-Host "Protocolo: OK (ver tabletPendente no JSON)" -ForegroundColor Green; exit 0 }
  "warn" { Write-Host "Protocolo: WARN - revisar fases" -ForegroundColor Yellow; exit 0 }
  default { Write-Host "Protocolo: FAIL" -ForegroundColor Red; exit 1 }
}
