# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 27/06/2026 · **Sprints A–C One UI ✅ publicados**  
**FE:** **v1.9.2** · **GAS:** **v1.5.167** · **Ciclo:** Premium One UI fechado (visual) · **Roteiro agente:** `ROTEIRO_AGENTE_OBRIGATORIO.md`  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main` · commit **4c3ea70** (27/06 v1.9.2)

**Mensagem mínima no novo chat:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

**Mensagem para ciclo UI (recomendada):**

> *Continuar MOVI KIDS — ler `HANDOFF_NOVO_CHAT.md` + `ROTEIRO_AGENTE_OBRIGATORIO.md`.*

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
5. **Push FE:** `git commit` → `pre-push-check` → `git push` → `verify-publish-complete` → `encerramento-sessao` exit 0 — **sem pedir** (§7.2 · I24)

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

## Produção (27/06/2026)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.9.2** | https://ribocg-a11y.github.io/movikids/?force=1.9.2 |
| **Gestão Pessoas** | **v1.9.2** | `gestao-pessoas.html?force=1.9.2` |
| **Service Worker** | **1.9.2** | `sw.js` |
| **Apps Script** | **v1.5.167** | lógica I68 ativa · ping string **v1.5.167** no repo (reimplantar se ping antigo) |
| **PIN admin** | **1421** | Script Property `ADMIN_PIN` |
| **Homolog tablet** | ✅ 23/06 | I43 · I42 · I47 · Gestor |
| **Planilha** | 23 abas | `schemaOk=True` · auditoria **23/23** |
| **FOLHA VT (I68)** | ✅ 26/06 | B9 **8,80** · B10/B12 **22** · B68 **5253,96** · B25 **18,18** |
| **VT holerite** | ✅ API | Milena **193,60** · Raykelly **103,25** |
| **Raykelly cadastro** | ✅ **100%** | API 26/06 · id 3 |
| **Design System** | **v1.1** | `DESIGN_SYSTEM_MOVIKIDS.md` |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

**Atalhos teste:**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_INVESTIGACAO_VT_COLABORADORES.ps1
.\scripts\testes\TESTE_FASE17_ALERTAS_READONLY.ps1
.\scripts\testes\AJUSTAR_FOLHA_VT_I67.ps1   # se resetar B9/B10/B12
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
| 6 | `ESTADO_ATUAL.md` · `DEPLOY_ATUAL.md` | Versões |
| 7 | `MAPA_ERROS_FALHAS_BUGS.md` | I* travas (I68 VT) |
| 8 | `../INDICE.md` | Mapa docs |

**Fonte de verdade versão:** `mk-version.js` → ping GAS → `DEPLOY_ATUAL.md` → este handoff.

---

## Próximo passo (novo chat)

| # | Ação | Quem | Status |
|---|------|------|--------|
| 1 | Assinar **FASE 17** + decisão **17.5 F9** | Sócio + Ops | ⏳ |
| 2 | Tablet: smoke **v1.9.2** (admin One UI + Colaboradores) | Ops | ⏳ |
| 3 | Sprint One UI A–C + travas I24 | Agente | ✅ **27/06 v1.9.2** |
| 4 | GAS ping **v1.5.167** Web (se ping ainda 165) | Sócio | ⏳ opcional |

Docs: `PLANEJAMENTO_ONE_UI_2026-06.md` · `CHECKLIST_FASE17_FECHAMENTO.md`

---

## Concluído (não repetir)

| Item | Data |
|------|------|
| Homolog tablet I43/I42/I47/Gestor | 23/06 |
| GAS v1.5.167 Web · planilha 23/23 | 26/06 |
| **I68 VT folha** (4,40×2 · 22 dias) | 26/06 |
| FE v1.8.122 timeout RH Colaboradores | 26/06 |
| Diagnóstico 6 camadas | 25/06 |
| FASE 17 API alertas (`TESTE_FASE17` ✅) | 26/06 |
| Raykelly cadastro **100%** | 26/06 |

---

## Incidentes — referência rápida

I15 POST browser · I20/I43 cronômetro · I42 conta dia · I44 banco horas · **I68 VT folha** · I52–I67 planilha · ver `MAPA_ERROS_FALHAS_BUGS.md`.

---

*Preparado para novo chat — ciclo Premium One UI · sessão VT/RH fechada 26/06.*
