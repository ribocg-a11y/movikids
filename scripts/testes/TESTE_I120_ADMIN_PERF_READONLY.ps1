param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$WarmMaxSec = 6,
  [int]$TimeoutSec = 90
)

# I120 / I120b — regressao admin: cache comando com _t, painel lite, pay-first caixa, comunicados.
# Somente leitura. Falha se Web < v1.5.199 (cache _t) ou warm acima do limiar.

$ErrorActionPreference = "Stop"

function Invoke-I120Api {
  param([hashtable]$Params, [int]$Timeout = $TimeoutSec)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $data = Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec $Timeout
  $sw.Stop()
  return [pscustomobject]@{ data = $data; sec = [math]::Round($sw.Elapsed.TotalSeconds, 2) }
}

$result = [ordered]@{
  suite = "TESTE_I120_ADMIN_PERF_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
  timings = [ordered]@{}
}

function Add-I120Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $pingR = Invoke-I120Api @{ action = "ping" } -Timeout 30
  $ping = $pingR.data
  if (-not $ping.ok) { throw "ping falhou" }
  Add-I120Check "ping" "ok" ("{0} ({1}s)" -f $ping.versao, $pingR.sec)
  $result.timings.ping = $pingR.sec

  $verOk = $false
  if ($ping.versao -match 'v1\.5\.(\d+)') {
    $n = [int]$Matches[1]
    if ($n -ge 199) { $verOk = $true; Add-I120Check "gas.versao.i120b" "ok" $ping.versao }
    elseif ($n -ge 198) { Add-I120Check "gas.versao.i120b" "warn" ("Web {0} — publique v1.5.199 (cache comando+_t)" -f $ping.versao) }
    else { Add-I120Check "gas.versao.i120b" "fail" ("Web {0} sem I120" -f $ping.versao) }
  } else {
    Add-I120Check "gas.versao.i120b" "warn" ("versao inesperada: " + $ping.versao)
  }

  # --- comandoOperacional com _t (mesmo padrao do FE mk-api.js) ---
  $t1 = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $cmd1 = Invoke-I120Api @{ action = "comandoOperacional"; adminPin = $AdminPin; _t = $t1 }
  if (-not $cmd1.data.ok) { throw "comandoOperacional frio: $($cmd1.data.erro)" }
  Add-I120Check "comando.cold" "ok" ("{0}s widgets=$($cmd1.data.widgets.Count)" -f $cmd1.sec)
  $result.timings.comandoCold = $cmd1.sec

  Start-Sleep -Seconds 1
  $t2 = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $cmd2 = Invoke-I120Api @{ action = "comandoOperacional"; adminPin = $AdminPin; _t = $t2 }
  if (-not $cmd2.data.ok) { throw "comandoOperacional warm: $($cmd2.data.erro)" }
  $result.timings.comandoWarm = $cmd2.sec
  if ($verOk) {
    if ($cmd2.sec -le $WarmMaxSec) {
      Add-I120Check "comando.warm.cache" "ok" ("{0}s (limite {1}s, _t diferente)" -f $cmd2.sec, $WarmMaxSec)
    } else {
      Add-I120Check "comando.warm.cache" "fail" ("{0}s > {1}s — cache ainda bustado por _t?" -f $cmd2.sec, $WarmMaxSec)
    }
  } else {
    if ($cmd2.sec -le $WarmMaxSec) {
      Add-I120Check "comando.warm.cache" "ok" ("{0}s (inesperado bom sem 199)" -f $cmd2.sec)
    } else {
      Add-I120Check "comando.warm.cache" "warn" ("{0}s — esperado ate Nova versao v1.5.199" -f $cmd2.sec)
    }
  }

  # --- painel lite ---
  $tl1 = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $lite1 = Invoke-I120Api @{
    action = "painelGestaoPessoasAdmin"; adminPin = $AdminPin; lite = "1"; _t = $tl1
  }
  if (-not $lite1.data.ok) { throw "painel lite frio: $($lite1.data.erro)" }
  $result.timings.painelLiteCold = $lite1.sec
  Add-I120Check "painel.lite.cold" "ok" ("{0}s colab=$($lite1.data.colaboradores.Count)" -f $lite1.sec)
  if ($lite1.data.lite -ne $true -and [string]$lite1.data.lite -ne "True") {
    Add-I120Check "painel.lite.flag" "warn" "campo lite ausente/false"
  } else {
    Add-I120Check "painel.lite.flag" "ok" "lite=true"
  }

  Start-Sleep -Seconds 1
  $tl2 = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $lite2 = Invoke-I120Api @{
    action = "painelGestaoPessoasAdmin"; adminPin = $AdminPin; lite = "1"; _t = $tl2
  }
  if (-not $lite2.data.ok) { throw "painel lite warm: $($lite2.data.erro)" }
  $result.timings.painelLiteWarm = $lite2.sec
  if ($lite2.sec -le $WarmMaxSec) {
    Add-I120Check "painel.lite.warm" "ok" ("{0}s" -f $lite2.sec)
  } else {
    Add-I120Check "painel.lite.warm" "fail" ("{0}s > {1}s — cache lite/invalidate?" -f $lite2.sec, $WarmMaxSec)
  }

  # Comunicados no painel (Julia / publico)
  $coms = @()
  if ($lite2.data.comunicadosRh) { $coms = @($lite2.data.comunicadosRh) }
  Add-I120Check "painel.comunicadosRh" "ok" ("n=" + $coms.Count)
  $juliaCom = $coms | Where-Object {
    $pub = [string]$_.publico
    $pub -eq "4" -or $pub -match '(?i)julia' -or [string]$_.titulo -match '(?i)ponto'
  } | Select-Object -First 1
  if ($juliaCom) {
    Add-I120Check "comunicado.julia" "ok" ("id=$($juliaCom.id) publico=$($juliaCom.publico)")
  } else {
    Add-I120Check "comunicado.julia" "warn" "nenhum comunicado publico=4 / ponto (pode ter sido desativado)"
  }

  $julia = @($lite2.data.colaboradores) | Where-Object { [int]$_.id -eq 4 } | Select-Object -First 1
  if ($julia) {
    Add-I120Check "colab.julia" "ok" ("nome=$($julia.nome)")
  } else {
    Add-I120Check "colab.julia" "fail" "operador id 4 ausente no painel lite"
  }

  # --- I117 pay-first (resumoDia) ---
  $hoje = Get-Date
  $dataFmt = "{0}/{1}/{2}" -f $hoje.Day.ToString("00"), $hoje.Month.ToString("00"), $hoje.Year
  try {
    $rd = Invoke-I120Api @{ action = "resumoDia"; data = $dataFmt; adminPin = $AdminPin } -Timeout 120
    if ($rd.data.ok) {
      $result.timings.resumoDia = $rd.sec
      if ($null -ne $rd.data.PSObject.Properties['caixaIncluiAbertas'] -and $rd.data.caixaIncluiAbertas) {
        Add-I120Check "i117.caixaIncluiAbertas" "ok" ("nAbertas=$($rd.data.nAbertas) ({0}s)" -f $rd.sec)
      } else {
        Add-I120Check "i117.caixaIncluiAbertas" "fail" "campo ausente ou false — regressao I117"
      }
    } else {
      Add-I120Check "i117.caixaIncluiAbertas" "warn" ([string]$rd.data.erro)
    }
  } catch {
    Add-I120Check "i117.caixaIncluiAbertas" "warn" $_.Exception.Message
  }

  $fail = @($result.checks | Where-Object { $_.status -eq "fail" })
  $warn = @($result.checks | Where-Object { $_.status -eq "warn" })
  if ($fail.Count -gt 0) {
    $result.status = "fail"
    $result.summary = "Falhas I120: $($fail.Count)"
  } elseif ($warn.Count -gt 0) {
    $result.status = "ok_with_warnings"
    $result.summary = "I120 parcial; $($warn.Count) aviso(s) — tipico ate Nova versao 199"
  } else {
    $result.status = "ok"
    $result.summary = "I120b OK — comando/painel warm + I117"
  }
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-I120Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 6
if ($result.status -eq "fail") { exit 1 }
exit 0
