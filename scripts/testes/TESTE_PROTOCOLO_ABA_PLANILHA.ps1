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
  [string]$AdminPin = "1416",
  [switch]$DryRun,
  [switch]$SomenteLeitura,
  [switch]$SkipRepair
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
  # Proximas abas: adicionar ao implementar repair GAS
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
        Add-Check "repair.dryRun" "ok" ("schemaOk=" + $repair.schemaOk + " prob=" + @($repair.audit.problemas).Count)
      } else {
        Add-Check "repair.aplicado" "ok" ("schemaOk=" + $repair.schemaOk + " linhas=" + $repair.formatos.linhas)
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
$result | ConvertTo-Json -Depth 8
