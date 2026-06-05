param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$AdminPin = "1416",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"

function Test-LocacaoTeste {
  param($Loc)
  $t = [string]($Loc.telefone -replace '\D', '')
  $r = [string]$Loc.responsavel
  $c = [string]$Loc.crianca
  if ($t -match '^9899999') { return $true }
  if ($r -match '^Teste') { return $true }
  if ($r -in @('BT', 'P', 'X', 'BrowserTest', 'DebugTest', 'ParityTest', 'OperadorTeste', 'TestOp')) { return $true }
  if ($c -match '^TESTE_|^DRAWER_E_') { return $true }
  if ($r -in @('TESTE', 'TESTE_EDIT')) { return $true }
  if ($r -eq 'X' -and $c -eq 'Y') { return $true }
  return $false
}

function Invoke-GasGet {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 30
}

$motivo = "Limpeza manual sessoes teste Codex 05-06-2026"
$result = [ordered]@{ gasAnuladas = 0; canceladas = 0; erros = @() }

# 1) GAS limparLocacoesTesteAdmin (hoje)
$limpar = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet
$result.gasAnuladas = [int]($limpar.total)
if (-not $limpar.ok) { $result.erros += "limparLocacoesTesteAdmin: $($limpar.detail)" }

# 2) Cancelar pendentes/ativas de teste ainda visiveis
$ativas = Invoke-GasGet @{ action = "listarAtivas" }
if (-not $ativas.ok) { throw "listarAtivas falhou: $($ativas.erro)" }

$testes = @($ativas.locacoes | Where-Object { Test-LocacaoTeste $_ })
foreach ($loc in $testes) {
  $label = "id=$($loc.id) $($loc.responsavel)/$($loc.crianca)"
  if ($DryRun) {
    Write-Host "[dry-run] cancelaria $label row=$($loc.rowIndex)"
    continue
  }
  try {
    $c = Invoke-GasGet @{
      action = "cancelarLocacao"
      rowIndex = $loc.rowIndex
      motivo = $motivo
      operador = "Administrador"
      authRole = "admin"
      adminPin = $AdminPin
    }
    if ($c.ok) {
      $result.canceladas++
      Write-Host "Cancelada: $label"
    } else {
      $result.erros += "$label : $($c.erro)"
    }
  } catch {
    $result.erros += "$label : $($_.Exception.Message)"
  }
}

$result | ConvertTo-Json -Depth 4
if ($result.erros.Count -gt 0) { exit 1 }
exit 0
