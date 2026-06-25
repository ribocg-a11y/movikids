# I62 - Camada 5 RH P0 readonly: dryRun + validarSchema + painelGestaoPessoasAdmin
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
    action = "repararRhCamada5PlanilhaAdmin"
    adminPin = $AdminPin
    dryRun = "1"
  }
  if (-not $dry.ok) { throw "dryRun camada5 falhou: $($dry.erro)" }
  foreach ($aba in @("colaboradores", "folhaPonto", "bancoHoras")) {
    $a = $dry.$aba
    if ($a) {
      $nProb = @($a.audit.problemas).Count
      $st = if ($nProb -eq 0) { "ok" } else { "warn" }
      Add-RhCheck ("audit." + $aba) $st ("reg=" + $a.audit.registros + " prob=" + $nProb)
    }
  }

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  foreach ($aba in @("COLABORADORES_RH", "FOLHA_PONTO", "BANCO_HORAS")) {
    $s = $schema.resultado.$aba
    if ($s.ok) { Add-RhCheck ("validarSchema." + $aba) "ok" ("registros=" + $s.registros) }
    else { Add-RhCheck ("validarSchema." + $aba) "warn" ("faltando=" + @($s.faltando).Count) }
  }

  $adm = Invoke-MkApi @{ action = "painelGestaoPessoasAdmin"; adminPin = $AdminPin }
  if (-not $adm.ok) { throw "painelGestaoPessoasAdmin falhou" }
  foreach ($c in @($adm.colaboradores)) {
    $st = if ($c.cadastroOk) { "ok" } else { "warn" }
    Add-RhCheck ("rh.id" + $c.id) $st ($c.nome + " pct=" + $c.cadastroPct)
  }

  $result.status = "ok"
  $result.summary = "Camada 5 RH P0 readonly OK - schema global=" + $schema.schemaOk
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-RhCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 10
if ($result.status -ne "ok") { exit 1 }
