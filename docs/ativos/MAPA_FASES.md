# MOVI KIDS — Mapa de fases (tradução)

**Atualizado:** 26/06/2026

Evita confusão entre **três planos** que usam o mesmo número para coisas diferentes.

---

## Ciclo ativo agora — Premium One UI

| Status | Fase | Nome | Doc canônico |
|--------|------|------|--------------|
| ✅ | **15** | Gestão Pessoas (RH) | `FASE_15_GESTAO_PESSOAS.md` |
| ✅ | **15b** | RH premium | `PLANO_PREMIUM` §6 — **100%** repo |
| 🟡 | **16** | One UI + Centro de Comando | **~92%** · Sprint A em `PLANEJAMENTO_ONE_UI_2026-06.md` |
| 🟡 | **17** | Alertas + Gestor | **~95%** · assinar `CHECKLIST_FASE17_FECHAMENTO.md` |
| ⏳ | **18** | Financeiro previsão (UI) | Sprint B — após Sprint A |

**Decisão 26/06:** fundação + homolog tablet fechados → **dev ativo = UI One UX** (FASE 16 visual → FASE 18).

---

## Tradução — colisões de número

| Nº | Em `PLANO_FASES_6_15` (cockpit) | Na operação real | Premium 16–22 |
|----|--------------------------------|------------------|---------------|
| **15** | Portal analytics + CONFIG UI | **Gestão Pessoas** (repriorizado) | Conteúdo cockpit → **FASE 20** |
| **15b** | — | RH completo | ✅ fechado repo |
| **16** | Telemetria balcão (backlog) | **Premium One UI** | **ciclo ativo** |
| **10–13** | CRM, Holding, Live BI… | Parcial / backlog | FASE 18–21 |

---

## Fases 0–15 — status resumido

| Fase | Nome | Status |
|------|------|--------|
| 0–5 | Base, homolog, payback, CONFIG, APIs | ✅ fechadas |
| 6–9 | Cockpit, leading, alertas, folha CLT | ✅ prod |
| 14 | Mini-DRE | ✅ prod |
| **15** | Gestão Pessoas | ✅ homolog 20/06 |
| 10–13 | CRM, Holding, drill-down, Live BI | ⏳ absorvido Premium 18–21 |

---

## Próximo ciclo Premium (16–22)

Doc mestre: **`PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md`**  
**Sprint ativo:** **`PLANEJAMENTO_ONE_UI_2026-06.md`**

| Fase | Nome | Status UI |
|------|------|-----------|
| 16 | One UI + Centro comando | 🟡 Sprint A |
| 17 | Alertas + Gestor | 🟡 assinar |
| 18 | Financeiro previsão | ⏳ Sprint B |
| 19–22 | Gamificação, portal, BI, IA | backlog |

---

## Hierarquia — qual doc manda

```
Versão          → mk-version.js + ping GAS
Operação hoje   → HANDOFF_NOVO_CHAT.md
Ciclo UI ativo  → PLANEJAMENTO_ONE_UI_2026-06.md
Fase / visão    → este arquivo + PLANO_PREMIUM
Prioridades     → PLANEJAMENTO_ATUAL §9
```
