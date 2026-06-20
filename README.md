# MOVI KIDS

Sistema operacional para locações — balcão (tablet), portal do responsável e painel admin.

## Por que a raiz do GitHub tem ~50 arquivos?

**GitHub Pages publica o app da raiz** — não dá para mover `mk-*.js` para subpastas sem quebrar o tablet.

| Grupo | Qtd. | Exemplos | Pode mover? |
|-------|------|----------|-------------|
| **Módulos FE (Pacote M)** | ~25 | `mk-nova.js`, `mk-sync.js`, `mk-auth.js`… | **Não** — URLs do Pages |
| **HTML produção** | 5 | `index.html`, `gestao-pessoas.html`, `acompanhar.html` | **Não** |
| **CSS + boot** | 6 | `mk-app.css`, `sw.js`, `mk-version.js`, `manifest.json` | **Não** |
| **Mock / redirect** | 3 | `ponto-mockup.html`, stubs finos | Parcial |
| **GAS + config** | 2 | `MOVIKIDS_Code_...gs`, `gas-endpoint.json` | GAS: nome fixo |
| **Docs + atalhos PC** | 4 | `README.md`, `AGENTS.md`, `protocolo-mestre.ps1` | Atalhos opcionais |
| **Ícones PWA** | — | `assets/icon-*.png` | ✅ movidos para `assets/` |

Detalhe: [docs/ativos/ESTRUTURA_REPO.md](docs/ativos/ESTRUTURA_REPO.md) · mockups: [docs/prototipos/README.md](docs/prototipos/README.md)

## Planejamento (09/06/2026)

**Planejamento:** [PLANEJAMENTO_ATUAL_2026-06.md](docs/ativos/PLANEJAMENTO_ATUAL_2026-06.md) · [PLANO_PRIORIDADES](docs/ativos/PLANO_PRIORIDADES_2026-06.md)

## Produção (20/06/2026 — FE v1.8.71 · GAS repo v1.5.111)

| Camada | Versão repo | Produção alvo |
|--------|-------------|---------------|
| Frontend | **v1.8.71** | https://ribocg-a11y.github.io/movikids/?force=1.8.71 |
| Gestão Pessoas | **v1.8.71** | `gestao-pessoas.html?force=1.8.71` |
| Apps Script | **v1.5.111** (repo) · ping **v1.5.107** | Publicar Nova versão Web para alinhar ping |
| Design System | **v1.0** | [DESIGN_SYSTEM_MOVIKIDS.md](docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md) |
| Aba FOLHA | memorial B68 | OK (I25) · B68 ~5269,96 |

## Novo chat / agente Cursor

1. Abra o Cursor **nesta pasta** — ver [`HANDOFF_NOVO_CHAT.md`](docs/ativos/HANDOFF_NOVO_CHAT.md) § *Como abrir o Cursor nesta pasta*
2. Novo chat — digite só: *“Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.”*

Detalhes: [docs/ativos/HANDOFF_NOVO_CHAT.md](docs/ativos/HANDOFF_NOVO_CHAT.md) · [AGENTS.md](AGENTS.md)

## Estrutura do repositório

A raiz parece longa porque **GitHub Pages** publica o app da raiz (`index.html`, `mk-*.js`, `sw.js`). Documentação e testes ficam em pastas.

| O quê | Onde |
|-------|------|
| **Por que tantos arquivos na raiz?** | [docs/ativos/ESTRUTURA_REPO.md](docs/ativos/ESTRUTURA_REPO.md) |
| **Deploy atual (versões)** | [docs/ativos/DEPLOY_ATUAL.md](docs/ativos/DEPLOY_ATUAL.md) |
| **Mapa de fases (15 vs 16)** | [docs/ativos/MAPA_FASES.md](docs/ativos/MAPA_FASES.md) |

## Documentação

Toda a documentação de processo está em **`docs/`** — não na raiz do GitHub (exceto `README.md` e `AGENTS.md`).

| Comece por | Caminho |
|------------|---------|
| **Handoff (novo chat)** | [docs/ativos/HANDOFF_NOVO_CHAT.md](docs/ativos/HANDOFF_NOVO_CHAT.md) |
| **Deploy atual** | [docs/ativos/DEPLOY_ATUAL.md](docs/ativos/DEPLOY_ATUAL.md) |
| **Prioridades e fases** | [docs/ativos/PLANO_PRIORIDADES_2026-06.md](docs/ativos/PLANO_PRIORIDADES_2026-06.md) |
| **Estado e versões** | [docs/ativos/ESTADO_ATUAL.md](docs/ativos/ESTADO_ATUAL.md) |
| **Acessos (agente vs você)** | [docs/ativos/ACESSOS_E_AUTORIZACOES.md](docs/ativos/ACESSOS_E_AUTORIZACOES.md) |
| **Mapa do código** | [docs/ativos/MAPA_CODIGO_ARQUITETURA.md](docs/ativos/MAPA_CODIGO_ARQUITETURA.md) |
| **Índice completo** | [docs/INDICE.md](docs/INDICE.md) |

**Planilha Google (OAuth):** `C:\Users\riboc\Projects\google-drive-sheets-auth` — token em `~/.config/google-api/`

## Publicar com segurança

1. Ler [docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md](docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md)
2. Rodar `.\scripts\pre-push-check.ps1`
3. `git push` (GitHub Pages) → `verify-publish-complete.ps1`
4. GAS: colar `.gs` canônico → **Nova versão** no mesmo Deploy ID — ver [DEPLOY_ATUAL.md](docs/ativos/DEPLOY_ATUAL.md)

## Código canônico

- **GAS:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (único `.gs` na raiz)  
  Caminho PC: `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`
- **GAS legado:** `arquivo-historico/` (não implantar)
- **Testes:** `scripts/testes/`
- **Versão FE:** `mk-version.js` + `sw.js`
- **Módulos FE:** `mk-globals.js`, `mk-core.js`, `mk-api.js` … `mk-boot.js` (Pacote M fechado)
- **CSS app:** `mk-app.css` + `mk-design.css` (Pacote M.1)
- **Testes tablet:** `scripts/testes/TESTE_TABLET_F5_F7_F10_F11.ps1`
