param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
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
  suite = "TESTE_AVALIACOES_RH_READONLY"
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

  $st = Invoke-GpApi @{ action = "gestaoPessoasStatus" }
  if (-not $st.ok) { throw "gestaoPessoasStatus: $($st.erro)" }
  $abaAv = @($st.abas | Where-Object { $_.nome -eq 'AVALIACOES_RH' } | Select-Object -First 1)
  if ($abaAv -and $abaAv.existe -eq $true) {
    Add-GpCheck "aba.AVALIACOES_RH" "ok" "presente"
  } else {
    Add-GpCheck "aba.AVALIACOES_RH" "warn" "ausente - instalar abas Gestao Pessoas (Operadores)"
  }

  try {
    $list = Invoke-GpApi @{ action = "listarAvaliacoesRhAdmin"; adminPin = $AdminPin }
    if ($list.ok) {
      $n = 0
      if ($list.avaliacoes) { $n = @($list.avaliacoes).Count }
      $nc = 0
      if ($list.competencias) { $nc = @($list.competencias).Count }
      Add-GpCheck "listarAvaliacoesRhAdmin" "ok" ("avaliacoes=" + $n + " competencias=" + $nc)
    } else {
      $msg = [string]$list.erro
      if ($msg -match 'desconhecida|listarAvaliacoes') {
        Add-GpCheck "listarAvaliacoesRhAdmin" "warn" "action ausente no GAS publicado (v1.5.128+)"
      } else {
        Add-GpCheck "listarAvaliacoesRhAdmin" "fail" $msg
      }
    }
  } catch {
    Add-GpCheck "listarAvaliacoesRhAdmin" "warn" $_.Exception.Message
  }

  try {
    $painel = Invoke-GpApi @{ action = "painelGestaoPessoasAdmin"; adminPin = $AdminPin; _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
    if ($painel.ok) {
      $hasField = $null -ne $painel.PSObject.Properties['avaliacoesRh']
      if ($hasField) {
        $na = 0
        if ($painel.avaliacoesRh) { $na = @($painel.avaliacoesRh).Count }
        Add-GpCheck "painel.avaliacoesRh" "ok" ("n=" + $na)
      } else {
        Add-GpCheck "painel.avaliacoesRh" "warn" "campo ausente - GAS antigo"
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
    $result.summary = "Avaliacoes RH readonly OK; $($warn.Count) aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "Avaliacoes RH readonly OK"
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
