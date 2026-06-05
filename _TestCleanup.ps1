# Limpeza pos-teste: remove locacoes de teste do caixa (Encerrada -> Cancelada + valores zerados).
# Tenta GAS limparLocacoesTesteAdmin (v1.5.45+); senao usa script Node na planilha.

function Get-MoviOperadorParams {
  param([string]$Operador = "TESTE_CODEX")
  return @{ operador = $Operador }
}

# Fase 9 em pausa: editar/cancelar aceitam operador logado (authRole admin so em testes legados).
function Get-MoviAdminSupervisorParams {
  param(
    [string]$AdminPin = "1416",
    [string]$Operador = "Administrador"
  )
  return @{
    operador = $Operador
    authRole = "admin"
    adminPin = $AdminPin
  }
}

function Invoke-MoviTestCleanup {
  param(
    [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
    [string]$AdminPin = "1416",
    [switch]$SoHoje,
    [switch]$Quiet
  )

  $motivo = "Limpeza automatica apos script de teste Codex"
  $detail = ""

  try {
    $q = @{
      action = "limparLocacoesTesteAdmin"
      adminPin = $AdminPin
      motivo = $motivo
    }
    if ($SoHoje) { $q.soHoje = "1" }
    $query = ($q.GetEnumerator() | ForEach-Object {
      "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
    }) -join "&"
    $url = "$BaseUrl`?$query"
    $api = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 30
    if ($api.ok) {
      $detail = "GAS: $($api.total) anulada(s)"
      if (-not $Quiet) { Write-Host "Limpeza testes: $detail" }
      return [ordered]@{ ok = $true; via = "gas"; total = $api.total; detail = $detail }
    }
    $detail = if ($api.erro) { $api.erro } else { "resposta GAS sem ok" }
  } catch {
    $detail = $_.Exception.Message
  }

  $nodeScript = "C:\Users\riboc\Projects\google-drive-sheets-auth\scripts\limpar-testes-movikids.js"
  if (-not (Test-Path $nodeScript)) {
    if (-not $Quiet) { Write-Warning "Limpeza testes falhou (GAS: $detail; Node ausente)" }
    return [ordered]@{ ok = $false; via = "none"; detail = $detail }
  }

  try {
    $out = & node $nodeScript 2>&1 | Out-String
    if (-not $Quiet) { Write-Host $out.TrimEnd() }
    if ($out -match "Alteracoes aplicadas:\s*(\d+)") {
      return [ordered]@{ ok = $true; via = "sheet"; total = [int]$Matches[1]; detail = "Planilha: $($Matches[1]) anulada(s)" }
    }
    if ($out -match "Nada a alterar") {
      return [ordered]@{ ok = $true; via = "sheet"; total = 0; detail = "Nenhum teste pendente" }
    }
    return [ordered]@{ ok = $true; via = "sheet"; total = -1; detail = "Planilha: executado" }
  } catch {
    if (-not $Quiet) { Write-Warning "Limpeza testes falhou: $($_.Exception.Message)" }
    return [ordered]@{ ok = $false; via = "sheet"; detail = $_.Exception.Message }
  }
}
