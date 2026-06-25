param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$OperadorId = 3,
  [string]$OperadorPin = "1111"
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
  suite = "TESTE_CADASTRO_RH_READONLY"
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
  if ($ping.versao -match 'v1\.5\.12[6-9]|v1\.5\.13') {
    Add-GpCheck "gas.versao" "ok" $ping.versao
  } else {
    Add-GpCheck "gas.versao" "warn" ("repo v1.5.126 - publicar Nova versao Web: " + $ping.versao)
  }

  $adm = Invoke-GpApi @{
    action = "painelGestaoPessoasAdmin"
    adminPin = $AdminPin
    _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  if (-not $adm.ok) {
    Add-GpCheck "painelGestaoPessoasAdmin" "fail" ([string]$adm.erro)
  } else {
    $c = @($adm.colaboradores | Where-Object { [int]$_.id -eq $OperadorId })[0]
    if (-not $c) {
      Add-GpCheck "colaborador.admin" "fail" ("id " + $OperadorId + " ausente")
    } elseif ($null -eq $c.cadastro) {
      Add-GpCheck "colaborador.cadastro" "warn" "campo cadastro ausente - GAS antigo"
    } else {
      Add-GpCheck "colaborador.cadastro" "ok" ("pct=" + $c.cadastroPct + " ok=" + $c.cadastroOk)
    }
  }

  $painel = Invoke-GpApi @{
    action = "buscarPainelColaborador"
    operadorId = $OperadorId
    pin = $OperadorPin
    _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  if ($painel.ok) {
    $co = $painel.colaborador
    Add-GpCheck "painel.cadastroOk" "ok" ("cadastroOk=" + $co.cadastroOk + " pct=" + $co.cadastroPct)
  } else {
    Add-GpCheck "painel.colaborador" "ok" ([string]$painel.erro)
  }

  $login = Invoke-GpApi @{
    action = "loginOperador"
    operadorId = $OperadorId
    pin = $OperadorPin
    _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  }
  if ($login.ok) {
    Add-GpCheck "loginOperador.bloqueio" "warn" "login OK - cadastro ja completo ou GAS antigo sem gate"
  } elseif ($login.code -eq 428 -or $login.cadastroIncompleto) {
    Add-GpCheck "loginOperador.bloqueio" "ok" ("code=428 pct=" + $login.cadastroPct)
  } else {
    Add-GpCheck "loginOperador.bloqueio" "warn" ([string]$login.erro)
  }

  $fail = @($result.checks | Where-Object { $_.status -eq "fail" })
  $warn = @($result.checks | Where-Object { $_.status -eq "warn" })
  if ($fail.Count -gt 0) {
    $result.status = "fail"
    $result.summary = "Falhas: $($fail.Count)"
  } elseif ($warn.Count -gt 0) {
    $result.status = "ok_with_warnings"
    $result.summary = "Cadastro RH readonly OK; $($warn.Count) aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "Cadastro RH readonly OK"
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
