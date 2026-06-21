param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416"
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
  suite = "TESTE_COMUNICADOS_RH_READONLY"
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
  if ($ping.versao -match 'v1\.5\.12[0-9]') {
    Add-GpCheck "gas.versao" "ok" $ping.versao
  } elseif ($ping.versao -match 'v1\.5\.(10[89]|11[0-9])') {
    Add-GpCheck "gas.versao" "warn" ("repo v1.5.124 - publicar Nova versao Web para comunicados: " + $ping.versao)
  } else {
    Add-GpCheck "gas.versao" "warn" ("versao inesperada: " + $ping.versao)
  }

  $st = Invoke-GpApi @{ action = "gestaoPessoasStatus" }
  if (-not $st.ok) { throw "gestaoPessoasStatus: $($st.erro)" }
  $abaCom = @($st.abas | Where-Object { $_.nome -eq 'COMUNICADOS_RH' } | Select-Object -First 1)
  if ($abaCom -and $abaCom.existe -eq $true) {
    Add-GpCheck "aba.COMUNICADOS_RH" "ok" "presente"
  } else {
    Add-GpCheck "aba.COMUNICADOS_RH" "warn" "ausente - instalar abas Gestao Pessoas (Operadores)"
  }

  try {
    $list = Invoke-GpApi @{ action = "listarComunicadosRhAdmin"; adminPin = $AdminPin }
    if ($list.ok) {
      $n = 0
      if ($list.comunicados) { $n = @($list.comunicados).Count }
      Add-GpCheck "listarComunicadosRhAdmin" "ok" ("n=" + $n)
    } else {
      $msg = [string]$list.erro
      if ($msg -match 'desconhecida|listarComunicados') {
        Add-GpCheck "listarComunicadosRhAdmin" "warn" "action ausente no GAS publicado"
      } else {
        Add-GpCheck "listarComunicadosRhAdmin" "fail" $msg
      }
    }
  } catch {
    Add-GpCheck "listarComunicadosRhAdmin" "warn" $_.Exception.Message
  }

  try {
    $painel = Invoke-GpApi @{ action = "painelGestaoPessoasAdmin"; adminPin = $AdminPin; _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
    if ($painel.ok) {
      $hasField = $null -ne $painel.PSObject.Properties['comunicadosRh']
      if ($hasField) {
        $nc = 0
        if ($painel.comunicadosRh) { $nc = @($painel.comunicadosRh).Count }
        Add-GpCheck "painel.comunicadosRh" "ok" ("n=" + $nc)
      } else {
        Add-GpCheck "painel.comunicadosRh" "warn" "campo ausente - GAS antigo"
      }
    } else {
      Add-GpCheck "painelGestaoPessoasAdmin" "warn" ([string]$painel.erro)
    }
  } catch {
    Add-GpCheck "painelGestaoPessoasAdmin" "warn" $_.Exception.Message
  }

  $fail = @($result.checks | Where-Object { $_.status -eq "fail" })
  $warn = @($result.checks | Where-Object { $_.status -eq "warn" })
  if ($fail.Count -gt 0) {
    $result.status = "fail"
    $result.summary = "Falhas: $($fail.Count)"
  } elseif ($warn.Count -gt 0) {
    $result.status = "ok_with_warnings"
    $result.summary = "Comunicados RH readonly OK; $($warn.Count) aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "Comunicados RH readonly OK"
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
