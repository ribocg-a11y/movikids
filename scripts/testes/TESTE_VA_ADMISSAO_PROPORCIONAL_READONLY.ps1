param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$OperadorId = 3,
  [string]$RepoRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent)
)

$ErrorActionPreference = "Stop"

function Invoke-GpApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 90
}

$result = [ordered]@{
  suite = "TESTE_VA_ADMISSAO_PROPORCIONAL_READONLY"
  startedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  checks = @()
  status = "ok"
}

function Add-Check([string]$Name, [string]$Status, [string]$Detail = '') {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq 'fail') { $script:result.status = 'fail' }
  elseif ($Status -eq 'warn' -and $script:result.status -eq 'ok') { $script:result.status = 'warn' }
}

$gsPath = Join-Path $RepoRoot "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
foreach ($pair in @(
  @{ needle = 'function gpNormAdmissaoStr_'; name = 'gas.gpNormAdmissaoStr' },
  @{ needle = 'TRAVA admissao invalida'; name = 'gas.travaAdmissaoInvalida' },
  @{ needle = 'function gpVaMensalTeto_'; name = 'gas.gpVaMensalTeto' },
  @{ needle = 'TRAVA va_diario planilha infla VA'; name = 'gas.travaVaDiario520' },
  @{ needle = 'vaTotal / diasTrab'; name = 'gas.vaDiarioProporcional' }
)) {
  if (-not (Test-Path $gsPath)) {
    Add-Check $pair.name 'fail' 'gs ausente'
  } elseif (-not (Select-String -Path $gsPath -Pattern $pair.needle -Quiet)) {
    Add-Check $pair.name 'fail' $pair.needle
  } else {
    Add-Check $pair.name 'ok' $pair.needle
  }
}

if (Select-String -Path $gsPath -Pattern 'v1\.5\.14[0-3]' -Quiet) {
  Add-Check 'gas.versaoHeader' 'ok' 'v1.5.140+'
} else {
  Add-Check 'gas.versaoHeader' 'warn' 'header abaixo v1.5.140'
}

try {
  $ping = Invoke-GpApi @{ action = 'ping' }
  Add-Check 'ping' 'ok' $ping.versao

  $preview = Invoke-GpApi @{
    action = 'buscarPainelColaboradorPreview'
    operadorId = $OperadorId
    adminPin = $AdminPin
  }
  if (-not $preview.ok) { throw "preview: $($preview.erro)" }

  $pg = $preview.pagamento
  $hol = $pg.holerite
  if (-not $hol) { throw 'pagamento.holerite ausente' }

  $dias = [int]$hol.diasTrabalhados
  $diasMes = [int]$hol.diasMes
  $vaMensal = [double]$hol.vaMensal
  $vaTotal = [double]$hol.vaTotal
  $admStr = [string]$preview.colaborador.admissao

  Add-Check 'holerite.diasTrab' 'ok' ('dias=' + $dias + '/' + $diasMes + ' adm=' + $admStr)
  Add-Check 'holerite.vaMensal' $(if ($vaMensal -ge 399 -and $vaMensal -le 401) { 'ok' } else { 'fail' }) ('vaMensal=' + $vaMensal)

  if ($dias -gt 0 -and $dias -lt $diasMes) {
    $esperado = [math]::Round(400 * $dias / $diasMes, 2)
    if ($hol.quinzena -ne 2) {
      Add-Check 'va.proporcional' 'warn' ('Q' + $hol.quinzena + ' — VA beneficio na Q2')
    } elseif ($vaTotal -le 0) {
      Add-Check 'va.proporcional' 'fail' 'vaTotal=0 na Q2'
    } else {
      $delta = [math]::Abs($vaTotal - $esperado)
      if ($delta -le 0.05) {
        Add-Check 'va.proporcional' 'ok' ('vaTotal=' + $vaTotal + ' esperado=' + $esperado)
      } else {
        Add-Check 'va.proporcional' 'fail' ('vaTotal=' + $vaTotal + ' esperado=' + $esperado + ' (base errada se ~277)')
      }
    }
  } else {
    Add-Check 'va.proporcional' 'warn' ('dias=' + $dias)
  }
} catch {
  Add-Check 'gas.api' 'warn' $_.Exception.Message
}

if ($result.status -eq 'ok') { $result.summary = 'VA R$400 proporcional OK' }
elseif ($result.status -eq 'warn') { $result.summary = 'Repo OK — publicar GAS v1.5.143 Web' }
else { $result.summary = 'Falha VA/admissao — ver I49' }

$result.finishedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
$result | ConvertTo-Json -Depth 6
if ($result.status -eq 'fail') { exit 1 }
exit 0
