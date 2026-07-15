# INCIDENTE I116 — Enrich RH no login + lentidão residual do app

**Data:** 15/07/2026  
**FE:** v1.9.58 · **GAS Web:** **v1.5.196** ✅  
**Severidade:** P1 — login frio + Dashboard/admin GP

---

## Pós Nova versão (15/07 ~20h)

| Action | Frio | Warm |
|--------|-----:|-----:|
| ping | 2,8 s · **v1.5.196** | — |
| Raykelly painel | ~20 s | **~4,4 s** |
| Julia painel | ~23 s | **~3,1 s** |
| listar | ~2 s | ~2 s |
| painelGestaoPessoasAdmin | ~49 s | **~2,3 s** |
| kpiMes lite | ~6 s* | ~2 s |
| TESTE_GESTAO_PESSOAS_READONLY | **ok** | |

\* sequência com runtime aquecido; isolado frio historicamente ~30s.

**Veredito:** reentrada Colaboradores/admin GP **OK**. Frio Colab ~20s ainda limitado por `gpLoadContext_` (abas + AUD tail) — não é mais write-on-login nem enrich-all-RH.

---

## Contexto pré-196 (pós I115 Web 195)

| Action | Antes I115 | Pós-195 | Pós-196 |
|--------|----------:|--------:|--------:|
| Raykelly warm | — | ~3–4 s | **~4 s** |
| Raykelly frio | ~61 s | ~16–29 s | **~20 s** |
| writes no login | sim | não | não |
| enrich todo RH no login | sim | sim (bug) | **não** |

---

## Correção GAS v1.5.196

| Mudança | Detalhe |
|---------|---------|
| `expandRh` | login: `expandRh: false` (op + FSS) |
| Admin | default `expandRh: true` |
| Escala/banco | via `ctx` |

## Residual backlog

- Frio Colab ~20s → slim `gpLoadContext_` / AUD (cuidado P0)
- Frio `painelGestaoPessoasAdmin` ~49s → N× jornada (FE SWR mitiga)
- `kpiMes` frio absoluto (I23/I73)

## MAPA

`MAPA_ERROS_FALHAS_BUGS.md` → **I116**
