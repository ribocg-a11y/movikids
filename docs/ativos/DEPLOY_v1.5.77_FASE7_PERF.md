# Deploy GAS v1.5.77 — FASE 7 performance (resumoDia leve)

**Inclui:** v1.5.75 cockpit + v1.5.76 leading · **FE pareado v1.8.4**  
**Complemento perf Dashboard:** **v1.5.78** + FE **v1.8.5** — ver `DEPLOY_v1.5.78_FASE7_KPI_PERF.md`

---

## Regra de ouro

**Arquivo canônico no PC (copiar deste arquivo — header v1.5.77):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Opção A — clasp (recomendado):**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\deploy-gas.ps1
```

**Opção B — colar manualmente** no [Editor Apps Script](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit)

**Publicar:** **Implantar → Gerenciar implantações → Nova versão** (Deploy ID `AKfycbwakQ...`) — **nunca** `clasp deploy`.

| Link | URL |
|------|-----|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **FE** | https://ribocg-a11y.github.io/movikids/?force=1.8.4 |
| **Planilha** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |

---

## O que muda (v1.5.77 + FE v1.8.4)

| Camada | Correção |
|--------|----------|
| **GAS v1.5.77** | `resumoDia` usa `calcLeadingDiaPatch_` — **não** chama `buildKpiMesPayload_` inteiro |
| **GAS** | `ping_()` alinhado à versão real |
| **FE v1.8.4** | Locks `_kpiHubInFlight` / `_kpiDashInFlight`; Dashboard só `kpiMes` (sem `resumoDia` paralelo) |

**Incidente:** **I23** — mutex KPI + resumoDia pesado.

**Limitação conhecida:** `kpiMes` ainda lento (~6s+) — resolvido em **v1.5.78** + **v1.8.5**.

---

## Frontend

**Regra 14:** `check-operacao-livre.ps1` antes de push FE.

Arquivos: `mk-admin.js`, `mk-version.js`, `sw.js`, `index.html`, `mk-app.css`

---

## Testes

Ping → **v1.5.77**.

```powershell
.\scripts\testes\TESTE_FASE7_LEADING_READONLY.ps1
.\scripts\testes\TESTE_FASE6_COCKPIT_READONLY.ps1
.\scripts\testes\TESTE_KPI_MES_READONLY.ps1
```

---

## Critério de pronto

- [ ] Nova versão Web **v1.5.77**  
- [ ] Ping ok  
- [ ] FE **v1.8.4**  
- [ ] Dashboard não trava eterno em "Calculando..." (I23 mutex)  
- [ ] **Recomendado:** evoluir para **v1.5.78** + **v1.8.5** para perf completa  

---

## Referências

- I23: `../arquivo/incidentes/INCIDENTE_I23_DASHBOARD_LENTO_TRAVADO_2026-06-09.md`  
- Perf completa: `DEPLOY_v1.5.78_FASE7_KPI_PERF.md`  
- FASE 6–7 base: `DEPLOY_v1.5.76_FASE7_LEADING.md`
