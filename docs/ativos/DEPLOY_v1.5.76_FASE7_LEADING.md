# Deploy GAS v1.5.76 — FASE 7 Leading financeiros

## Regra de ouro

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\deploy-gas.ps1
```

**Nova versão Web** no Deploy ID `AKfycbwakQ...` — nunca `clasp deploy`.

| Link | URL |
|------|-----|
| **Editor** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **FE** | https://ribocg-a11y.github.io/movikids/?force=1.8.1 |

## O que muda

| Camada | Entrega |
|--------|---------|
| **GAS v1.5.76** | `leadingFinanceiro` em `kpiMes` (ticket, R$/h, custo/loc, break-even, sensibilidade) |
| **GAS** | `resumoDia.leadingDia` (meta break-even vs locações hoje) |
| **FE v1.8.1** | Dashboard — linha 4 leading KPIs + faixa sensibilidade |
| **FE** | Caixa — chip meta break-even do dia |

**Pareado:** FASE 6 cockpit (v1.5.75 + v1.8.0) incluído neste release FE.

## Testes

```powershell
.\scripts\testes\TESTE_FASE6_COCKPIT_READONLY.ps1
.\scripts\testes\TESTE_FASE7_LEADING_READONLY.ps1
```

Ping → **v1.5.76** após Nova versão Web.
