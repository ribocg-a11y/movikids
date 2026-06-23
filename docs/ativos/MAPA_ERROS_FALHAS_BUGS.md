# MOVI KIDS — Mapa de erros, falhas e bugs

**Atualizado:** 23/06/2026 — **I43** cronômetro revertia pós-I42 · FE **v1.8.114** · GAS **v1.5.136**  
**Uso anterior:** 22/06/2026 — **I38–I41** auditoria RH 22/06 · GAS repo **v1.5.129** (ping **v1.5.107**) · FE **v1.8.110**  
**Uso anterior:** 17/06/2026 — **I28** liberar sessão tablet · GAS **v1.5.92** prod. · FE **v1.8.30**  
**Uso anterior:** 09/06/2026 — **I22 fechado** (hotfix FE v1.8.2)  
**Uso:** consultar **antes de publicar** e **ao montar checklist de teste**. Cada linha tem trava e script de verificação quando existir.

**Protocolo de teste (obrigatório quando usuário pedir “rodar teste”):** `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` → `scripts/testes/TESTE_PROTOCOLO_DIAGNOSTICO.ps1`

**Índice de incidentes longos:** `INCIDENTE_*.md` (pós-mortems).  
**Regras anti-repetição:** `REGRAS_DE_PUBLICACAO_SEGURA.md` Regra 6–7.

---

## Como usar nos testes

```powershell
# Gate completo (recomendado antes de todo push)
.\scripts\pre-push-check.ps1

# Cronômetro portal × balcão (I16) + regressão I43
.\scripts\testes\TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1
.\scripts\testes\TESTE_I43_CARREGAR_INICIO_READONLY.ps1

# HTTP tablet (I15)
.\scripts\testes\TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1
```

**Tablet obrigatório** quando a linha marcar `tablet`: PowerShell sozinho **não** substitui (lição I15).

---

## Tabela mestre — causa → efeito → correção → trava → teste

| # | Problema | Efeito | Correção | Trava | Teste |
|---|----------|--------|----------|-------|-------|
| I1 | `clasp deploy` **sem `-i`** na Web App | 404; caixa quebrado | `clasp deploy -i AKfycbwakQ...` via `deploy-gas.ps1` | Regra 9 | ping |
| **I26** | **`clasp push` sem republicar Web App** | Editor v1.5.92 / `/exec` v1.5.91 (3×) | `deploy-gas.ps1` + `verify-gas-deploy.ps1` | Regra 9; clasp @138 desc | ping + verify |
| **I27** | **Web App exige login Google (≠ Anyone)** | `fetch()` Failed to fetch no Pages/tablet | **Editar** `AKfycbwakQ...` → Quem tem acesso = **Qualquer pessoa** | `live.anonymous` verify | aba anonima ping JSON |
| **I28** | **`prompt()` PIN admin + deslogar PIN-first no tablet** | Liberar/Deslogar balcão sem efeito; dual Milena+Admin | FE **v1.8.29** modal PIN + persist; **v1.8.30** banner dual + guards | `guard.auth.*` I28 | `TESTE_SESSAO_LIBERAR_READONLY.ps1` · tablet Liberar |
| **I29** | **Gestão Pessoas UI fora do DNA** (mock-pick, PIN único, CSS paralelo, passos juntos) | Colaboradores feio/não responsivo; perda padrão Movi Kids | FE **v1.8.48–1.8.49** `#gp-auth-gate` = `#mk-auth-gate`; **`DESIGN_SYSTEM_MOVIKIDS.md`** | `guard.ui.design-system`, `guard.ui.auth-gate` | `gestao-pessoas.html?force=1.8.49` · checklist §9 Design System |
| **I30** | **`getRange` numRows errado em `instalarAbasGestaoPessoas`** | Abas RH parciais (1 linha seed) | GAS **v1.5.99** — `getRange(2,1,seeds.length,cols)` | `guard.gas.getRange.numRows` | `gestaoPessoasStatus` · reinstalar abas |
| **I31** | **CONFIG `veiculos_validos_json` encoding quebrado (Pelúcia)** | Pelúcias ilegíveis — locação bloqueada | `salvarOperacaoConfigAdmin` UTF-8 / `\u00facia` | `TESTE_OPERACAO_CONFIG_READONLY` | Nova locação Pelúcia 01 |
| **I32** | **Nova locação `sessions.push` + SMS legado no Fechar** | Loc duplicada; fluxo SMS vs qr_only | FE **v1.8.68+** upsert + `_novaSavingInFlight` | `guard.nova.sms.sem.autoStart`; qr_only | tablet 1 loc · sem SMS Fechar |
| **I33** | **PWA cache stale + `carregarInicio` ~6s** | Tablet lento / não abre | Force update FE; limpar site data tablet | I3 versões; `verify-publish-complete` | `?force=1.8.71` · boot tablet |
| **I34** | **Holerite UX + CNPJ placeholder** | Doc RH abaixo padrão; CNPJ fictício | FE **v1.8.70–71** `mk-holerite.js` + CNPJ real | Design System § holerite | PDF holerite · CNPJ 66.664.255/0001-67 |
| **I35** | **PWA SW intercepta GAS** (`FetchEvent respondWith null`) | iPhone/Safari falha API | SW não intercepta `script.google.com` · FE **v1.8.104+** | `sw.js` NETWORK_FIRST exclui GAS | tablet iPhone ping + login |
| **I36** | **`salvarCadastro` getRange numRows** (2 linhas vs 1) | Cadastro RH não grava 100% | GAS **v1.5.127** `getRange(r,4,1,7)` | review getRange cadastro | Raykelly/Milena 100% planilha |
| **I37** | **`gestao-pessoas.html` sem stale-sync** | Safari cache antigo Colaboradores | `mk-stale-sync` + `mk-gp-boot.js` · **v1.8.105+** | boot GP | Safari `?force=` |
| **I38** | **`p.preview` fantasma** — banner ADM com PIN colab | UX “somente leitura”; ponto parece bloqueado | FE **v1.8.110–111** — banner só `gpAdmPreviewMode_`; `preview: false` no login | `renderColabHub`; `colabEntrar` | preview admin → sair → login PIN → sem faixa |
| **I39** | **VA/salário mês cheio** com admissão ISO/meio mês | Raykelly VA ~399 vs ~213 | GAS **v1.5.129–130** proporcional + trava 0 dias | `TESTE_VA_ADMISSAO_PROPORCIONAL_READONLY.ps1` | holerite após Web v1.5.130 |
| **I40** | **Hub benefícios `calcFolhaPagamento`** ≠ GAS quinzenal | Chips VA/VT divergem do holerite | FE **v1.8.111** — hub usa `pg.holerite` | `gpBeneficiosResumo_` | hub vs tela holerite |
| **I43** | **`carregarInicio` getRange 19 cols (I42) sem col Y** | **▶ inicia → sync reverte para Pendente 10:00** | GAS **v1.5.136** `COL_LOC_READ_=28`; FE **v1.8.114** merge I43 | `guard.gas.carregarInicio.colY`, `guard.sync.i43` | **`TESTE_I43_CARREGAR_INICIO_READONLY`** + tablet ▶ |
| **I42** | Conta do dia — mesmo telefone 10h–22h | Caixa `n` vs sessões; maquininha | GAS **v1.5.131+** col S `conta_id` | `TESTE_I42_CONTA_DIA_CAIXA` | não reduzir `COL_LOC_READ_` (ver I43) |
| **I41** | **`ping_` versão defasada** (v1.5.107 vs repo) | Confusão deploy / verify | GAS **v1.5.130** `ping_()` alinhado | `ping_` header alinhado | ping = v1.5.130 |
| I2 | GAS offline + timer local | Extra fantasma | ADM `somentePlano`; offline v1.7.6 | `FIX_OFFLINE_ENCERRAR` | tablet encerrar |
| I3 | Cache `?force=` / **`index.html ?v=` desatualizado** | JS antigo no tablet/admin | `mk-version` + `sw` + **index** alinhados | `pre-push-check` versões | `?force=VERSAO` · ver **11/06** |
| **I25** | **FOLHA `#NAME?` — `setValue('=SE...')` no GAS** | Aba FOLHA quebrada; Dashboard usa fallback 4926 | GAS **v1.5.91** `folhaFlushFormulasUser_` (USER_ENTERED) + `repairFolhaAdmin` | Nunca `setValue`/`setFormula` PT para fórmulas FOLHA | `TESTE_FOLHA_FORMULAS_READONLY.ps1` · **fechado 14/06** |
| **I24** | **Commit local sem `git push`** / Pages desatualizada | Mesmo sintoma I3; remoto em versão antiga | `git push` + **`verify-publish-complete.ps1`** | `git.not-ahead-of-origin`, `pages.version-live` | curl Pages `mk-version.js` · **11/06** |
| I4 | `mk-login-err` duplicado | Erro PIN invisível | ID único `mk-login-pin-err` | review HTML ids | login PIN errado |
| I5 | Liberar sessão sem refresh UI (v1) | ADM acha que botão falhou | `refreshOperadoresAdmin_` | — | ADM liberar |
| I6 | Sessão única sem liberar | 409 operador | `liberarSessaoOperadorAdmin` | GAS sessão TTL | login 2º op |
| I7 | Extra errado encerrada | Caixa errado | `corrigirFinanceiroLocacaoAdmin` | GAS auditoria | ADM corrigir |
| I8 | CSS `.btn-secondary` 100% | Busca Quem esmagada | `nova-rel-search` | CSS scoped | Nova locação UX |
| I9 | `incluirExtraLocalAdm` indefinido | ADM offline quebra | `session._incluirExtraLocalAdm` | — | encerrar offline |
| I10 | Testes `DRAWER_E_*` sujos | stats/caixa poluídos | `limparLocacoesTesteAdmin` | cleanup scripts | pós-teste |
| I11 | `cancelarLocacao` restrito | Teste no caixa | Anular → Cancelada | GAS v1.5.45 | cancelar teste |
| I12 | URL GAS morta em script | Teste falha | URL `AKfycbwakQ...` | scripts grep URL | regressão PS |
| I13 | Race `listarAtivas` | Falso negativo encerrar | Verificar row Ativa | `TESTE_DRAWER_E` | drawer E |
| I14 | Ping desatualizado no `.gs` | Prod versão antiga | `ping_()` + Nova versão | header GAS | ping |
| I15 | **POST no FE browser** v1.7.26–33 | **Balcão parado** | GET v1.7.35+; `mkGuardEscritaBrowser_` | Regra 6; pre-push | paridade HTTP + **tablet** |
| **I16** | **Portal sem `timestampCanonico_`** | **Celular ≠ balcão (minutos)** | GAS v1.5.55 + `canonLoc_` portal | GAS+FE canon; pre-push estático | **`TESTE_PARIDADE_CRONOMETRO`** + tablet+celular |
| **I20** | **Col C no cadastro + `serverTs` na API (latência Δt)** | **Timer adiantado ao ▶ (09:33 / 09:50 / ~3–27s); botão ▶ lento** | GAS **v1.5.66** `clientTs`; FE **v1.7.78** otimista + `_localTimerStart` + `effectiveStartTs_` | guards I20 em `pre-push-check`; Regra 13 | **`TESTE_I20_COMPLETO_PROD`** + **tablet** ▶→10:00 imediato |
| **I17** | **Liberar sessão + cache GET** | **Banner operador preso** | v1.7.45 sync UI + `no-store` | `mkAuthSyncSessaoBalcaoUI_`; api cache | ADM liberar **tablet** |
| **I18** | **Idle 1h com locação aberta** | **Logout no meio da locação** | v1.7.46 `mkHasLocacaoAbertaNoTablet_` | mk-auth + tickAdmin | mock idle + loc ativa |
| **I19** | **PWA sessão fantasma + turno invisível** | Operador “dentro” do app; servidor sem turno; Home sem nome; AUD sem logout idle | v1.7.48 `mkAuthReconcileSessaoFantasma_` + chip `#hd-turno-chip` | pre-push `guard.auth.fantasma`; PWA `mk-update` | tablet ícone: chip Turno + liberar ADM |
| **I21** | **Idle 1h — sessão dual + splash boot** | Milena 14h+ logada; mock idle travava splash | **B8** v1.7.94/96 + v1.5.72: wall clock, release GAS, `hideSplash_` boot | `guard.idle.wallclock`, `guard.idle.gas.release` | **`TESTE_SESSAO_IDLE_READONLY`** + tablet mock ✅ |
| **I22** | **`</div>` extra em `#page-dashboard` (FASE 6)** | **Home/balcão fora do ar** com locações ativas | FE **v1.8.2** — remover `</div>`; Regra 14 janela operacional | `guard.html.page-balance`, `guard.operacao.livre`, `check-operacao-livre.ps1` | **tablet F0 Home** após mudança em `index.html` |
| **I23** | **Mutex `_kpiInFlight` + `resumoDia` pesado (FASE 7)** | Dashboard KPIs `"Calculando..."` eterno; app pesado | FE **v1.8.4** locks hub/dash; GAS **v1.5.77** `calcLeadingDiaPatch_` | separar `_kpiHubInFlight` / `_kpiDashInFlight`; não `kpiMes`+`resumoDia` paralelo no Dash | **PC admin** Dashboard + `TESTE_KPI_MES_READONLY` |
| T1 | Em-dash `—` em string `.ps1` perto de `-f` | ParserError em `TESTE_RELACIONAMENTO`, `TESTE_I20` | Hífen ASCII `-` em mensagens | `scripts/testes/README.md` | `TESTE_RELACIONAMENTO_*`, `TESTE_I20_COMPLETO_PROD.ps1` |

---

## Incidentes — documentos

| Doc | IDs |
|-----|-----|
| `../arquivo/incidentes/INCIDENTE_DEPLOY_E_EXTRAS_2026-06-04.md` | I1, I2 |
| `../arquivo/incidentes/INCIDENTE_AUTH_OPERADORES_2026-06-04.md` | I4, I6, I7, timer sem operador |
| `../arquivo/incidentes/INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md` | **I15** |
| `../arquivo/incidentes/INCIDENTE_CRONOMETRO_PORTAL_AUTH_2026-06-05_06.md` | **I16, I17, I18, I20 fase 1** |
| **`INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`** | **I20 definitivo** — cronologia, causa raiz, travas |
| `../arquivo/incidentes/INCIDENTE_AUTH_SESSAO_FANTASMA_PWA_2026-06-06.md` | **I19** (Milena 06/06, login OK 13:05) |
| `../arquivo/incidentes/INCIDENTE_I21_SESSAO_IDLE_DUAL_2026-06-09.md` | **I21** — idle dual, B8 v1.7.94/v1.5.72 |
| `../arquivo/incidentes/INCIDENTE_I22_HOME_FORA_DO_AR_FASE6_HTML_2026-06-09.md` | **I22** — `</div>` extra FASE 6; Home P0 |
| `../arquivo/incidentes/INCIDENTE_I3_CACHE_BUST_INDEX_2026-06-11.md` | **I3 recorrência** — v1.8.15 não carregava (index.html) |
| `../arquivo/incidentes/INCIDENTE_I25_FOLHA_FORMULAS_NAME_2026-06-13.md` | **I25** — FOLHA USER_ENTERED |
| `../arquivo/incidentes/INCIDENTE_I24_COMMIT_SEM_PUSH_2026-06-11.md` | **I24** — v1.8.18 commit sem push |
| `../arquivo/incidentes/INCIDENTE_I23_DASHBOARD_LENTO_TRAVADO_2026-06-09.md` | **I23** — Dashboard lento; mutex KPI + GAS perf |
| `../arquivo/incidentes/INCIDENTE_I26_GAS_EDITOR_VS_EXEC_2026-06-14.md` | **I26** — push sem republicar |
| `../arquivo/incidentes/INCIDENTE_I27_GAS_LOGIN_ANONIMO_2026-06-14.md` | **I27** — ServiceLogin / Failed to fetch |
| `../arquivo/incidentes/INCIDENTE_I28_LIBERAR_SESSAO_TABLET_2026-06-17.md` | **I28** — prompt PIN / liberar balcão tablet |
| `../arquivo/incidentes/INCIDENTE_I29_GESTAO_PESSOAS_DNA_UI_2026-06-18.md` | **I29** — UI colaboradores fora DNA; Design System |
| `../arquivo/incidentes/INCIDENTE_I30_GAS_ABAS_GESTAO_RANGE_2026-06-18.md` | **I30** — abas RH getRange v1.5.99 |
| `../arquivo/incidentes/INCIDENTE_I31_CONFIG_ENCODING_PELUCIAS_2026-06-20.md` | **I31** — Pelúcias CONFIG encoding |
| `../arquivo/incidentes/INCIDENTE_I32_LOCACAO_DUPLICADA_SMS_2026-06-20.md` | **I32** — loc duplicada + SMS legado |
| `../arquivo/incidentes/INCIDENTE_I33_PWA_CACHE_BOOT_LENTO_2026-06-20.md` | **I33** — PWA stale + boot lento |
| `../arquivo/incidentes/INCIDENTE_I34_HOLERITE_APRESENTACAO_2026-06-20.md` | **I34** — holerite UX + CNPJ |
| **`INCIDENTE_I43_CARREGAR_INICIO_COL_Y_2026-06-23.md`** | **I43** — regressão I42; col Y fora do getRange |
| `../arquivo/incidentes/INCIDENTE_I38_PREVIEW_BANNER_PIN_COLAB_2026-06-22.md` | **I38** — banner preview com PIN colab |
| `../arquivo/incidentes/INCIDENTE_I39_VA_ADMISSAO_PROPORCIONAL_2026-06-22.md` | **I39** — VA proporcional admissão |
| **`AUDITORIA_RH_FOLHA_PERSISTENCIA_2026-06-22.md`** | Matriz abas RH · I40 · lacunas RH-G1–G15 |
| `TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md` | Gateway SMS |

---

## Travas automáticas (Pacote J — pre-push)

| Check | Arquivo | Incidente |
|-------|---------|-----------|
| `versao.mk-vs-sw` | `mk-version.js`, `sw.js` | I3 |
| `versao.index-cache-bust` | `index.html` | I3 |
| `guard.post.escritas` | `mkGuardEscritaBrowser_` | I15 |
| `static.no-post-index` | sem POST em index | I15 |
| `guard.portal.canon` | `canonLoc_`, `calcStartTimestamp_` em acompanhar | I16 |
| `guard.gas.portal.canon` | `timestampCanonico_` em `buscarPortalResponsavel_` | I16 |
| `guard.gas.salvar.horaVazia` | `salvarLocacao_` — col C `''` no cadastro | I20 |
| `guard.gas.timestamp.noFallback` | `timestampCanonico_` — só col Y; sem data+hora cadastro | I20 |
| `guard.gas.iniciar.clientTs` | `iniciarTimer_` — `canonTs` / `clientTs` (não só `serverTs`) | I20 |
| `guard.fe.iniciar.otimista` | `mk-operacao.js` — `clickTs`, `_localTimerStart` | I20 |
| `guard.sessao.effectiveStart` | `mk-sessao.js` — `effectiveStartTs_` | I20 |
| `guard.sync.localTimer` | `mk-sync.js` — merge preserva `_localTimerStart` | I20 |
| `guard.sync.i43` | `mk-sync.js` — Ativa sem `startTimestamp` preserva ts local | I43 |
| `guard.gas.carregarInicio.colY` | `carregarInicio_` — `COL_LOC_READ_` se usa `r[24]` | I43 |
| `guard.nova.sms.sem.autoStart` | `mk-nova.js` — cadastro não auto-inicia | I20 |
| `guard.iniciar.direto` | `iniciarContagemDireto_` sem modal BV | I20 |
| `guard.idle.locacao` | `mkHasLocacaoAbertaNoTablet_` em mk-auth | I18 |
| `guard.auth.fantasma` | `mkAuthReconcileSessaoFantasma_` em mk-auth | I19 |
| `guard.idle.wallclock` | `mkAuthIdleRemainingMs_` em mk-auth | I21 |
| `guard.idle.gas.release` | `mkAuthReleaseBalcaoServer_` em mk-auth | I21 |
| `guard.auth.no-prompt-pin` | `mkAuthEnsureAdminPin_` sem `prompt()` | I28 |
| `guard.auth.pin-modal` | `mkAdminPinModalAsk_` em mk-admin | I28 |
| `guard.auth.pin-persist` | `mkAuthRestoreAdminPin_` + persist 24h | I28 |
| `guard.auth.deslogar-api-first` | `mkOpDeslogarBalcao` API antes do PIN | I28 |
| `guard.auth.dual-banner` | `mkAuthDualSessaoBanner_` + `#mk-dual-sessao-banner` | I28 |
| `guard.ui.design-system` | Consultar `DESIGN_SYSTEM_MOVIKIDS.md` §0 antes de criar/alterar UI | I29 |
| `guard.ui.auth-gate` | Auth colaboradores = `#gp-auth-gate` (classes `mk-auth-*` de `mk-app.css`) | I29 |
| `guard.ui.no-mock-pick-prod` | Proibido `mock-pick` em login produção | I29 |
| `guard.ui.pin-four-boxes` | PIN = 4× `.mk-pin-box`; nunca campo único largo | I29 |
| `guard.host.canonical` | `mk-canonical-host.js` → host `ribocg-a11y` | I29 |
| `guard.gas.getRange.numRows` | `getRange(row,col,numRows,numCols)` — seeds.length não 1+len | I30 |
| `guard.turno.chip` | `#hd-turno-chip` em index.html | I19 |
| `guard.html.page-balance` | balanceamento `<div>` page-home/nova/dashboard | I22 |
| `guard.operacao.livre` | `check-operacao-livre.ps1` se FE crítico alterado | I22 |
| `teste.paridade` | `scripts/testes/TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` | I15 |
| `teste.portal` | `scripts/testes/TESTE_PORTAL_READONLY.ps1` | portal |
| `teste.cronometro` | `scripts/testes/TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` | I16 |
| `teste.i43` | `scripts/testes/TESTE_I43_CARREGAR_INICIO_READONLY.ps1` | I43 |
| `teste.sessao.liberar` | `scripts/testes/TESTE_SESSAO_LIBERAR_READONLY.ps1` | I28 |

## Travas pos-push (Pacote J — após `git push` FE)

| Check | Script | Incidente |
|-------|--------|-----------|
| `git.not-ahead-of-origin` | `verify-publish-complete.ps1` | I24 |
| `gas.deploy.verify` | `verify-gas-deploy.ps1` | I26, I27 |

---

## Checklist tablet mínimo (pós-deploy FE)

- [ ] Ping GAS ≥ versão esperada (`ESTADO_ATUAL.md`)
- [ ] Nova locação salva (I15)
- [ ] Timer balcão = portal mesmo telefone ±2 s (I16)
- [ ] Nova locação **Pendente** mostra 10:00; timer **parado** até ▶ (I20)
- [ ] ▶ responde na hora (“⏳ Iniciando…”); ativo começa **10:00** ±1 s — não 09:33 (I20)
- [ ] `TESTE_I20_COMPLETO_PROD.ps1` verde após mudança em timer (I20)
- [ ] `TESTE_I43_CARREGAR_INICIO_READONLY.ps1` verde após mudança em `carregarInicio_` (I43)
- [ ] ▶ não reverte para Pendente após sync (I43) — tablet
- [ ] ADM liberar sessão atualiza banner (I17)
- [ ] Idle não desloga com locação Ativa (I18)
- [ ] Chip **Turno: Nome** visível no header (I19) — PWA ícone
- [ ] Liberar sessão ADM → tablet desloga ou chip laranja em ≤60s (I19)
- [x] Mock idle 1h → gate login + balcão livre no GAS (I21) — **09/06 v1.7.96**
- [ ] Admin timer mostra `MM:SS`; `⏸` com locação Ativa (I21/I18)
- [ ] **Dual admin + operador GAS:** faixa laranja Liberar + modal PIN (I28) — `?force=1.8.30`
- [ ] Operadores → Deslogar balcão → teclado numérico, não `prompt()` nativo (I28)
- [ ] Dashboard admin carrega KPIs em &lt;15s — não fica em "Calculando..." (I23)
- [ ] Ctrl+F5 com `?force=VERSAO_ATUAL`

---

## Aprendizados — nunca repetir

1. **Nunca** `clasp deploy` **sem `-i`** (I1). **Nunca** só `clasp push` sem `deploy-gas.ps1` (I26).
2. **Nunca** POST no `api()` do browser (I15).
3. **Nunca** timer do portal sem paridade com `carregarInicio` (I16).
4. **Nunca** gravar **Hora Início (col C)** no cadastro nem inferir `startTimestamp` por data+hora do cadastro — só col **Y** após `iniciarTimer` (I20).
5. **Nunca** usar só `serverTs` em `iniciarTimer_` nem esperar API antes de mostrar card ativo — usar `clientTs` + início otimista (I20).
6. **Nunca** validar só PowerShell e declarar tablet OK (I15).
7. **Sempre** `cache: 'no-store'` em leituras de sessão no tablet (I17).
8. **Sempre** registrar novo bug neste mapa + incidente `.md` + trava em `pre-push-check` quando possível.
9. **Sempre** bump `mk-version` + `sw` + cache bust juntos (I3).
10. **Nunca** assumir tablet deslogado após `liberarSessaoOperadorAdmin` — PWA pode manter fantasma (I19).
11. **Sempre** validar turno com chip header + `listarOperadoresLogin.sessaoAtiva` (I19).
12. **Nunca** confiar só em TTL 18h no GAS para idle — usar `lastActivityAt` + FE wall clock (I21).
13. **Nunca** `adminLogin()` sobrescrever sessão operador sem liberar balcão no servidor (I21).
14. **Nunca** publicar mudança em `index.html` / Home / sync / sessão com locações **Ativa/Pendente** — Regra 14; hotfix P0 só com aprovação (I22).
15. **Sempre** validar balanceamento HTML das páginas `#page-*` antes de push (I22).
16. **Nunca** compartilhar mutex entre `carregarKPIs` (hub) e `carregarKPIsDashboard` (I23).
17. **Nunca** chamar `buildKpiMesPayload_` dentro de `resumoDia` — usar patch leve `calcLeadingDiaPatch_` (I23).
18. **Sempre** pacote deploy completo (`DEPLOY_v*.md` **modelo `DEPLOY_v1.5.76`**) ao entregar fase GAS+FE — caminho PC, clasp, links, testes, checklist tablet, critério de pronto (Regra 8).
19. **Após deploy GAS que toque FOLHA:** rodar `repairFolhaAdmin` + `TESTE_FOLHA_FORMULAS_READONLY.ps1` (I25).
20. **Nunca** usar `prompt()` para PIN admin no tablet — só `mkAdminPinModalAsk_` (I28).
21. **Nunca** pedir PIN admin **antes** de tentar `liberarSessaoOperador` em `mkOpDeslogarBalcao` (I28).
22. **Sempre** faixa `#mk-dual-sessao-banner` quando admin local + `sessaoAtiva` no GAS (I28).
23. **Sempre** consultar **`DESIGN_SYSTEM_MOVIKIDS.md`** antes de criar/alterar UI (I29).
24. **Nunca** login produção com `mock-pick` ou PIN campo único — usar `#mk-auth-gate` / `#gp-auth-gate` (I29).
25. **Nunca** CSS auth paralelo fora de `mk-app.css` `#mk-auth-gate,#gp-auth-gate` (I29).
26. **Sempre** host **`ribocg-a11y`** (hífen) — nunca `ribocg.a11y` (I29).
27. **Revisar** `getRange` numRows ao gravar seeds em abas GAS (I30).
28. **Nunca** gravar `veiculos_validos_json` sem validar acentos Pelúcia — usar Unicode explícito (I31).
29. **Nunca** `sessions.push` após `salvarLocacao` — upsert por `rowIndex`/`id` + mutex save (I32).
30. **Nunca** reexpor SMS no Fechar Nova locação enquanto `MK_COMUNICACAO_MODO=qr_only` (I32).
31. **Sempre** force update FE após hotfix operacional + procedimento tablet `?force=` (I33).
32. **Nunca** CNPJ/razão fictícios em holerite produção — usar dados reais da empresa (I34).
33. **Nunca** confiar em `p.preview` no objeto colaborador — modo preview só `gpAdmPreviewMode_` + URL `admPreview=1` (I38).
34. **Sempre** proporcional admissão em holerite — admissão inválida = 0 dias, nunca mês cheio (I39).
35. **Hub benefícios** deve usar `pg.holerite` da API, não `calcFolhaPagamento` mensal (I40).
36. **Nunca** usar `getRange(..., COL_CONTA_ID_)` em `carregarInicio_`/`listarAtivas_` se a função lê `r[24]`/`r[25]` — usar **`COL_LOC_READ_` = 28** (I43 regressão I42).
37. **Sempre** rodar `TESTE_I43_CARREGAR_INICIO_READONLY.ps1` após mudança em sync/timer GAS (I43).

---

## Versões de referência (23/06/2026)

| Camada | Repo / produção | Mínimo operação |
|--------|-----------------|-----------------|
| Frontend | **v1.8.114** (I43 hotfix) | `?force=1.8.114` · cronômetro |
| GAS | **v1.5.136** (I43) · Web **v1.5.136** | Nova versão após mudança em `carregarInicio` |
| Design System | **`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`** | Obrigatório antes de UI |
| Aba FOLHA | B68 ~5269,96 · `fonte=FOLHA` | `repairFolhaAdmin` após deploy que toque FOLHA |

Ver `ESTADO_ATUAL.md` para URLs e editor GAS.
