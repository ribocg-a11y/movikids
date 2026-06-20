# Deploy GAS v1.5.79 — FASE 8 Alertas e semáforos

**FE pareado:** **v1.8.9** — ver `DEPLOY_FE_v1.8.9_FASE8_ALERTAS.md`  
**Depende de:** GAS **v1.5.78** + FE **v1.8.8** (Pacote I KPI) publicados

---

## Regra de ouro

**Arquivo canônico no PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Opção A — clasp:**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\deploy-gas.ps1
```

**Opção B — colar manualmente** no [Editor Apps Script](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit)

**Publicar:**

1. Implantar → Gerenciar implantações  
2. Editar Web (**Deploy ID `AKfycbwakQ...`**)  
3. **Nova versão** → Implantar  
4. **Nunca** `clasp deploy`

| Link | URL |
|------|-----|
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **FE teste** | https://ribocg-a11y.github.io/movikids/?force=1.8.9 |

**Deploy ID:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda (v1.5.79)

| Entrega | Detalhe |
|---------|---------|
| `buildAlertasGestao_` | Regras v1: margem, ocupação, cancel, payback, CTO mínimo, sem movimento |
| `movikidsSinalEmpresa_` | Semáforo ok/atencao/perigo (3 meses) |
| `kpiMes.alertas` | Array `{ nivel, codigo, titulo, mensagem, acionavel }` |
| `kpiMes.sinalEmpresa` | `{ nivel, label, motivo }` |
| Cache | Chave `kpiMes79_*` (invalida cache 78) |

**Não alterou:** balcão, Home operador, `resumoDia`, portal.

---

## Testes após Nova versão Web

Ping → `"versao": "v1.5.79"`.

```powershell
.\scripts\check-operacao-livre.ps1
.\scripts\testes\TESTE_FASE8_ALERTAS_READONLY.ps1
.\scripts\testes\TESTE_KPI_MES_READONLY.ps1
.\scripts\pre-push-check.ps1
```

**Validação visual (PC admin, após FE v1.8.9 no Pages):**

1. Dashboard → faixa **Alertas** sob cockpit (se regra disparar)  
2. Badge sidebar Dashboard (alertas vermelhos)  
3. Semáforo no badge cockpit + borda margem  
4. Operador na Home **não** vê `#mk-alert-strip`

**Ordem recomendada:** GAS v1.5.79 Nova versão Web → push FE v1.8.9 → `?force=1.8.9`

---

## Referências

- Plano: `FASE_8_ALERTAS_SEMAFOROS.md`  
- Base perf: `DEPLOY_v1.5.78_FASE7_KPI_PERF.md`
