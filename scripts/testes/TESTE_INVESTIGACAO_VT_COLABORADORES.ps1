param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421"
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params, [int]$TimeoutSec = 120)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec $TimeoutSec
}

$result = [ordered]@{
  suite = "TESTE_INVESTIGACAO_VT_COLABORADORES"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  colaboradores = @()
  folhaPlanejamento = $null
  painelMs = $null
  checks = @()
}

function Add-Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  Add-Check "ping" "ok" $ping.versao

  $kpi = Invoke-MkApi @{ action = "kpiMes"; adminPin = $AdminPin; lite = "1" } 90
  $fp = $null
  if ($kpi.ok -and $kpi.folhaPlanejamento) {
    $fp = $kpi.folhaPlanejamento
    $result.folhaPlanejamento = $fp
    $diasVt = if ($null -ne $fp.diasVt) { [double]$fp.diasVt } else { [double]$fp.diasVa }
    $vtCalc = [math]::Round($diasVt * [double]$fp.vtTarifa, 2)
    Add-Check "folha.vtTarifa" "ok" ("tarifaDia=" + $fp.vtTarifa)
    Add-Check "folha.diasVt" "ok" ("dias=" + $diasVt)
    Add-Check "folha.vtPassesMesCalc" "ok" ("diasVt*tarifaDia=" + $vtCalc)
    if ($fp.vtTarifa -lt 8.5 -or $fp.vtTarifa -gt 9.5) {
      Add-Check "folha.vtTarifaCanon" "warn" "esperado 8.80 (2x 4.40)"
    }
    if ([math]::Abs($vtCalc - 193.6) -lt 2) {
      Add-Check "folha.vtCanon" "ok" "perto de 193.60 (22x8.80)"
    }
  } else {
    Add-Check "kpiMes.folha" "warn" "sem folhaPlanejamento"
  }

  $sw = [System.Diagnostics.Stopwatch]::StartNew()
  $painel = Invoke-MkApi @{
    action = "painelGestaoPessoasAdmin"
    adminPin = $AdminPin
    _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  } 120
  $sw.Stop()
  $result.painelMs = $sw.ElapsedMilliseconds
  $tempoOk = if ($sw.ElapsedMilliseconds -lt 45000) { "ok" } else { "warn" }
  Add-Check "painelGestaoPessoasAdmin.tempo" $tempoOk ($sw.ElapsedMilliseconds.ToString() + "ms")

  if (-not $painel.ok) {
    Add-Check "painelGestaoPessoasAdmin" "fail" ([string]$painel.erro)
  } else {
    Add-Check "painelGestaoPessoasAdmin" "ok" ("colab=" + @($painel.colaboradores).Count)
    foreach ($id in @(2, 3)) {
      $c = @($painel.colaboradores | Where-Object { [int]$_.id -eq $id })[0]
      $f = @($painel.folha | Where-Object { [int]$_.id -eq $id })[0]
      $hol = $null
      if ($f) { $hol = $f.holerite }
      $entry = [ordered]@{
        operadorId = $id
        nome = if ($c) { $c.nome } else { "?" }
        cadastroPct = if ($c) { $c.cadastroPct } else { $null }
        cadastroOk = if ($c) { $c.cadastroOk } else { $null }
        salarioBase = if ($c) { $c.salarioBase } else { $null }
        vaDiario = if ($c) { $c.vaDiario } else { $null }
        admissao = if ($c) { $c.admissao } else { $null }
        holerite = $hol
      }
      if ($hol) {
        $detail = "vtPasses=" + $hol.vtPasses + " vtDesc=" + $hol.vt + " vaTotal=" + $hol.vaTotal
        Add-Check ("hol." + $id) "ok" $detail
        if ([double]$hol.vtPasses -ge 400) {
          Add-Check ("hol." + $id + ".vtAlto") "warn" ("vtPasses alto (bug I67?)=" + $hol.vtPasses)
        }
      }
      $result.colaboradores += $entry
    }
  }

  foreach ($id in @(2, 3)) {
    try {
      $prev = Invoke-MkApi @{
        action = "buscarPainelColaboradorPreview"
        operadorId = $id
        adminPin = $AdminPin
      } 90
      if ($prev.ok -and $prev.pagamento -and $prev.pagamento.holerite) {
        $h = $prev.pagamento.holerite
        Add-Check ("preview." + $id) "ok" ("vtPasses=" + $h.vtPasses + " vaTotal=" + $h.vaTotal)
      } else {
        Add-Check ("preview." + $id) "warn" ([string]$prev.erro)
      }
    } catch {
      Add-Check ("preview." + $id) "warn" $_.Exception.Message
    }
  }

  $result.status = "ok"
  $result.summary = "Investigacao VT concluida"
} catch {
  $result.status = "fail"
  $result.summary = $_.Exception.Message
  Add-Check "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 8
