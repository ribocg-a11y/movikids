# Deploy FE v1.8.9 — FASE 8 Alertas e semáforos

**GAS pareado:** **v1.5.79** — ver `DEPLOY_v1.5.79_FASE8_ALERTAS.md`

---

## Regra de ouro — FE

| Item | Valor |
|------|-------|
| Versão | **v1.8.9** (`mk-version.js` = `sw.js`) |
| URL teste | https://ribocg-a11y.github.io/movikids/?force=1.8.9 |
| Cache bust | `index.html` — todos os `?v=1.8.9` |

**Regra 14:** `.\scripts\check-operacao-livre.ps1` antes de push.

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
| `index.html` | `#mk-alert-strip`, modal, badge sidebar Dashboard |
| `mk-admin.js` | `renderAlertStrip_`, semáforos, dismiss sessionStorage |
| `mk-app.css` | Estilos alertas + semáforo cockpit/payback |
| `mk-version.js` / `sw.js` | **1.8.9** |

**Não alterou:** balcão, `mk-home.js`, `mk-api.js`.

---

## Comportamento

- `#nk-alerta` (FASE 5) = faturamento **hoje** — mantido  
- `#mk-alert-strip` = alertas **mês/gestão** — só admin Dashboard  
- Dismiss por alerta: `sessionStorage` `mk_alert_dismiss_{codigo}_{mes}_{ano}`

---

## Homologação

| # | Check |
|---|-------|
| 1 | GAS v1.5.79 publicado — `kpiMes.alertas` no JSON |
| 2 | Dashboard admin — strip + badge + modal |
| 3 | Tablet Home F0 ok |

---

## Referências

- GAS: `DEPLOY_v1.5.79_FASE8_ALERTAS.md`  
- Pacote I KPI: `DEPLOY_FE_v1.8.7_PACOTE_I_KPI_DEDUP.md`
