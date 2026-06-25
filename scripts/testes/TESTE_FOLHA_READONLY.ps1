# I57 — FOLHA readonly: audit + validarSchema + folhaPlanejamento (sem repair formulas)
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
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 120
}

$result = [ordered]@{ startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); checks = @() }

function Add-FolCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-FolCheck "ping" "ok" $ping.versao

  $dry = Invoke-MkApi @{
    action = "repararFolhaPlanilhaAdmin"
    adminPin = $AdminPin
    dryRun = "1"
  }
  if (-not $dry.ok) { throw "dryRun repair falhou: $($dry.erro)" }
  $nProb = @($dry.audit.problemas).Count
  if ($nProb -eq 0) { Add-FolCheck "folha.audit" "ok" "sem erros formula" }
  else { Add-FolCheck "folha.audit" "warn" ("problemas=" + $nProb) }

  $schema = Invoke-MkApi @{ action = "validarSchema" }
  $fol = $schema.resultado.FOLHA
  if ($fol.ok) { Add-FolCheck "validarSchema.FOLHA" "ok" ("B68=" + $fol.b68) }
  else { Add-FolCheck "validarSchema.FOLHA" "warn" ("faltando=" + @($fol.faltando).Count) }

  $mes = (Get-Date).Month
  $ano = (Get-Date).Year
  $kpi = Invoke-MkApi @{ action = "kpiMes"; adminPin = $AdminPin; mes = $mes; ano = $ano; lite = "1" }
  if (-not $kpi.ok) { throw "kpiMes falhou: $($kpi.erro)" }
  $f = $kpi.folhaPlanejamento
  if ($null -eq $f) { throw "folhaPlanejamento ausente" }
  if ($f.fonte -ne "FOLHA") { throw "fonte=" + $f.fonte }
  Add-FolCheck "folhaPlanejamento" "ok" ("custo=" + $f.custoMensal + " vaDia=" + $f.vaDia)

  $result.status = "ok"
  $result.summary = "FOLHA readonly OK - B68=" + $f.custoMensal + " fonte=FOLHA"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-FolCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
if ($result.status -ne "ok") { exit 1 }
