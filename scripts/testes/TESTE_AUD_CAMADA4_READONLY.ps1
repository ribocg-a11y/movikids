# I61 - Camada 4 AUD_* readonly: dryRun repair + validarSchema + listarAuditoriaAdmin
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

function Add-AudCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-AudCheck "ping" "ok" $ping.versao

  $dry = Invoke-MkApi @{
    action = "repararAudCamada4PlanilhaAdmin"
    adminPin = $AdminPin
    dryRun = "1"
  }
  if (-not $dry.ok) { throw "dryRun camada4 falhou: $($dry.erro)" }
  foreach ($aba in @("AUDITORIA", "AUD_TURNO", "AUD_SMS", "AUD_WHATSAPP", "AUD_RESPONSAVEIS")) {
    $a = $dry.abas.$aba
    if ($a) {
      $nProb = @($a.audit.problemas).Count
      $st = if ($nProb -eq 0) { "ok" } else { "warn" }
      Add-AudCheck ("audit." + $aba) $st ("reg=" + $a.audit.registros + " prob=" + $nProb)
    }
  }

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  foreach ($aba in @("AUDITORIA", "AUD_TURNO", "AUD_SMS", "AUD_WHATSAPP", "AUD_RESPONSAVEIS")) {
    $s = $schema.resultado.$aba
    if ($s.ok) { Add-AudCheck ("validarSchema." + $aba) "ok" ("registros=" + $s.registros) }
    else { Add-AudCheck ("validarSchema." + $aba) "warn" ("faltando=" + @($s.faltando).Count) }
  }

  $lista = Invoke-MkApi @{ action = "listarAuditoriaAdmin"; adminPin = $AdminPin; limite = "5" }
  if (-not $lista.ok) { throw "listarAuditoriaAdmin falhou" }
  Add-AudCheck "listarAuditoriaAdmin" "ok" ("eventos=" + @($lista.eventos).Count + " total=" + $lista.total)

  $result.status = "ok"
  $result.summary = "Camada 4 AUD_* readonly OK - schema global=" + $schema.schemaOk
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-AudCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 10
if ($result.status -ne "ok") { exit 1 }
