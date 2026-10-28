# I183 / I184 / I183b — Holding dual no celular + ponto toque-duplo (28/10/2026)

**Status:** ✅ FE **v1.9.176** (I183b) · validação API/FE em curso  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` I183 · I184 · I183b

## Sintomas (relato Ops)

1. No celular ADM, Lojas/Holding: se mostrava uma loja, a outra zerava.
2. Operadoras “não conseguiam bater ponto”.
3. **28/10 noite (I183b):** após v1.9.175, Holding ainda La Ville R$0 / só 1 loja — print Ops.

## Causas

| ID | Causa |
|----|--------|
| **I183** | Fix `mkHoldingHydrateKpis_` ficou no PR #47 e **nunca mergeou** em `main`. Após Abrir balcão LV, `encHojeData` local ficava só de 1 loja. |
| **I184** | Toque duplo no botão de ponto (entrada→saída em segundos). Ex.: Jennifer 28/10 `15:01→15:22`. Hub escondia CTA após “turno encerrado”. |
| **I183b** | `Object.assign({unidadeId:'all'}, authP)` → auth sobrescrevia com loja aberta; `operadorApiParams_` colapsava `all`→`golden`; cache Caixa 1-loja envenenava Holding. |

## Correção

### FE v1.9.175 (I183/I184)
- Holding: `resumoDia(all)` + fatia Golden/La Ville ao abrir Lojas / voltar Holding
- Ponto: trava 2,5s · confirma saída &lt;45 min · CTA “Registrar nova entrada”

### FE v1.9.176 (I183b)
- `unidadeId:'all'` **depois** do `authP` no hydrate Holding e no Caixa
- `operadorApiParams_`: **não** colapsa `all`→`golden` (holding dual)
- Cache `_mkCaixaResumoCache_` só se `unidadeId==='all'`
- Lista **Encerradas hoje** nas 2 colunas do Holding (pagamento + valor)

## Evidência — validação 28/10/2026 (America/Sao_Paulo)

Arquivo: `entregas/VALIDACAO_I183_I184_2026-10-28.json` (I183/I184) · I183b = FE 1.9.176 + `guard.i183b`

| Check | Resultado |
|-------|-----------|
| Pages alvo | **1.9.176** |
| Ping GAS | **v1.5.236** |
| `resumoDia(all)` | n=11 · fat R$239 · golden+laville |
| FE hydrate all pós-auth | OK (I183b) |
| FE Encerradas holding | OK |
| `TESTE_HOLDING_SMOKE_C` | PASS |

## Homolog Ops (celular)

1. `?force=1.9.176` → ADM → Lojas · **Todas** → Golden **e** La Ville com caixa + lista Encerradas
2. `gestao-pessoas.html?force=1.9.176` → PIN → Meu ponto (sem toque duplo na saída)

## Lição

**PR aberto ≠ publicado.** I183 ficou em #47 até 28/10; só merge/`main`+Pages conta para Ops.  
**Auth params por último matam `unidadeId:all`.** Sempre `Object.assign({}, authP, { unidadeId:'all' })` em leituras dual.
