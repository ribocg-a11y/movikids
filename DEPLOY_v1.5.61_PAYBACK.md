# Deploy GAS v1.5.61 — Payback (aba INVESTIMENTO + Dashboard)

## Regra de ouro

**v1.5.61 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Como colar:** Explorer → cole o caminho na barra → Enter → duplo clique → Ctrl+A → Ctrl+C → colar em **Código.gs** no editor → **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão**. **Nunca** `clasp deploy` nem novo Deploy ID.

### Links diretos GAS

| O quê | Link |
|--------|------|
| **Editor Apps Script** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Web app (exec)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec |
| **Ping (deve retornar v1.5.61 após deploy)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **Planilha — aba INVESTIMENTO** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| **App (FE v1.7.63+)** | https://ribocg-a11y.github.io/movikids/?force=1.7.63 |

**URL morta (não usar):** `AKfycbzc...` → 404

---

## O que muda

- **v1.5.60:** `lerInvestimento_()` lê aba **INVESTIMENTO** na planilha.
- **v1.5.61:** `calcPaybackAcumulado_()` + `buscarKPIsAdmin` retorna **`payback`** e **`investimento`**.
- Frontend **v1.7.63:** painel **Payback do investimento** (roxo) abaixo do CTO no Dashboard.

Memorial de fórmulas: `MEMORIAL_PAYBACK_INVESTIMENTO.md`

## O que NÃO muda

- LOCACOES, timer, caixa, auth, portal, CTO, KPIs existentes.
- **Novo Deploy ID** — proibido.

## Ordem

1. Preencher aba **INVESTIMENTO** na planilha (coluna D = valores).
2. Colar GAS **v1.5.61** no Apps Script (mesmo projeto).
3. Salvar → Implantar nova versão no **mesmo** Deploy ID `AKfycbwakQ...`.
4. Abrir **Ping** — deve retornar `"versao":"v1.5.61"`.
5. App **Dashboard** admin → bloco roxo **Payback** (Investido / Recuperado / Falta / %).

## Teste rápido

Ping JSON deve incluir após login admin em `buscarKPIsAdmin`: `payback.investimentoTotal`, `payback.resultadoAcumulado`, `payback.pctRecuperado`.
