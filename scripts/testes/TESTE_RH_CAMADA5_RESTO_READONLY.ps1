# I63 - Camada 5 RH resto readonly: dryRun + validarSchema + diagnostico audits
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())" -Method Get -TimeoutSec 120
}

$result = [ordered]@{ startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); checks = @() }

function Add-RhCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-RhCheck "ping" "ok" $ping.versao

  $dry = Invoke-MkApi @{
    action = "repararRhCamada5RestoPlanilhaAdmin"
    adminPin = $AdminPin
    dryRun = "1"
  }
  if (-not $dry.ok) { throw "dryRun camada5 resto falhou: $($dry.erro)" }
  foreach ($aba in @("escala", "faltas", "holerites", "metas", "comunicados", "avaliacoes")) {
    $a = $dry.abas.$aba
    if (-not $a) { $a = $dry.$aba }
    if ($a) {
      $nProb = @($a.audit.problemas).Count
      $st = if ($nProb -eq 0) { "ok" } else { "warn" }
      Add-RhCheck ("audit." + $aba) $st ("reg=" + $a.audit.registros + " prob=" + $nProb)
    }
  }

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  foreach ($aba in @("ESCALA_COLABORADORES", "FALTAS_AUSENCIAS", "HOLERITES", "METAS_COLABORADORES", "COMUNICADOS_RH", "AVALIACOES_RH")) {
    $s = $schema.resultado.$aba
    if ($s.ok) { Add-RhCheck ("validarSchema." + $aba) "ok" ("registros=" + $s.registros) }
    else { Add-RhCheck ("validarSchema." + $aba) "warn" ("faltando=" + @($s.faltando).Count) }
  }

  $diag = Invoke-MkApi @{ action = "diagnosticoPlanilhaCompletoAdmin"; adminPin = $AdminPin }
  if (-not $diag.ok) { throw "diagnostico falhou" }
  foreach ($pair in @(
    @{ key = "escalaAudit"; label = "escala" },
    @{ key = "faltasAudit"; label = "faltas" },
    @{ key = "holeritesAudit"; label = "holerites" },
    @{ key = "metasAudit"; label = "metas" },
    @{ key = "comunicadosRhAudit"; label = "comunicados" },
    @{ key = "avaliacoesRhAudit"; label = "avaliacoes" }
  )) {
    $a = $diag.($pair.key)
    if ($a) {
      $nProb = @($a.problemas).Count
      $st = if ($nProb -eq 0) { "ok" } else { "warn" }
      Add-RhCheck ("diag." + $pair.label) $st ("reg=" + $a.registros + " prob=" + $nProb)
    }
  }

  $result.status = "ok"
  $result.summary = "Camada 5 RH resto readonly OK - schema global=" + $schema.schemaOk
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-RhCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 10
if ($result.status -ne "ok") { exit 1 }
