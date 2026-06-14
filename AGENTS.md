# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Modelo operacional:** o sócio/dev trabalha no **computador** (Cursor, deploy, testes). O **tablet fica no balcão** com os operadores — homologação real é lá, não no PC. Ver `HANDOFF_NOVO_CHAT.md` § Modelo operacional.

**Modo agente (máximo potencial):** mapear fluxo F0–F14 antes de codar; `pre-push-check` + resumo publicação; checklist tablet na loja; sem UI operacional ocultável sem pedido. Ver HANDOFF § Modo de operação e `.cursor/rules/handoff-movikids.mdc`.

**Repo neste PC:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`

## Mensagem mínima do usuário

Esta frase **basta** para retomar o projeto — não exija caminhos, anexos nem bloco longo:

> Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.

**O agente deve:** ler os 4 docs abaixo → resumir produção + próximo passo → só então trabalhar. Não perguntar "qual pasta?" se `AGENTS.md` ou `README.md` estiverem no workspace.

**Melhor experiência:** abrir o Cursor **nesta pasta** (`movikids-github`) antes do chat.

## Antes de qualquer trabalho

Leia **nesta ordem**:

1. [`docs/ativos/HANDOFF_NOVO_CHAT.md`](docs/ativos/HANDOFF_NOVO_CHAT.md) — contexto, produção, próximo passo
2. [`docs/ativos/PLANO_PRIORIDADES_2026-06.md`](docs/ativos/PLANO_PRIORIDADES_2026-06.md) — o que fazer agora
3. [`docs/ativos/ESTADO_ATUAL.md`](docs/ativos/ESTADO_ATUAL.md) — versões e links
4. [`docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md`](docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md) — antes de publicar
5. [`docs/ativos/ACESSOS_E_AUTORIZACOES.md`](docs/ativos/ACESSOS_E_AUTORIZACOES.md) — papéis, PIN admin, o que agente vs humano faz

Índice completo: [`docs/INDICE.md`](docs/INDICE.md)

## Agente vs você (resumo)

| Eu (agente) sozinho | Só com seu pedido | Só você |
|---------------------|-------------------|---------|
| Ler docs, editar código, `pre-push-check`, ping GAS, testes `.ps1` | `clasp push` | Nova versão Web GAS no editor |
| **`git commit` + `git push`** após mudanças FE/docs (automático) | Mudanças em `api()` / auth | Tablet balcão `?force=` |
| **`verify-publish-complete.ps1`** após todo push FE (Regra 8 / I24) | — | — |
| **Planilha** via `google-drive-sheets-auth` (OAuth) | Escritas destrutivas na planilha | Script Properties SMS, re-auth OAuth |
| Preparar deploy (sync + clasp push) | Limpar testes prod / corrigir financeiro GAS | — |

**Nunca:** `clasp deploy`, POST no browser, commit de segredos.

Detalhe completo: [`ACESSOS_E_AUTORIZACOES.md`](docs/ativos/ACESSOS_E_AUTORIZACOES.md) §7.

## Papéis no app (resumo)

| Papel | Entrada |
|-------|---------|
| Operador | Nome + PIN |
| Admin | PIN **1416** |
| Portal | Telefone |

## Produção atual

| Camada | Versão repo | Ping produção |
|--------|-------------|---------------|
| Frontend | **v1.8.20** | https://ribocg-a11y.github.io/movikids/?force=1.8.20 |
| Comunicação balcão | **QR only** | `OPERACAO_COMUNICACAO_QR_ONLY.md` |
| GAS | **v1.5.91** | ping prod. **v1.5.91** ✅ |
| Aba FOLHA | OK (I25) | B68 ~5269,96 · `folhaPlanejamento.fonte: FOLHA` |
| Deploy ID | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

**GAS canônico (sempre informar se alterou):**

`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

Fonte de verdade: `mk-version.js`, header do `.gs`, ping GAS.

## Código canônico

- **GAS:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (único `.gs` na raiz)
- **Legado:** `arquivo-historico/` — não implantar
- **Testes:** `scripts/testes/`
- **Protocolo teste/diagnóstico:** `docs/ativos/PROTOCOLO_DIAGNOSTICO_E_TESTES.md` → `TESTE_PROTOCOLO_DIAGNOSTICO.ps1`
- **CI:** `scripts/pre-push-check.ps1` — rodar **antes** do push
- **Pos-push:** `scripts/verify-publish-complete.ps1` — obrigatório após `git push` FE (I24)

## Regras P0

- Escritas GAS no browser = **GET** (incidente I15 — nunca POST JSON no tablet)
- GAS: **Nova versão** no mesmo Deploy ID — nunca `clasp deploy`
- Tablet físico obrigatório após mudança em `api()` ou auth
- F4 (WhatsApp auto) e F9 (supervisor) **pausados**

## Não usar

- `docs/arquivo/planos/HANDOFF_NOVO_CHAT_2026-06-05.md` — defasado
- `docs/arquivo/obsoleto/` — rollback/changelog antigos
- Arquivos em `arquivo-historico/` para deploy

## Estado do projeto (14/06/2026)

- **FASE 1–8:** ✅ prod
- **FASE 9 Folha CLT:** ✅ prod · testes readonly **ok** 14/06 · I25 **fechado**
- **FASE 14 mini-DRE:** 🟡 FE v1.8.16 · homolog sócio pendente

## "Atualize tudo"

Quando pedir **atualize tudo** — seguir **`docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md`** (handoff, mapa erros, protocolos, arquitetura, diagramas, planilhas, histórico, pasta C).

## Ao encerrar sessão

Atualizar `HANDOFF_NOVO_CHAT.md`, checklist em `PLANO_PRIORIDADES`, e `ESTADO_ATUAL.md` se versões mudaram. **Sempre** terminar resposta com Regra 16 (AppScript sim/não + link).
