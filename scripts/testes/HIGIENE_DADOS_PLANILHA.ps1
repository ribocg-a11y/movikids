# Pacote higiene de dados — planilha MOVI KIDS (pos-protocolo I52-I63)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [switch]$SkipPontoRaykelly
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

$result = [ordered]@{
  suite = "HIGIENE_DADOS_PLANILHA"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  steps = @()
}

function Add-Step([string]$Name, [string]$Status, $Detail) {
  $script:result.steps += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -TimeoutSec 120
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  Add-Step "ping" "ok" $ping.versao

  # 1) Limpar locacoes de teste
  . "$PSScriptRoot\_TestCleanup.ps1"
  $limpar = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -Quiet
  Add-Step "limparLocacoesTeste" $(if ($limpar.ok) { "ok" } else { "warn" }) $limpar.detail

  # 1b) Repair LOCACOES + limpar testes historicos (ultimas linhas)
  try {
    $loc = Invoke-MkApi @{
      action = "repararLocacoesPlanilhaAdmin"
      adminPin = $AdminPin
      limparTeste = "1"
      motivo = "Higiene dados locacoes teste historico $(Get-Date -Format yyyy-MM-dd)"
    }
    if ($loc.ok -eq $false) { throw $loc.erro }
    $nTeste = if ($loc.limpeza) { $loc.limpeza.total } else { 0 }
    $nProb = if ($loc.audit) { @($loc.audit.problemas).Count } else { -1 }
    Add-Step "repararLocacoesPlanilhaAdmin" "ok" "testesAnulados=$nTeste problemasAmostra=$nProb schemaOk=$($loc.schemaOk)"
  } catch {
    Add-Step "repararLocacoesPlanilhaAdmin" "warn" $_.Exception.Message
  }

  # 2) Repair RH + banco horas + faltas sync + VA
  $repair = Invoke-MkApi @{
    action = "repararRhPlanilhaAdmin"
    adminPin = $AdminPin
    repairBanco = "sim"
  }
  if ($repair.ok -eq $false) { throw "repararRhPlanilhaAdmin: $($repair.erro)" }
  $colabSummary = @($repair.colaboradores | ForEach-Object {
    "id$($_.operadorId) $($_.nome) pct=$($_.cadastroPct) ok=$($_.cadastroOk)"
  }) -join "; "
  Add-Step "repararRhPlanilhaAdmin" "ok" @{
    vaDiario = $repair.vaDiarioReparados
    faltasSync = $repair.faltasSyncRemovidas
    banco = $repair.bancoRepair
    colaboradores = $colabSummary
  }

  # 3) Ponto Raykelly (idempotente)
  if (-not $SkipPontoRaykelly) {
    try {
      $ponto = Invoke-MkApi @{ action = "restaurarPontoRaykellyJun2026Admin"; adminPin = $AdminPin }
      Add-Step "restaurarPontoRaykelly" $(if ($ponto.ok -ne $false) { "ok" } else { "warn" }) $ponto
    } catch {
      Add-Step "restaurarPontoRaykelly" "warn" $_.Exception.Message
    }
  }

  # 4) Busca texto Raykelly (recuperacao cadastro)
  try {
    $busca = Invoke-MkApi @{ action = "buscarTextoPlanilhaAdmin"; adminPin = $AdminPin; termo = "Raykelly"; limite = "20" }
    $hits = @($busca.ocorrencias).Count
    Add-Step "buscarTextoRaykelly" "ok" "ocorrencias=$hits"
    $result.buscaRaykelly = $busca.ocorrencias
  } catch {
    Add-Step "buscarTextoRaykelly" "warn" $_.Exception.Message
  }

  # 5) Auditoria final
  $aud = & "$PSScriptRoot\TESTE_AUDITORIA_PLANILHA_COMPLETA_READONLY.ps1" -BaseUrl $BaseUrl -AdminPin $AdminPin | ConvertFrom-Json
  Add-Step "auditoriaFinal" $aud.status $aud.summary

  $warn = @($result.steps | Where-Object { $_.status -eq "warn" })
  $fail = @($result.steps | Where-Object { $_.status -eq "fail" })
  if ($fail.Count) { $result.status = "fail" }
  elseif ($warn.Count) { $result.status = "ok_with_warnings" }
  else { $result.status = "ok" }
} catch {
  $result.status = "fail"
  $result.erro = $_.Exception.Message
  Add-Step "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
if ($result.status -eq "fail") { exit 1 }
exit 0
