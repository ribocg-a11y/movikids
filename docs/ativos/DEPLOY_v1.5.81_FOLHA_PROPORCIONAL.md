# Deploy GAS v1.5.81 — Folha proporcional + ping alinhado

**Data:** 10/06/2026  
**FE pareado:** **v1.8.14** — `DEPLOY_FE_v1.8.12_DASHBOARD_NARRATIVO.md`

| Item | Valor |
|------|-------|
| Versão GAS | **v1.5.81** |
| Ping prod. | `versao: v1.5.81` |
| Cache kpiMes | `kpiMes81_*` |

---

## O que mudou

- **`resultadoComFolha`** no parcial usa **folha proporcional** (`folha × diasOperando / diasMes`) — mesma base que lucro sem folha
- Novos campos em `viabilidadeContratacao`: `folhaProRata`, `projecaoResSemFolha`, `margemProjSemFolha`
- **`ping_()`** reporta **v1.5.81** (antes header 1.5.81 mas ping dizia 1.5.80)

---

## Deploy

1. `.\scripts\deploy-gas.ps1`
2. Apps Script → **Implantar → Nova versão** (Deploy ID `AKfycbwakQ...`)
3. Ping: `.../exec?action=ping` → **v1.5.81**
4. `.\scripts\testes\TESTE_FASE9_FOLHA_READONLY.ps1`

---

## Validação (jun/2026, 10 dias)

| Campo | Esperado |
|-------|----------|
| `folhaProRata` | ~R$ 1.757 |
| `resultadoComFolha` | ~R$ 2.249 (não negativo por folha integral) |
| `projecaoResComFolha` | ~R$ 8.380 |

**Commit repo:** `3f5aeea` (ping) · produção confirmada 10/06/2026 17:37
