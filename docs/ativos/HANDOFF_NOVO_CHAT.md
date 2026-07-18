# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 18/07/2026 · FE **v1.9.66** (I124) · GAS repo **v1.5.201** · Web ping **v1.5.201**  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**GAS canônico (raw):** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  
**GitHub:** `ribocg-a11y/movikids` · branch `main` · I124: Dashboard saneado (Real / Previsão / Resultado)

**Mensagem mínima no novo chat:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

**Mensagem para ciclo UI (recomendada):**

> *Continuar MOVI KIDS — Sprint D: `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`*

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

## Produção (15/07/2026)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.9.65** | https://ribocg-a11y.github.io/movikids/?force=1.9.65 |
| **Gestão Pessoas** | **v1.9.65** | `gestao-pessoas.html?force=1.9.65` |
| **Service Worker** | **1.9.65** | `sw.js` |
| **Apps Script** | repo **v1.5.201** · Web **v1.5.200** ⏳ | Colar `.gs` + **Nova versão** → I122 (carregarInicio cache / anti-fantasma) |
| **Baseline P0** | ✅ | `docs/ativos/BASELINE_CODIGO_P0.md` |
| **PIN admin** | **1421** | Script Property `ADMIN_PIN` |
| **Homolog tablet** | ✅ 23/06 | I43 · I42 · I47 · Gestor — smoke **v1.9.39** pendente Ops |
| **Planilha** | 23 abas | `schemaOk=True` · auditoria **23/23** |
| **FOLHA VT (I68)** | ✅ 26/06 | B9 **8,80** · B10/B12 **22** · B68 **5253,96** · B25 **18,18** |
| **FOLHA_PONTO audit** | ✅ I70 | 5 linhas reparadas via API 09/07 |
| **VT holerite** | ✅ API | Milena **193,60** · Raykelly **103,25** |
| **Colaboradores RH** | ✅ I75+I79 | Julia sync RH + escala Atendente 2 (07/2026) · meta turno ativa |
| **Raykelly cadastro** | ✅ **100%** | API 26/06 · id 3 |
| **Design System** | **v1.1** | `DESIGN_SYSTEM_MOVIKIDS.md` |
| **Multi-veículo** | ✅ I97–I99 | Cesta Nova locação · batch GAS · overlay watchdog |
| **I103 contagem** | ✅ v1.9.39 | Encerradas = contas únicas · Caixa = todas locações |
| **I104 conferência POS** | ✅ v1.9.46 | Caixa: contas no cartão (não locações) vs vendas maquininha |
| **I106 POS gate** | ✅ v1.9.47 | Painel bruto POS + trava comprovante na Nova + cancel sem placeholder |
| **I117 caixa pay-first** | ✅ Web+FE | Ativa/Pendente entram em `resumoDia` — bater POS com brincando |
| **I123 gráfico Base×Ritmo×Real** | ✅ FE v1.9.65 | Dashboard: base travada · ritmo atual · real (DNA admin) |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

**Regra I103 (contagem dia):**

| Onde | Mostra |
|------|--------|
| Tile **Contas hoje** + lista **Encerradas** + painel **Encerrados** | **Números únicos** (telefone/conta_id — I42) |
| **Caixa** (chip, página, hub, dashboard) | **Todas as locações** (`nSessoes`) |

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
| 2 | **`PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`** | **Ciclo ativo** — Sprint D→G |
| 3 | `PLANEJAMENTO_ONE_UI_2026-06.md` | One UI fechado (referência) |
| 3 | **`DESIGN_SYSTEM_MOVIKIDS.md`** | Cartilha UI — **antes de qualquer tela** |
| 4 | `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md` | Visão FASE 16–22 |
| 5 | `PLANEJAMENTO_ATUAL_2026-06.md` §9 | Prioridades gerais |
| 6 | `ESTADO_ATUAL.md` · `DEPLOY_ATUAL.md` | Versões |
| 7 | `MAPA_ERROS_FALHAS_BUGS.md` | I* travas (I68 VT · I96–I103) |
| 8 | `../INDICE.md` | Mapa docs |

**Fonte de verdade versão:** `mk-version.js` → ping GAS → `DEPLOY_ATUAL.md` → este handoff.

---

## Próximo passo (novo chat)

| # | Ação | Quem | Status |
|---|------|------|--------|
| **0** | **I117** caixa pay-first — GAS **v1.5.198** Web ✅ · FE **v1.9.62** | Sócio+Agente | ✅ **15/07** |
| **0a** | **I116** GAS **v1.5.196** Web ✅ — validado 15/07 (ping 196 · GP OK · Ray warm ~4s) | Sócio+Agente | ✅ **15/07** |
| **0b** | **I122** GAS **v1.5.201** + FE **v1.9.64** — colar Nova versão · limpar site data tablet se fantasma persistir | Sócio+Agente | ⏳ **16/07** |
| **0b2** | **I123** gráfico Base × Ritmo × Real — FE **v1.9.65** (só Dashboard; P0 zero) | Agente | ✅ **16/07** |
| **0c** | Frios Colab residual (AUD/tail full) — lite já slim; não regredir P0 | Agente | 📋 backlog |
| 1 | **Sprint D1** homolog PC admin v1.9.2 | Agente | ✅ **27/06** |
| 1b | **I69** hotfix ponto mock → **v1.9.3** | Agente | ✅ **29/06** Pages |
| 1c | **I70–I75** varredura — GAS/FE/Dashboard/GP/Julia | Agente | ✅ **09/07** |
| 1d | **I79–I83** Julia + Operadores + race Escala/Metas | Agente | ✅ FE **v1.9.15** · GAS **v1.5.179** |
| 1e | **I84–I87** meta conta/dia · caixa pagamento · perf admin | Agente | ✅ FE **v1.9.21** · GAS **v1.5.182** |
| 1f | **I96–I103** multi-veículo + contagem encerradas/caixa | Agente | ✅ FE **v1.9.39** · GAS **v1.5.187** Web |
| 2 | Assinar **FASE 17** (só falta **17.5 F9**) + smoke tablet D4 | Sócio + Ops | ⏳ |
| 3 | Smoke tablet **v1.9.39** (multi-veículo + overlay + timer) | Ops | ⏳ Sprint D4 |
| 4 | Sprint One UI A–C + I24 | Agente | ✅ **v1.9.9** |

Docs: `MAPA_ERROS` I117 · `INCIDENTE_I116_ENRICH_RH_KPI_LENTIDAO_2026-07-15.md` · `INCIDENTE_I115_COLAB_LOGIN_LENTO_2026-07-15.md` · `BASELINE_CODIGO_P0.md` · `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`

---

## Concluído (não repetir)

| Item | Data |
|------|------|
| **I108–I110** holerite Q1 (50% VA/bônus/VT · FSS pot · sem faltas Q1) · GAS **v1.5.192** Web · FE **v1.9.52** | 15/07 |
| **I111–I114** VT Q1=0 · bônus cesta · hardclamp FE · totais | 15/07 |
| **I115** slim login Colaboradores Web **v1.5.195** + FE **v1.9.58** | 15/07 |
| **I116** enrich login sem todo RH · Web **v1.5.196** | 15/07 |
| Homolog tablet I43/I42/I47/Gestor | 23/06 |
| GAS v1.5.167 Web · planilha 23/23 | 26/06 |
| **I68 VT folha** (4,40×2 · 22 dias) | 26/06 |
| **I96–I99** multi-veículo + overlay | 10/07 |
| **I101** MK_GAS_VERSAO_ alinhado | 10/07 |
| **I103** encerradas únicas / caixa todas | 10/07 |
| **I69** ponto mock FE **v1.9.3** | 29/06 |

---

## Incidentes — referência rápida

I15 POST browser · I20/I43 cronômetro · I42 conta dia · **I68 VT folha** · **I69 ponto mock** · **I70–I76 sessão 09/07** · **I96–I103 multi-veículo/contagem** · **I108–I114 holerite** · **I115–I116 login/lentidão** · **I117 caixa pay-first** · **I120/I120b admin perf** · ver `MAPA_ERROS_FALHAS_BUGS.md` · `INCIDENTE_I96_I99_MULTI_VEICULO_2026-07-10.md`.

---

*Preparado para novo chat — ciclo Premium One UI · I110 Web alinhado 15/07 · próximo: FASE 17 / smoke tablet.*
