# FASE 18 — Financeiro + previsão (memorial)

**Atualizado:** 27/06/2026 · FE **v1.9.1** · GAS **v1.5.167** (sem alteração)  
**UI:** `#mk-previsao-mes` no Dashboard · Sprint B `PLANEJAMENTO_ONE_UI_2026-06.md`

---

## 1. Objetivo

Hero de **previsão de fim de mês** no Dashboard admin, com linhas de contexto One UI (Nunito nos números, Fredoka só no título da seção).

---

## 2. Fórmulas (FE — `calcPrevisaoMes7d_`)

| Métrica | Fórmula |
|---------|---------|
| **Média 7 dias** | Soma `fatPorDia[d]` dos últimos 7 dias corridos (até hoje) ÷ dias considerados |
| **Faturamento projetado** | `fatMes + media7 × diasRestantes` (só mês corrente) |
| **Resultado projetado** | `previsaoFat × (resultado / fatMes)` — mantém margem operacional atual |
| **Ritmo GAS** | `kpiMes.projecaoFat` / `projecaoRes` — dias com movimento (backend) |
| **Fat. vs 30d** | `mediaDiaria` do mês vs `comandoOperacional.comparativo30d.media` |
| **Custos vs fat.** | `cusMes / fatMes × 100` + custo médio por dia operando |

Mês **passado** (não corrente): previsão = realizado (`fatMes` / `resultado`).

---

## 3. Fontes de dados

| Campo | API |
|-------|-----|
| `fatPorDia`, `fatMes`, `cusMes`, `resultado`, `projecaoFat`, `projecaoRes` | `kpiMes` |
| `comparativo30d.media` | `comandoOperacional` (cache FE `commandCenterData`) |

**Sem mudança GAS** neste incremento — leitura apenas.

---

## 4. Critérios de pronto (UI-B1 + UI-B2)

- [x] Hero `#mk-prev-fat` + ctx *"Com base nos últimos 7 dias"*
- [x] Grid 4 widgets (resultado, GAS, cmp 30d fat, custos %)
- [x] Classes `trend-up` / `trend-down` em ctx comparativos
- [x] Memorial este doc (UI-B3)

---

## 5. Próximo

- UI-B3 Design System §8.4 (opcional — tokens já em `mk-design.css`)
- Sprint C RH polish · FASE 17 assinatura formal
