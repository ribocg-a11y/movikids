# Deploy GAS v1.5.71 — B2 `kpiMes`

## Regra de ouro

**v1.5.71 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Como colar:** Explorer → caminho acima → Ctrl+A → Ctrl+C → **Código.gs** no editor → **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão → Implantar**. **Nunca** `clasp deploy`.

| Link | URL |
|--------|------|
| **Editor** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |

**Deploy ID:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda

| Camada | Versão | Entrega |
|--------|--------|---------|
| **GAS** | v1.5.71 | `buildKpiMesPayload_` + action `kpiMes`; `buscarKPIsAdmin` = alias |
| **FE** | v1.7.93 | Dashboard → `kpiMes`; Hub/Sistema → só `resumoDia` (leve) |

Inclui **v1.5.70** (`resumoDia`) se ainda não publicou — use o mesmo `.gs`.

## Teste após Nova versão Web

1. Ping → `v1.5.71`
2. `.\scripts\testes\TESTE_KPI_MES_READONLY.ps1`
3. `.\scripts\testes\TESTE_RESUMO_DIA_READONLY.ps1`
4. Tablet `?force=1.7.93` → Hub abre rápido; **Dashboard** carrega gráficos
