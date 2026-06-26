# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 26/06/2026 · FE **v1.8.122** · GAS **v1.5.167** · VT I67 aplicado (B9=8,80 · 22 dias) · **Ciclo ativo: Premium One UI**  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main`

**Mensagem mínima no novo chat:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

**Mensagem para ciclo UI (recomendada):**

> *Continuar MOVI KIDS — ciclo One UI. Ler `PLANEJAMENTO_ONE_UI_2026-06.md` e começar por **UI-A1**.*

---

## Modelo operacional — dois aparelhos (ler sempre)

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor) | **Você** (sócio/dev) | Código, testes `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** (Milena, Raykelly) | Locações, timer, PIN operador, PWA ícone na loja |

**Regras para o agente:**

1. **Você opera sempre do computador** — prints e chats costumam ser do **PC**, não do tablet do balcão.
2. O **tablet fica na operação** — homologação balcão **fechada 23/06**; só re-testar se mudar `api()`, auth ou cronômetro.
3. **Sessão dual (I21):** PC com PIN admin **1421** = **TABLET: Administrador**; tablet operadores = **BALCÃO: Nome**.
4. **UI nova:** consultar **`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`** §0 **antes** de codar (I29).
5. **Push FE:** após `pre-push-check` OK → commit → push → **`verify-publish-complete.ps1`** (sem pedir permissão).

Detalhe: `ACESSOS_E_AUTORIZACOES.md` §7 · incidentes I21 · I29.

---

## Como abrir o Cursor nesta pasta (novo chat)

```powershell
cursor "C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github"
```

---

### O que o agente faz sozinho (não pedir autorização)

- Ler docs ativos (ordem abaixo)
- **UI:** consultar `DESIGN_SYSTEM_MOVIKIDS.md` + `PLANEJAMENTO_ONE_UI_2026-06.md`
- **FE:** editar → `pre-push-check` → commit → push → `verify-publish-complete`
- Testes, ping GAS, planilha OAuth, docs, incidentes no mapa I*
- Toda resposta: bloco **Versões (encerramento)** + `Mudança no AppScript` (Regra 16)

**Só com pedido explícito:** `clasp push` / `prepare-gas-push.ps1` · mudar auth/PIN · Nova versão Web GAS.

---

## Produção (26/06/2026)

| Camada | Repo | Produção | Notas |
|--------|------|----------|-------|
| **Frontend** | **v1.8.121** | https://ribocg-a11y.github.io/movikids/?force=1.8.121 | |
| **Gestão Pessoas** | **v1.8.121** | `gestao-pessoas.html?force=1.8.121` | |
| **Service Worker** | **1.8.121** | `sw.js` | |
| **Apps Script** | **v1.5.165** | ping **v1.5.165** | PIN admin **1421** |
| **Homolog tablet** | ✅ 23/06 | I43 · I42 · I47 · Gestor | |
| **Planilha** | 23 abas | `schemaOk=True` · auditoria **23/23** | I52–I67 |
| **COLABORADORES_RH** | Raykelly **25%** | `GUIA_RAYKELLY_CADASTRO_P0.md` | P0 paralelo |
| **Design System** | **v1.1** | `DESIGN_SYSTEM_MOVIKIDS.md` | |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

**Atalhos teste:**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_FASE16_COMANDO_READONLY.ps1
.\scripts\testes\TESTE_FASE17_ALERTAS_READONLY.ps1
```

---

## Ordem de leitura (obrigatória)

| # | Documento | Para quê |
|---|-----------|----------|
| 1 | **Este arquivo** | Contexto, produção |
| 2 | **`PLANEJAMENTO_ONE_UI_2026-06.md`** | **Ciclo ativo UI** — backlog UI-A1… |
| 3 | **`DESIGN_SYSTEM_MOVIKIDS.md`** | Cartilha UI — **antes de qualquer tela** |
| 4 | `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md` | Visão FASE 16–22 |
| 5 | `PLANEJAMENTO_ATUAL_2026-06.md` §9 | Prioridades gerais |
| 6 | `DIAGNOSTICO_SISTEMA_6_CAMADAS_2026-06.md` | Scorecard fundação |
| 7 | `ESTADO_ATUAL.md` · `DEPLOY_ATUAL.md` | Versões |
| 8 | `MAPA_ERROS_FALHAS_BUGS.md` | I* travas |
| 9 | `../INDICE.md` | Mapa docs |

**Fonte de verdade versão:** `mk-version.js` → ping GAS → `DEPLOY_ATUAL.md` → este handoff.

---

## Próximo passo (26/06/2026)

| # | Ação | Quem | Status |
|---|------|------|--------|
| 1 | **UI-A1** Sidebar admin mobile read-only | **Agente (dev)** | ⏳ **próximo** |
| 2 | Sprint A UI-A2…A6 — fechar FASE 16 visual | Agente | ⏳ |
| 3 | Raykelly cadastro **100%** | Colaborador | ⏳ P0-5 |
| 4 | Assinar **FASE 17** + decisão **17.5 F9** | Sócio + Ops | ⏳ |
| 5 | Sprint B — FASE 18 previsão UI | Agente | backlog |

Docs: `PLANEJAMENTO_ONE_UI_2026-06.md` · `CHECKLIST_FASE17_FECHAMENTO.md`

---

## Concluído (não repetir)

| Item | Data |
|------|------|
| Homolog tablet I43/I42/I47/Gestor | 23/06 |
| GAS v1.5.165 Web · planilha 23/23 | 25/06 |
| Diagnóstico 6 camadas | 25/06 |
| FASE 16 comando + widgets Dashboard repo | jun/2026 |
| FASE 17 API alertas (`TESTE_FASE17` ✅) | 26/06 |

---

## Incidentes — referência rápida

I15 POST browser · I20/I43 cronômetro · I42 conta dia · I44 banco horas · I52–I67 planilha · ver `MAPA_ERROS_FALHAS_BUGS.md`.

---

*Preparado para novo chat — ciclo Premium One UI.*
