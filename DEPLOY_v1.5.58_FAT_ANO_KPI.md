# Deploy GAS v1.5.58 — KPI faturamento do ano (Dashboard)

## Regra de ouro

**v1.5.58 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Como colar:** Explorer → cole o caminho na barra → Enter → duplo clique → Ctrl+A → Ctrl+C → colar em **Código.gs** no editor → **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão**. **Nunca** `clasp deploy` nem novo Deploy ID.

### Links diretos GAS

| O quê | Link |
|--------|------|
| **Editor Apps Script** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Web app (exec)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec |
| **Ping (deve retornar v1.5.58 após deploy)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **App (FE v1.7.53+)** | https://ribocg-a11y.github.io/movikids/?force=1.7.53 |

**URL morta (não usar):** `AKfycbzc...` → 404

---

## O que muda

- `buscarKPIsAdmin` retorna **`fatAno`** e **`nAno`**: faturamento acumulado de **janeiro até o mês selecionado** no ano (locações encerradas).
- Frontend **v1.7.53** já exibe o 5º KPI **“Faturamento do ano”** no Dashboard (roxo, primeiro card).

## O que NÃO muda

- LOCACOES, timer, caixa, auth, portal, import RESPONSAVEIS.
- **Novo Deploy ID** — proibido.

## Ordem

1. Colar GAS v1.5.58 no Apps Script (mesmo projeto).
2. Salvar → Implantar nova versão no **mesmo** Deploy ID.
3. Abrir **Ping** — deve retornar `"versao":"v1.5.58"`.
4. No app: **Dashboard** → primeiro KPI “Faturamento do ano” com valor (ex.: acum. jan–junho/2026).

## Teste rápido (admin logado no tablet/navegador)

Abra o Dashboard com mês **Junho/2026**. O card roxo deve mostrar o total jan–jun, não “—”.
