# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Modelo operacional:** o sócio/dev trabalha no **computador** (Cursor, deploy, testes). O **tablet fica no balcão** com os operadores. Ver `HANDOFF_NOVO_CHAT.md` § Modelo operacional.

**Ciclo ativo (27/06/2026):** **Sprint D pós One UI** — `docs/ativos/PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`

**Repo neste PC:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`

## Mensagem mínima do usuário

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

**Para ciclo ativo:**

> *Continuar MOVI KIDS — Sprint D: `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md` → **D1** homolog admin v1.9.2.*

## Antes de qualquer trabalho

Leia **nesta ordem**:

1. [`docs/ativos/HANDOFF_NOVO_CHAT.md`](docs/ativos/HANDOFF_NOVO_CHAT.md)
2. [`docs/ativos/PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`](docs/ativos/PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md) — **ciclo ativo Sprint D**
3. [`docs/ativos/PLANEJAMENTO_ONE_UI_2026-06.md`](docs/ativos/PLANEJAMENTO_ONE_UI_2026-06.md) — One UI fechado (referência)
4. [`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`](docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md) — **antes de qualquer tela**
5. [`docs/ativos/ESTADO_ATUAL.md`](docs/ativos/ESTADO_ATUAL.md) · [`DEPLOY_ATUAL.md`](docs/ativos/DEPLOY_ATUAL.md)
6. [`docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md`](docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md)
7. [`docs/ativos/ROTEIRO_AGENTE_OBRIGATORIO.md`](docs/ativos/ROTEIRO_AGENTE_OBRIGATORIO.md) — **ordem fixa commit/push/verify**

Índice: [`docs/INDICE.md`](docs/INDICE.md)

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.26** | https://ribocg-a11y.github.io/movikids/?force=1.9.26 |
| Gestão Pessoas | **v1.9.26** | `gestao-pessoas.html?force=1.9.26` |
| GAS repo | **v1.5.185** | ping Web **v1.5.182** — Nova versão pendente |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |
| Deploy ID | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

**GAS raw (colar Editor — I76):** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Roteiro agente (obrigatório):** `docs/ativos/ROTEIRO_AGENTE_OBRIGATORIO.md`

**GAS canônico:**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

## Estado do projeto (10/07/2026)

- **FASE 0–17:** ✅ prod visual One UI **v1.9.26**
- **I87–I91:** ✅ cronômetro/cache/UI pós-salvar (FE v1.9.26)
- **I92–I93:** ✅ repo GAS v1.5.185 — **Nova versão Web pendente**
- **10 testes validação:** ✅ T1–T10 OK (10/07) · doc `INCIDENTE_SESSAO_2026-07-10_I87_I95.md`
- **Próximo:** Nova versão Web GAS · anular loc teste · smoke tablet v1.9.26

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
