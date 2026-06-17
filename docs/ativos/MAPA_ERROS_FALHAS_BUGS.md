# MOVI KIDS — Mapa de erros, falhas e bugs

**Atualizado:** 17/06/2026 — **I28** liberar sessão tablet · GAS **v1.5.92** prod. · FE **v1.8.30**  
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

# Cronômetro portal × balcão (I16)
.\scripts\testes\TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1

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
| `guard.turno.chip` | `#hd-turno-chip` em index.html | I19 |
| `guard.html.page-balance` | balanceamento `<div>` page-home/nova/dashboard | I22 |
| `guard.operacao.livre` | `check-operacao-livre.ps1` se FE crítico alterado | I22 |
| `teste.paridade` | `scripts/testes/TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` | I15 |
| `teste.portal` | `scripts/testes/TESTE_PORTAL_READONLY.ps1` | portal |
| `teste.cronometro` | `scripts/testes/TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` | I16 |
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

---

## Versões de referência (14/06/2026)

| Camada | Repo / produção | Mínimo operação |
|--------|-----------------|-----------------|
| Frontend | **v1.8.30** | `?force=1.8.30` |
| GAS | **v1.5.92** (prod.) | `deploy-gas.ps1` se ping &lt; repo |
| Aba FOLHA | B68 ~5269,96 · `fonte=FOLHA` | `repairFolhaAdmin` após deploy que toque FOLHA |

Ver `ESTADO_ATUAL.md` para URLs e editor GAS.
