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
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 90
}

$result = [ordered]@{
  suite = "TESTE_AUDITORIA_PLANILHA_COMPLETA_READONLY"
  startedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  checks = @()
}

function Add-Check([string]$Name, [string]$Status, [string]$Detail = '') {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MkApi @{ action = 'ping' }
  Add-Check 'ping' 'ok' $ping.versao

  $schema = Invoke-MkApi @{ action = 'validarSchema' }
  if ($schema.schemaOk) { Add-Check 'validarSchema' 'ok' 'LOC/CUS/REL ok' }
  else { Add-Check 'validarSchema' 'warn' 'schema incompleto' }

  $gp = Invoke-MkApi @{ action = 'gestaoPessoasStatus' }
  $gpOk = @($gp.abas | Where-Object { $_.existe -eq $true }).Count
  Add-Check 'gestaoPessoasStatus' $(if ($gpOk -ge 9) { 'ok' } else { 'warn' }) ('abasRh=' + $gpOk)

  try {
    $diag = Invoke-MkApi @{
      action = 'diagnosticoPlanilhaCompletoAdmin'
      adminPin = $AdminPin
      _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    }
    if ($diag.ok -eq $false) { throw $diag.erro }
    Add-Check 'diagnosticoPlanilhaCompletoAdmin' 'ok' ('totalAbas=' + $diag.totalAbas + ' versao=' + $diag.versao)

    $locAba = @($diag.abas | Where-Object { $_.nome -eq 'LOCACOES' })[0]
    if ($locAba) {
      Add-Check 'locacoes.dataRows' 'ok' ('n=' + $locAba.dataRows + ' cols=' + $locAba.lastCol)
    }
    if ($diag.locacoesAudit) {
      $nProb = @($diag.locacoesAudit.problemas).Count
      $stLoc = if ($nProb -eq 0) { 'ok' } else { 'warn' }
      Add-Check 'locacoes.audit' $stLoc ('problemas=' + $nProb + ' amostra=' + $diag.locacoesAudit.amostra)
    }

    foreach ($c in @($diag.colaboradoresRh)) {
      $st = if ($c.cadastroOk) { 'ok' } else { 'warn' }
      Add-Check ('rh.id' + $c.operadorId + '.cadastro') $st ($c.nome + ' pct=' + $c.cadastroPctCalculado + ' ok=' + $c.cadastroOk)
    }

    $nPonto = @($diag.folhaPonto).Count
    Add-Check 'folhaPonto.linhas' 'ok' ('n=' + $nPonto)

    foreach ($b in @($diag.bancoHoras)) {
      $saldo = [string]$b.saldo
      if ($saldo -match '^-\d+h') { Add-Check ('banco.id' + $b.operadorId) 'warn' $saldo }
      else { Add-Check ('banco.id' + $b.operadorId) 'ok' $saldo }
    }

    $naoMap = @($diag.abas | Where-Object { $_.mapeadaGAS -eq $false })
    if ($naoMap.Count -gt 0) {
      Add-Check 'abas.naoMapeadas' 'warn' ($naoMap.nome -join ', ')
    } else {
      Add-Check 'abas.naoMapeadas' 'ok' '0'
    }
  } catch {
    if ($_.Exception.Message -match 'desconhecida|unknown') {
      Add-Check 'diagnosticoPlanilhaCompletoAdmin' 'warn' 'API ausente em prod - publicar GAS v1.5.138+'
    } else {
      Add-Check 'diagnosticoPlanilhaCompletoAdmin' 'warn' $_.Exception.Message
    }
    $painel = Invoke-MkApi @{ action = 'painelGestaoPessoasAdmin'; adminPin = $AdminPin }
    foreach ($c in @($painel.colaboradores)) {
      $st = if ($c.cadastroOk) { 'ok' } else { 'warn' }
      Add-Check ('rh.fallback.id' + $c.id) $st ($c.nome + ' pct=' + $c.cadastroPct)
    }
  }

  $fail = @($result.checks | Where-Object { $_.status -eq 'fail' })
  $warn = @($result.checks | Where-Object { $_.status -eq 'warn' })
  if ($fail.Count -gt 0) {
    $result.status = 'fail'
    $result.summary = 'Falhas: ' + $fail.Count
  } elseif ($warn.Count -gt 0) {
    $result.status = 'ok_with_warnings'
    $result.summary = 'Auditoria OK com ' + $warn.Count + ' avisos'
  } else {
    $result.status = 'ok'
    $result.summary = 'Planilha auditada OK'
  }
} catch {
  $result.status = 'fail'
  $result.summary = $_.Exception.Message
  Add-Check 'exception' 'fail' $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
$result | ConvertTo-Json -Depth 8
