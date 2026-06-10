# FASE 9 — Folha CLT + viabilidade contratação (Dashboard)

**Status:** 🟢 **repo pronto** — publicar GAS **v1.5.80** + FE **v1.8.10**  
**Prioridade:** P1 (decisão de contratação data-driven)  
**Versão alvo:** FE **v1.8.10** · GAS **v1.5.80**  
**Depende de:** aba **FOLHA** (B68) · FASE 8 alertas (v1.5.79 / v1.8.9)  
**Nota:** distinto da fase **DNA visual admin** no plano 6–15 (continua ⏳).

---

## Objetivo

Integrar custo folha (memorial aba FOLHA) ao Dashboard admin e dar **semáforo objetivo** para contratar CLT — sem achismo.

---

## Entregas

| ID | Entrega | Status |
|----|---------|--------|
| 9.1 | `lerFolhaPlanejamento_` (B68, B5, B7, B9, B11) | ✅ repo |
| 9.2 | `buildViabilidadeContratacao_` — 6 gates + estudo | ✅ repo |
| 9.3 | `kpiMes.viabilidadeContratacao` + `folhaPlanejamento` | ✅ repo |
| 9.4 | Alertas `CONTRATACAO_*` | ✅ repo |
| 9.5 | FE `#mk-contratacao-panel` | ✅ repo |
| 9.6 | Leading `breakEvenComFolha` | ✅ repo |
| 9.7 | Docs deploy regra de ouro | ✅ repo |

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

- GAS: `DEPLOY_v1.5.80_FASE9_FOLHA_VIABILIDADE.md`  
- FE: `DEPLOY_FE_v1.8.10_FASE9_FOLHA_VIABILIDADE.md`  
- Memorial folha: `../referencia/FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md`

---

## Critério de pronto

- [ ] Ping `v1.5.80`  
- [ ] Dashboard `?force=1.8.10` — painel CLT + checklist gates  
- [ ] Alterar FOLHA B68 → Dashboard recalcula  
- [ ] Operador Home sem painel CLT  
