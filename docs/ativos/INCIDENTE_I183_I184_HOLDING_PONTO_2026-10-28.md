# I183 / I184 — Holding dual no celular + ponto toque-duplo (28/10/2026)

**Status:** ✅ FE **v1.9.175** em Pages · validação API/FE **PASS**  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` I183 · I184

## Sintomas (relato Ops)

1. No celular ADM, Lojas/Holding: se mostrava uma loja, a outra zerava.
2. Operadoras “não conseguiam bater ponto”.

## Causas

| ID | Causa |
|----|--------|
| **I183** | Fix `mkHoldingHydrateKpis_` ficou no PR #47 e **nunca mergeou** em `main`. Após Abrir balcão LV, `encHojeData` local ficava só de 1 loja. |
| **I184** | Toque duplo no botão de ponto (entrada→saída em segundos). Ex.: Jennifer 28/10 `15:01→15:22`. Hub escondia CTA após “turno encerrado”. |

## Correção (FE v1.9.175)

- Holding: `resumoDia(all)` + fatia Golden/La Ville ao abrir Lojas / voltar Holding
- Ponto: trava 2,5s · confirma saída &lt;45 min · CTA “Registrar nova entrada”
- Ops: `excluirPontoRhAdmin` Jennifer `28/10/2026` (fantasma removido)

## Evidência — validação 28/10/2026 (America/Sao_Paulo)

Arquivo: `entregas/VALIDACAO_I183_I184_2026-10-28.json`

| Check | Resultado |
|-------|-----------|
| Pages | **1.9.175** |
| Ping GAS | **v1.5.236** |
| `carregarInicio` G/L/all | enc 9 / 2 / 11 |
| `resumoDia(all)` | n=11 · fat R$239 · golden+laville |
| Fatia Holding | Golden nSess 10 / LV 2 — **não zera** |
| FE hydrate/nav/voltar | OK |
| FE ponto busy/confirm/CTA | OK |
| Jennifer repair | limpo (pode registrar entrada) |
| Karen | dentro 16:02 |
| Raykelly | 09:50→17:32 |
| `TESTE_HOLDING_SMOKE_C` | PASS (I183 guards) |
| `TESTE_ISOLAMENTO_MULTIUNIDADE` | PASS |

## Homolog Ops (celular)

1. `?force=1.9.175` → ADM → Lojas · **Todas** → Golden e La Ville com contas/caixa
2. `gestao-pessoas.html?force=1.9.175` → PIN → Meu ponto (sem toque duplo na saída)

## Lição

**PR aberto ≠ publicado.** I183 ficou em #47 até 28/10; só merge/`main`+Pages conta para Ops.
