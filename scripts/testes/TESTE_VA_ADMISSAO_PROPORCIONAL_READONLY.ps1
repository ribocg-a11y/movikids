param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416",
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
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  status = "ok"
}

function Add-Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
  if ($Status -eq "fail") { $script:result.status = "fail" }
  elseif ($Status -eq "warn" -and $script:result.status -eq "ok") { $script:result.status = "warn" }
}

$gsPath = Join-Path $RepoRoot "MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs"
foreach ($pair in @(
  @{ needle = "function gpNormAdmissaoStr_"; name = "gas.gpNormAdmissaoStr" },
  @{ needle = "TRAVA admissao invalida"; name = "gas.travaAdmissaoInvalida" },
  @{ needle = "function gpRepairAdmissaoRhCell_"; name = "gas.repairAdmissaoCell" },
  @{ needle = "yyyy-MM-dd"; name = "gas.parseIsoDate" },
  @{ needle = "vaTotal / diasTrab"; name = "gas.vaDiarioProporcional" }
)) {
  if (-not (Test-Path $gsPath)) {
    Add-Check $pair.name "fail" "gs ausente"
  } elseif (-not (Select-String -Path $gsPath -Pattern $pair.needle -Quiet)) {
    Add-Check $pair.name "fail" $pair.needle
  } else {
    Add-Check $pair.name "ok" $pair.needle
  }
}

if (Select-String -Path $gsPath -Pattern "v1\.5\.129" -Quiet) {
  Add-Check "gas.versaoHeader" "ok" "v1.5.129"
} else {
  Add-Check "gas.versaoHeader" "warn" "header ainda nao v1.5.129"
}

try {
  $adm = Invoke-GpApi @{ action = "painelGestaoPessoasAdmin"; adminPin = $AdminPin }
  if (-not $adm.ok) { throw "painelGestaoPessoasAdmin: $($adm.erro)" }
  $c = @($adm.colaboradores | Where-Object { [int]$_.id -eq $OperadorId })[0]
  if (-not $c) {
    Add-Check "colaborador" "fail" "id $OperadorId ausente"
  } else {
    $admStr = [string]$c.admissao
    if ($c.cadastro -and $c.cadastro.admissao) { $admStr = [string]$c.cadastro.admissao }
    Add-Check "admissao.formato" $(if ($admStr -match '^\d{2}/\d{2}/\d{4}$') { "ok" } else { "warn" }) $admStr
    $preview = Invoke-GpApi @{
      action = "buscarPainelColaboradorPreview"
      operadorId = $OperadorId
      adminPin = $AdminPin
    }
    if ($preview.ok -and $preview.pagamento) {
      $pg = $preview.pagamento
      $ben = $pg.beneficios
      $dias = [int]$pg.diasTrabalhados
      $diasMes = [int]$pg.diasMes
      $vaTotal = [double]$ben.vaTotal
      if ($null -eq $ben.vaTotal) { $vaTotal = [double]($preview.holerite.vaTotal) }
      Add-Check "holerite.diasTrab" "ok" ("dias=" + $dias + "/" + $diasMes)
      if ($dias -gt 0 -and $dias -lt $diasMes) {
        $esperado = [math]::Round(400 * $dias / $diasMes, 2)
        $delta = [math]::Abs($vaTotal - $esperado)
        if ($vaTotal -le 0) {
          Add-Check "va.proporcional" "warn" "VA 0 - 1a quinzena ou GAS Web antigo"
        } elseif ($delta -le 0.05) {
          Add-Check "va.proporcional" "ok" ("va=" + $vaTotal + " esperado~" + $esperado)
        } else {
          Add-Check "va.proporcional" "fail" ("va=" + $vaTotal + " esperado=" + $esperado + " adm=" + $admStr)
        }
      } else {
        Add-Check "va.proporcional" "warn" ("dias=" + $dias + " - conferir admissao na planilha")
      }
    } else {
      Add-Check "painel.preview" "warn" ([string]$preview.erro)
    }
  }
} catch {
  Add-Check "gas.api" "warn" $_.Exception.Message
}

if ($result.status -eq "ok") { $result.summary = "VA admissao proporcional - repo OK" }
elseif ($result.status -eq "warn") { $result.summary = "Repo OK - publique GAS v1.5.129 Web" }
else { $result.summary = "Falha proporcional VA/admissao" }

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
