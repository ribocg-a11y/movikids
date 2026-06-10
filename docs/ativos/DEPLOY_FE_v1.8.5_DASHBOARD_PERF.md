# Deploy FE v1.8.5 — Dashboard performance (complemento I23)

**GAS pareado:** **v1.5.78** — ver `DEPLOY_v1.5.78_FASE7_KPI_PERF.md`  
**Problema:** Dashboard com KPIs em `"..."` e CTO em `"Calculando..."` por 6–15s+.

---

## Regra de ouro — FE

| Item | Valor |
|------|-------|
| Versão | **v1.8.5** (`mk-version.js` = `sw.js`) |
| URL teste | https://ribocg-a11y.github.io/movikids/?force=1.8.5 |
| Cache bust | `index.html` — todos os `?v=1.8.5` |

**Regra 14:** `.\scripts\check-operacao-livre.ps1` antes de push (altera `index.html`).

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\check-operacao-livre.ps1
.\scripts\pre-push-check.ps1
git push origin main
```

---

## Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `mk-admin.js` | Cache SWR; `kpiMes` lite→full; `kpiDashApply_`; `renderChartsBody_` |
| `mk-app.css` | Indicador `.mk-dash-loading` |
| `mk-version.js` / `sw.js` | **1.8.5** |
| `index.html` | Cache-bust **1.8.5** |

**Não alterou:** `mk-api.js`, `mk-auth.js`, `mk-sync.js`, `mk-home.js`, balcão.

---

## Comportamento esperado

1. **Cache hit** — Dashboard preenche KPIs na hora (dados &lt;5 min)  
2. **Cold start** — `lite=1` preenche topo em ~2–4s; request completo traz operador/cancelamentos  
3. **Timeout** — 45s (antes 25s)  

---

## Homologação

| # | Check |
|---|-------|
| 1 | PC admin Dashboard — KPIs/CTO &lt;5s |
| 2 | Reabrir Dashboard — instantâneo + “atualizando…” |
| 3 | Tablet Home F0 ok |

---

## Referências

- GAS: `DEPLOY_v1.5.78_FASE7_KPI_PERF.md`  
- I23: `../arquivo/incidentes/INCIDENTE_I23_DASHBOARD_LENTO_TRAVADO_2026-06-09.md`
