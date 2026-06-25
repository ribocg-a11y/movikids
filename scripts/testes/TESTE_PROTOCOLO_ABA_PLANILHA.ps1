# Protocolo por aba da planilha — auditoria, repair, validação
# Doc: docs/ativos/PROTOCOLO_AUDITORIA_ABAS_PLANILHA.md
#
# Uso:
#   .\scripts\testes\TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba LOCACOES
#   .\scripts\testes\TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba LOCACOES -DryRun
#   .\scripts\testes\TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba CONFIG -SomenteLeitura

param(
  [Parameter(Mandatory = $true)]
  [string]$Aba,
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [switch]$DryRun,
  [switch]$SomenteLeitura,
  [switch]$SkipRepair,
  [string]$ResultFile = ""
)

$ErrorActionPreference = "Stop"
$Aba = $Aba.Trim().ToUpper()

$repairActions = @{
  LOCACOES = @{
    repairAction = "repararLocacoesPlanilhaAdmin"
    repairScript = "REPARAR_LOCACOES_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_I43_CARREGAR_INICIO_READONLY.ps1"
    fluxoNome = "I43 cronometro col Y"
  }
  CONFIG = @{
    repairAction = "repararConfigPlanilhaAdmin"
    repairScript = "REPARAR_CONFIG_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_OPERACAO_CONFIG_READONLY.ps1"
    fluxoNome = "CONFIG operacional frota precos"
  }
  OPERADORES_SISTEMA = @{
    repairAction = "repararOperadoresSistemaPlanilhaAdmin"
    repairScript = "REPARAR_OPERADORES_SISTEMA_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_SESSAO_LIBERAR_READONLY.ps1"
    fluxoNome = "login operadores sessao admin"
  }
  CUSTOS = @{
    repairAction = "repararCustosPlanilhaAdmin"
    repairScript = "REPARAR_CUSTOS_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_CUSTOS_READONLY.ps1"
    fluxoNome = "listarCustos resumoDia caixa"
  }
  DASHBOARD = @{
    repairAction = "repararDashboardPlanilhaAdmin"
    repairScript = "REPARAR_DASHBOARD_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_DASHBOARD_READONLY.ps1"
    fluxoNome = "kpiMes audit formulas memorial"
  }
  FOLHA = @{
    repairAction = "repararFolhaPlanilhaAdmin"
    repairScript = "REPARAR_FOLHA_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_FOLHA_FORMULAS_READONLY.ps1"
    fluxoNome = "formulas USER_ENTERED B68 folhaPlanejamento"
  }
  INVESTIMENTO = @{
    repairAction = "repararInvestimentoPlanilhaAdmin"
    repairScript = "REPARAR_INVESTIMENTO_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_INVESTIMENTO_READONLY.ps1"
    fluxoNome = "payback kpiMes investimentoTotal"
  }
  RESPONSAVEIS = @{
    repairAction = "repararResponsaveisPlanilhaAdmin"
    repairScript = "REPARAR_RESPONSAVEIS_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1"
    fluxoNome = "listarResponsaveis CRM portal"
  }
  RELATORIOS = @{
    repairAction = "repararRelatoriosPlanilhaAdmin"
    repairScript = "REPARAR_RELATORIOS_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RELATORIOS_READONLY.ps1"
    fluxoNome = "listarRelatorios PDFs mensais"
  }
  AUDITORIA = @{
    repairAction = "repararAuditoriaPlanilhaAdmin"
    repairScript = "REPARAR_AUD_CAMADA4_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_AUD_CAMADA4_READONLY.ps1"
    fluxoNome = "listarAuditoriaAdmin metas RH"
  }
  AUD_TURNO = @{
    repairAction = "repararAudTurnoPlanilhaAdmin"
    repairScript = "REPARAR_AUD_CAMADA4_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_AUD_CAMADA4_READONLY.ps1"
    fluxoNome = "login logout balcao log"
  }
  AUD_SMS = @{
    repairAction = "repararAudSmsPlanilhaAdmin"
    repairScript = "REPARAR_AUD_CAMADA4_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_AUD_CAMADA4_READONLY.ps1"
    fluxoNome = "SMS pausado log historico"
  }
  AUD_WHATSAPP = @{
    repairAction = "repararAudWhatsappPlanilhaAdmin"
    repairScript = "REPARAR_AUD_CAMADA4_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_AUD_CAMADA4_READONLY.ps1"
    fluxoNome = "WhatsApp pausado log"
  }
  AUD_RESPONSAVEIS = @{
    repairAction = "repararAudResponsaveisPlanilhaAdmin"
    repairScript = "REPARAR_AUD_CAMADA4_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_AUD_CAMADA4_READONLY.ps1"
    fluxoNome = "import CRM audit log"
  }
  COLABORADORES_RH = @{
    repairAction = "repararColaboradoresRhPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_READONLY.ps1"
    fluxoNome = "painelGestaoPessoas cadastro gate 428"
  }
  FOLHA_PONTO = @{
    repairAction = "repararFolhaPontoPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_READONLY.ps1"
    fluxoNome = "ponto RH entrada saida"
  }
  BANCO_HORAS = @{
    repairAction = "repararBancoHorasPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_READONLY.ps1"
    fluxoNome = "saldo banco horas I44"
  }
  ESCALA_COLABORADORES = @{
    repairAction = "repararEscalaPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_RESTO_READONLY.ps1"
    fluxoNome = "escala jornada GP"
  }
  FALTAS_AUSENCIAS = @{
    repairAction = "repararFaltasPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_RESTO_READONLY.ps1"
    fluxoNome = "faltas abono sync jornada"
  }
  HOLERITES = @{
    repairAction = "repararHoleritesPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_RESTO_READONLY.ps1"
    fluxoNome = "holerite competencia"
  }
  METAS_COLABORADORES = @{
    repairAction = "repararMetasPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_RESTO_READONLY.ps1"
    fluxoNome = "metas bonus demo"
  }
  COMUNICADOS_RH = @{
    repairAction = "repararComunicadosRhPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_RESTO_READONLY.ps1"
    fluxoNome = "comunicados portal RH"
  }
  AVALIACOES_RH = @{
    repairAction = "repararAvaliacoesRhPlanilhaAdmin"
    repairScript = "REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN.ps1"
    fluxoTeste = "TESTE_RH_CAMADA5_RESTO_READONLY.ps1"
    fluxoNome = "avaliacoes nota 0-10"
  }
}

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 120
  } catch {
    $raw = & curl.exe -L -s $url --max-time 120
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

function Add-Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

$result = [ordered]@{
  suite = "TESTE_PROTOCOLO_ABA_PLANILHA"
  aba = $Aba
  protocolo = "docs/ativos/PROTOCOLO_AUDITORIA_ABAS_PLANILHA.md"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  dryRun = [bool]$DryRun
  somenteLeitura = [bool]$SomenteLeitura
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-Check "ping" "ok" $ping.versao

  $diag = Invoke-MkApi @{
    action = "diagnosticoPlanilhaCompletoAdmin"
    adminPin = $AdminPin
  }
  if (-not $diag.ok) { throw $diag.erro }
  $abaInfo = @($diag.abas | Where-Object { $_.nome -eq $Aba })[0]
  if (-not $abaInfo) {
    Add-Check "aba.existe" "fail" "Aba $Aba nao encontrada no workbook"
    throw "Aba $Aba ausente"
  }
  Add-Check "aba.existe" "ok" ("lastRow=" + $abaInfo.lastRow + " lastCol=" + $abaInfo.lastCol)
  Add-Check "aba.mapeadaGAS" $(if ($abaInfo.mapeadaGAS) { "ok" } else { "warn" }) $abaInfo.funcao
  Add-Check "aba.dataRows" "ok" ("n=" + $abaInfo.dataRows)

  if ($Aba -eq "LOCACOES" -and $diag.locacoesAudit) {
    $nProb = @($diag.locacoesAudit.problemas).Count
    Add-Check "locacoes.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb)
  }

  if ($Aba -eq "CONFIG" -and $diag.configAudit) {
    $nProb = @($diag.configAudit.problemas).Count
    Add-Check "config.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " veiculos=" + $diag.configAudit.veiculos)
  }

  if ($Aba -eq "OPERADORES_SISTEMA" -and $diag.opsAudit) {
    $nProb = @($diag.opsAudit.problemas).Count
    Add-Check "ops.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " ativos=" + $diag.opsAudit.operadoresAtivos)
  }

  if ($Aba -eq "CUSTOS" -and $diag.custosAudit) {
    $nProb = @($diag.custosAudit.problemas).Count
    Add-Check "custos.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " soma=" + $diag.custosAudit.somaAmostra)
  }

  if ($Aba -eq "DASHBOARD" -and $diag.dashboardAudit) {
    $nProb = @($diag.dashboardAudit.problemas).Count
    Add-Check "dashboard.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " memorial=" + $diag.dashboardAudit.memorialOk)
  }

  if ($Aba -eq "FOLHA" -and $diag.folhaAudit) {
    $nProb = @($diag.folhaAudit.problemas).Count
    Add-Check "folha.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " B68=" + $diag.folhaAudit.b68)
  }

  if ($Aba -eq "INVESTIMENTO" -and $diag.investimentoAudit) {
    $nProb = @($diag.investimentoAudit.problemas).Count
    Add-Check "investimento.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " total=" + $diag.investimentoAudit.investimentoTotal)
  }

  if ($Aba -eq "RESPONSAVEIS" -and $diag.responsaveisAudit) {
    $nProb = @($diag.responsaveisAudit.problemas).Count
    Add-Check "responsaveis.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " cadastros=" + $diag.responsaveisAudit.cadastrosPlanilha)
  }

  if ($Aba -eq "RELATORIOS" -and $diag.relatoriosAudit) {
    $nProb = @($diag.relatoriosAudit.problemas).Count
    Add-Check "relatorios.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.relatoriosAudit.registros)
  }

  if ($Aba -eq "AUDITORIA" -and $diag.auditoriaAudit) {
    $nProb = @($diag.auditoriaAudit.problemas).Count
    Add-Check "auditoria.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.auditoriaAudit.registros)
  }

  if ($Aba -eq "AUD_TURNO" -and $diag.audTurnoAudit) {
    $nProb = @($diag.audTurnoAudit.problemas).Count
    Add-Check "audTurno.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.audTurnoAudit.registros)
  }

  if ($Aba -eq "AUD_SMS" -and $diag.audSmsAudit) {
    $nProb = @($diag.audSmsAudit.problemas).Count
    Add-Check "audSms.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.audSmsAudit.registros)
  }

  if ($Aba -eq "AUD_WHATSAPP" -and $diag.audWhatsappAudit) {
    $nProb = @($diag.audWhatsappAudit.problemas).Count
    Add-Check "audWhatsapp.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.audWhatsappAudit.registros)
  }

  if ($Aba -eq "AUD_RESPONSAVEIS" -and $diag.audResponsaveisAudit) {
    $nProb = @($diag.audResponsaveisAudit.problemas).Count
    Add-Check "audResponsaveis.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.audResponsaveisAudit.registros)
  }

  if ($Aba -eq "COLABORADORES_RH" -and $diag.colaboradoresRhAudit) {
    $nProb = @($diag.colaboradoresRhAudit.problemas).Count
    Add-Check "colabRh.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.colaboradoresRhAudit.registros)
  }

  if ($Aba -eq "FOLHA_PONTO" -and $diag.folhaPontoAudit) {
    $nProb = @($diag.folhaPontoAudit.problemas).Count
    Add-Check "folhaPonto.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.folhaPontoAudit.registros)
  }

  if ($Aba -eq "BANCO_HORAS" -and $diag.bancoHorasAudit) {
    $nProb = @($diag.bancoHorasAudit.problemas).Count
    Add-Check "bancoHoras.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.bancoHorasAudit.registros)
  }

  if ($Aba -eq "ESCALA_COLABORADORES" -and $diag.escalaAudit) {
    $nProb = @($diag.escalaAudit.problemas).Count
    Add-Check "escala.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.escalaAudit.registros)
  }

  if ($Aba -eq "FALTAS_AUSENCIAS" -and $diag.faltasAudit) {
    $nProb = @($diag.faltasAudit.problemas).Count
    Add-Check "faltas.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.faltasAudit.registros)
  }

  if ($Aba -eq "HOLERITES" -and $diag.holeritesAudit) {
    $nProb = @($diag.holeritesAudit.problemas).Count
    Add-Check "holerites.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.holeritesAudit.registros)
  }

  if ($Aba -eq "METAS_COLABORADORES" -and $diag.metasAudit) {
    $nProb = @($diag.metasAudit.problemas).Count
    Add-Check "metas.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.metasAudit.registros)
  }

  if ($Aba -eq "COMUNICADOS_RH" -and $diag.comunicadosRhAudit) {
    $nProb = @($diag.comunicadosRhAudit.problemas).Count
    Add-Check "comunicadosRh.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.comunicadosRhAudit.registros)
  }

  if ($Aba -eq "AVALIACOES_RH" -and $diag.avaliacoesRhAudit) {
    $nProb = @($diag.avaliacoesRhAudit.problemas).Count
    Add-Check "avaliacoesRh.audit" $(if ($nProb -eq 0) { "ok" } else { "warn" }) ("problemas=" + $nProb + " registros=" + $diag.avaliacoesRhAudit.registros)
  }

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  if ($schema.resultado.$Aba) {
    $s = $schema.resultado.$Aba
    if ($s.ok) { Add-Check "validarSchema.$Aba" "ok" "headers ok" }
    else {
      $f = @($s.faltando | ForEach-Object { "col$($_.coluna)" }) -join ","
      Add-Check "validarSchema.$Aba" "warn" ("faltando: " + $f)
    }
  } else {
    Add-Check "validarSchema.$Aba" "warn" "aba ainda sem entrada em validarSchema_"
  }

  $cfg = $repairActions[$Aba]
  if ($cfg) {
    Add-Check "repair.mapeado" "ok" $cfg.repairAction
    if (-not $SomenteLeitura -and -not $SkipRepair) {
      $rp = @{ action = $cfg.repairAction; adminPin = $AdminPin }
      if ($DryRun) { $rp.dryRun = "1" }
      else {
        $rp.motivo = "Protocolo aba $Aba $(Get-Date -Format yyyy-MM-dd)"
        if ($Aba -eq "LOCACOES") { $rp.limparTeste = "1" }
      }
      $repair = Invoke-MkApi $rp
      if (-not $repair.ok) { throw $repair.erro }
      if ($repair.dryRun) {
        $schemaOk = if ($null -ne $repair.schemaOk) { $repair.schemaOk } elseif ($repair.schema) { $repair.schema.ok } else { "?" }
        Add-Check "repair.dryRun" "ok" ("schemaOk=" + $schemaOk + " prob=" + @($repair.audit.problemas).Count)
      } else {
        $detail = "schemaOk=$($repair.schemaOk)"
        if ($repair.formatos -and $repair.formatos.linhas) {
          $detail += " linhas=$($repair.formatos.linhas)"
        } elseif ($repair.kpiSync) {
          $detail += " kpiSync=ok"
        } elseif ($repair.formulas) {
          $detail += " formulas B68=$($repair.formulas.b68)"
        }
        Add-Check "repair.aplicado" "ok" $detail
      }
    }
    if ($cfg.fluxoTeste -and (Test-Path (Join-Path $PSScriptRoot $cfg.fluxoTeste))) {
      if (-not $SomenteLeitura -and -not $DryRun) {
        $fluxoOut = & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot $cfg.fluxoTeste) 2>&1 | Out-String
        if ($fluxoOut -match '"status"\s*:\s*"ok"') {
          Add-Check "fluxo.consumidor" "ok" $cfg.fluxoNome
        } else {
          Add-Check "fluxo.consumidor" "warn" $cfg.fluxoNome
        }
      } else {
        Add-Check "fluxo.consumidor" "skip" "DryRun ou SomenteLeitura"
      }
    }
  } else {
    Add-Check "repair.mapeado" "warn" "Repair GAS ainda nao implementado para $Aba - ver protocolo Fase G"
  }

  $fail = @($result.checks | Where-Object { $_.status -eq "fail" })
  $warn = @($result.checks | Where-Object { $_.status -eq "warn" })
  if ($fail.Count -gt 0) {
    $result.status = "fail"
    $result.summary = "Falhas: " + $fail.Count
  } elseif ($warn.Count -gt 0) {
    $result.status = "ok_with_warnings"
    $result.summary = "Aba $Aba OK com " + $warn.Count + " aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "Aba $Aba protocolo OK"
  }
} catch {
  $result.status = "fail"
  $result.summary = $_.Exception.Message
  Add-Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$json = $result | ConvertTo-Json -Depth 8
if ($ResultFile) {
  $json | Set-Content -Path $ResultFile -Encoding UTF8
}
$json
