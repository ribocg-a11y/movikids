# Repara aba FOLHA via Sheets API USER_ENTERED (como digitar na planilha pt_BR).
# Uso: .\scripts\planilha\repairFolhaSheetsApi.ps1
$ErrorActionPreference = 'Stop'
$ssId = '1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618'
$prefix = "'FOLHA'!"

$clasprc = Join-Path $env:USERPROFILE '.clasprc.json'
if (-not (Test-Path $clasprc)) { throw 'clasprc.json nao encontrado — rode clasp login' }
$tok = (Get-Content $clasprc -Raw | ConvertFrom-Json).tokens.default
$access = $tok.access_token
if ([int64]$tok.expiry_date -lt [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) {
  $body = @{
    client_id     = $tok.client_id
    client_secret = $tok.client_secret
    refresh_token = $tok.refresh_token
    grant_type    = 'refresh_token'
  }
  $ref = Invoke-RestMethod -Method Post -Uri 'https://oauth2.googleapis.com/token' -Body $body
  $access = $ref.access_token
}

$headers = @{ Authorization = "Bearer $access" }

function Add-Fx([System.Collections.Generic.List[object]]$list, [string]$a1, [string]$fx) {
  $list.Add(@{ range = $prefix + $a1; values = @(@($fx)) })
}

$R_N = 5; $R_SAL = 7; $R_SIMPLES = 8; $R_TVT = 9; $R_DVT = 10
$R_VAD = 11; $R_DVA = 12; $R_INSS = 13; $R_PISO = 14
$firstEmp = 35; $firstMem = 49; $S = ';'
$data = [System.Collections.Generic.List[object]]::new()

Add-Fx $data 'B21' "=SE(B$R_PISO>0${S}B$R_PISO${S}B$R_SAL)"
Add-Fx $data 'B22' '=B21/220'
Add-Fx $data 'B23' '=B21*0,06'
Add-Fx $data 'B24' "=MÁXIMO(0${S}B$R_TVT*B$R_DVT-B23)"
Add-Fx $data 'B25' "=SE(B$R_DVA>0${S}ARRED(B$R_VAD/B$R_DVA${S}2)${S}0)"
Add-Fx $data 'B26' "=B$R_VAD"
Add-Fx $data 'B31' '=B27+B28+B29+B30'

for ($r = $firstEmp; $r -le 44; $r++) {
  $idx = $r - $firstEmp + 1
  Add-Fx $data "A$r" "=SE($idx<=`$B`$$R_N${S}`"SIM`"${S}`"-`")"
  Add-Fx $data "C$r" "=SE(A$r=`"SIM`"${S}B`$21${S}`"`"`")"
  Add-Fx $data "D$r" "=SE(A$r=`"SIM`"${S}B`$$R_DVT${S}`"`"`")"
  Add-Fx $data "E$r" "=SE(A$r=`"SIM`"${S}B`$$R_TVT${S}`"`"`")"
  Add-Fx $data "F$r" "=SE(A$r=`"SIM`"${S}B`$25${S}`"`"`")"
}

for ($mr = $firstMem; $mr -lt ($firstMem + 10); $mr++) {
  $er = $firstEmp + ($mr - $firstMem)
  Add-Fx $data "A$mr" "=SE(A$er=`"SIM`"${S}B$er${S}`"`"`")"
  Add-Fx $data "B$mr" "=SE(A$er=`"SIM`"${S}C$er${S}`"`"`")"
  Add-Fx $data "C$mr" "=SE(A$er=`"SIM`"${S}-ARRED(C$er*B`$$R_INSS${S}2)${S}`"`"`")"
  Add-Fx $data "D$mr" "=SE(A$er=`"SIM`"${S}-MÍNIMO(B`$23${S}D$er*E$er)${S}`"`"`")"
  Add-Fx $data "E$mr" "=SE(A$er=`"SIM`"${S}B$mr+C$mr+D$mr${S}`" `")"
  Add-Fx $data "F$mr" "=SE(A$er=`"SIM`"${S}C$er*B`$27${S}`"`"`")"
  Add-Fx $data "G$mr" "=SE(A$er=`"SIM`"${S}C$er*(B`$28+B`$29+B`$30)${S}`"`"`")"
  Add-Fx $data "H$mr" "=SE(A$er=`"SIM`"${S}C$er+F$mr+G$mr+B`$$R_VAD+I$mr${S}`" `")"
  Add-Fx $data "I$mr" "=SE(A$er=`"SIM`"${S}MÁXIMO(0${S}D$er*E$er+D$mr)${S}`"`"`")"
}

Add-Fx $data 'B62' '=SOMA(B49:B58)'
Add-Fx $data 'B63' '=SOMA(F49:F58)'
Add-Fx $data 'B64' '=SOMA(G49:G58)'
Add-Fx $data 'B65' '=SOMA(I49:I58)'
Add-Fx $data 'B66' "=B`$$R_VAD*B`$$R_N"
Add-Fx $data 'B67' "=SE(B$R_SIMPLES=1${S}0${S}B62*0,2)"
Add-Fx $data 'B68' '=B62+B63+B64+B65+B66+B67'
Add-Fx $data 'B69' "=SE(B$R_N>0${S}B68/B$R_N${S}0)"
Add-Fx $data 'B73' '=B62*0,0833'
Add-Fx $data 'B74' '=B62*0,1111'
Add-Fx $data 'B75' '=B62*0,04'
Add-Fx $data 'B76' '=B63'
Add-Fx $data 'B77' '=B73+B74+B75+B76'

$payload = @{
  valueInputOption = 'USER_ENTERED'
  data             = $data
} | ConvertTo-Json -Depth 6

$uri = "https://sheets.googleapis.com/v4/spreadsheets/$ssId/values:batchUpdate"
$result = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($payload))

$check = Invoke-RestMethod -Uri "https://sheets.googleapis.com/v4/spreadsheets/$ssId/values/'FOLHA'!B25,'FOLHA'!B68,'FOLHA'!D36?valueRenderOption=FORMATTED_VALUE" -Headers $headers
Write-Host 'Repair OK — celulas atualizadas:' $result.totalUpdatedCells
Write-Host 'B25:' $check.valueRanges[0].values[0][0]
Write-Host 'B68:' $check.valueRanges[1].values[0][0]
Write-Host 'D36:' $check.valueRanges[2].values[0][0]
