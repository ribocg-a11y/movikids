#!/usr/bin/env bash
# MOVI KIDS — 10 testes de validação completa (Linux/bash + curl)
# Uso: bash scripts/testes/TESTE_VALIDACAO_COMPLETA_10.sh
# Opcional: ANULAR_ROWS="1272,1273" bash ... (requer GAS v1.5.184+ em produção)

set -euo pipefail

BASE_URL="${BASE_URL:-https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec}"
ADMIN_PIN="${ADMIN_PIN:-1421}"
OPERADOR="${OPERADOR:-TESTE_CODEX}"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAMP="$(date +%Y%m%d_%H%M%S)"
TEL="989$(shuf -i 10000000-99999999 -n 1)"

PASS=0
FAIL=0
WARN=0
RESULTS=()

log() { echo "[$(date +%H:%M:%S)] $*"; }
add_result() {
  local name="$1" status="$2" detail="$3"
  RESULTS+=("$status|$name|$detail")
  case "$status" in
    ok) PASS=$((PASS + 1)); log "✅ $name — $detail" ;;
    warn) WARN=$((WARN + 1)); log "⚠️  $name — $detail" ;;
    *) FAIL=$((FAIL + 1)); log "❌ $name — $detail" ;;
  esac
}

api_get() {
  local qs="$1"
  curl -sL --max-time 45 "${BASE_URL}?${qs}&_t=$(date +%s%3N)" 2>/dev/null
}

api_json() {
  python3 -c "import json,sys; print(json.dumps(json.load(sys.stdin)))" 2>/dev/null || cat
}

check_ok() {
  python3 - "$1" "$2" <<'PY'
import json, sys
step, raw = sys.argv[1], sys.argv[2]
try:
  d = json.loads(raw)
except Exception as e:
  print(f"fail|{step}|JSON invalido: {e}")
  sys.exit(0)
if d.get("ok"):
  print(f"ok|{step}|ok")
else:
  print(f"fail|{step}|{d.get('erro', d)}")
PY
}

# --- T1: Ping GAS ---
log "=== T1 ping GAS ==="
RAW="$(api_get "action=ping")"
VER="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('versao','?'))" 2>/dev/null || echo "?")"
if echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('ok') else 1)" 2>/dev/null; then
  add_result "T1.ping" "ok" "GAS $VER online"
else
  add_result "T1.ping" "fail" "$RAW"
fi

# --- T2: FE Pages vs repo ---
log "=== T2 FE Pages vs repo ==="
REPO_VER="$(grep -oP "MK_VERSION\s*=\s*'\K[\d.]+" "$REPO_ROOT/mk-version.js" 2>/dev/null || echo "?")"
PAGES_VER="$(curl -sL --max-time 20 "https://ribocg-a11y.github.io/movikids/mk-version.js" | grep -oP "MK_VERSION\s*=\s*'\K[\d.]+" || echo "?")"
if [[ "$REPO_VER" == "$PAGES_VER" && "$REPO_VER" != "?" ]]; then
  add_result "T2.fe.pages" "ok" "v$REPO_VER alinhado"
else
  add_result "T2.fe.pages" "warn" "pages=v$PAGES_VER repo=v$REPO_VER"
fi

# --- T3: carregarInicio admin ---
log "=== T3 carregarInicio admin ==="
RAW="$(api_get "action=carregarInicio&authRole=admin&adminPin=${ADMIN_PIN}")"
if echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('ok') else 1)" 2>/dev/null; then
  STATS="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); s=d.get('statsHoje',{}); print(f\"fat={s.get('fat',0)} n={s.get('n',0)} enc={len(d.get('encHoje',[]))} ativos={len(d.get('ativos',[]))}\")")"
  add_result "T3.carregarInicio" "ok" "$STATS"
else
  add_result "T3.carregarInicio" "fail" "$(echo "$RAW" | head -c 200)"
fi

# --- T4: listarHistorico hoje ---
log "=== T4 listarHistorico admin ==="
HOJE="$(date +%d/%m/%Y)"
RAW="$(api_get "action=listarHistorico&authRole=admin&adminPin=${ADMIN_PIN}&data=${HOJE//\//%2F}&bustCache=1")"
if echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('ok') is not False else 1)" 2>/dev/null; then
  N="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('total', len(d.get('locacoes',[]))))")"
  add_result "T4.listarHistorico" "ok" "total=$N data=$HOJE"
else
  add_result "T4.listarHistorico" "fail" "$(echo "$RAW" | head -c 200)"
fi

# --- T5: validarSchema ---
log "=== T5 validarSchema ==="
RAW="$(api_get "action=validarSchema&authRole=admin&adminPin=${ADMIN_PIN}")"
SCHEMA_OK="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); print('1' if d.get('schemaOk') or d.get('ok') else '0')" 2>/dev/null || echo 0)"
if [[ "$SCHEMA_OK" == "1" ]]; then
  add_result "T5.validarSchema" "ok" "schemaOk"
else
  add_result "T5.validarSchema" "warn" "$(echo "$RAW" | head -c 150)"
fi

# --- T6: salvar Pendente ---
log "=== T6 salvarLocacao Pendente ==="
NOME="TESTE_VAL10_${STAMP}"
RAW="$(api_get "action=salvarLocacao&operador=${OPERADOR}&tipo=Carro&plano=10min&veiculo=Carro%2001&pagamento=PIX&responsavel=TESTE%20VAL10&crianca=${NOME}&telefone=${TEL}&observacao=%5BTESTE%5D%20validacao%2010")"
ROW="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('rowIndex',''))" 2>/dev/null || echo "")"
if echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('ok') and d.get('status')=='Pendente' else 1)" 2>/dev/null; then
  add_result "T6.salvar" "ok" "Pendente row=$ROW"
else
  add_result "T6.salvar" "fail" "$(echo "$RAW" | head -c 200)"
  ROW=""
fi

# --- T7: carregarInicio Pendente não auto-inicia ---
if [[ -n "$ROW" ]]; then
  log "=== T7 Pendente sem auto-start (3s) ==="
  sleep 3
  RAW="$(api_get "action=carregarInicio&_t=$(date +%s%3N)")"
  CHECK="$(echo "$RAW" | python3 -c "
import json,sys
d=json.load(sys.stdin)
row=int('$ROW')
for a in d.get('ativos',[]):
  if int(a.get('rowIndex',0))==row:
    ok = a.get('status')=='Pendente' and not a.get('started')
    print('ok' if ok else f\"fail status={a.get('status')} started={a.get('started')}\")
    sys.exit(0)
print('fail nao encontrada')
" 2>/dev/null || echo "fail parse")"
  if [[ "$CHECK" == "ok" ]]; then
    add_result "T7.pendente.3s" "ok" "row=$ROW Pendente"
  else
    add_result "T7.pendente.3s" "fail" "$CHECK"
  fi
fi

# --- T8: iniciarTimer ---
TS="$(python3 -c "import time; print(int(time.time()*1000))")"
if [[ -n "$ROW" ]]; then
  log "=== T8 iniciarTimer ==="
  RAW="$(api_get "action=iniciarTimer&operador=${OPERADOR}&rowIndex=${ROW}&timestamp=${TS}")"
  TS_BACK="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('startTimestamp',0))" 2>/dev/null || echo 0)"
  if echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('ok') and int(d.get('startTimestamp',0))>1e12 else 1)" 2>/dev/null; then
    add_result "T8.iniciarTimer" "ok" "ts=$TS_BACK row=$ROW"
  else
    add_result "T8.iniciarTimer" "fail" "$(echo "$RAW" | head -c 200)"
  fi
fi

# --- T9: carregarInicio Ativa started ---
if [[ -n "$ROW" && "$TS_BACK" != "0" ]]; then
  log "=== T9 carregarInicio pos-iniciar ==="
  RAW="$(api_get "action=carregarInicio&_t=$(date +%s%3N)")"
  CHECK="$(echo "$RAW" | python3 -c "
import json,sys
d=json.load(sys.stdin)
row=int('$ROW')
ts=int('$TS_BACK')
for a in d.get('ativos',[]):
  if int(a.get('rowIndex',0))==row:
    ok = a.get('status')=='Ativa' and a.get('started') and int(a.get('startTimestamp',0))==ts
    print('ok' if ok else f\"fail status={a.get('status')} ts={a.get('startTimestamp')}\")
    sys.exit(0)
print('fail nao encontrada')
" 2>/dev/null || echo "fail")"
  if [[ "$CHECK" == "ok" ]]; then
    add_result "T9.carregarInicio.ativa" "ok" "started ts=$TS_BACK"
  else
    add_result "T9.carregarInicio.ativa" "fail" "$CHECK"
  fi
fi

# --- T10: encerrar + limpar testes ---
log "=== T10 cleanup testes ==="
if [[ -n "$ROW" ]]; then
  api_get "action=encerrarLocacao&operador=${OPERADOR}&rowIndex=${ROW}&minUsados=0" >/dev/null || true
fi
MOTIVO="Limpeza%20automatica%20validacao%2010%20testes%20${STAMP}"
RAW="$(api_get "action=limparLocacoesTesteAdmin&adminPin=${ADMIN_PIN}&soHoje=1&motivo=${MOTIVO}")"
TOTAL="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('total',0))" 2>/dev/null || echo 0)"
if echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('ok') else 1)" 2>/dev/null; then
  add_result "T10.limparTestes" "ok" "anuladas=$TOTAL soHoje"
else
  add_result "T10.limparTestes" "warn" "$(echo "$RAW" | head -c 150)"
fi

# --- Opcional: anular rows específicas (4 locações usuário) ---
if [[ -n "${ANULAR_ROWS:-}" ]]; then
  log "=== Anular rows: $ANULAR_ROWS ==="
  MOTIVO2="Limpeza%20locacoes%20teste%20usuario%20${STAMP}"
  RAW="$(api_get "action=anularLocacoesRowAdmin&adminPin=${ADMIN_PIN}&rowIndexes=${ANULAR_ROWS}&motivo=${MOTIVO2}")"
  if echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('ok') else 1)" 2>/dev/null; then
    N="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('total',0))")"
    add_result "anular.rows" "ok" "anuladas=$N rows=$ANULAR_ROWS"
  else
    ERR="$(echo "$RAW" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('erro','?'))" 2>/dev/null || echo "$RAW")"
    add_result "anular.rows" "warn" "$ERR (requer GAS v1.5.184+ Nova versão Web)"
  fi
fi

echo ""
echo "========== RESUMO =========="
echo "PASS=$PASS WARN=$WARN FAIL=$FAIL"
for r in "${RESULTS[@]}"; do
  IFS='|' read -r st name det <<< "$r"
  printf "  [%s] %s — %s\n" "$st" "$name" "$det"
done

if [[ "$FAIL" -gt 0 ]]; then exit 1; fi
exit 0
