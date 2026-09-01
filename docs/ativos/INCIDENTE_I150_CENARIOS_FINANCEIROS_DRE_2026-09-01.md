# I150 / I150b — Cenários financeiros Dashboard (Base DRE · Projetado 3m · Ritmo 3d)

**Status:** ✅ FE **v1.9.109** Pages · GAS **cenariosFinanceiros** live (ping **v1.5.213** · repo **v1.5.215**)  
**Data:** 01/09/2026

---

## O quê

Fechamento de faturamento confuso: números diferentes em cada bloco do Dashboard (Base, Ritmo, Projetado, Real) com rótulos ambíguos. Não era bug de soma — eram **métricas distintas** mal nomeadas:

| Antes | Problema |
|-------|----------|
| **Base** | Média histórica travada no `localStorage` (~R$ 16.547) — não era DRE |
| **Ritmo** | Média de todo o mês (= real no fechamento, tautologia) |
| **Projetado** | Colapsava no real em mês fechado; `metaProjecaoMes` travada cedo |
| **Labels** | "Abaixo do ritmo" vs "dentro do projetado" pareciam contraditórios |

**Referência ago/2026:** real **R$ 16.140** · base tela antiga ~R$ 16.547 · meta travada ~R$ 20.749.

---

## Regra acordada (I150)

| Métrica | Definição |
|---------|-----------|
| **Base** | Piso **DRE**: folha B68 + custos CUSTOS + **manutenção fixa R$ 1.200/mês** + CTO mín. ÷ 0,72 (margem 18%) |
| **Projetado** | Média dos **3 meses calendário anteriores** |
| **Ritmo** | Média dos **últimos 3 dias com faturamento**; se \<3 dias no mês → últimos 3 dias do **mês anterior** |
| **Ritmo fim de mês** | acumulado + média3d × dias restantes (fechado = real) |

**I150b:** constante `DRE_MANUTENCAO_MENSAL_` / `MK_DRE_MANUTENCAO_MENSAL_` = **1200**.

---

## Correção

### GAS v1.5.214–215

- `buildCenariosFinanceirosMes_`, `calcProjetado3mMes_`, `calcBaseDreMes_`, `lastNBillingDaysFromFatMap_`
- `kpiMes` retorna `cenariosFinanceiros` (baseDreMes, projetado3mMes, ritmo3dMes, …)
- Histórico mensal usa projetado 3m (não extrapolação por dias operando)

### FE v1.9.108–109

- `mkCenariosFinanceirosFe_`, `mkCalcBaseDreFe_`, `mkProjetado3mMes_`
- Gráficos, previsão, cockpit, histórico alinhados
- Labels: **Base DRE**, **Projetado (3 meses)**, **Ritmo (3 dias)**
- Removida base histórica `localStorage`

---

## Valores referência (ago/2026 · produção 01/09/2026)

| Campo | Valor |
|-------|-------|
| `fatMes` | 16.140 |
| `baseDreMes` | 11.047,17 |
| `baseDreManutencao` | 1.200 |
| `projetado3mMes` | 11.875,20 (Mai+Jun+Jul/26) |
| `ritmo3dMes` | 16.140 (= real, mês fechado) |

Teste: `node scripts/testes/teste-i150-cenarios-financeiros.cjs`

---

## Homolog

| Check | Quem | Status |
|-------|------|--------|
| `teste-i150-cenarios-financeiros.cjs` | Agente Cloud 01/09 | ✅ |
| Dashboard admin browser (3 linhas + labels) | Sócio PC | ⏳ |
| Tablet smoke D4 | Ops | ⏳ |

---

## Deploy GAS

Repo header **v1.5.215** · ping produção ainda reporta **v1.5.213** — `cenariosFinanceiros` já responde com I150b. Sócio: colar raw → **Nova versão** no deploy `AKfycbwakQ...` para alinhar string de versão ping.

**Raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

---

## Arquivos

| Camada | Arquivo |
|--------|---------|
| GAS | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` |
| FE | `mk-admin.js`, `index.html` (Dashboard) |
| Teste | `scripts/testes/teste-i150-cenarios-financeiros.cjs` |
