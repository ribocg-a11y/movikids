# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Modelo operacional:** o sócio/dev trabalha no **computador** (Cursor, deploy, testes). O **tablet fica no balcão** com os operadores. Ver `HANDOFF_NOVO_CHAT.md` § Modelo operacional.

**Ciclo ativo (26/06/2026):** **Premium One UI** — `docs/ativos/PLANEJAMENTO_ONE_UI_2026-06.md`

**Repo neste PC:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`

## Mensagem mínima do usuário

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

**Para ciclo UI:**

> *Continuar MOVI KIDS — ciclo One UI. Ler `PLANEJAMENTO_ONE_UI_2026-06.md` e começar por **UI-A1**.*

## Antes de qualquer trabalho

Leia **nesta ordem**:

1. [`docs/ativos/HANDOFF_NOVO_CHAT.md`](docs/ativos/HANDOFF_NOVO_CHAT.md)
2. [`docs/ativos/PLANEJAMENTO_ONE_UI_2026-06.md`](docs/ativos/PLANEJAMENTO_ONE_UI_2026-06.md) — **sprint UI ativo**
3. [`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`](docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md) — **antes de qualquer tela**
4. [`docs/ativos/ESTADO_ATUAL.md`](docs/ativos/ESTADO_ATUAL.md) · [`DEPLOY_ATUAL.md`](docs/ativos/DEPLOY_ATUAL.md)
5. [`docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md`](docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md)

Índice: [`docs/INDICE.md`](docs/INDICE.md)

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.8.122** | https://ribocg-a11y.github.io/movikids/?force=1.8.122 |
| Gestão Pessoas | **v1.8.122** | `gestao-pessoas.html?force=1.8.122` |
| GAS | repo **v1.5.167** · ping **v1.5.165** | Nova versão Web I67 VT pendente |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |
| Deploy ID | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

**GAS canônico:**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

## Estado do projeto (26/06/2026)

- **FASE 0–15 + 15b:** ✅ prod
- **FASE 14 mini-DRE:** ✅ prod
- **FASE 16–17:** 🟡 ~92–95% — **Sprint One UI** fecha visual
- **Homolog tablet:** ✅ 23/06 (I43, I42, I47, Gestor)
- **Planilha:** ✅ 23/23 auditoria célula
- **Próximo dev:** **UI-A1** sidebar admin mobile → FE alvo **v1.9.0**

## Regras P0

- Escritas GAS no browser = **GET** (I15)
- GAS: **Nova versão** no mesmo Deploy ID — nunca `clasp deploy`
- Tablet só se mudar `api()`, auth ou cronômetro
- F4 (WhatsApp) e F9 (supervisor) **pausados**
- Encerrar toda resposta com **Versões (encerramento)** + Regra 16

## "Atualize tudo"

[`docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md`](docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md)

## Ao encerrar sessão

Atualizar `HANDOFF_NOVO_CHAT.md` se mudou produção ou próximo passo.
