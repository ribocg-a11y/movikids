$base = 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec'
$t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$url = "$base" + '?action=metaOperadorTurno&operadorId=3&_t=' + $t
try {
  $meta = Invoke-RestMethod -Uri $url -TimeoutSec 60
  $meta | ConvertTo-Json -Depth 5 -Compress
} catch { Write-Output $_.Exception.Message }

$url2 = "$base" + '?action=buscarPainelColaboradorPreview&operadorId=3&adminPin=1421&competencia=06%2F2026&_t=' + $t
$r = Invoke-RestMethod -Uri $url2 -TimeoutSec 120
Write-Output "--- preview metas ---"
Write-Output "locMes=$($r.metas.atual) bonusDias sheet count=$($r.metas.diasMes | Where-Object { $_.bonusOk } | Measure-Object | Select-Object -ExpandProperty Count)"
Write-Output "diasMes metas rows=$($r.metas.diasMes.Count)"
$r.metas.diasMes | Where-Object { $_.bonusOk } | ForEach-Object { Write-Output "  bonus $($_.data) loc=$($_.loc)" }
