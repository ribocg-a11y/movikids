param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$Busca = ""
)

$ErrorActionPreference = "Stop"

function Invoke-MoviApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 25
  } catch {
    $raw = & curl.exe -L -s $url
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    try { return $raw | ConvertFrom-Json } catch { throw "JSON invalido em $($Params.action): $raw" }
  }
}

function Assert-Ok {
  param($Response, [string]$Step)
  if (-not $Response.ok) {
    $msg = if ($Response.erro) { $Response.erro } else { $Response | ConvertTo-Json -Compress }
    throw "Falhou: $Step - $msg"
  }
}

function Assert-Field {
  param($Obj, [string]$Field, [string]$Context)
  if (-not ($Obj.PSObject.Properties.Name -contains $Field)) {
    throw "Campo ausente em ${Context}: $Field"
  }
}

$result = [ordered]@{
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  baseUrl = $BaseUrl
  busca = $Busca
  mode = "readonly"
  checks = @()
}

function Add-Check {
  param([string]$Name, [string]$Status, [string]$Detail = "")
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $ping = Invoke-MoviApi @{ action = "ping" }
  Assert-Ok $ping "ping"
  Add-Check "ping" "ok" $ping.versao

  $params = @{ action = "listarResponsaveis"; limite = "20" }
  if ($Busca.Trim()) { $params.q = $Busca.Trim() }
  $resp = Invoke-MoviApi $params
  Assert-Ok $resp "listarResponsaveis"
  Add-Check "listarResponsaveis" "ok" ("total={0}; retornados={1}" -f $resp.total, $resp.responsaveis.Count)

  if ($resp.responsaveis.Count -gt 0) {
    $r = $resp.responsaveis | Select-Object -First 1
    foreach ($field in @("telefone","responsavel","criancas","totalLocacoes","faturamento")) {
      Assert-Field $r $field "responsavel"
    }
    if (-not [string]::IsNullOrWhiteSpace([string]$r.telefone)) {
      $tel = ([string]$r.telefone) -replace "\D", ""
      if ($tel.Length -lt 10) { throw "Telefone normalizado curto demais: $($r.telefone)" }
    }
    Add-Check "schema responsavel" "ok" ("responsavel={0}; telefone={1}" -f $r.responsavel, $r.telefone)
  } else {
    Add-Check "schema responsavel" "skipped" "Nenhum responsavel retornado para validar campos"
  }

  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "ok"
  $result | ConvertTo-Json -Depth 6
  exit 0
} catch {
  $result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $result.status = "failed"
  $result.error = $_.Exception.Message
  $result | ConvertTo-Json -Depth 6
  exit 1
}
