# MOVI KIDS — Mapa de fases (tradução)

**Atualizado:** 22/06/2026

Evita confusão entre **três planos** que usam o mesmo número para coisas diferentes.

---

## Ciclo ativo agora

| Status | Fase | Nome | Doc canônico |
|--------|------|------|--------------|
| ✅ | **15** | Gestão Pessoas (RH) | `FASE_15_GESTAO_PESSOAS.md` |
| 🟡 | **15b** | RH premium | `PLANO_PREMIUM` §6 — **96%** (falta 15b.7) |
| 🟡 | **16 Premium** | One UI + Centro de Comando | repo ✅ · homolog tablet ⏳ |
| 🟢 | **17 Premium** | Alertas + perfil Gestor | **próxima fase ativa** |

**Decisão 22/06:** FASE 16 código pronto no repo — fechar com homolog tablet após **Nova versão Web GAS v1.5.128**. Dev segue em **FASE 17**.

---

## Tradução — colisões de número

| Nº | Em `PLANO_FASES_6_15` (cockpit) | Na operação real | Premium 16–22 |
|----|--------------------------------|------------------|---------------|
| **15** | Portal analytics + CONFIG UI | **Gestão Pessoas** (repriorizado) | Conteúdo cockpit → **FASE 20** |
| **15b** | — | RH completo (comunicados, avaliações) | `PLANO_PREMIUM` §6 |
| **16** | Telemetria balcão (backlog) | **Premium One UI** (próximo dev) | FASE 16 Premium |
| **10–13** | CRM, Holding, Live BI… | Parcial / backlog | FASE 18–21 absorvem partes |

---

## Fases 0–15 — status resumido

| Fase | Nome | Status |
|------|------|--------|
| 0–5 | Base, homolog, payback, CONFIG, APIs | ✅ fechadas |
| 6–9 | Cockpit, leading, alertas, folha CLT | ✅ repo/prod |
| 9b | DNA admin | ✅ v1.8.28+ |
| 14 | Mini-DRE | ✅ prod v1.8.16+ |
| **15** | **Gestão Pessoas** | ✅ homolog tablet 20/06 |
| 10–13 | CRM, Holding, drill-down, Live BI | ⏳ backlog (cockpit) — não bloqueia operação |

Detalhe entregas 6–15: `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md` (histórico de planejamento).

---

## Próximo ciclo Premium (16–22)

Doc mestre: **`PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md`**

| Fase | Nome | Risco balcão |
|------|------|--------------|
| 16 | One UI + Centro comando | Médio (CSS global admin) |
| 15b | RH premium | Baixo-médio |
| 17 | Alertas + permissões Gestor | **Alto** (auth) |
| 18–19 | Financeiro, gamificação | Baixo (leitura) |
| 20 | Portal analytics + CONFIG UI | **Alto** (CONFIG) |
| 21–22 | Live BI, IA | Baixo / decisão sócio |

**Sequência documentada:** GAS v1.5.111 Web → homolog tablet → FASE 16 mock (janela segura).

---

## Hierarquia — qual doc manda

```
Versão          → mk-version.js + ping GAS
Operação hoje   → HANDOFF_NOVO_CHAT.md
Fase ativa      → este arquivo + PLANEJAMENTO_ATUAL
Futuro produto  → PLANO_PREMIUM_ONEUI_FASES_16_22
Histórico fase  → PLANO_FASES_6_15 (não renumerar retroactivamente)
```
