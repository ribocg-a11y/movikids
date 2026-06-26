# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 23/06/2026 (homolog tablet confirmada) · FE **v1.8.121** · GAS **v1.5.165** prod  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main`

**Mensagem mínima no novo chat:** *"Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina."*

---

## Modelo operacional — dois aparelhos (ler sempre)

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor) | **Você** (sócio/dev) | Código, testes `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** (Milena, Eduarda) | Locações, timer, PIN operador, PWA ícone na loja |

**Regras para o agente:**

1. **Você opera sempre do computador** — prints e chats costumam ser do **PC**, não do tablet do balcão.
2. O **tablet fica na operação** — homologação real exige **aparelho na loja**.
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
- **UI:** consultar `DESIGN_SYSTEM_MOVIKIDS.md` antes de alterar telas
- **FE:** editar → `pre-push-check` → commit → push → `verify-publish-complete`
- Testes, ping GAS, planilha OAuth, docs, incidentes no mapa I*
- Toda resposta: `Mudança no AppScript: sim|não` + link `.gs` canônico (Regra 16)

**Só com pedido explícito:** `clasp push` / `prepare-gas-push.ps1` · mudar auth/PIN · Nova versão Web GAS.

---

## Produção (23/06/2026)

| Camada | Repo | Produção (ping / Pages) | Notas |
|--------|------|-------------------------|-------|
| **Frontend** | **v1.8.121** | https://ribocg-a11y.github.io/movikids/?force=1.8.121 | |
| **Gestão Pessoas** | **v1.8.121** | `gestao-pessoas.html?force=1.8.121` | Ficha admin somente leitura |
| **Service Worker** | **1.8.121** | `sw.js` | GAS fora do intercept |
| **Apps Script** | **v1.5.165** | ping **v1.5.165** | Deploy `AKfycbwakQ...` · PIN admin **1421** |
| **Homolog tablet** | ✅ **23/06** | I43 ▶ · I42 caixa · I47 PIN · Gestor F17 | Confirmado usuário |
| **Planilha (23 abas)** | ✅ I52–I63 + auditoria | `validarSchema` **schemaOk=True** · **23/23 ok** célula | I67 Neide L233 corrigido |
| **COLABORADORES_RH** | Milena **100%** · Raykelly **25%** | Backup `backups/rh/` | **P0-5** — próximo passo |
| **Aba BANCO_HORAS** | ✅ repair I44/I66 | Milena/Raykelly **0h00** | |
| **Design System** | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` | |

**Diagnóstico sistema:** `DIAGNOSTICO_SISTEMA_6_CAMADAS_2026-06.md` · **Prioridades:** `PLANEJAMENTO_ATUAL_2026-06.md` §9

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

**Atalhos teste:**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\verify-gas-deploy.ps1
.\scripts\pre-push-check.ps1
.\scripts\testes\_diag-dashboard-now.ps1
```

---

## Ordem de leitura (obrigatória)

| # | Documento | Para quê |
|---|-----------|----------|
| 1 | **Este arquivo** | Contexto, produção, próximo passo |
| 2 | **`DESIGN_SYSTEM_MOVIKIDS.md`** | Cartilha UI — **antes de qualquer tela** |
| 3 | `PLANO_PRIORIDADES_2026-06.md` | Fases 0–17 |
| 4 | `ESTADO_ATUAL.md` | Versões, entregas |
| 5 | `MAPA_ERROS_FALHAS_BUGS.md` | I29–I44 + travas |
| 6 | `REGRAS_DE_PUBLICACAO_SEGURA.md` | Push/deploy |
| 7 | `MAPA_FASES.md` · `DEPLOY_ATUAL.md` · `ESTRUTURA_REPO.md` | Fases · deploy · layout repo |
| 8 | `../INDICE.md` | Mapa docs |

**Fonte de verdade versão:** `mk-version.js` → ping GAS → `DEPLOY_ATUAL.md` → este handoff.

---

## Próximo passo (23/06/2026)

| # | Ação | Quem | Status |
|---|------|------|--------|
| 1 | ~~Homolog tablet v1.8.121 (I43, I42, I47, Gestor)~~ | Ops loja | ✅ **23/06** |
| 2 | Raykelly cadastro **100%** `gestao-pessoas.html` | Colaborador | ⏳ **próximo** |
| 3 | Decisão **17.5 F9** Supervisor | **Sócio** | ⏳ |
| 4 | Assinar fechamento formal **FASE 17** | Ops + sócio | ⏳ |
| 5 | Ponto RH diário (`FOLHA_PONTO`) | Ops | ⏳ |
| 6 | Rotina mensal `HIGIENE` + `AUDITORIA_CELULA` + `BACKUP_RH` | Agente | ⏳ |

Docs: `PLANEJAMENTO_ATUAL_2026-06.md` §9 · `DIAGNOSTICO_SISTEMA_6_CAMADAS_2026-06.md`

---

## Incidentes — sessão 24/06/2026 (arquivo)

| ID | Evento | Fix |
|----|--------|-----|
| **I52** | `validarSchema` só 18 cols; `listarAtivas` 26 cols; LOCACOES sem memorial/formatos | GAS **v1.5.149** · `repararLocacoesPlanilhaAdmin` · repair planilha ✅ |
| **I53** | CONFIG sem memorial/schema | GAS **v1.5.150** · repair planilha ✅ |
| **I54** | OPERADORES_SISTEMA sem memorial/schema | GAS **v1.5.151** · repair ✅ |
| **I55** | CUSTOS sem memorial dedicado | GAS **v1.5.152** · repair planilha ✅ |
| **I56** | DASHBOARD sem memorial/audit formulas | GAS **v1.5.153** · repair conservador ✅ |
| **I57** | FOLHA fora protocolo abas (só I25 legado) | GAS **v1.5.154** · `repararFolhaPlanilhaAdmin` ✅ |
| **I58** | INVESTIMENTO sem protocolo abas | GAS **v1.5.155** · `repararInvestimentoPlanilhaAdmin` ✅ |
| **I59** | RESPONSAVEIS CRM sem protocolo | GAS **v1.5.156** · `repararResponsaveisPlanilhaAdmin` ✅ |
| **I60** | RELATORIOS sem protocolo abas | GAS **v1.5.158** · `repararRelatoriosPlanilhaAdmin` ✅ |
| **I61** | AUD_* camada 4 sem protocolo | GAS **v1.5.159** · `repararAudCamada4PlanilhaAdmin` ✅ |
| **I62** | RH P0 sem protocolo abas | GAS **v1.5.160** · `repararRhCamada5PlanilhaAdmin` ✅ |
| **I63** | RH resto sem protocolo abas | GAS **v1.5.161** · `repararRhCamada5RestoPlanilhaAdmin` ✅ |

---

## Próximo passo (23/06/2026 — arquivo)

| # | Ação | Quem | Status |
|---|------|------|--------|
| 1 | ~~Nova versão Web GAS v1.5.145 (I48–I51)~~ | **Sócio** | ✅ prod |
| 2 | ~~Restore ponto Raykelly jun/2026~~ | Agente | ✅ `RESTAURAR_PONTO_RAYKELLY_JUN2026` |
| 3 | Tablet `?force=1.8.118` — login PIN Milena/Raykelly (I47) | Ops loja | ⏳ |
| 4 | Raykelly cadastro **100%** em `gestao-pessoas.html` (PIN dela) | Colaborador | ⏳ 25% |
| 5 | Homolog ▶ cronômetro (I43) + Caixa I42 + Gestor | Ops loja | ⏳ |
| 6 | Ponto RH diário (`FOLHA_PONTO`) | Ops | ⏳ |
| 7 | **17.5** decisão F9 Supervisor | Sócio | ⏳ |

Docs: `INCIDENTE_I49_*` · `INCIDENTE_I51_*` · `MAPA_PLANILHA_ABAS_MOVIKIDS.md`

---

## Incidentes — sessão 23/06/2026 (noite)

| ID | Evento | Fix |
|----|--------|-----|
| **I49** | VA holerite R$520 (va_diario×26) em vez de R$400 | GAS **v1.5.143** `gpVaMensalTeto_` |
| **I50** | Tentativa desligar falta auto — **revertido** | I51 restaura regra correta |
| **I51** | FOLHA_PONTO Raykelly apagado → faltas −R$270 falsas | GAS **v1.5.145** restore + falta auto + abono ADM |

---

## Incidentes — sessão 23/06/2026 (tarde)

| ID | Evento | Fix |
|----|--------|-----|
| **I46** | Faltas/holerite RH + governança dados | GAS **v1.5.140–141** · FE **v1.8.117** (forms admin removidos em I47) |
| **I47** | PIN duplo submit / teclado password tablet | FE **v1.8.118** · GAS **v1.5.141** |
| **I48** | Admin Operadores lento — escrita FALTAS/HOLERITES na leitura (I46) | GAS **v1.5.142** — só cálculo em memória |

---

## Incidentes — sessão 23/06/2026 (manhã)

| ID | Evento | Fix |
|----|--------|-----|
| **I43** | Cronômetro revertia após ▶ (`carregarInicio` 19 cols sem col Y) | GAS **v1.5.136** prod · FE **v1.8.114+** · `TESTE_I43` no pre-push |
| **I44** | Banco horas corrompido — persist em **leitura** painel RH | GAS **v1.5.137** · `repairBancoHorasAdmin` |
| **I48** | **painelGestaoPessoasAdmin** escrevia FALTAS/HOLERITES na leitura | GAS **v1.5.142** — nunca append em read admin |
| **I45** | Cadastro Raykelly não persistiu · installer apagava abas RH | GAS **v1.5.138** · FE **v1.8.116** · mapa `MAPA_PLANILHA_ABAS_MOVIKIDS.md` |

---

## Incidentes — sessão 22/06/2026 (auditoria RH)

| ID | Evento | Fix |
|----|--------|-----|
| **I38** | Banner “Pré-visualização ADM” com login PIN colab (`p.preview` fantasma) | FE **v1.8.110–111** |
| **I39** | VA/salário mês cheio — admissão meio mês / ISO | GAS **v1.5.129–130** |
| **I40** | Hub benefícios ≠ holerite GAS quinzenal | FE **v1.8.111** `gpBeneficiosResumo_` |
| **I41** | `ping_` defasado vs repo | GAS **v1.5.130** |
| **RH-G1–G3** | Holerite/banco/faltas não persistiam | GAS **v1.5.130** snapshot+sync |

---

## Armadilhas ativas (não regredir)

| Tema | Regra |
|------|-------|
| **I15** | Escritas GAS no browser = **GET** apenas |
| **I20/I43** | `carregarInicio` → `COL_LOC_READ_=28` · rodar `TESTE_I43` + tablet ▶ |
| **I44** | **Nunca** `gpPersistBancoFromJornada_` em leitura de painel |
| **Dashboard** | Login balcão ≠ Ponto RH (`FOLHA_PONTO`) — widget "Ponto RH hoje" |
| **I22** | `check-operacao-livre.ps1` antes de push FE crítico |
| **GAS deploy** | Nova versão no deploy `AKfycbwakQ...` — nunca `clasp deploy` |

---

## Modo de operação — máximo potencial

1. Fluxo **F0–F14** antes de codar (`PROTOCOLO_DIAGNOSTICO_E_TESTES.md`)
2. PC ≠ tablet
3. FE + GAS + planilha + PWA
4. MAPA_ERROS I15/I18/I20/I21/I22/I23/I42/I43/I44/**I48**

---

## Commits recentes (referência)

| Hash | Entrega |
|------|---------|
| `b488148` | I52 LOCACOES schema 28 cols · repair planilha · `listarAtivas` COL_LOC_READ_ |
| `d39a7ac` | I44 banco horas · FE v1.8.115 · GAS v1.5.137 repo |
| `ff84239` | I43 guards + `TESTE_I43` + docs |
| `ef10dfa` | I43 hotfix cronômetro · FE v1.8.114 · GAS v1.5.136 |
