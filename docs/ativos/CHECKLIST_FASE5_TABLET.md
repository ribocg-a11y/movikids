# Checklist FASE 5 — Tablet balcão (5.B7.4)

**Data:** 09/06/2026  
**FE alvo:** **v1.7.95** · **GAS:** **v1.5.72**  
**Referência:** `FASE_5_CONFIABILIDADE_APIS.md` · `INCIDENTE_I21_SESSAO_IDLE_DUAL_2026-06-09.md`

**URL no tablet:** https://ribocg-a11y.github.io/movikids/?force=1.7.95

---

## Automatizado (PC) — ✅ 09/06/2026

| # | Teste | Resultado |
|---|-------|-----------|
| PC.1 | 3× `TESTE_B7_REGRESSAO_WRITE.ps1` | ✅ ok (GAS v1.5.72; cleanup 2/run) |
| PC.2 | `TESTE_SESSAO_IDLE_READONLY.ps1` | ✅ ok |
| PC.3 | `pre-push-check.ps1` | ✅ 27 checks |
| PC.4 | `TESTE_PORTAL_READONLY.ps1` | ✅ ok (isolado) |
| PC.5 | `TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` | ✅ ok (warn: loja vazia) |
| PC.6 | GitHub Pages `mk-version.js` | ✅ **1.7.95** (live) |
| PC.7 | Portal card no DOM (Pages) | ✅ título + sem botão ✕ |

---

## Homologação tablet — assinada 09/06/2026 (Milena)

| # | Passo | OK | Evidência |
|---|-------|-----|-----------|
| F0.1 | `?force=1.7.95` no tablet da loja | [x] | — |
| F0.2 | Rodapé **Online · v1.7.95** | [x] | usuário |
| F0.3 | Chip **Turno** verde; operador logado | [x] | **Milena** |
| F0.4 | Sidebar **BALCÃO: Milena Nunes** | [x] | implícito |
| P.1 | Card **Portal dos pais** visível | [x] | — |
| P.2 | **Sem** botão ✕ | [x] | usuário |
| B7.1 | Nova → **Só salvar** | [x] | — |
| B7.2 | ▶ **Iniciar** | [x] | — |
| B7.3 | **Estender** | [x] | — |
| B7.4 | **Encerrar** | [x] | — |
| I21.1 | Mock idle → gate login | [x] | **09/06 v1.7.96** |
| I21.2 | Re-login operador | [x] | Milena |

**Assinatura ops:** Milena / balcão · **09/06/2026**  
**5.B7.4 + I21:** ✅ **FECHADO** (v1.7.96)

---

## I21 — por que não funcionou antes + como retestar

O helper em arquivo local (`file://`) **não grava** no mesmo `localStorage` do app HTTPS. Use o link **HTTPS** (mesmo domínio GitHub Pages):

**https://ribocg-a11y.github.io/movikids/assets/mock-idle-homolog.html**

1. Milena logada · zero locações abertas  
2. Abrir o link acima no Chrome do tablet  
3. Tocar **Simular 61 min**  
4. Esperado: gate **Quem está no balcão?**

*(Requer push do arquivo `assets/mock-idle-homolog.html` — pedir ao dev se 404.)*

---

## Admin rápido (opcional — não assinado)

| # | Passo | OK |
|---|-------|-----|
| A.1 | Hub → **Caixa** (`resumoDia`) | [ ] |
| A.2 | **Dashboard** (`kpiMes`) | [ ] |
| A.3 | **Sistema** versão + liberar sessão | [ ] |

---

## Fechar FASE 5

**Critério mínimo atingido:** F0 + P + B7 ✅ (09/06). I21.1 tablet = opcional pós-B8.

FASE 5 declarada **fechada** — ver `PLANEJAMENTO_ATUAL_2026-06.md`.
