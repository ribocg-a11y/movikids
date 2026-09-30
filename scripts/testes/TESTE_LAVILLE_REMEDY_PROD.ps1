# Remediacao pos-suite40: cenarios que falharam por I153/frota/quota
param(
  [string]$BaseUrl = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec",
  [string]$Operador = "TESTE_LAVILLE",
  [string]$AdminPin = "1421"
)
$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_TestCleanup.ps1"
$op = Get-MoviOperadorParams -Operador $Operador
$adm = Get-MoviAdminSupervisorParams -AdminPin $AdminPin
$uid = @{ unidadeId = "laville" }
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$pass = 0; $fail = 0; $checks = @()

function Api([hashtable]$P, [int]$R = 4) {
  $q = ($P.GetEnumerator() | ForEach-Object { "{0}={1}" -f [uri]::EscapeDataString([string]$_.Key), [uri]::EscapeDataString([string]$_.Value) }) -join "&"
  for ($i = 1; $i -le $R; $i++) {
    $url = "$BaseUrl`?$q&_t=$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
    $raw = & curl.exe -L -s --max-time 120 $url
    if ($raw -and $raw -notmatch '^\s*<') {
      try { return $raw | ConvertFrom-Json } catch {}
    }
    Start-Sleep -Seconds (4 * $i)
  }
  throw "API falhou apos retries: $($P.action)"
}
function Ok($r, $n, $d = "") {
  if ($r.ok) { $script:pass++; Write-Host "[OK] $n - $d"; $script:checks += @{ n = $n; s = "ok"; d = $d } }
  else { $script:fail++; Write-Host "[FAIL] $n - $($r.erro)"; $script:checks += @{ n = $n; s = "fail"; d = [string]$r.erro } }
}

try {
  Start-Sleep -Seconds 20
  $ping = Api @{ action = "ping" }
  Ok $ping "ping" $ping.versao

  # limpa orfaos TESTE
  $at = Api @{ action = "listarAtivas" }
  foreach ($a in @($at.locacoes)) {
    if ([string]$a.crianca -like "TESTE_*" -or [string]$a.observacao -match '\[TESTE\]') {
      Api (@{ action = "cancelarLocacao"; rowIndex = $a.rowIndex; motivo = "remedy cleanup" } + $op) | Out-Null
    }
  }
  Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet | Out-Null
  Start-Sleep -Seconds 3

  # A) somentePlano + confirmarCurto
  $s = Api (@{
    action = "salvarLocacao"; tipo = "Dino"; plano = "20min"; veiculo = "LV Dino 01"
    pagamento = "PIX"; responsavel = "TESTE LA VILLE"; crianca = "TESTE_LV_R_$stamp"
    telefone = "98991$([int](Get-Random -Min 1000 -Max 9999))"; observacao = "[TESTE] remedy somentePlano"
  } + $op + $uid)
  Ok $s "A.salvar.dino" ("row=$($s.rowIndex) valor=$($s.valorPlano)")
  $row = [int]$s.rowIndex
  $i = Api (@{ action = "iniciarTimer"; rowIndex = $row; timestamp = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) } + $op)
  Ok $i "A.iniciar" "ok"
  $e = Api (@{ action = "encerrarLocacao"; rowIndex = $row; minUsados = 45; somentePlano = "true"; confirmarCurto = "1" } + $op)
  Ok $e "A.somentePlano" ("status=$($e.status)")
  Start-Sleep -Seconds 2

  # B) cancelarExtras + confirmarCurto
  $s2 = Api (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "LV Carro 01"
    pagamento = "PIX"; responsavel = "TESTE LA VILLE"; crianca = "TESTE_LV_R2_$stamp"
    telefone = "98992$([int](Get-Random -Min 1000 -Max 9999))"; observacao = "[TESTE] remedy cancelExtras"
  } + $op + $uid)
  Ok $s2 "B.salvar" ("row=$($s2.rowIndex)")
  $r2 = [int]$s2.rowIndex
  Api (@{ action = "iniciarTimer"; rowIndex = $r2; timestamp = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) } + $op) | Out-Null
  $e2 = Api (@{
    action = "encerrarLocacao"; rowIndex = $r2; minUsados = 10; cancelarExtras = "true"
    justificativaExtras = "Remedy cancelar extras La Ville"; minExtraCancelados = 12; confirmarCurto = "1"
  } + $op)
  Ok $e2 "B.cancelarExtras" ("status=$($e2.status)")
  Start-Sleep -Seconds 2

  # C) multi 2 veiculos
  $itens = (@(
    @{ tipo = "Pelúcia"; plano = "10min"; veiculo = "LV Pelúcia 01" },
    @{ tipo = "Triciclo"; plano = "10min"; veiculo = "LV Triciclo 01" }
  ) | ConvertTo-Json -Compress)
  $m = Api (@{
    action = "salvarLocacoesMulti"; itens = $itens
    responsavel = "TESTE MULTI"; crianca = "TESTE_LV_RM_$stamp"
    telefone = "98993$([int](Get-Random -Min 1000 -Max 9999))"
    pagamento = "Debito"; observacao = "[TESTE] remedy multi"
  } + $op + $uid)
  Ok $m "C.multi" ("n=$($m.n)")
  $cids = @($m.locacoes | ForEach-Object { $_.contaId }) | Select-Object -Unique
  if ($cids.Count -eq 1) { $pass++; Write-Host "[OK] C.mesmaConta - $($cids[0])" } else { $fail++; Write-Host "[FAIL] C.mesmaConta" }
  foreach ($L in @($m.locacoes)) {
    Api (@{ action = "cancelarLocacao"; rowIndex = $L.rowIndex; motivo = "remedy multi" } + $op) | Out-Null
  }
  Start-Sleep -Seconds 2

  # D) avulso + Drift preco
  $av = Api (@{
    action = "salvarLancamentoAvulso"; tipo = "Drift"; plano = "40min"; veiculo = "LV Drift 01"
    pagamento = "Dinheiro"; responsavel = "TESTE"; crianca = "TESTE_LV_RA_$stamp"
    telefone = "98994$([int](Get-Random -Min 1000 -Max 9999))"
    motivo = "Remedy avulso Drift La Ville"; observacao = "[TESTE] remedy avulso"
  } + $op + $uid)
  Ok $av "D.avulso.drift" ("valor=$($av.valorPlano)")
  if ([int]$av.valorPlano -eq 45) { $pass++; Write-Host "[OK] D.preco45" } else { $fail++; Write-Host "[FAIL] D.preco45 $($av.valorPlano)" }
  Api (@{ action = "cancelarLocacao"; rowIndex = $av.rowIndex; motivo = "remedy avulso" } + $op) | Out-Null
  Start-Sleep -Seconds 2

  # E) caixa dual
  $hoje = Get-Date -Format "dd/MM/yyyy"
  $rd = Api (@{ action = "resumoDia"; data = $hoje } + $adm + $uid)
  Ok $rd "E.resumoDia.laville" (($rd | ConvertTo-Json -Compress).Substring(0, [Math]::Min(180, (($rd | ConvertTo-Json -Compress).Length))))
  $rdg = Api (@{ action = "resumoDia"; data = $hoje; unidadeId = "golden" } + $adm)
  Ok $rdg "E.resumoDia.golden" "ok"

  # F) cronometro + extraPago
  $s3 = Api (@{
    action = "salvarLocacao"; tipo = "Carro"; plano = "10min"; veiculo = "LV Carro 02"
    pagamento = "PIX"; responsavel = "TESTE"; crianca = "TESTE_LV_RF_$stamp"
    telefone = "98995$([int](Get-Random -Min 1000 -Max 9999))"; observacao = "[TESTE] remedy extra"
  } + $op + $uid)
  Ok $s3 "F.salvar" ("row=$($s3.rowIndex)")
  $r3 = [int]$s3.rowIndex
  Api (@{ action = "iniciarTimer"; rowIndex = $r3; timestamp = ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) } + $op) | Out-Null
  $ex = Api (@{ action = "estenderLocacao"; rowIndex = $r3; extMins = 10; extValor = 15; extPlano = "10min" } + $op)
  Ok $ex "F.estender" ("mins=$($ex.totalMins)")
  $en = Api (@{ action = "encerrarLocacao"; rowIndex = $r3; minUsados = 25; extraPagamento = "Credito"; confirmarCurto = "1" } + $op)
  Ok $en "F.encerrar.extraPago" ("status=$($en.status) total=$($en.valorTotal)")

} catch {
  $fail++; Write-Host "[FAIL] exception - $($_.Exception.Message)"
} finally {
  Write-Host "=== LIMPEZA ==="
  try {
    $at2 = Api @{ action = "listarAtivas" }
    foreach ($a in @($at2.locacoes)) {
      if ([string]$a.crianca -like "TESTE_*") {
        Api (@{ action = "cancelarLocacao"; rowIndex = $a.rowIndex; motivo = "remedy finally" } + $op) | Out-Null
      }
    }
  } catch {}
  $cu = Invoke-MoviTestCleanup -BaseUrl $BaseUrl -AdminPin $AdminPin -SoHoje -Quiet
  Write-Host "limpeza: $($cu.detail)"
  try {
    $fin = Api @{ action = "listarAtivas" }
    Write-Host ("abertas finais: {0}" -f @($fin.locacoes).Count)
  } catch { Write-Host "listarAtivas final falhou (quota)" }
  Write-Host ("RESULT pass={0} fail={1}" -f $pass, $fail)
  if ($fail -gt 0) { exit 1 }
}
