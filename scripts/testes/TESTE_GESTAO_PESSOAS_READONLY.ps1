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
  suite = "TESTE_GESTAO_PESSOAS_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-GpCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

$expectedAbas = @(
  'COLABORADORES_RH', 'FOLHA_PONTO', 'ESCALA_COLABORADORES',
  'FALTAS_AUSENCIAS', 'HOLERITES', 'METAS_COLABORADORES', 'BANCO_HORAS', 'COMUNICADOS_RH', 'AVALIACOES_RH'
)

try {
  $ping = Invoke-GpApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-GpCheck "ping" "ok" $ping.versao
  if ($ping.versao -match 'v1\.5\.(10[0-6]|107)') {
    Add-GpCheck "gas.versao" "warn" "repo v1.5.134 - publicar Nova versao Web"
  } elseif ($ping.versao -match 'v1\.5\.(10[89]|11[0-4]|13[0-4])') {
    Add-GpCheck "gas.versao" "ok" $ping.versao
  } else {
    Add-GpCheck "gas.versao" "warn" ("versao inesperada: " + $ping.versao)
  }

  $st = Invoke-GpApi @{ action = "gestaoPessoasStatus" }
  if ($null -eq $st.ok) { throw "gestaoPessoasStatus: resposta invalida" }
  $abaNames = @()
  if ($st.abas) {
    foreach ($a in @($st.abas)) {
      if ($a -is [string]) { $abaNames += $a }
      elseif ($a.nome) { $abaNames += [string]$a.nome }
    }
  }
  if ($st.ok) {
    Add-GpCheck "gestaoPessoasStatus" "ok" ("n=" + $abaNames.Count)
  } else {
    $faltam = @($st.abas | Where-Object { $_.existe -eq $false } | ForEach-Object { $_.nome })
    Add-GpCheck "gestaoPessoasStatus" "warn" ("abas faltando: " + ($faltam -join ", "))
  }
  foreach ($aba in $expectedAbas) {
    $row = @($st.abas | Where-Object { ($_.nome -eq $aba) -or ($_ -eq $aba) } | Select-Object -First 1)
    $existe = ($row -and $row[0].existe -eq $true)
    if ($existe) {
      Add-GpCheck ("aba." + $aba) "ok" "presente"
    } else {
      Add-GpCheck ("aba." + $aba) "warn" "ausente - rodar instalar-abas-gestao-pessoas-gas.ps1"
    }
  }

  $cols = Invoke-GpApi @{ action = "listarColaboradoresGestao" }
  if (-not $cols.ok) { throw "listarColaboradoresGestao: $($cols.erro)" }
  $n = 0
  if ($cols.colaboradores) { $n = @($cols.colaboradores).Count }
  Add-GpCheck "listarColaboradoresGestao" "ok" ("n=" + $n)

  $alertas = Invoke-GpApi @{ action = "alertasPontoGestaoAdmin"; adminPin = $AdminPin }
  if (-not $alertas.ok) { throw "alertasPontoGestaoAdmin: $($alertas.erro)" }
  $na = 0
  if ($alertas.alertas) { $na = @($alertas.alertas).Count }
  Add-GpCheck "alertasPontoGestaoAdmin" "ok" ("alertas=" + $na)

  try {
    $painel = Invoke-GpApi @{ action = "painelGestaoPessoasAdmin"; adminPin = $AdminPin; _t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() }
    if ($painel.ok) {
      $comJornada = 0
      $comBanco = 0
      if ($painel.colaboradores) {
        foreach ($c in @($painel.colaboradores)) {
          if ($c.jornada) {
            $comJornada++
            if ($c.jornada.bancoProjetado) { $comBanco++ }
          }
        }
      }
      Add-GpCheck "painelGestaoPessoasAdmin" "ok" ("colab=" + @($painel.colaboradores).Count + " jornada=" + $comJornada + " banco=" + $comBanco)
      if ($comJornada -gt 0 -and $comBanco -eq 0) {
        Add-GpCheck "painel.bancoProjetado" "warn" "jornada sem bancoProjetado"
      } else {
        Add-GpCheck "painel.bancoProjetado" "ok" ("n=" + $comBanco)
      }
      if ($painel.versao -and $painel.versao -match 'v1\.5\.13[0-4]') {
        Add-GpCheck "painel.versao" "ok" $painel.versao
      } elseif ($painel.versao) {
        Add-GpCheck "painel.versao" "warn" ("Web antiga: " + $painel.versao + " - esperado v1.5.134 para 15b.7")
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
    $result.summary = "APIs RH OK; $($warn.Count) aviso(s)"
  } else {
    $result.status = "ok"
    $result.summary = "Gestao Pessoas readonly OK"
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
