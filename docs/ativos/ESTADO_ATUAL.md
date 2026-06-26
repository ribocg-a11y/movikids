# MOVI KIDS — Estado atual (26/06/2026)

Referência única para alinhamento local × produção.

**Ciclo dev ativo:** **`PLANEJAMENTO_ONE_UI_2026-06.md`** — Premium One UI  
**Diagnóstico 6 camadas:** **`DIAGNOSTICO_SISTEMA_6_CAMADAS_2026-06.md`**  
**Prioridades gerais:** **`PLANEJAMENTO_ATUAL_2026-06.md`** §9

**Handoff (novo chat):** **`HANDOFF_NOVO_CHAT.md`** ← ler primeiro  
**Design System (UI):** **`../referencia/DESIGN_SYSTEM_MOVIKIDS.md`** ← antes de qualquer tela  
**Acessos:** **`ACESSOS_E_AUTORIZACOES.md`** — papéis, PIN admin, agente vs humano  
**Índice:** `../INDICE.md` · **Prioridades:** **`PLANO_PRIORIDADES_2026-06.md`**  
**Planejamento ativo:** `PLANEJAMENTO_ATUAL_2026-06.md`  
**Mapa de erros/bugs:** **`MAPA_ERROS_FALHAS_BUGS.md`**  
**FASE 9 Folha CLT:** **`FASE_9_FOLHA_VIABILIDADE_CLT.md`**  
**Memorial folha:** `../referencia/FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md`  
**FASE 14 mini-DRE:** 🟡 memorial — `FASE_14_MINI_DRE.md` · `../referencia/MEMORIAL_MINI_DRE.md`  
**Deploy GAS pacote:** **`DEPLOY_ATUAL.md`** · histórico `../arquivo/deploy/DEPLOY_v1.5.91_FOLHA_REPAIR_USER_ENTERED.md`  
**Incidente I29 (DNA Gestão Pessoas):** `../arquivo/incidentes/INCIDENTE_I29_GESTAO_PESSOAS_DNA_UI_2026-06-18.md`  
**Incidente I30 (abas RH getRange):** `../arquivo/incidentes/INCIDENTE_I30_GAS_ABAS_GESTAO_RANGE_2026-06-18.md`  
**Incidentes sessão 23/06:** **I43** cronômetro · **I44** banco · **I45–I48** RH/perf/PIN — ver `MAPA_ERROS_FALHAS_BUGS.md` e `INCIDENTE_I4*_2026-06-23.md`  
**Incidentes sessão 22/06:** **I38** preview banner · **I39** VA admissão · **I40** hub benefícios · auditoria `AUDITORIA_RH_FOLHA_PERSISTENCIA_2026-06-22.md`  
**Incidentes sessão 20/06:** **I31** Pelúcias CONFIG · **I32** loc duplicada/SMS · **I33** PWA boot · **I34** holerite — ver `MAPA_ERROS_FALHAS_BUGS.md`

---

## ALERTA P0 (05/06/2026)

**Nunca POST no `api()` do browser** — ver `../arquivo/incidentes/INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md`.  
FE mínimo em operação: **v1.7.35** (recomendado **v1.7.41+**). Teste tablet obrigatório após mudança em `api()`.

---

## Produção (26/06/2026 — fim de sessão)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.8.122** | https://ribocg-a11y.github.io/movikids/?force=1.8.122 |
| **Gestão Pessoas** | **v1.8.122** | `gestao-pessoas.html?force=1.8.122` |
| **Service Worker** | **1.8.122** | `sw.js` |
| **Apps Script** | **v1.5.167** | I68 VT ativo · ping **v1.5.167** no repo |
| **FOLHA VT I68** | ✅ 26/06 | B9 **8,80** · B10/B12 **22** · Milena VT **193,60** · Raykelly **103,25** |
| **Planilha** | 23 abas | `schemaOk=True` · auditoria célula **23/23** |
| **Homolog tablet** | ✅ 23/06 | I43 · I42 · I47 · Gestor |
| **Raykelly cadastro** | ✅ **100%** | id 3 · API 26/06 |
| **Design System** | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |
| **Ciclo dev** | One UI | `PLANEJAMENTO_ONE_UI_2026-06.md` · alvo FE **v1.9.0** |
| **RELATORIOS** | repair I60 24/06 | 1 registro · **schemaOk=True** |
| **RESPONSAVEIS** | repair I59 24/06 | **241** cadastros · **schemaOk=True** |
| **FOLHA** | I68 26/06 | B68 **5253,96** · VA/dia **18,18** · VT **193,60**/pessoa · **schemaOk=True** |
| **OPERADORES_SISTEMA** | repair I54 24/06 | **schemaOk=True** |
| **CUSTOS** | repair I55 24/06 | 10 linhas · soma mes ~3477 · **schemaOk=True** |
| **Aba BANCO_HORAS** | ✅ repair 23/06 | Milena/Raykelly **0h00** |
| **Aba FOLHA** | I68 26/06 | [gid=179040058](https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit#gid=179040058) · B68 **5253,96** · B9 **8,80** · 22 dias |

**Editor Apps Script:** https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit

**Teste rápido GAS (ping):**  
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping  
→ ping **v1.5.167** (repo) · `kpiMes` folha `vtTarifa=8.8` `diasVt=22` · `validarSchema` **schemaOk=True**

**URL morta (não usar):** `AKfycbzc...` → 404

---

## Arquivos canônicos

| Artefato | Arquivo |
|----------|---------|
| GAS | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` |
| Payback | `MEMORIAL_PAYBACK_INVESTIMENTO.md` · deploy histórico `../arquivo/deploy/DEPLOY_v1.5.63_PAYBACK.md` |
| Clasp | `gas/Code.gs` (gerado por `scripts/sync-gas-to-clasp.ps1` — não editar à mão) |
| Login | `mk-auth.js` + gate em `index.html` |
| Versão FE | `mk-version.js`, `sw.js`, **`index.html ?v=`** (I3 — sempre os três) |
| CSS FE | `mk-design.css`, `mk-app.css` (Pacote M.1) |
| Bootstrap FE | `mk-stale-sync.js`, `mk-cache-bust.js`, `mk-firebase.js` (Pacote M.2) |
| API FE | `mk-api.js` — `api()` + guards I15 (Pacote M.3) |
| Sync FE | `mk-sync.js` — `syncController` + merge Firebase (Pacote M.4) |
| Sessão FE | `mk-sessao.js` — SMS, timer, `saveSessions` (Pacote M.5) |
| Nova FE | `mk-nova.js` — fluxo Nova locação + `atualizarVeiculoGrid` (Pacote M.6) |
| Drawer FE | `mk-drawer.js` — drawer sessão + encerrar (Pacote M.7) |
| **Operação FE** | `mk-operacao.js` — alertas, editar, iniciar, estender (SMS/WA pausados — QR) |
| Home FE | `mk-home.js` — cards, painel, encHoje (Pacote M.9) |
| Nav FE | `mk-nav.js` — showPage, sidebar, roles gestão (Pacote M.10) |
| Admin FE | `mk-admin.js` — PIN, KPIs, caixa, config, sistema (Pacote M.11) |
| Histórico FE | `mk-historico.js` — período, analytics, ranking veículo (Pacote M.12) |
| Relacionamento FE | `mk-relacionamento.js` — CRM responsáveis K.3 (Pacote M.13) |
| Custos FE | `mk-custos.js` (M.14) |
| Avulso FE | `mk-avulso.js` (M.15) |
| Globals FE | `mk-globals.js` — PRECOS, sessions (M.17) |
| Boot FE | `mk-boot.js` — DOMContentLoaded + SW (M.17) |
| Core FE | `mk-core.js` — toast, init, config (M.16) |
| Deploy | `DEPLOY_GAS_v1.5.32_AUTH.md`, `scripts/deploy-gas.ps1` |
| Limpeza testes | `scripts/testes/LIMPAR_TESTES_MOVIKIDS.ps1`, `scripts/testes/LIMPAR_SESSOES_TESTE_AGORA.ps1` |
| Paridade HTTP tablet | `scripts/testes/TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` |
| Paridade cronômetro portal | `scripts/testes/TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` |
| Pre-push (Pacote J) | `scripts/pre-push-check.ps1` — versões, guards I15–I20 |
| I20 cronômetro | `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md` — causa raiz + travas |
| Teste I20 | `scripts/testes/TESTE_I20_COMPLETO_PROD.ps1` |
| **Protocolo testes** | **`PROTOCOLO_DIAGNOSTICO_E_TESTES.md`** + `TESTE_PROTOCOLO_DIAGNOSTICO.ps1` |
| **Protocolo mestre** | **`TESTE_PROTOCOLO_MESTRE.ps1`** · atalho `protocolo-mestre.ps1` na raiz |
| **Protocolo "atualize tudo"** | **`PROTOCOLO_ATUALIZAR_TUDO.md`** |
| **Comunicação balcão** | **`OPERACAO_COMUNICACAO_QR_ONLY.md`** · FE v1.8.20 · `MK_COMUNICACAO_MODO=qr_only` |
| **Teste FOLHA fórmulas** | `TESTE_FOLHA_FORMULAS_READONLY.ps1` — gate pós-deploy I25 |
| **Teste FASE 9 folha** | `TESTE_FASE9_FOLHA_READONLY.ps1` |
| **Teste Gestão Pessoas** | `TESTE_GESTAO_PESSOAS_READONLY.ps1` — F15-RH readonly |
| **Homologação tablet F5–F11** | `TESTE_TABLET_F5_F7_F10_F11.ps1` + `TESTE_TABLET_F5_F7_F10_F11_BROWSER.js` |
| Mapa bugs | `MAPA_ERROS_FALHAS_BUGS.md` |
| Emergência | `scripts/ops/liberar-*.html`, `scripts/corrigir-locacao-206.html` |
| CONFIG FASE 4 | `CONFIG_OPERACIONAL_TEMPLATE.md` · `TESTE_OPERACAO_CONFIG_READONLY.ps1` |
| FASE 5 B7 | `FASE_5_CONFIABILIDADE_APIS.md` · `TESTE_B7_REGRESSAO_WRITE.ps1` |

---

## Validação FOLHA + FASE 9 (14/06/2026 08:23)

| Teste | Status | Destaque |
|-------|--------|----------|
| `TESTE_FOLHA_FORMULAS_READONLY` | **ok** | 12/12 · B25=15,38 · B68=5269,96 · `fonte=FOLHA` |
| `TESTE_FASE9_FOLHA_READONLY` | **ok** | verde · 6/6 gates · `CONTRATACAO_VIAVEL` · margem proj. 41,8% |

---

## Entregas recentes

| Versão | Entrega |
|--------|---------|
| **v1.8.89** + **GAS v1.5.121** | FASE 17.5 — alertas Proativos na ficha Presença + Metas |
| **v1.8.88** + **GAS v1.5.120** | FASE 17 — meta abaixo 3d · alertas RH Operadores · frota parada Sistema |
| **v1.8.87** + **GAS v1.5.119** | FASE 17 — alertasInteligentes_ · perfil gestor · badge Proativo |
| **v1.8.86** + **GAS v1.5.118** | FASE 16 fechada — sidebar mobile admin · comando comparativo 30d |
| **v1.8.68** | Nova locação — grid de **Carros** em 2x2 (simetria com Pelúcias) |
| **v1.8.67** | Frota FE — **Carro 04** em Nova locação/painel/filtros |
| **GAS repo v1.5.111** | `VEICULOS_VALIDOS` inclui **Carro 04** (ping produção ainda v1.5.107) |
| **v1.8.30** | **I28** — modal PIN + persist + banner dual + guards liberar sessão |
| **v1.8.29** | I28 fix — `mkAdminPinModalAsk_`, API antes PIN em deslogar |
| **v1.8.28** | FASE 9 DNA admin (glass, accordions, CRM cards) |
| **v1.8.27** | Logo oficial PNG transparente empty state Home |
| **v1.8.24–26** | Header mobile DNA (`mk-mob-header`) · banner auto-update 12s |
| **v1.8.23** | Mobile header contraste + auto-update banner |
| **GAS v1.5.92** | `encerrarLocacao` mensagem Pendente vs Encerrada |
| **16/06** | **Protocolo Mestre** — varredura F0–F14 + cleanup · scripts FASE6/P3/tablet corrigidos |
| **v1.8.20** | Operação **QR only** — SMS/WA pausados |
| **GAS v1.5.91** | **I25** — FOLHA repair USER_ENTERED |
| **v1.8.16** + **GAS v1.5.82** | FASE 14 mini-DRE — cascata margens Dashboard |
| **v1.8.15** + **GAS v1.5.81** | Semana corrente Dashboard + fix I3 cache-bust |
| **v1.8.14** + **GAS v1.5.81** | Dashboard narrativo + folha proporcional (mesma base sem/com folha) |
| **v1.8.10** + **GAS v1.5.80** | **FASE 9** — folha FOLHA B68 + `viabilidadeContratacao` + painel CLT |
| **v1.8.9** + **GAS v1.5.79** | **FASE 8** — alertas gestão + semáforo empresa |
| **v1.8.7** | **Pacote I** — KPI row: Ano · Locações · Cancel · Extras · Caixa |
| **v1.8.6** | **Pacote I** — ticket médio só em `#mk-leading-row` |
| **v1.8.5** + **GAS v1.5.78** | **I23 fase 2** — kpiMes leitura única, lite, cache GAS+FE |
| **v1.8.4** + **GAS v1.5.77** | **I23 fase 1** — mutex KPI + resumoDia leve |
| **v1.8.2** | **I22 hotfix** — `</div>` extra Dashboard quebrava Home |
| **v1.8.1** + **GAS v1.5.76** | **FASE 7** — leadingFinanceiro, break-even Caixa, sensibilidade margem |
| **v1.8.0** + **GAS v1.5.75** | **FASE 6** — cockpit executivo + narrativaExecutiva |
| **v1.7.98** + **GAS v1.5.74** | **P2** — B6 PIN admin via GAS |
| **v1.7.95** | **Portal dos pais fixo** na Home — sem dismiss ✕ |
| **v1.7.94** | **B8 idle I21** — wall clock FE+GAS; `mkAuthReleaseBalcaoServer_`; protocolo ok |
| **v1.7.93** | **B2 kpiMes** — Dashboard só visualiza via `kpiMes` |
| **v1.7.92** | **B1 resumoDia** — Caixa + chip admin unificados |
| **v1.7.78** | **I20 definitivo** — início otimista no ▶, `_localTimerStart`, `effectiveStartTs_`, botão imediato; validado tablet |
| **v1.7.87** | **Pacote M.17** — `mk-globals.js` + `mk-boot.js`; **zero JS inline**; Pacote M **fechado** |
| **v1.7.86** | **Pacote M.16** — core extraído para `mk-core.js`; `index.html` ~1.440 linhas (só globals) |
| **v1.7.85** | **Pacote M.15** — lançamento avulso extraído para `mk-avulso.js`; `index.html` ~1.730 linhas |
| **v1.7.84** | **Pacote M.14** — custos extraídos para `mk-custos.js`; `index.html` ~1.810 linhas |
| **v1.7.83** | **Pacote M.13** — CRM extraído para `mk-relacionamento.js`; `index.html` ~1.890 linhas |
| **v1.7.82** | Fix M.12 — `HIST_CACHE_TTL_MS` duplicado |
| **v1.7.81** | **Pacote M.12** — `mk-historico.js` |
| **v1.7.80** | **Pacote M.11** — admin extraído para `mk-admin.js` |
| **v1.7.79** | **Pacote M.10** — `showPage` + sidebar extraídos para `mk-nav.js` |
| **Pacote M** | M.1–M.17 ✅ **fechado** — `PACOTE_M_MODULARIZACAO.md` |
| **Testes** | T1 em-dash (`RELACIONAMENTO`, `I20`); tablet F5–F11 automatizado 08/06; protocolo completo WARN Pages |
| **v1.5.66** | **I20 GAS** — `iniciarTimer_` grava `clientTs` (clique) na col Y quando drift ≤ 2 min |
| **v1.7.76** | I20 fase 1 — SMS separado do ▶; `iniciarContagemDireto_`; card pendente compacto |
| **v1.5.64–65** | I20 col C/Y — cadastro Pendente; idempotência `iniciarTimer` |
| **v1.7.72** | Pacote M.8 — alertas/operação/iniciar/estender extraídos para `mk-operacao.js` |
| **v1.7.71** | Pacote M.7 — drawer + encerrar extraídos para `mk-drawer.js` |
| **v1.7.70** | Pacote M.6 — Nova locação extraída para `mk-nova.js` |
| **v1.7.69** | Pacote M.5 — sessão/SMS/timer extraídos para `mk-sessao.js` |
| **v1.7.68** | Pacote M.4 — `syncController` + merge extraídos para `mk-sync.js` |
| **v1.7.67** | Pacote M.3 — `api()` + guards I15 extraídos para `mk-api.js` |
| **v1.7.66** | Pacote M.2 — bootstrap + Firebase extraídos |
| **v1.7.65** | Pacote M.1 — CSS legado → `mk-app.css` |
| **v1.7.24** | Pacote D — drawer unificado Encerrar / Estender / Editar / Cancelar |
| **v1.7.25** | Fix busca cliente passo Quem + checkbox ADM offline encerrar |
| **v1.7.26** | Pacote E — tentativa POST JSON no FE (revertido v1.7.34 — POST quebra no tablet) |
| **v1.7.34** | Fix I15 — `api()` usa GET no browser para as 5 escritas críticas |
| **GAS v1.5.44** | `doPost` JSON; operador obrigatório nas 5 escritas |
| **GAS v1.5.45** | `limparLocacoesTesteAdmin` — anula locações de teste |
| **v1.7.27** + **GAS v1.5.46** | **Pacote F (início)** — KPIs operador, cancelamentos, ocupação frota no Dashboard |

Commits de referência: `3d9d106` (v1.7.25), `e1a56db` (Pacote E), `1454bc8` (fix scripts teste).

---

## Proteções pós-incidente (v1.7.5+)

| Proteção | Onde |
|----------|------|
| ADM encerra sem SMS de extra | frontend v1.7.5+ |
| Sem extras fantasmas com GAS offline | frontend v1.7.6 + `somentePlano` no GAS |
| Nunca `clasp deploy` | `REGRAS_DE_PUBLICACAO_SEGURA.md` Regra 8 |
| Cache / URL GAS | `mk-version.js`, `gas-endpoint.json` |
| Escritas no tablet = GET | `api()` v1.7.34+; ver Regra 6 em `REGRAS_DE_PUBLICACAO_SEGURA.md` |
| Paridade HTTP nos testes | `TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` (readonly) |
| Dados financeiros só ADM | GAS v1.5.43 + frontend v1.7.18+ |
| Testes não poluem caixa | `limparLocacoesTesteAdmin` + cleanup scripts |
| Cronômetro portal = balcão | GAS `timestampCanonico_` v1.5.55+ + `canonLoc_` portal (I16) |
| Liberar sessão atualiza UI | `mkAuthSyncSessaoBalcaoUI_` + `cache: no-store` (I17) |
| Idle não desloga com locação | `mkHasLocacaoAbertaNoTablet_` v1.7.46 (I18) |
| Anti sessão fantasma PWA | `mkAuthReconcileSessaoFantasma_` + chip Turno v1.7.48 (I19) |
| Balanceamento HTML `#page-*` | `guard.html.page-balance` em pre-push (I22) |
| Gate locações ativas antes push FE | `check-operacao-livre.ps1` + Regra 14 (I22) |

---

## Auth operadores — ADM (GAS 1.5.35+)

| Ação | API |
|------|-----|
| Resetar PIN | `resetarPinOperadorAdmin` + `adminPin=1416` |
| Liberar balcão | `liberarSessaoOperadorAdmin` |
| Corrigir locação encerrada | `corrigirFinanceiroLocacaoAdmin` + `zerarExtra` (v1.5.36+) |
| Limpar locações de teste | `limparLocacoesTesteAdmin` + `motivo` ≥10 chars |
| Logout por inatividade | 1h — relógio real FE **v1.7.96** + GAS v1.5.72 |

---

## Roadmap UX — pacotes

- [x] Pacote A — design system v1.7.0
- [x] Financeiro extras + histórico — v1.7.1 + GAS v1.5.37
- [x] Pacote B — Hub admin — v1.7.2
- [x] Pacote Incidente — cache, ADM SMS, offline encerrar — v1.7.4–1.7.6
- [x] Pacote C — Nova locação 3 passos — v1.7.7+
- [x] Pacote SMS P0 + gateway DJVJRL — v1.5.41 + v1.7.11
- [x] UX auth/menu (pós-C) — v1.7.18–1.7.23
- [x] **Pacote D — Drawer sessão** — **v1.7.24**
- [x] **Pacote E — POST + auditoria plena** — **v1.7.26** + GAS **v1.5.44**
- [x] **Limpeza testes** — planilha + auto-cleanup nos scripts
- [x] **Pacote F — KPIs avançados** — **v1.7.38** + GAS **v1.5.48–1.5.52** (Dashboard 5 blocos + PDF Gestão Avançada)
- [x] **Pacote I — Sanitização gestão** — **v1.7.40** (Home enxuta, hub sem KPIs duplicados)
- [x] **Pacote G — Portal responsável** — **v1.7.41** + GAS **v1.5.54** (rate limit portal)
- [x] **Pacote H — Config amigável** — v1.7.43 + GAS v1.5.56 (validação config)
- [x] **Pacote J — Travas CI** — `pre-push-check.ps1` + guards I16/I18
- [x] **Fix cronômetro portal** — GAS v1.5.55 + portal `canonLoc_` (I16)
- [x] **Fix auth sessão UI + idle** — v1.7.45–46 (I17, I18)
- [x] **Pacote K.1** — RESPONSAVEIS populado (240 cadastros, import 06/06)
- [x] **Pacote K.2** — merge GAS canônico (v1.5.57)
- [x] **Pacote K.3–K.4** — homologado tablet 08/06/2026 (`CHECKLIST_PACOTE_K.md`)
- [x] **Pacote M — Payback investimento** — GAS v1.5.60–63 + FE v1.7.63–64 (painel Dashboard)
- [x] **Portal foto moldura** — `foto-moldura.html` + botão no portal (v1.7.62+)
- [~] **Fase 4 WhatsApp / SMS auto — PAUSADA** (QR Code oficial — `DECISAO_COMUNICACAO_QR_CODE_2026-06.md`)
- [x] **Pacote M — Modularização FE** — M.1–M.17 ✅ (v1.7.87; zero JS inline)
- [x] **Pacote L** — UX polish v1.7.91 (FASE 3 fechada)
- [x] **FASE 4 CONFIG** — planilha + tablet validados
- [x] **FASE 5** — ✅ fechada 09/06 (Milena + I21 v1.7.96)
- [~] **Fase 9 supervisor — PAUSADA**

---

## Planejamento ativo (`PLANO_CONTINUIDADE_2026-06.md`)

| Sprint | Foco | Status |
|--------|------|--------|
| **1** | Estabilizar: checklist I.5, tablets v1.7.87, testes | ✅ **fechada** 08/06 |
| **2** | **Pacote K** — K.1–K.4 homologado tablet | ✅ **fechada** 08/06 |
| **2b** | **Payback negócio** — FASE 2 | ✅ fechada 08/06 |
| **3** | **Pacote L** — UX polish + QR balcão v1.7.91 | ✅ fechada |
| **4** | **CONFIG planilha** — frota/preços sem redeploy GAS | ✅ fechada |
| **5** | **B7 write + APIs B1/B2** | **ativa** 08/06 |
| ⏸ | F4 WhatsApp / SMS automático | conta bloqueada; usar QR |
| ⏸ | F9 supervisor | pausada |

### Pacote F — escopo entregue (v1.7.27)

- Dashboard: desempenho por operador (AUDITORIA `encerrarLocacao`)
- Dashboard: cancelamentos do mês + motivos (AUDITORIA `cancelarLocacao`)
- Dashboard: ocupação da frota (% capacidade 12h/dia por veículo)
- Tile “Caixa de hoje” linka para Caixa (sem duplicar conferência)
- Horários de pico, ranking veículo, planos e pagamento — já existentes

### Pacote F — entregue neste incremento (v1.7.28 local)

- Custos por categoria (`cusPorCategoria`) no Dashboard
- Recorrência de clientes (`recorrenciaClientes`) — telefones com 2+ locações no mês
- Regressão: checagem ping ≥ v1.5.46 + gate admin em `buscarKPIsAdmin`

### Pacote F — fechado (v1.7.38)

- Dashboard: operador, cancelamentos, ocupação frota, custos por categoria, recorrência
- PDF/preview mensal com seção **Gestão Avançada — Pacote F**
- Tile Caixa de hoje → página Caixa
- Operador na Home **sem** KPIs financeiros; editar/cancelar/plano liberados (F9 pausada)

### Pacote I — sanitização gestão (v1.7.40)

- Home admin: removidos grid KPI mensal e ranking; só chip **Hoje: R$ X → Caixa**
- Hub admin: subtítulos sem R$ duplicado; chip **Online · app vX**
- Sistema: fechamento/copiar resumo removidos → atalho para **Caixa do dia**
- Dashboard: único lugar de KPIs do mês + gestão avançada; código legado removido
- Caixa: fechamento detalhado + copiar resumo (canônico)

### Pacote G — portal responsável (v1.7.41+)

- `acompanhar.html` redesenhado com `mk-design.css`, tema Movi Kids, `safe-area`, `theme-color`
- Máscara de telefone BR, deep link `?tel=`, QR no balcão, timer com anel de progresso
- GAS **v1.5.54**: rate limit `buscarPortalResponsavel` (20/min por telefone, 150/min global)
- GAS **v1.5.55**: `timestampCanonico_` + `mins` alinhados ao balcão (**I16**)
- Portal: `canonLoc_` / `calcStartTimestamp_` / refresh 15s — paridade com `mergeSessaoCanonica`
- Testes: `TESTE_PORTAL_READONLY.ps1`, **`TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1`**

### Mapa canônico de métricas (Pacote I)

| Métrica | Onde |
|---------|------|
| Faturamento **hoje** (detalhe) | **Caixa** |
| Chip “Hoje” na Home admin | Atalho → Caixa |
| Faturamento **mês**, margem, resultado, payback, ocupação | **Cockpit** `#mk-exec-cockpit` |
| Ticket médio, R$/h, break-even | **Leading** `#mk-leading-row` |
| Ano, locações, custos, extras, caixa hoje | **Dashboard** linha `#new-kpi-row` |
| Ativas / encerradas hoje (contagem) | **Home** stats-bar |
| Diagnóstico técnico | **Sistema** |

---

## Validação rápida (pós-deploy)

1. Ping GAS → `ok:true`, `versao` **v1.5.72**
2. Pages → `mk-version.js` → **1.7.96**
3. Tablet balcão → `?force=1.7.96`, rodapé **Online v1.7.96**
4. `.\scripts\pre-push-check.ps1` → status ok
5. B7 write → `.\scripts\testes\TESTE_B7_REGRESSAO_WRITE.ps1` → status ok (grava + cleanup)
6. Balcão + celular mesma locação → timer ± **2 s** (I16)
7. ADM liberar sessão → banner limpa sem Ctrl+F5 (I17)
8. Locação ativa + idle expirado → operador **permanece** logado (I18)
9. Nova locação salva no tablet (I15)
10. Idle I21 → `TESTE_SESSAO_IDLE_READONLY.ps1` ok; mock tablet opcional

Scripts: `scripts/testes/` — ver `scripts/testes/README.md`

---

## Script Properties (SMS)

| Propriedade | Valor produção |
|-------------|----------------|
| `SMS_GATEWAY_USER` | configurado no projeto GAS (não versionar valor) |
| `SMS_GATEWAY_PASS` | configurado no projeto GAS (não versionar valor) |
| `SMS_GATEWAY_DEVICE_ID` | configurado no projeto GAS (não versionar valor) |
