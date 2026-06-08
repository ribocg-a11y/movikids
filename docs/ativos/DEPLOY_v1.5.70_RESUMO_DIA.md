# Deploy GAS v1.5.70 — B1 `resumoDia`

## Regra de ouro

**v1.5.70 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Como colar:** Explorer → cole o caminho na barra → Enter → duplo clique → Ctrl+A → Ctrl+C → colar em **Código.gs** no editor → **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão → Implantar**. **Nunca** `clasp deploy` nem novo Deploy ID.

### Links

| O quê | Link |
|--------|------|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Web app (exec)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec |
| **Ping (meta v1.5.70)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **Teste resumoDia** | `?action=resumoDia&adminPin=1416&data=DD/MM/AAAA` |

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda

| Camada | Versão | Entrega |
|--------|--------|---------|
| **GAS** | v1.5.70 | `resumoDia` + `calcResumoDiaCore_`; `buscarKPIsAdmin` usa mesma fonte para `nHoje`/`fatHoje` |
| **FE** | v1.7.92 | Caixa e chip admin via `resumoDia` (`mk-admin.js`) |

## Teste após Nova versão Web

1. Ping → `"versao":"v1.5.70"`.
2. `.\scripts\testes\TESTE_RESUMO_DIA_READONLY.ps1` → paridade `n`/`fat` com KPI.
3. Tablet `?force=1.7.92` → **Caixa** e chip **Hoje** com mesma contagem.

**Ordem:** publicar GAS **antes** ou junto com push FE — Caixa v1.7.92 exige GAS v1.5.70.
