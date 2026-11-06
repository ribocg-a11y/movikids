# I203/I203b — Golden preços/tempos = La Ville; frota Golden própria (4 pelúcias + 2 dinos)
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
)

$ErrorActionPreference = "Stop"

function Invoke-MkApi {
  param([hashtable]$Params)
  $query = ($Params.GetEnumerator() | ForEach-Object {
    "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value)
  }) -join "&"
  $url = "$BaseUrl`?$query&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  return Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 120
}

function Count-Tipo([string[]]$veics, [string]$needle) {
  return @($veics | Where-Object { $_ -like "*$needle*" }).Count
}

$ping = Invoke-MkApi @{ action = "ping" }
if (-not $ping.ok) { throw "ping falhou" }
Write-Host "GAS ping: $($ping.versao)" -ForegroundColor Cyan

$g = (Invoke-MkApi @{ action = "carregarInicio"; unidadeId = "golden" }).operacaoConfig
$l = (Invoke-MkApi @{ action = "carregarInicio"; unidadeId = "laville" }).operacaoConfig
if (-not $g -or -not $l) { throw "operacaoConfig ausente" }

$checks = @()
function Add-I203([string]$name, [bool]$ok, [string]$detail) {
  $script:checks += [pscustomobject]@{ name = $name; ok = $ok; detail = $detail }
  $color = if ($ok) { "Green" } else { "Red" }
  Write-Host ("[{0}] {1}: {2}" -f ($(if ($ok) { "OK" } else { "FAIL" }), $name, $detail)) -ForegroundColor $color
}

$gVeic = @($g.veiculos_validos)
$lVeic = @($l.veiculos_validos)
Add-I203 "golden.pelucias.4" ((Count-Tipo $gVeic "Pel") -eq 4) ("nPel=" + (Count-Tipo $gVeic "Pel"))
Add-I203 "golden.dinos.2" ((Count-Tipo $gVeic "Dino") -eq 2) ("nDino=" + (Count-Tipo $gVeic "Dino"))
Add-I203 "golden.dinos.clean" (($gVeic -contains "Dino 01") -and ($gVeic -contains "Dino 02")) ("veics=" + ($gVeic -join ","))
Add-I203 "laville.pelucias.3" ((Count-Tipo $lVeic "Pel") -eq 3) ("nPelLV=" + (Count-Tipo $lVeic "Pel"))

$gc = $g.precosFe.Carro."10min"
$lc = $l.precosFe.Carro."10min"
Add-I203 "precos.brinquedos.paridade" (($gc.v -eq $lc.v) -and ($gc.a -eq $lc.a) -and ($gc.v -eq 15)) ("G=$($gc.v)/$($gc.a) L=$($lc.v)/$($lc.a)")
$gd = $g.precosFe.Dino."60min"
$ld = $l.precosFe.Dino."60min"
Add-I203 "precos.dino.paridade" (($gd.v -eq $ld.v) -and ($gd.v -eq 90)) ("G60=$($gd.v) L60=$($ld.v)")
Add-I203 "precos.sem.3h" (-not $g.precosFe.Carro.PSObject.Properties["3h"]) "Golden sem plano 3h"

$schema = Invoke-MkApi @{ action = "validarSchema" }
$cusOk = $schema.resultado.CUSTOS.ok
Add-I203 "planilha.custos.unidade_id" ([bool]$cusOk) ("schemaOk=$($schema.schemaOk) CUSTOS.ok=$cusOk")

$fail = @($checks | Where-Object { -not $_.ok })
if ($fail.Count -gt 0) {
  throw ("I203 FAIL: " + (($fail | ForEach-Object { $_.name }) -join ", "))
}
Write-Host "TESTE_I203 OK — Golden preços=LV · 4 pelúcias · 2 dinos · CUSTOS ok" -ForegroundColor Green
