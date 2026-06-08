# Executa TESTE_TABLET_F5_F7_F10_F11_BROWSER.js via CDP (Chrome remote debugging).
# Requer aba logada em movikids ?force=1.7.87 ou usa resultado via Invoke-WebRequest ao MCP nao disponivel.
# Uso interno agente: le o .js e imprime para colar no Runtime.evaluate.

$jsPath = Join-Path $PSScriptRoot 'TESTE_TABLET_F5_F7_F10_F11_BROWSER.js'
$js = Get-Content -Path $jsPath -Raw -Encoding UTF8
$escaped = $js -replace '\\', '\\\\' -replace '"', '\"' -replace "`r?`n", ' '
@{ expression = $escaped; awaitPromise = $true; returnByValue = $true } | ConvertTo-Json -Compress | Set-Content (Join-Path $PSScriptRoot '.tablet-cdp-payload.json') -Encoding UTF8
Write-Host "Payload CDP gerado: .tablet-cdp-payload.json ($($escaped.Length) chars)"
