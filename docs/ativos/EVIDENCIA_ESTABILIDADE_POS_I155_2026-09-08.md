# Evidência — estabilidade pós-I155 (08/09/2026 ~19:15–19:25)

## Contexto

GAS live **v1.5.220** (lookback 600 + cache ativas 8s) · FE Pages **v1.9.114** (retry + fila 404 + timeout 45s).

Script: `scripts/testes/teste-estabilidade-pos-i155.cjs`  
JSON: `docs/ativos/EVIDENCIA_ESTABILIDADE_POS_I155_2026-09-08.json`

## Comparativo (antes I155 → agora)

| Métrica | Pré-I155 (I154 evidência) | Pós-I155 |
|---------|---------------------------|----------|
| Ping OK | 11/12 · 1× HTML 404 | **12/12 · 0 HTML 404** |
| `listarAtivas` OK | 5/8 (~37% HTML 404) | **10/10 · 0 HTML 404** |
| `listarAtivas` p50 | ~6–7s (quando OK) | **~1,6s** (warm) · frio ~12–15s |
| Cache ativas | — | frio 16s → **1,0s / 2,0s** |
| Concurrent 3 | — | **3/3 OK · 0 HTML 404** |
| Lookback | full sheet | **600** (ativas + início) |
| Paridade ativos | OK | **OK** (ids iguais) |
| I43 `startTimestamp` | — | **todas Ativas com ts** |

## Checks funcionais

| Ponto | Resultado |
|-------|-----------|
| Pages FE/SW | **1.9.114** |
| `validarSchema` | **schemaOk=true** (~30s frio) |
| `resumoDia` + adminPin | **OK** · n=29 contas · nSessoes=37 · fat=781 |
| `listarHistorico` + adminPin | **OK** · 100 locs |
| `listarAuditoriaAdmin` | **OK** · top=`08/09` Raykelly (I154 sort) · 49 eventos hoje |
| Smoke salvar → ▶ → sync | **OK** · ts match início/listar · cancelar limpa |
| I151 readonly | **OK** · ping 220 · paridade |
| FE guards I154/I154b/I151 | **OK** (estáticos) |

> 1º smoke sem `timestamp` no ▶ → 400 esperado (harness). Com `timestamp` ms cliente → OK.

## Como o sistema respondeu

1. **Confiabilidade (objetivo I155):** HTML 404 sumiu na bateria operacional. Causa raiz (full-sheet) tratada.
2. **Latência warm:** excelente (~1,5–2s em `listarAtivas` com cache).
3. **Latência frio / 1ª chamada:** ainda **11–18s** — custo de abrir planilha/Apps Script, não de ler 3k linhas. Aceitável vs 404.
4. **Cache 8s:** após ~8–10s sem hit, volta frio (~12s). FE poll ~5s mantém warm na operação.
5. **Carga paralela:** 3 requests juntos ~16–19s cada, mas **todas OK** — antes isso gerava 404.
6. **Auth:** endpoints gestão sem PIN = 403 (correto; não é falha de estabilidade).

## Precisa ajustar algo?

| Item | Prioridade | Ação |
|------|------------|------|
| Nada bloqueante | — | **Não** — I155 cumpriu a meta de estabilidade |
| TTL cache ativas 8s → **12–15s** | P3 opcional | Menos frio se poll atrasar; invalidação nas escritas já existe |
| Evitar `listarAtivas`+`carregarInicio` em paralelo no FE | P3 | Já há reconcile I151; warm path reduz dor |
| Cron/warm ping externo | P4 | Só se frio matinal incomodar tablet |
| Tablet físico balcão | Ops | Smoke D4 manual com `?force=1.9.114` |

**Veredito:** sistema **estável o bastante para operação**. Confiabilidade (404/perda de sync) resolvida na causa raiz; latência residual = frio GAS/Sheets, não regressão funcional.

## Não mexer agora

- Não subir lookback sem evidência de Ativa “fantasma” antiga fora da cauda 600.
- Não Nova versão GAS só por TTL — só se optar pelo P3.
