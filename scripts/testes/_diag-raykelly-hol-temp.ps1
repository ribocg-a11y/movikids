$base = 'https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec'
$pin = '1421'
$t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$url = "$base" + '?action=painelGestaoPessoasAdmin&adminPin=' + $pin + '&competencia=06%2F2026&_t=' + $t
$r = Invoke-RestMethod -Uri $url -TimeoutSec 120
$ray = @($r.colaboradores) | Where-Object { $_.id -eq 3 } | Select-Object -First 1
$fol = @($r.folha) | Where-Object { $_.id -eq 3 } | Select-Object -First 1
Write-Output "admissao=$($ray.admissao) locMes=$($ray.metas.locMes) bonusDias=$($ray.metas.bonusDias) bonusTotal=$($ray.metas.bonusTotal)"
Write-Output "folha bonusDias=$($fol.bonusDias) bonus=$($fol.bonus) base=$($fol.base) liquido=$($fol.total)"
Write-Output "hol diasTrab=$($fol.holerite.diasTrabalhados) diasMes=$($fol.holerite.diasMes) salProp=$($fol.holerite.salarioProporcional) faltas=$($fol.holerite.faltas)"
if ($ray.jornada -and $ray.jornada.dias) {
  $bonusOk = @($ray.jornada.dias | Where-Object { $_.bonusOk -eq $true })
  Write-Output "jornada dias total=$($ray.jornada.dias.Count) bonusOk=$($bonusOk.Count)"
  $bonusOk | ForEach-Object { Write-Output "  bonus dia $($_.data) loc=$($_.loc)" }
}
