# I193 — trava parse JavaScript FE (node --check)
# Uso:
#   .\scripts\guard-js-syntax.ps1
#   .\scripts\guard-js-syntax.ps1 -Quiet
#
# Nunca publicar mk-*.js / sw.js com SyntaxError.
# Incidente: I191 comentário `_offline*/` dentro de /* */ quebrou sync em produção (04/11/2026).

param(
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
  Write-Error "node nao encontrado no PATH — I193 exige node --check"
  exit 1
}

$files = @()
$files += Get-ChildItem -Path $root -Filter "mk-*.js" -File | ForEach-Object { $_.FullName }
$sw = Join-Path $root "sw.js"
if (Test-Path $sw) { $files += $sw }
$ver = Join-Path $root "mk-version.js"
if ((Test-Path $ver) -and ($files -notcontains $ver)) { $files += $ver }

$failed = @()
foreach ($f in ($files | Select-Object -Unique)) {
  $name = Split-Path $f -Leaf
  $err = & node --check $f 2>&1
  if ($LASTEXITCODE -ne 0) {
    $failed += [ordered]@{ file = $name; detail = (($err | Out-String).Trim()) }
    if (-not $Quiet) {
      Write-Host "FAIL $name" -ForegroundColor Red
      Write-Host ($err | Out-String)
    }
  } elseif (-not $Quiet) {
    Write-Host "OK   $name" -ForegroundColor Green
  }
}

# Armadilha específica: `*/` no meio de comentário de bloco (fecha cedo → SyntaxError)
$trapHits = @()
foreach ($f in ($files | Select-Object -Unique)) {
  $raw = Get-Content -Path $f -Raw -Encoding UTF8
  if ($raw -match '(?s)/\*[^*]*\*/[A-Za-z0-9_]') {
    # heurística fraca; a trava real é node --check
  }
  if ($raw -match '_offline\*/' -or $raw -match 'flags _offline\*/') {
    $trapHits += (Split-Path $f -Leaf)
  }
}
if ($trapHits.Count -gt 0) {
  foreach ($t in $trapHits) {
    $failed += [ordered]@{ file = $t; detail = "comentario com _offline*/ dentro de bloco /* */ (I193)" }
  }
  if (-not $Quiet) {
    Write-Host "FAIL armadilha */ em comentario: $($trapHits -join ', ')" -ForegroundColor Red
  }
}

if ($failed.Count -gt 0) {
  if (-not $Quiet) {
    Write-Host "guard-js-syntax FALHOU ($($failed.Count) arquivo(s)) — NAO publicar FE" -ForegroundColor Red
  }
  exit 1
}

if (-not $Quiet) {
  Write-Host "guard-js-syntax OK ($($files.Count) arquivos)" -ForegroundColor Cyan
}
exit 0
