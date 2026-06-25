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
  return Invoke-RestMethod -Uri "$BaseUrl`?$query" -Method Get -TimeoutSec 120
}

Write-Host "Restaurando ponto Raykelly (id 3) jun/2026..."
$r = Invoke-MkApi @{ action = "restaurarPontoRaykellyJun2026Admin"; adminPin = $AdminPin }
$r | ConvertTo-Json -Depth 6

Write-Host "`nConferindo FOLHA_PONTO..."
$d = Invoke-MkApi @{ action = "diagnosticoPlanilhaCompletoAdmin"; adminPin = $AdminPin }
$d.folhaPonto | Where-Object { $_.operadorId -eq 3 } | Format-Table

Write-Host "`nConferindo holerite faltas..."
$prev = Invoke-MkApi @{ action = "buscarPainelColaboradorPreview"; operadorId = 3; adminPin = $AdminPin }
Write-Host ("faltas=" + $prev.pagamento.holerite.faltas + " vaTotal=" + $prev.pagamento.holerite.vaTotal)
