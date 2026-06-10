# Deploy FE v1.8.6–v1.8.7 — Pacote I KPIs sem duplicata

**GAS pareado:** **v1.5.78** (sem alteração)  
**Problema:** Dashboard repetia métricas já exibidas no cockpit executivo e na faixa leading (Pacote I — uma métrica, um lugar).

---

## Regra de ouro — FE

| Item | Valor |
|------|-------|
| Versão | **v1.8.7** (`mk-version.js` = `sw.js`) |
| URL teste | https://ribocg-a11y.github.io/movikids/?force=1.8.7 |
| Cache bust | `index.html` — todos os `?v=1.8.7` |
| Commit v1.8.6 | `4d74a07` — ticket médio removido da linha KPI |
| Commit v1.8.7 | (este pacote) — fat mês + resultado → locações + extras |

**Regra 14:** `.\scripts\check-operacao-livre.ps1` antes de push (altera `index.html`).

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\check-operacao-livre.ps1
.\scripts\pre-push-check.ps1
git push origin main
```

---

## Layout canônico (Dashboard admin)

| Faixa | Métricas |
|-------|----------|
| **Cockpit** `#mk-exec-cockpit` | Fat mês, margem, resultado, payback, ocupação |
| **Leading** `#mk-leading-row` | Ticket médio, R$/h, custo/loc, break-even |
| **KPI row** `#new-kpi-row` | Ano · Locações · Custos · Extras · Caixa hoje |

---

## Arquivos alterados

| Versão | Arquivo | Mudança |
|--------|---------|---------|
| v1.8.6 | `index.html` | Card inferior → Custos do mês (ticket médio só em leading) |
| v1.8.7 | `index.html` | KPI row: Locações + Extras (remove fat mês + resultado duplicados) |
| v1.8.7 | `mk-admin.js` | `renderDashboardCore_` popula `nk-nloc`, `nk-extmes` |
| v1.8.6–7 | `mk-version.js` / `sw.js` | **1.8.6** → **1.8.7** |

**Não alterou:** GAS, `mk-api.js`, balcão, Home operadores.

---

## Homologação

| # | Check |
|---|-------|
| 1 | PC admin Dashboard — cockpit + leading + KPI row **sem métrica repetida** |
| 2 | Valores coerentes (fat mês só no cockpit; ticket médio só no leading) |
| 3 | Tablet Home F0 ok `?force=1.8.7` |

---

## Referências

- Mapa métricas: `MAPA_CODIGO_ARQUITETURA.md` §10  
- Perf base: `DEPLOY_FE_v1.8.5_DASHBOARD_PERF.md`  
- FASE 8 (próxima): `FASE_8_ALERTAS_SEMAFOROS.md`
