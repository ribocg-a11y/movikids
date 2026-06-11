# FASE 14 — Plano de contas + mini-DRE

**Status:** 🟡 **iniciada** (docs 11/06/2026) — implementação GAS/FE pendente revisão memorial  
**Prioridade:** P2 · **Esforço:** 10–14 dias  
**Versão alvo:** FE **v1.8.16** · GAS **v1.5.82** (clasp push ✅ · **Nova versão Web pendente**)  
**Mestre:** `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md` § FASE 14

---

## Produção base (não mudar até FASE 14 deploy)

| Camada | Versão |
|--------|--------|
| GAS | **v1.5.81** |
| FE | **v1.8.15** |

---

## Entregas — checklist

| ID | Entrega | Camada | Status |
|----|---------|--------|--------|
| 14.0 | Memorial mini-DRE | Docs | ✅ `../referencia/MEMORIAL_MINI_DRE.md` |
| 14.1 | Aba `PLANO_CONTAS` | Planilha | ⏳ script `instalarAbaPlanoContas.gs` |
| 14.2 | Validar CUSTOS col cat → plano | GAS | ✅ fallback default |
| 14.3 | `margemBruta` / `cusCMV` | GAS | ✅ v1.5.82 repo |
| 14.4 | `margemOperacional` explícito | GAS | ✅ v1.5.82 repo |
| 14.5 | `depreciacaoMensal_` opcional | GAS | ⏳ backlog |
| 14.6 | Cascata margens Dashboard | FE | ✅ v1.8.16 repo |
| 14.7 | Memorial (este pacote) | Docs | ✅ |
| 14.8 | `scripts/planilha/instalarAbaPlanoContas.gs` | Ops | ✅ |

---

## Ordem de implementação

```
1. Sócio revisa MEMORIAL_MINI_DRE.md (mapeamento categorias)
2. Criar aba PLANO_CONTAS na planilha + seed 5 categorias atuais
3. GAS v1.5.82 — lerPlanoContas_ + split cusCMV/cusOPEX em kpiMes
4. TESTE_MINI_DRE_READONLY.ps1 — paridade margemOperacional = resultado
5. FE v1.8.16 — #mk-dre-cascata no cockpit
6. Deploy doc + Nova versão Web GAS
```

---

## Validação pós v1.8.15 (11/06/2026)

| Teste | Resultado |
|-------|-----------|
| `check-operacao-livre` | ✅ 0 locações abertas |
| `TESTE_KPI_MES_READONLY` | ✅ ok |
| `TESTE_FASE9_FOLHA_READONLY` | ✅ ok (semáforo amarelo — 10 dias) |
| `TESTE_FASE8_ALERTAS_READONLY` | ✅ ok |
| Pages `MK_VERSION` | ✅ **1.8.15** |
| GAS ping | ✅ **v1.5.81** |

---

## Próximo passo

| # | Ação | Quem |
|---|------|------|
| 1 | Revisar **`MEMORIAL_MINI_DRE.md`** — OK mapeamento CMV/OPEX? | **Sócio** |
| 2 | Homolog Dashboard v1.8.15 (semana corrente + rodapé) | **Sócio** (PC) |
| 3 | Após OK memorial → aba PLANO_CONTAS + GAS 14.2–14.4 | **Agente** |

---

## Docs relacionados

| Doc | Uso |
|-----|-----|
| `../referencia/MEMORIAL_MINI_DRE.md` | Fórmulas e cascata |
| `DEPLOY_FE_v1.8.15_SEMANA_ATUAL.md` | FE atual em prod |
| `DEPLOY_v1.5.81_FOLHA_PROPORCIONAL.md` | GAS atual em prod |
