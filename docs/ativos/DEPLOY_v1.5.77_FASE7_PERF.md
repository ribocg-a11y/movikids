# Deploy GAS v1.5.77 — FASE 7 performance (resumoDia leve)

**Inclui:** v1.5.75 cockpit + v1.5.76 leading · **FE pareado v1.8.4**

## Regra de ouro

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\deploy-gas.ps1
```

**Nova versão Web** no Deploy ID `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` — nunca `clasp deploy`.

| Link | URL |
|------|-----|
| **Editor** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **FE** | https://ribocg-a11y.github.io/movikids/?force=1.8.4 |

## O que muda

| Camada | Correção |
|--------|----------|
| **GAS v1.5.77** | `resumoDia` usa `calcLeadingDiaPatch_` — **não** chama `buildKpiMesPayload_` inteiro |
| **GAS** | `ping` alinhado à versão real (estava preso em v1.5.74) |
| **FE v1.8.4** | Locks separados hub vs dashboard; fila se troca de mês durante load; `kpiMes` sem `resumoDia` paralelo |

## Testes

Ping → **v1.5.77**. Dashboard admin deve carregar em ~5–8s (não ficar em "Calculando..." eterno).

```powershell
.\scripts\testes\TESTE_FASE7_LEADING_READONLY.ps1
.\scripts\testes\TESTE_FASE6_COCKPIT_READONLY.ps1
```
