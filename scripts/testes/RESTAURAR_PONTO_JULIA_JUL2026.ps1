# Admin — restaura FOLHA_PONTO Julia (id 4) jul/2026 · adm 01/07 · hoje +20min atraso
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
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  try {
    return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 120
  } catch {
    $raw = & curl.exe -L -s $url --max-time 120
    if (-not $raw) { throw "Resposta vazia: $($Params.action)" }
    return $raw | ConvertFrom-Json
  }
}

$ping = Invoke-MkApi @{ action = "ping" }
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan

# v1.5.178+ — endpoint batch; fallback dia a dia (salvarPontoRhAdmin)
$batidas = @(
  @{ data = "02/07/2026"; entrada = "14:02"; saida = "21:58"; situacao = "OK" },
  @{ data = "03/07/2026"; entrada = "13:58"; saida = "22:01"; situacao = "OK" },
  @{ data = "04/07/2026"; entrada = "12:05"; saida = "22:00"; situacao = "OK" },
  @{ data = "05/07/2026"; entrada = "13:00"; saida = "21:02"; situacao = "OK" },
  @{ data = "07/07/2026"; entrada = "14:00"; saida = "21:55"; situacao = "OK" },
  @{ data = "09/07/2026"; entrada = "14:20"; saida = "22:00"; situacao = "Atraso" }
)

$folgaErrada = @("01/07/2026", "06/07/2026")
foreach ($d in $folgaErrada) {
  try {
    $ex = Invoke-MkApi @{ action = "excluirPontoRhAdmin"; adminPin = $AdminPin; operadorId = 4; data = $d }
    if ($ex.ok -and $ex.removido) { Write-Host "Removido ponto folga $d" -ForegroundColor DarkYellow }
  } catch { /* endpoint v1.5.178+ */ }
}

try {
  $batch = Invoke-MkApi @{ action = "restaurarPontoJuliaJul2026Admin"; adminPin = $AdminPin }
  if ($batch.ok) {
    $batch | ConvertTo-Json -Depth 6
    exit 0
  }
} catch { Write-Host "Batch indisponivel — salvarPontoRhAdmin dia a dia" -ForegroundColor Yellow }

$log = @()
foreach ($b in $batidas) {
  $out = Invoke-MkApi @{
    action = "salvarPontoRhAdmin"
    adminPin = $AdminPin
    operadorId = 4
    data = $b.data
    entrada = $b.entrada
    saida = $b.saida
    situacao = $b.situacao
  }
  if (-not $out.ok) { throw $out.erro }
  $log += $out
  Write-Host ("OK " + $b.data + " " + $b.entrada + "-" + $b.saida) -ForegroundColor Green
}
@{ ok = $true; batidas = $log.Count; detalhe = $log } | ConvertTo-Json -Depth 6
