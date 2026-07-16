param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [int]$WarmMaxSec = 8,
  [int]$TimeoutSec = 90
)

# I122 — carregarInicio com _t deve acertar ScriptCache (warm < WarmMaxSec) apos v1.5.201.

$ErrorActionPreference = "Stop"

function Invoke-I122Api {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $data = Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec $TimeoutSec
  $sw.Stop()
  return [pscustomobject]@{ data = $data; sec = [math]::Round($sw.Elapsed.TotalSeconds, 2) }
}

$result = [ordered]@{
  suite = "TESTE_I122_SYNC_INICIO_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  timings = [ordered]@{}
}

function Add-I122([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $pingR = Invoke-I122Api @{ action = "ping" }
  $ping = $pingR.data
  if (-not $ping.ok) { throw "ping falhou" }
  Add-I122 "ping" "ok" ("{0} ({1}s)" -f $ping.versao, $pingR.sec)

  $verOk = $false
  if ($ping.versao -match 'v1\.5\.(\d+)') {
    $n = [int]$Matches[1]
    if ($n -ge 201) { $verOk = $true; Add-I122 "gas.versao.i122" "ok" $ping.versao }
    else { Add-I122 "gas.versao.i122" "warn" ("Web {0} — publique v1.5.201 (cache inicio+_t)" -f $ping.versao) }
  }

  $c1 = Invoke-I122Api @{ action = "carregarInicio"; _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  if (-not $c1.data.ok) { throw "carregarInicio frio: $($c1.data.erro)" }
  $n1 = @($c1.data.ativos).Count
  Add-I122 "inicio.cold" "ok" ("{0}s ativos=$n1" -f $c1.sec)
  $result.timings.cold = $c1.sec

  Start-Sleep -Seconds 1
  $c2 = Invoke-I122Api @{ action = "carregarInicio"; _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + 1 }
  if (-not $c2.data.ok) { throw "carregarInicio warm: $($c2.data.erro)" }
  $n2 = @($c2.data.ativos).Count
  $result.timings.warm = $c2.sec
  Add-I122 "inicio.warm.ativos" "ok" ("n=$n2")

  if ($verOk) {
    if ($c2.sec -le $WarmMaxSec) {
      Add-I122 "inicio.warm.cache" "ok" ("{0}s (limite {1}s, _t diferente)" -f $c2.sec, $WarmMaxSec)
    } else {
      Add-I122 "inicio.warm.cache" "fail" ("{0}s > {1}s — cache ainda bustado por _t?" -f $c2.sec, $WarmMaxSec)
    }
  } else {
    if ($c2.sec -le $WarmMaxSec) {
      Add-I122 "inicio.warm.cache" "ok" ("{0}s" -f $c2.sec)
    } else {
      Add-I122 "inicio.warm.cache" "warn" ("{0}s — esperado ate Nova versao 201" -f $c2.sec)
    }
  }

  $la = Invoke-I122Api @{ action = "listarAtivas"; _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
  $nLa = @($la.data.locacoes).Count
  Add-I122 "listarAtivas" "ok" ("n=$nLa")
  if ($n1 -eq $nLa -or $n2 -eq $nLa) {
    Add-I122 "paridade.ativos" "ok" ("inicio=$n2 listar=$nLa")
  } else {
    Add-I122 "paridade.ativos" "warn" ("inicio cold/warm=$n1/$n2 listar=$nLa (pode ter mudado na loja)")
  }

  $fail = @($result.checks | Where-Object { $_.status -eq "fail" })
  $warn = @($result.checks | Where-Object { $_.status -eq "warn" })
  if ($fail.Count -gt 0) {
    $result.status = "fail"
    $result.summary = "Falhas I122: $($fail.Count)"
  } elseif ($warn.Count -gt 0) {
    $result.status = "ok_with_warnings"
    $result.summary = "I122 parcial; $($warn.Count) aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "carregarInicio warm OK com _t"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-I122 "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
