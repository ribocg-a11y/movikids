param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$OperadorId = 3
)

$ErrorActionPreference = "Stop"

function Invoke-GpApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 60
}

$result = [ordered]@{
  suite = "TESTE_HISTORICO_DESEMPENHO_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-GpCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-GpApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-GpCheck "ping" "ok" $ping.versao
  if ($ping.versao -match 'v1\.5\.12[5-9]|v1\.5\.13') {
    Add-GpCheck "gas.versao" "ok" $ping.versao
  } else {
    Add-GpCheck "gas.versao" "warn" ("repo v1.5.125 - publicar Nova versao Web: " + $ping.versao)
  }

  $painel = Invoke-GpApi @{
    action = "buscarPainelColaboradorPreview"
    adminPin = $AdminPin
    operadorId = $OperadorId
    _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  if (-not $painel.ok) {
    Add-GpCheck "buscarPainelColaboradorPreview" "warn" ([string]$painel.erro)
  } else {
    $h = $painel.historicoDesempenho
    if ($null -eq $h) {
      Add-GpCheck "historicoDesempenho" "warn" "campo ausente - GAS antigo"
    } else {
      $n = 0
      if ($h.meses) { $n = @($h.meses).Count }
      Add-GpCheck "historicoDesempenho" "ok" ("meses=" + $n + " metaAlvo=" + $h.metaAlvo)
    }
  }

  $fail = @($result.checks | Where-Object { $_.status -eq "fail" })
  $warn = @($result.checks | Where-Object { $_.status -eq "warn" })
  if ($fail.Count -gt 0) {
    $result.status = "fail"
    $result.summary = "Falhas: $($fail.Count)"
  } elseif ($warn.Count -gt 0) {
    $result.status = "ok_with_warnings"
    $result.summary = "Historico desempenho readonly OK; $($warn.Count) aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "Historico desempenho readonly OK"
  }
} catch {
  $result.status = "fail"
  $result.summary = $_.Exception.Message
  Add-GpCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
