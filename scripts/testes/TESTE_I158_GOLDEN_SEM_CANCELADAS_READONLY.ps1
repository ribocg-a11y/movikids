# I158 — relatório Golden FE via kpiMes (sem Cancelada); não usa gerarRelatorio GAS
param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Stop"
$result = [ordered]@{
  suite = "TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY"
  startedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  checks = @()
}
function Add-I158([string]$Name, [string]$Status, [string]$Detail = "") {
  $script:result.checks += [ordered]@{ name = $Name; status = $Status; detail = $Detail }
}

try {
  $admin = Get-Content -Raw -Path (Join-Path $Root "mk-admin.js") -Encoding UTF8
  if ($admin -notmatch 'function mkHtmlRelatorioGoldenFromKpi_') { throw "mkHtmlRelatorioGoldenFromKpi_ ausente" }
  Add-I158 "fe.htmlBuilder" "ok" "presente"
  if ($admin -notmatch 'carregarPreviewRelatorio[\s\S]{0,1500}mkHtmlRelatorioGoldenFromKpi_') {
    throw "preview nao usa builder FE"
  }
  Add-I158 "fe.preview" "ok" "kpiMes → HTML FE"
  if ($admin -match 'async function enviarRelatorioEmail[\s\S]{0,900}action:\s*[''\"]gerarRelatorio[''\"]') {
    throw "enviarRelatorioEmail ainda chama gerarRelatorio GAS"
  }
  Add-I158 "fe.email" "ok" "sem gerarRelatorio GAS"
  if ($admin -match 'async function salvarRelatorioDrive[\s\S]{0,900}action:\s*[''\"]salvarRelatorioDrive[''\"]') {
    throw "salvarRelatorioDrive ainda chama GAS Drive (HTML com Cancelada)"
  }
  Add-I158 "fe.pdf" "ok" "download/print local"
  $result.status = "ok"
  $result.summary = "I158 FE: Golden via kpiMes sem Cancelada"
}
catch {
  $result.status = "fail"
  $result.error = $_.Exception.Message
  Add-I158 "exception" "fail" $_.Exception.Message
}
$result.finishedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$result | ConvertTo-Json -Depth 4
if ($result.status -eq "fail") { exit 1 }
