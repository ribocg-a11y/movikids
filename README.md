# MOVI KIDS

Sistema operacional para locações — balcão (tablet), portal do responsável e painel admin.

## Produção (07/06/2026)

| Camada | Versão |
|--------|--------|
| Frontend | **v1.7.67** — https://ribocg-a11y.github.io/movikids/?force=1.7.67 |
| Apps Script | **v1.5.63** — ping `?action=ping` no deploy `AKfycbwakQ...` |

## Novo chat / agente Cursor

1. Abra o Cursor **nesta pasta** (`movikids-github`).
2. Novo chat — digite só: *“Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.”*

Detalhes: [docs/ativos/HANDOFF_NOVO_CHAT.md](docs/ativos/HANDOFF_NOVO_CHAT.md) · [AGENTS.md](AGENTS.md)

## Documentação

Toda a documentação está em **`docs/`**. Não use arquivos soltos na raiz (foram movidos em 07/06/2026).

| Comece por | Caminho |
|------------|---------|
| **Handoff (novo chat)** | [docs/ativos/HANDOFF_NOVO_CHAT.md](docs/ativos/HANDOFF_NOVO_CHAT.md) |
| **Prioridades e fases** | [docs/ativos/PLANO_PRIORIDADES_2026-06.md](docs/ativos/PLANO_PRIORIDADES_2026-06.md) |
| **Estado e versões** | [docs/ativos/ESTADO_ATUAL.md](docs/ativos/ESTADO_ATUAL.md) |
| **Acessos (agente vs você)** | [docs/ativos/ACESSOS_E_AUTORIZACOES.md](docs/ativos/ACESSOS_E_AUTORIZACOES.md) |
| **Mapa do código** | [docs/ativos/MAPA_CODIGO_ARQUITETURA.md](docs/ativos/MAPA_CODIGO_ARQUITETURA.md) |
| **Índice completo** | [docs/INDICE.md](docs/INDICE.md) |

**Planilha Google (OAuth):** `C:\Users\riboc\Projects\google-drive-sheets-auth` — token em `~/.config/google-api/`

## Publicar com segurança

1. Ler [docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md](docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md)
2. Rodar `.\scripts\pre-push-check.ps1`
3. `git push` (GitHub Pages)
4. GAS: colar `.gs` canônico → **Nova versão** no mesmo Deploy ID ([docs/ativos/DEPLOY_GAS_v1.5.32_AUTH.md](docs/ativos/DEPLOY_GAS_v1.5.32_AUTH.md))

## Código canônico

- **GAS:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (único `.gs` na raiz)
- **GAS legado:** `arquivo-historico/` (não implantar)
- **Testes:** `scripts/testes/`
- **Versão FE:** `mk-version.js`
- **CSS app:** `mk-app.css` + `mk-design.css` (Pacote M.1)
