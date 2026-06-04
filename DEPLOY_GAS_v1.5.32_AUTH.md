# Deploy GAS v1.5.32+ — Auth operadores + lançamento avulso

## Links diretos (use estes)

| O quê | Link |
|--------|------|
| **Planilha MOVIKIDS** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| **Editor Apps Script** | Na planilha: menu **Extensões → Apps Script** |
| **Testar se o GAS está no ar** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **App (GitHub Pages)** | https://ribocg-a11y.github.io/movikids/?force=1.7.11 |
| **Editor Apps Script (direto)** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |

No editor Apps Script: **Implantar → Gerenciar implantações → Editar** a implantação Web (**ID `AKfycbwakQ...`**) → **Nova versão** → Implantar. **Não** crie um deploy novo. **Nunca** use `clasp deploy`.

Após implantar, o `ping` deve mostrar `versao` **v1.5.41** (SMS gateway DJVJRL: ver `TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md`).

### Propriedades do script (SMS — producao)

| Propriedade | Valor |
|-------------|--------|
| `SMS_GATEWAY_USER` | `DJVJRL` |
| `SMS_GATEWAY_PASS` | `t4bh_q2x1favfo` |
| `SMS_GATEWAY_DEVICE_ID` | `wihWegHr4wXaVJQ1R-GZR` |

**Pós-incidente 04/06/2026:** `INCIDENTE_DEPLOY_E_EXTRAS_2026-06-04.md`, `INCIDENTE_AUTH_OPERADORES_2026-06-04.md`.

## Deploy seguro (PC)

```powershell
cd movikids-github
.\scripts\deploy-gas.ps1
```

O script: copia o `.gs` canônico → `gas/Code.gs` → valida `DEPLOY_ID` → `clasp push` → lembrete de **Nova versão** no painel.

## Arquivo canônico

`MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (header **v1.5.41**)

`const DEPLOY_ID` no arquivo deve ser **`AKfycbwakQ...`** (não `AKfycbzc...`).

## Novas actions (resumo)

| Action | Uso |
|--------|-----|
| `loginOperador` / `loginAdmin` | Auth balcão (ADM PIN **1416**) |
| `corrigirFinanceiroLocacaoAdmin` | Ajuste locação encerrada + `zerarExtra` |
| `liberarSessaoOperadorAdmin` | ADM libera trava de sessão |
| `encerrarLocacao` | Aceita `somentePlano=true` (sem extras — GAS instável) |

## Frontend

Publicar **v1.7.11** no GitHub (`git push`). Tablets: `?force=1.7.11`.

Ver também: `ESTADO_ATUAL.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`.
