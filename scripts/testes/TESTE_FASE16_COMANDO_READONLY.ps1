param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
)

$ErrorActionPreference = "Stop"

function Invoke-CmdApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 45
}

$result = [ordered]@{
  suite = "TESTE_FASE16_COMANDO_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-C16Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-CmdApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-C16Check "ping" "ok" $ping.versao

  $cmd = Invoke-CmdApi @{ action = "comandoOperacional"; adminPin = $AdminPin }
  if ($cmd.erro -and $cmd.erro -match 'desconhecida') {
    Add-C16Check "comandoOperacional" "warn" "action ausente — publique GAS v1.5.118+ Nova versao Web"
    $result.status = "warn"
    $result.summary = "FASE 16 API pendente deploy GAS"
  } elseif (-not $cmd.ok) {
    throw "comandoOperacional falhou: $($cmd.erro)"
  } else {
    foreach ($field in @('data', 'locacoes', 'fatHoje', 'equipe', 'frota', 'widgets', 'comparativo30d')) {
      if ($null -eq $cmd.$field) { throw "campo ausente: $field" }
    }
    if ($null -eq $cmd.frota.detalhe) { throw "frota.detalhe ausente" }
    Add-C16Check "comandoOperacional" "ok" ("abertas=" + $cmd.locacoes.abertas + " fatHoje=" + $cmd.fatHoje)
    Add-C16Check "frota.detalhe" "ok" ("n=" + $cmd.frota.detalhe.Count)
    Add-C16Check "comparativo30d" "ok" ("media=" + $cmd.comparativo30d.media)
    $result.status = "ok"
    $result.summary = "FASE 16 comando OK"
  }
} catch {
  Add-C16Check "suite" "fail" $_.Exception.Message
  $result.status = "fail"
  $result.summary = $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
