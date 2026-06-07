# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet), portal do responsável, painel admin.

## Antes de qualquer trabalho

Leia **nesta ordem**:

1. [`docs/ativos/HANDOFF_NOVO_CHAT.md`](docs/ativos/HANDOFF_NOVO_CHAT.md) — contexto, produção, próximo passo
2. [`docs/ativos/PLANO_PRIORIDADES_2026-06.md`](docs/ativos/PLANO_PRIORIDADES_2026-06.md) — o que fazer agora
3. [`docs/ativos/ESTADO_ATUAL.md`](docs/ativos/ESTADO_ATUAL.md) — versões e links
4. [`docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md`](docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md) — antes de publicar

Índice completo: [`docs/INDICE.md`](docs/INDICE.md)

## Produção atual

| Camada | Versão |
|--------|--------|
| Frontend | **v1.7.64** |
| GAS | **v1.5.63** |
| Deploy ID | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |

Fonte de verdade: `mk-version.js`, header do `.gs`, ping GAS.

## Código canônico

- **GAS:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (único `.gs` na raiz)
- **Legado:** `arquivo-historico/` — não implantar
- **Testes:** `scripts/testes/`
- **CI:** `scripts/pre-push-check.ps1` — rodar antes de push

## Regras P0

- Escritas GAS no browser = **GET** (incidente I15 — nunca POST JSON no tablet)
- GAS: **Nova versão** no mesmo Deploy ID — nunca `clasp deploy`
- Tablet físico obrigatório após mudança em `api()` ou auth
- F4 (WhatsApp auto) e F9 (supervisor) **pausados**

## Não usar

- `docs/arquivo/planos/HANDOFF_NOVO_CHAT_2026-06-05.md` — defasado
- `docs/arquivo/obsoleto/` — rollback/changelog antigos
- Arquivos em `arquivo-historico/` para deploy

## Ao encerrar sessão

Atualizar `HANDOFF_NOVO_CHAT.md`, checklist em `PLANO_PRIORIDADES`, e `ESTADO_ATUAL.md` se versões mudaram.
