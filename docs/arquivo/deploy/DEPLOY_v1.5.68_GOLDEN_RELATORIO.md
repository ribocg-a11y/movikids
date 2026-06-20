# Deploy GAS v1.5.68 — Relatório Golden (sem custos ADM)

## Regra de ouro

**v1.5.68 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Como colar:** Explorer → cole o caminho na barra → Enter → duplo clique → Ctrl+A → Ctrl+C → colar em **Código.gs** no editor → **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão → Implantar**. **Nunca** `clasp deploy` nem novo Deploy ID.

### Links

| O quê | Link |
|--------|------|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Web app (exec)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec |
| **Ping (deve retornar v1.5.68 após deploy)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **Decisões FASE 2** | `DECISAO_PAYBACK_FASE2_2026-06.md` |

**Deploy ID (único — nunca criar outro):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**Ping em produção agora:** `v1.5.67` — falta **Nova versão** para `v1.5.68`.

---

## O que muda nesta versão

| Item | Detalhe |
|------|---------|
| **Relatório email/PDF Golden** | `_gerarHtmlRelatorio_(refDate, 'golden')` — só movimentação + CTO contratual |
| **Removido do Golden** | Custos CUSTOS, lucro/resultado, Pacote F, payback |
| **Admin interno** | Aba Análise (`criarAnalise_`) inalterada — só gestão |

## O que NÃO muda

- LOCACOES, auth, portal, cronômetro, KPIs, SMS, Deploy ID.

## Teste após deploy

1. Abrir **Ping** — deve retornar `"versao":"v1.5.68"`.
2. Admin → preview relatório mensal — **sem** tabela de custos nem lucro.
3. Email Golden (quando disparar) — mesmo HTML enxuto.
