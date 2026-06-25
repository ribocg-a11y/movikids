param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$OperadorId = 3
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 90
}

$result = [ordered]@{
  suite = "TESTE_FALTAS_HOLERITE_READONLY"
  startedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  checks = @()
  status = "ok"
}

function Add-Check([string]$Name, [string]$Status, [string]$Detail = '') {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq 'fail') { $script:result.status = 'fail' }
  elseif ($Status -eq 'warn' -and $script:result.status -eq 'ok') { $script:result.status = 'warn' }
}

$gsPath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
foreach ($n in @('gpFaltaEhConfirmadaRow_', 'gpRepairLimparFaltasSyncJornada_', "sit = 'Sem ponto'")) {
  if (Select-String -Path $gsPath -Pattern ([regex]::Escape($n)) -Quiet) {
    Add-Check ('gas.' + $n) 'ok' $n
  } else {
    Add-Check ('gas.' + $n) 'fail' 'ausente'
    $result.status = 'fail'
  }
}

try {
  $preview = Invoke-MkApi @{
    action = 'buscarPainelColaboradorPreview'
    operadorId = $OperadorId
    adminPin = $AdminPin
  }
  if (-not $preview.ok) { throw $preview.erro }
  $hol = $preview.pagamento.holerite
  $faltas = [double]$hol.faltas
  Add-Check 'holerite.faltas' $(if ($faltas -le 0.01) { 'ok' } else { 'fail' }) ('faltas=' + $faltas)
  $jornadaFalta = @($preview.ponto.jornada.dias | Where-Object { $_.sit -eq 'Falta' }).Count
  Add-Check 'jornada.semSitFaltaAuto' $(if ($jornadaFalta -eq 0) { 'ok' } else { 'fail' }) ('sitFalta=' + $jornadaFalta)
} catch {
  Add-Check 'gas.api' 'warn' $_.Exception.Message
}

if ($result.status -eq 'ok') { $result.summary = 'Faltas holerite OK (0)' }
else { $result.summary = 'Faltas indevidas — ver I50 + repararRhPlanilhaAdmin' }

$result.finishedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
$result | ConvertTo-Json -Depth 6
if ($result.status -eq 'fail') { exit 1 }
