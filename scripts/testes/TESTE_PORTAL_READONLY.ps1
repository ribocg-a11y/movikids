param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path

function Invoke-PortalApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 30
}

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}

function Add-PCheck([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-PortalApi @{ action = "ping" }
  if (-not $ping.ok) { throw "ping falhou" }
  Add-PCheck "ping" "ok" $ping.versao

  $bad = Invoke-PortalApi @{ action = "buscarPortalResponsavel"; telefone = "12" }
  if ($bad.ok) { throw "telefone curto deveria falhar" }
  Add-PCheck "portal.telefone_curto" "ok" $bad.erro

  $ci = Invoke-PortalApi @{ action = "carregarInicio" }
  $tel = ""
  if ($ci.ativos -and $ci.ativos.Count -gt 0) {
    $tel = [string]$ci.ativos[0].telefone
  } else {
    $lr = Invoke-PortalApi @{ action = "listarResponsaveis"; limite = "3" }
    if ($lr.responsaveis -and $lr.responsaveis.Count -gt 0) {
      $tel = [string]$lr.responsaveis[0].telefone
    }
  }

  if (-not $tel) {
    Add-PCheck "portal.busca" "warn" "sem telefone de teste na planilha"
  } else {
    $digits = ($tel -replace '\D', '')
    $portal = Invoke-PortalApi @{ action = "buscarPortalResponsavel"; telefone = $digits }
    if (-not $portal.ok) { throw "buscarPortalResponsavel falhou: $($portal.erro)" }
    Add-PCheck "portal.busca" "ok" "total=$($portal.total)"
    if ($null -eq $portal.locacoes) { throw "campo locacoes ausente" }
    Add-PCheck "portal.locacoes_array" "ok" "presente"
  }

  $localHtml = Join-Path $RepoRoot "acompanhar.html"
  if (-not (Test-Path $localHtml)) { throw "acompanhar.html nao encontrado no repo" }
  $src = Get-Content -Path $localHtml -Raw -Encoding UTF8
  if ($src -notmatch 'mk-portal-page') { throw "acompanhar.html sem classe mk-portal-page" }
  if ($src -notmatch 'mk-design\.css') { throw "acompanhar.html sem mk-design.css" }
  Add-PCheck "fe.acompanhar.local" "ok" "mk-portal-page + mk-design.css"

  $result.status = "ok"
} catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-PCheck "exception" "fail" $_.Exception.Message
}

$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 5
if ($result.status -ne "ok") { exit 1 }
