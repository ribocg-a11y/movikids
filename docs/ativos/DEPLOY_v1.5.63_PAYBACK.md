# Deploy GAS v1.5.63 — Payback (correções + projeção)

## Regra de ouro

**v1.5.63 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Como colar:** Explorer → caminho acima → duplo clique → Ctrl+A → Ctrl+C → **Código.gs** → **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão**.

### Links

| O quê | Link |
|--------|------|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping (v1.5.63)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **Planilha INVESTIMENTO** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| **App FE v1.7.64+** | https://ribocg-a11y.github.io/movikids/?force=1.7.64 |

Histórico payback base: `../arquivo/deploy/DEPLOY_v1.5.61_PAYBACK.md` · Memorial: `MEMORIAL_PAYBACK_INVESTIMENTO.md`

---

## O que muda nesta versão

| Versão | Correção / feature |
|--------|-------------------|
| **v1.5.62** | `parseMesAnoPayback_` — B4 `01/05/2026` (data Sheets) lida como **05/2026**, não ano 5 |
| **v1.5.63** | `enrichPaybackProjecao_` — previsão payback usa **`projecaoRes`** (ritmo dos dias com movimento) |
| **FE v1.7.64** | UI: "Payback prev." + data + nota lucro operacional vs investimento |

## O que NÃO muda

- LOCACOES, auth, portal, CTO, KPIs, SMS, Deploy ID.

## Teste após deploy

1. Ping → `"versao":"v1.5.63"`
2. Dashboard admin → painel roxo Payback:
   - **Investido** ≈ valor aba INVESTIMENTO
   - **Payback prev.** ≈ poucos meses (não ~29) se ritmo atual se mantiver
   - Nota: "Projeção payback: R$ …/mês (N dias com movimento → mês cheio)"
3. B4 planilha: aceita `01/05/2026` ou `05/2026`
