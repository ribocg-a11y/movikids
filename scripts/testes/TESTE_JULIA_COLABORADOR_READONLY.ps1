param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1421",
  [int]$OperadorId = 4
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
  suite = "TESTE_JULIA_COLABORADOR_READONLY"
  operadorId = $OperadorId
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-Check([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

$juliaEscala = @('OFF', '14–22', 'OFF', '14–22', '14–22', '12–22', '13–21')

try {
  $ping = Invoke-MkApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-Check "ping" "ok" $ping.versao
  if ($ping.versao -notmatch 'v1\.5\.17[6-9]|v1\.5\.18') {
    Add-Check "gas.versao.julia" "warn" ("esperado v1.5.176+ — atual " + $ping.versao)
  }

  $cols = Invoke-MkApi @{ action = "listarColaboradoresGestao" }
  if (-not $cols.ok) { throw "listarColaboradoresGestao: $($cols.erro)" }
  $julia = @($cols.colaboradores | Where-Object { [int]$_.id -eq $OperadorId } | Select-Object -First 1)
  if ($julia) {
    Add-Check "lista.colaboradores" "ok" ("nome=" + $julia.nome + " funcao=" + $julia.funcao + " cadastro=" + $julia.cadastroPct + "%")
    if ($julia.funcao -ne 'Atendente 2') { Add-Check "julia.funcao" "fail" $julia.funcao }
    if ([int]$julia.cadastroPct -lt 100) { Add-Check "julia.cadastro" "warn" ("cadastroPct=" + $julia.cadastroPct) }
    else { Add-Check "julia.cadastro" "ok" "100%" }
  } else {
    Add-Check "lista.colaboradores" "fail" "Julia id $OperadorId ausente"
  }

  $exp = Invoke-MkApi @{ action = "exportarCadastroRhAdmin"; adminPin = $AdminPin; operadorId = $OperadorId }
  if (-not $exp.ok) { throw "exportarCadastroRhAdmin: $($exp.erro)" }
  $rh = @($exp.colaboradores | Select-Object -First 1)
  if ($rh.cadastro.admissao -eq '01/07/2026') { Add-Check "rh.admissao" "ok" "01/07/2026" }
  else { Add-Check "rh.admissao" "fail" $rh.cadastro.admissao }
  if ($rh.cadastroOk) { Add-Check "rh.cadastroOk" "ok" "8/8 campos" }
  else { Add-Check "rh.cadastroOk" "warn" ("pct=" + $rh.cadastroPct) }
  if ($rh.turno -match '14') { Add-Check "rh.turno" "ok" $rh.turno }
  else { Add-Check "rh.turno" "warn" $rh.turno }

  $prev = Invoke-MkApi @{ action = "buscarPainelColaboradorPreview"; adminPin = $AdminPin; operadorId = $OperadorId; competencia = "07/2026" }
  if (-not $prev.ok) { throw "buscarPainelColaboradorPreview: $($prev.erro)" }
  $esc = @($prev.escala)
  if ($esc.Count -eq 7) {
    $escOk = $true
    for ($i = 0; $i -lt 7; $i++) {
      if ([string]$esc[$i] -ne [string]$juliaEscala[$i]) { $escOk = $false; break }
    }
    if ($escOk) { Add-Check "escala.07_2026" "ok" ($esc -join ' · ') }
    else { Add-Check "escala.07_2026" "fail" ($esc -join ' · ') }
  } else {
    Add-Check "escala.07_2026" "fail" ("cols=" + $esc.Count)
  }

  $pag = $prev.pagamento
  if ($pag) {
    if ([int]$pag.diasTrabalhados -eq 31 -and [int]$pag.diasMes -eq 31) {
      Add-Check "holerite.diasJul" "ok" "31/31 (adm 01/07)"
    } else {
      Add-Check "holerite.diasJul" "warn" ("diasTrab=" + $pag.diasTrabalhados + " diasMes=" + $pag.diasMes)
    }
    Add-Check "holerite.quinzena" "ok" ($pag.quinzenaLabel + " liq=" + $pag.holerite.liquido)
  }

  $meta = Invoke-MkApi @{ action = "metaOperadorTurno"; operadorId = $OperadorId }
  if ($meta.ok -and $meta.configurado) {
    Add-Check "meta.turno" "ok" ("hoje n=" + $meta.hoje.n + " folga=" + $meta.hoje.folga)
  } else {
    Add-Check "meta.turno" "fail" "nao configurado"
  }

  $painel = Invoke-MkApi @{ action = "painelGestaoPessoasAdmin"; adminPin = $AdminPin; competencia = "07/2026" }
  if ($painel.ok) {
    Add-Check "painel.admin" "ok" ("colaboradores=" + @($painel.colaboradores).Count)
    $jAdmin = @($painel.colaboradores | Where-Object { [int]$_.id -eq $OperadorId } | Select-Object -First 1)
    if ($jAdmin) { Add-Check "painel.julia" "ok" ("escalaHoje=" + $jAdmin.escalaHoje) }
    else { Add-Check "painel.julia" "warn" "nao listada" }
  } else {
    Add-Check "painel.admin" "fail" $painel.erro
  }

  $fails = @($result.checks | Where-Object { $_.status -eq 'fail' })
  $result.ok = ($fails.Count -eq 0)
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result | ConvertTo-Json -Depth 6
  if (-not $result.ok) { exit 1 }
} catch {
  Add-Check "exception" "fail" $_.Exception.Message
  $result.ok = $false
  $result | ConvertTo-Json -Depth 6
  exit 1
}
