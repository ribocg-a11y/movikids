# FASE 14 — Plano de contas + mini-DRE

**Status:** 🟢 **FASE 14 core em prod** — mini-DRE GAS+FE · GAS ping prod. **v1.5.91** (14/06) · aba PLANO_CONTAS opcional  
**Prioridade:** P2 · **Esforço:** 10–14 dias  
**Versão alvo:** FE **v1.8.16** · GAS **v1.5.82** ✅ prod. (11/06/2026 13:50)  
**Mestre:** `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md` § FASE 14

---

## Produção (11/06/2026)

| Camada | Versão |
|--------|--------|
| GAS | **v1.5.82** ✅ |
| FE | **v1.8.16** ✅ |

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

## Validação prod (11/06/2026 13:50)

| Teste | Resultado |
|-------|-----------|
| GAS ping | ✅ **v1.5.82** |
| `TESTE_MINI_DRE_READONLY` | ✅ ok · paridade diff=0 |
| `miniDre.planoFonte` | `default` (CMV=0 · OPEX=80 jun/2026) |
| Pages `MK_VERSION` | ✅ **1.8.16** |
| `check-operacao-livre` | ✅ 0 locações abertas |

---

## Próximo passo

| # | Ação | Quem |
|---|------|------|
| 1 | Homolog Dashboard **v1.8.16** — cascata mini-DRE | **Sócio** (PC) |
| 2 | Opcional: `instalarAbaPlanoContas` na planilha | Sócio |
| 3 | Tablet F0 smoke | Sócio (balcão) |

---

## Docs relacionados

| Doc | Uso |
|-----|-----|
| `../referencia/MEMORIAL_MINI_DRE.md` | Fórmulas e cascata |
| `../arquivo/deploy/DEPLOY_FE_v1.8.15_SEMANA_ATUAL.md` | FE narrativo (histórico) |
| `../arquivo/deploy/DEPLOY_v1.5.91_FOLHA_REPAIR_USER_ENTERED.md` | GAS I25 (histórico) |
