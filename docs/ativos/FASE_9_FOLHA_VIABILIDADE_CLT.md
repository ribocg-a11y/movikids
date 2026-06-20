# FASE 9 — Folha CLT + viabilidade contratação (Dashboard)

**Status:** 🟢 **prod fechado** — GAS **v1.5.91** · testes readonly **ok** 14/06/2026  
**Prioridade:** P1 (decisão de contratação data-driven)  
**Versão alvo:** FE **v1.8.10+** · GAS **v1.5.91**  
**Depende de:** aba **FOLHA** (B68) · FASE 8 alertas (v1.5.79 / v1.8.9)  
**Nota:** distinto da fase **DNA visual admin** no plano 6–15 (continua ⏳).

---

## Objetivo

Integrar custo folha (memorial aba FOLHA) ao Dashboard admin e dar **semáforo objetivo** para contratar CLT — sem achismo.

---

## Entregas

| ID | Entrega | Status |
|----|---------|--------|
| 9.1 | `lerFolhaPlanejamento_` (B68, B5, B7, B9, B11) | ✅ prod |
| 9.2 | `buildViabilidadeContratacao_` — 6 gates + estudo | ✅ prod |
| 9.3 | `kpiMes.viabilidadeContratacao` + `folhaPlanejamento` | ✅ prod |
| 9.4 | Alertas `CONTRATACAO_*` | ✅ prod |
| 9.5 | FE `#mk-contratacao-panel` | ✅ prod |
| 9.6 | Leading `breakEvenComFolha`, `custoDiaComFolha` | ✅ prod |
| 9.7 | Docs deploy regra de ouro | ✅ repo |
| 9.8 | **I25** — repair fórmulas FOLHA USER_ENTERED | ✅ prod v1.5.91 |

---

## Gates de contratação (todos verdes = ideal)

1. Margem ≥10% **sem** folha no mês  
2. Projeção mês cheio cobre folha  
3. Reserva ≥ R$ 2.500 após folha (projeção)  
4. Margem projetada com folha ≥ 18%  
5. ≥ 12 dias com locação no mês  
6. Faturamento projetado ≥ piso sugerido  

---

## Deploy

- GAS base: `../arquivo/deploy/DEPLOY_v1.5.80_FASE9_FOLHA_VIABILIDADE.md`  
- GAS repair I25: **`../arquivo/deploy/DEPLOY_v1.5.91_FOLHA_REPAIR_USER_ENTERED.md`**  
- FE: `../arquivo/deploy/DEPLOY_FE_v1.8.10_FASE9_FOLHA_VIABILIDADE.md`  
- Memorial folha: `../referencia/FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md`  
- Incidente: `../arquivo/incidentes/INCIDENTE_I25_FOLHA_FORMULAS_NAME_2026-06-13.md`

---

## Critério de pronto

- [x] Ping `v1.5.91`  
- [x] Dashboard `?force=1.8.10+` — painel CLT + checklist gates  
- [x] Aba FOLHA calculando — B68 ~5269,96 · `folhaPlanejamento.fonte: FOLHA`  
- [x] Alterar FOLHA B68 → Dashboard recalcula (após repair)  
- [x] Operador Home sem painel CLT  
- [x] `TESTE_FOLHA_FORMULAS_READONLY.ps1` + `TESTE_FASE9_FOLHA_READONLY.ps1` ok (**14/06/2026**)

---

## Repair pós-deploy (obrigatório se fórmulas FOLHA quebradas)

```powershell
Invoke-RestMethod -Uri "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=repairFolhaAdmin&adminPin=1416"
.\scripts\testes\TESTE_FOLHA_FORMULAS_READONLY.ps1
```
