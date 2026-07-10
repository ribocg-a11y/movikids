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
2. [`docs/ativos/BASELINE_CODIGO_P0.md`](docs/ativos/BASELINE_CODIGO_P0.md) — **zonas congeladas — não mexer**
3. [`docs/ativos/PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`](docs/ativos/PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md) — **ciclo ativo Sprint D**
4. [`docs/ativos/PLANEJAMENTO_ONE_UI_2026-06.md`](docs/ativos/PLANEJAMENTO_ONE_UI_2026-06.md) — One UI fechado (referência)
5. [`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`](docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md) — **antes de qualquer tela**
6. [`docs/ativos/ESTADO_ATUAL.md`](docs/ativos/ESTADO_ATUAL.md) · [`DEPLOY_ATUAL.md`](docs/ativos/DEPLOY_ATUAL.md)
7. [`docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md`](docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md)
8. [`docs/ativos/ROTEIRO_AGENTE_OBRIGATORIO.md`](docs/ativos/ROTEIRO_AGENTE_OBRIGATORIO.md) — **ordem fixa commit/push/verify**

Índice: [`docs/INDICE.md`](docs/INDICE.md)

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.9** | https://ribocg-a11y.github.io/movikids/?force=1.9.9 |
| Gestão Pessoas | **v1.9.9** | `gestao-pessoas.html?force=1.9.9` |
| GAS | **v1.5.173** | ping Web **v1.5.173** ✅ |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |
| Deploy ID | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

**GAS raw (colar Editor — I76):** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Roteiro agente (obrigatório):** `docs/ativos/ROTEIRO_AGENTE_OBRIGATORIO.md`

**GAS canônico:**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

## Estado do projeto (09/07/2026)

- **FASE 0–15 + 15b:** ✅ prod
- **FASE 14 mini-DRE:** ✅ prod
- **FASE 16–17:** ✅ visual One UI **v1.9.9** · assinatura FASE 17 pendente Ops
- **Homolog tablet:** ✅ 23/06 · smoke **v1.9.9** pendente (D4)
- **Planilha:** ✅ 23/23 · **I68 VT** ✅ · **I75 Julia RH** ✅
- **Travas I24:** ✅ `guard-i24-publicacao` + `encerramento-sessao`
- **Próximo:** Sprint D2–D4 — assinar FASE 17 · smoke tablet v1.9.9 · validar GP + gráfico Dashboard

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
