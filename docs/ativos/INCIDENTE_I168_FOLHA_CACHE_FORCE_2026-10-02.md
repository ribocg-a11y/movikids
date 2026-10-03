# INCIDENTE I168 — Folha/admin “travou de novo” após I166

**Status:** ✅ resolvido · FE **v1.9.161**  
**Data:** 02–03/10/2026  
**Relacionados:** I166 (mitigação que regressou) · I120 · I126b · I136 · I137 · I48

---

## Sintoma

Sócio: Folha setembro / admin RH demorando ou “travando” de novo após correções do dia. Percepção: “toda vez que mexe, volta a travar”.

---

## Medição (02/10/2026)

| Chamada | Tempo |
|---------|------:|
| `painelGestaoPessoasAdmin` full **frio** (09/2026) | ~62 s |
| full **warm** (ScriptCache) | **~2,3 s** |
| full com **`force=1`** | ~49 s |
| lite | ~30 s (folha vazia — inútil na aba Folha) |
| `kpiMes` set golden lite | ~11 s |

---

## Causa raiz (regressão do agente no I166)

O I166 tentou “endurecer” a Folha e **reabriu a família I120/I136**:

1. Troca de competência **apagava** `sessionStorage` cache  
2. Sempre `force: true` → **mata** ScriptCache warm (~2 s) → cold ~60 s  
3. Loop **3 retries** com `force=1` no retry → piora sob fila GAS  
4. Auto-`kpiMes` ao abrir Relatório mensal → **fila paralela** com painel (I136)

---

## Correção (I168)

| Regra | Implementação |
|-------|----------------|
| Cache-first | Pintar folha do cache FE/LS antes de rede |
| Sem force na troca de mês | `softRefresh` sem `force=1` (usa ScriptCache) |
| Persistência | `localStorage` `mk_gp_folha_v1_*` 24 h |
| Sem auto-relatório | `irAdmin('relatorio')` não dispara `kpiMes` |
| 1 chamada full | `api()` já retenta 404 1× — sem loop 3× |
| force só no retry humano | `mkGpAdmRetryPanel_` |

Arquivos: `mk-gestao-pessoas-admin.js` · `mk-admin.js` · commit `bd960ad`

---

## Não repetir (trava de família)

| ID | Lição |
|----|--------|
| **I120 / I120b** | Cache ScriptCache é o que torna admin usável; `force=1` é caro |
| **I126b** | Folha precisa full; lite não traz `folha[]` |
| **I136** | Não disparar painel + kpiMes/preview em paralelo |
| **I137** | Cache full hit → **não** re-bater GAS |
| **I166→I168** | Retry agressivo + apagar cache = regressão disfarçada de “hardening” |

**Expectativa honesta:** 1ª carga do mês ainda ~1 min (limite Apps Script). 2ª carga / reabrir PC = segundos / instantâneo.

---

## Veredito

| Item | Status |
|------|--------|
| Regressão I166 | ✅ revertida no comportamento (I168) |
| Pages | **v1.9.161** |
| GAS | sem mudança (v1.5.231) — cold ~60s permanece no servidor |
