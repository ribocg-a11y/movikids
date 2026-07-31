# MOVI KIDS — Mapa de erros, falhas e bugs

**Atualizado:** 15/07/2026 — **I116** Web ✅ **v1.5.196** · FE **v1.9.58** · Ray warm ~4s · frio ~20s  
**Uso anterior:** 15/07/2026 — **I116** enrich login sem expandir RH · GAS repo **v1.5.196** · FE **v1.9.58** · Web **v1.5.195** até Nova versão  
**Uso anterior:** 15/07/2026 — **I115** Web ✅ v1.5.195 · Ray frio ~16s / warm ~3s · residual enrich-all-RH + kpiMes ~34s  
**Uso anterior:** 15/07/2026 — **I115** login Colaboradores ~61s · FE **v1.9.57** (mitigação) · GAS **v1.5.194**  
**Uso anterior:** 15/07/2026 — **I110** Q1 sem faltas + pacote holerite · FE **v1.9.52** · GAS **v1.5.192**  
**Uso anterior:** 15/07/2026 — **I109b** pot FSS R$50 cada · FE **v1.9.51** · GAS **v1.5.191**  
**Uso anterior:** 15/07/2026 — **I109** bônus FSS metade · FE **v1.9.50** · GAS **v1.5.190**  
**Uso anterior:** 15/07/2026 — **I108** 1ª quinzena 50% VA/bônus/VT · FE **v1.9.49** · GAS **v1.5.189**  
**Uso anterior:** 14/07/2026 — **I107** ritmo realista Dashboard · FE **v1.9.48** · GAS **v1.5.188**  
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
| **I44** | **`gpPersistBancoFromJornada_` em leitura painel RH** | BANCO_HORAS -544h→-884h; alertas absurdos | GAS **v1.5.137** — persist só na saída ponto; `repairBancoHorasAdmin` | não persist em read | zerar aba + repair API |
| **I45** | **Cadastro RH não persistido / installer apagava abas** | Raykelly 25% após “completar”; FE falso sucesso | GAS **v1.5.138** · FE **v1.8.116** · `diagnosticoPlanilhaCompletoAdmin` | não `clear()` com dados · salvar exige PIN | Raykelly refazer cadastro |
| **I46** | **Faltas/holerite RH + sync jornada** | Holerite com desconto faltas; governança dados | GAS **v1.5.140** · FE **v1.8.117** | persist no colaborador, não admin | `GOVERNANCA_DADOS_RH_2026-06-23.md` |
| **I47** | **PIN duplo submit + teclado password no tablet** | “PIN incorreto” falso; várias tentativas | FE **v1.8.118** `_authBusy` + `tel` · GAS **v1.5.141** hash strip | `onLoginPin` guard | tablet `?force=1.8.118` |
| **I51** | **Ponto FOLHA_PONTO apagado** — faltas falsas eram sintoma | Raykelly 1 linha; holerite −270 | GAS **v1.5.145** restore + falta auto | abono só ADM | `RESTAURAR_PONTO_RAYKELLY_JUN2026` |
| **I50** | ~~Faltas falsas~~ **revertido** — ver I51 | — | — | — | — |
| **I49** | **VA R$ 520** — `va_diario=20` na planilha × 26 dias | Holerite mostra 520/mês; VA ~277 em vez de ~213 | GAS **v1.5.143** `gpVaMensalTeto_` | nunca va_diario×dias como teto | `TESTE_VA_ADMISSAO_PROPORCIONAL` |
| **I48** | **`painelGestaoPessoasAdmin` escrevia FALTAS/HOLERITES na leitura** (I46) | Operadores admin lento de novo | GAS **v1.5.142** — só cálculo em memória no admin | nunca append em read admin | 2× painelGestaoPessoasAdmin |
| **I43** | **`carregarInicio` getRange 19 cols (I42) sem col Y** | **▶ inicia → sync reverte para Pendente 10:00** | GAS **v1.5.136** `COL_LOC_READ_=28`; FE **v1.8.114** merge I43 | `guard.gas.carregarInicio.colY`, `guard.sync.i43` | **`TESTE_I43_CARREGAR_INICIO_READONLY`** + tablet ▶ |
| **I52** | **`validarSchema` 18 cols; `listarAtivas` 26 cols; LOCACOES sem padronização** | Schema falso negativo; extensão fora de listagem | GAS **v1.5.149** · `repararLocacoesPlanilhaAdmin` | `guard.gas.listarAtivas.colY`, `guard.gas.validarSchema.loc28` | **`REPARAR_LOCACOES_PLANILHA_ADMIN`** + `TESTE_REAUDITORIA_PLANILHA` |
| **I53** | **CONFIG sem memorial/schema; `cfgReadMap_` legado linha 2** | Frota/preços sem audit; protocolo aba 2 bloqueado | GAS **v1.5.150** · `repararConfigPlanilhaAdmin` | `guard.gas.validarSchema.config` | **`REPARAR_CONFIG_PLANILHA_ADMIN`** + `TESTE_OPERACAO_CONFIG_READONLY` |
| **I54** | **OPERADORES_SISTEMA sem memorial; `OP_DATA_ROW` fixo** | Login/schema sem audit; MAPA cols erradas | GAS **v1.5.151** · `repararOperadoresSistemaPlanilhaAdmin` | `guard.gas.validarSchema.ops` | **`REPARAR_OPERADORES_SISTEMA_PLANILHA_ADMIN`** + `TESTE_SESSAO_LIBERAR_READONLY` |
| **I55** | **CUSTOS sem memorial dedicado; schema inline em validarSchema** | Caixa/mini-DRE sem audit | GAS **v1.5.152** · `repararCustosPlanilhaAdmin` | `guard.gas.validarSchema.cus` | **`REPARAR_CUSTOS_PLANILHA_ADMIN`** + `TESTE_CUSTOS_READONLY` |
| **I56** | **DASHBOARD sem memorial/audit; formulas fragil** | KPI planilha sem guard | GAS **v1.5.153** · `repararDashboardPlanilhaAdmin` (conservador) | `guard.gas.validarSchema.dash` | **`REPARAR_DASHBOARD_PLANILHA_ADMIN`** + `TESTE_DASHBOARD_READONLY` |
| **I57** | **FOLHA fora do protocolo abas; só repairFolhaAdmin legado** | Sem validarSchema FOLHA | GAS **v1.5.154** · `repararFolhaPlanilhaAdmin` (ext. I25) | `guard.gas.validarSchema.folha` | **`REPARAR_FOLHA_PLANILHA_ADMIN`** + `TESTE_FOLHA_FORMULAS_READONLY` |
| **I58** | **INVESTIMENTO sem memorial/schema no protocolo** | Payback sem audit aba | GAS **v1.5.155** · `repararInvestimentoPlanilhaAdmin` | `guard.gas.validarSchema.inv` | **`REPARAR_INVESTIMENTO_PLANILHA_ADMIN`** + `TESTE_INVESTIMENTO_READONLY` |
| **I59** | **RESPONSAVEIS sem protocolo; CRM 240 linhas legado** | Portal sem audit planilha | GAS **v1.5.156** · `repararResponsaveisPlanilhaAdmin` | `guard.gas.validarSchema.resp` | **`REPARAR_RESPONSAVEIS_PLANILHA_ADMIN`** + `TESTE_RELACIONAMENTO_*` |
| **I60** | **RELATORIOS só validarSchema inline** | PDFs sem audit | GAS **v1.5.158** prod | `guard.gas.validarSchema.rel` | **`REPARAR_RELATORIOS_PLANILHA_ADMIN`** + `TESTE_RELATORIOS_READONLY` |
| **I61** | **AUD_* camada 4 sem protocolo** | Metas RH sem schema | GAS **v1.5.159** prod | `guard.gas.validarSchema.aud` | **`REPARAR_AUD_CAMADA4_PLANILHA_ADMIN`** + `TESTE_AUD_CAMADA4_READONLY` |
| **I62** | **RH P0 sem protocolo abas** | Gate 428 sem schema | GAS **v1.5.160** prod | `guard.gas.validarSchema.rh` | **`REPARAR_RH_CAMADA5_PLANILHA_ADMIN`** + `TESTE_RH_CAMADA5_READONLY` |
| **I63** | **RH resto sem protocolo abas** | ESCALA/FALTAS/HOL sem schema | GAS **v1.5.161** prod | `guard.gas.validarSchema.rhResto` | **`REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN`** + `TESTE_RH_CAMADA5_RESTO_READONLY` |
| **I64** | **PIN admin vazado + faixa preview colab** | 1416 na UI; banner ADM no hub | FE **v1.8.120** · GAS **v1.5.162** repo | `guard.pin.leak.fe` / `guard.pin.leak.gas` | `ROTACAO_PIN_ADMIN.md` · Script Property `ADMIN_PIN` |
| **I67** | **RESPONSAVEIS L233 tel curto (import K.1)** | Audit célula warn; duplicata VERA `98987203839` | OAuth merge + delete L233 · **25/06** | `AUDITORIA_CELULA_PLANILHA` | `INCIDENTE_I67_RESP_NEIDE_L233_DUPLICATA_2026-06-25.md` |
| **I68** | **VT folha dobrado + dias VA no lugar de VT** | ~R$ 437 passes; timeout 25s Colaboradores | GAS **v1.5.167** · FE **v1.9.2** · B9=8,80 B10=22 · **26/06** | `TESTE_INVESTIGACAO_VT_COLABORADORES` | `INCIDENTE_I68_VT_FOLHA_DUPLO_2026-06-26.md` |
| **I69** | **Ponto mock falso sucesso sem `gpSessionPin`** | Raykelly: tela OK mas planilha vazia / confusão PIN | FE **v1.9.3** · **27/06** | `gestao-pessoas.html` `MK_GP_PROD` | `INCIDENTE_I69_PONTO_MOCK_FALSO_SUCESSO_2026-06-27.md` |
| **I70** | **Strings versão GAS defasadas + FOLHA_PONTO OK sem horário** | `carregarInicio` v1.5.123; audit 5 linhas | GAS **v1.5.169** · `MK_GAS_VERSAO_` · `repairFolhaPontoOkSemHorarioCore_` | `guard.gas.versao` | **`REPARAR_RH_CAMADA5_PLANILHA_ADMIN`** após Nova versão Web |
| **I71** | **Holerite competência passada — bonus dias/meta do mês errado** | Filtro mês anterior mostrava bonus/loc do mês corrente | GAS **v1.5.169** · `gpEnrichContextAudit_` usa `compNorm` | FE v1.9.5 competencia param | painel admin/colab holerite mês anterior |
| **I72** | **Gráfico projeção — meta travada cedo demais (R$372 vs R$13k)** | Linha roxa colada no zero; 3000%+ acima projetado | GAS **v1.5.170** · `metaProjecaoStale_` + trava após 3 dias · FE **v1.9.6** | `PROJ_CHART_MM_YYYY` Script Property | Dashboard gráfico projetado vs real |
| **I73** | **Dashboard lento pós I72 — kpiMes lite+full sequencial + alertas pesados** | Spinner longo; dados demoram | GAS **v1.5.171** lite sem `alertasInteligentes_` · FE **v1.9.7** full em background | `kpiMes83_*` cache | Dashboard abre após lite (~1 chamada) |
| **I74** | **Gestão Pessoas dropdown vazio / lento (~23s)** | Colaborador sem opções; fila GAS com Dashboard | GAS **v1.5.172** `gpIntelRhAlertasFromCtx_` · FE **v1.9.8** loading dropdown + sem prefetch GP | `gp_painel_adm_v2_*` | Operadores → Ficha lista 4 colaboradores |
| **I75** | **Operador novo não aparece em Colaboradores (Julia)** | Cadastro só em OPERADORES_SISTEMA; filtro exige COLABORADORES_RH | GAS **v1.5.173** `gpSyncOperadoresAtivosToRh_` no cadastro + listar | `gp_list_colab_v2` | gestao-pessoas.html lista todos com PIN |
| **I76** | **Agente orientou deploy GAS com caminho Windows / docs defasados** | Usuário cola `.gs` errado; comentários `// v1.5.x` no PowerShell; HANDOFF atrasado | **Raw GitHub** para colar Editor; C:\ só rodapé Regra 16; Fase D roteiro na mesma sessão | `ROTEIRO_AGENTE` Fase F | raw URL header = ping · `INCIDENTE_SESSAO_2026-07-09_I70_I75.md` |
| **I77** | **Operadores preso/lento — painel GAS null row + FE bloqueava 18s** | Dropdown/jornada vazios; banner GAS v1.5.102 falso | GAS **v1.5.175** `gpRowValid_` FOLHA_PONTO · FE **v1.9.11** load rápido + painel background | `gpAdmLoadPainelBackground_` | Operadores abre ≤5s |
| **I78** | **Regressão I77 — cadastro 0% na aba Hoje (modo parcial)** | Todas 0% apesar de RH 100% (I45/I36) | FE **v1.9.12** quick load usa `listarColaboradoresGestao` (cadastroPct planilha) | `gpAdmFetchColabListRh_` | Hoje: Eduarda 25% · demais 100% |
| **I79** | **Julia (id 4) sem escala RH / meta turno inativa** | Folga errada; jornada/ponto/alertas/meta hero ignoram Atendente 2 | GAS **v1.5.176** `gpUpsertEscalaRow_` + sync Julia · FE **v1.9.13** `MK_META_CFG[4]` ativo | `gpSyncRhColaboradoresPadrao_` | painel Operadores → Julia escala hoje; meta hero no turno |
| **I80** | **Julia admissão errada + painel admin null row + meta alertas só [2,3]** | Holerite/jornada skew; `painelGestaoPessoasAdmin` 500; Julia sem alerta meta | GAS **v1.5.177** `gpSyncJuliaPadrao_` adm 01/07/2026 · `gpRowValid_` · refresh ctx · `gpMetaOperadoresIdsAtivos_` | `TESTE_JULIA_COLABORADOR_READONLY.ps1` | export RH admissao · painel admin OK |
| **I81** | **Julia FOLHA_PONTO vazio — faltas/banco distorcidos** | -42h banco; holerite -R$261 Q1 | GAS **v1.5.178** `restaurarPontoJuliaJul2026Admin` · escala 02–09/07 · hoje +20min | `RESTAURAR_PONTO_JULIA_JUL2026.ps1` | faltas 0 · banco -0h20 |
| **I82** | **Operadores/Escala vazio — `painelGestaoPessoasAdmin` null row [4]** | Todas abas RH vazias; FE modo parcial `_partial` | GAS **v1.5.179** `gpSafeRows_` · FE **v1.9.14** erro visível | `TESTE_GESTAO_PESSOAS_READONLY.ps1` | painel ok · escala linhas preenchidas |
| **I83** | **Escala/Metas vazias com Folha OK — race quick load FE** | Quick load sobrescrevia painel completo; abas não re-renderizavam | FE **v1.9.15** `gpAdmRenderTab_` · não downgrade painel · cache `v3` | trocar aba Escala/Metas | 3 colaboradores · escala Jul/2026 |
| **I85** | **Caixa PIX/créd/déb/din abertos + extras pagamento obrigatório** | Encerrar sem dizer pagamento extra; extras cancelados invisíveis | GAS **v1.5.181** col AB `EP:`/`EC:` · FE **v1.9.18** | `resumoDia` extrasPorPagamento | modal encerrar + caixa |
| **I86** | **Páginas lentas — fila GAS duplicada + sync agressivo** | Dashboard/Caixa/Histórico demoram; spinner longo | FE **v1.9.20** — dedupe dashboard, SWR resumoDia/caixa, hist paralelo, sync defer | `mkSyncDeferHeavy_` | abrir Caixa/Dashboard após admin login |
| **I87** | **Histórico custos admin — classificação + insights** | Sem visão gerencial de gastos por período | GAS **v1.5.182** `listarCustosHistorico` · FE **v1.9.21** | PLANO_CONTAS grupos DRE | Admin → Hist. custos |
| **I96** | **CTA "+ Outro carro" na Home (mesma conta)** | Fluxo fora do cadastro — rejeitado pelo usuário | Removido I97 · fluxo 100% Nova locação | — | não reintroduzir Home CTA |
| **I97** | **Multi-veículo UX iterativo (cesta/pick/overlay)** | Confusão layout; scroll; overlay na página errada | FE **v1.9.28–1.9.31** · telas pick/cesta · overlay global | Design System § Nova | tablet 2 carros planos diferentes |
| **I98** | **Lentidão N×salvarLocacao + batch parcial GAS** | ~30s+ 2 carros; item 2 inválido gravava item 1 | GAS **v1.5.187** validate-first + `salvarLocacoesMulti` · FE **v1.9.32+** | ping `postWriteActions` | batch após Nova versão Web |
| **I99** | **Overlay "Salvando…" preso + dismiss duplicava save** | Tablet travado; re-save duplicava loc | FE **v1.9.33–1.9.34** CSS hidden · watchdog · `_novaSaveGen` | `novaRecoveryOverlayStale_` boot | `INCIDENTE_I96_I99_MULTI_VEICULO_2026-07-10.md` |
| **I101** | **Header GAS v1.5.187 mas `MK_GAS_VERSAO_` v1.5.182** | Ping/relatório mentem versão; confusão deploy | GAS **v1.5.187** constantes alinhadas ao header (I70) | bump header + `MK_GAS_VERSAO_` juntos | ping `versao` = header |
| **I102** | ~~Home stat = sessões~~ **revertido I103** | — | ver I103 | — | — |
| **I103** | **Encerradas = contas únicas · Caixa = todas locações** | Painel/lista mostravam sessões; hub Caixa usava contas | FE **v1.9.39** `mkEncHojePorConta_` · `ph-enc-hoje` · hub/cx `nSessoesHojeCanonica_` | I42 | encerradas N contas · caixa N loc |
| **I104** | **Caixa contava locações como vendas POS** | Conferência maquininha: 6 loc vs 4 vendas POS (13/07); 39 vs 37 (12/07) | FE **v1.9.46** `nContasCartao_` · hint `cxHintConferenciaPos_` — comparar **contas no cartão** + R$ bruto | I42 · I103 | 13/07: 4 contas = 4 POS · 12/07: valor R$ 804≈805 |
| **I105** | **`buscarTextoPlanilhaAdmin` só lia 500 linhas** | Motivo cancelamento/obs na ~linha 1424 invisível | GAS **v1.5.188** lê até 8k do **fim** da aba + `observacao` em `listarHistorico`/`resumoDia` | I70 | buscar `CANCELADA` / id 1513 após Nova versão Web |
| **I106** | **Caixa × POS sem conferência operacional** | R$ batia mal (ex. 491 vs 496) sem alerta; cadastro sem trava de comprovante | FE **v1.9.47** painel POS + checkbox Nova + cancelamento sem placeholder | I104 | digitar bruto/vendas POS · diferença gritante |
| **I107** | **Média/projeção Dashboard otimista** | Extrapolava só dias c/ movimento do mês (ex. R$533→R$16,5k) ignorando meses cheios (~R$450) | FE **v1.9.48** `mkRitmoRealistaDash_` · âncora histórica + 2 linhas no gráfico · badge semana por ritmo/dia | I72 | Card “realista”; ritmo puro no tooltip |
| **I108** | **1ª quinzena sem VA/bônus/VT** | Pagamento dia 15 só 40% salário; VA/bônus/VT 100% só no fechamento | GAS **v1.5.189** `gpCalcHollerite_` 50% VA/bônus/VT em cada quinzena · dia 15 ainda = Q1 · FE **v1.9.49** `mk-holerite.js` | I39 · I68 | Raykelly Q1: 648,40+250+200+96,80 |
| **I109** | **Bônus FSS Raykelly+Julia** | Pot R$100 deve ser metade pra cada (não R$100 só pra quem bateu) | GAS **v1.5.191** `metaBonusValorDoDia_` pot FSS · FE **v1.9.51** | I84 | Ray **300** · Julia **200** (live jul) |
| **I110** | **Faltas descontadas na 1ª quinzena** | Julia Q1 liquido −209; faltas só no acerto do mês | GAS **v1.5.192** Web ✅ faltas só Q2 · snapshot Q1 · FE **v1.9.52** pacote | I108 · I46 | Q1: PIX+VA+VT sem faltas · **fechado 15/07** |
| **I111** | **Pacote Q1 incluía VT já pago** | App 1.095/1.045 com VT; sócio paga PIX+VA | GAS **v1.5.193** `vtPasses=0` na Q1 · FE **v1.9.53** | I108 · I110 | Ray **998,40** · Julia **948,40** |
| **I112** | **Bônus no salário/vencimentos** | Base INSS/líquido misturava metas | GAS **v1.5.194** bruto=só salário · bônus na cesta · FE **v1.9.54** | I108 · I111 | cód 500 na cesta · Base INSS = salário |
| **I113** | **FE cache mostrou pacote com VT** | Print em force=1.9.53 ainda somava VT | FE **v1.9.55** `mkHolNormalizeHol_` zera VT Q1 no pacote + faixa “já pago” | I111 | Reabrir com `?force=1.9.55` |
| **I114** | **Total vencimentos = salário+bônus** | Julia 748,40 com bônus na cesta | FE **v1.9.56** bruto/líquido = só salário | I112 | Total = 648,40 · bônus só cód 500 |
| **I115** | **Login Colaboradores lento/trava** | Raykelly ~61s no painel pós-PIN | GAS **v1.5.195** Web ✅ 1× enrich + sem write + cache · FE **v1.9.58** · residual → **I116** | I48 · I68 · I74 · I110 | Ray warm ~3s · frio 16–29s pós-195 |
| **I116** | **Enrich login expandia todo RH + lento app-wide** | Frios Colab altos; admin GP frio; kpiMes | GAS **v1.5.196** Web ✅ `expandRh:false` · warm Colab/admin OK · frio Colab ~20s residual LoadContext | I115 · I73 · I23 | ping 196 · Ray warm &lt;5s · GP readonly OK |
| **I117** | **Caixa ignorava Ativa/Pendente (pay-first)** | POS com venda; app só Encerrada → “Divergência” enquanto brinca | GAS **v1.5.197** Web ✅ `calcResumoDiaCore_` inclui Ativa/Pendente · FE **v1.9.60** status+hint · `COL_LOC_READ_` no resumo | I104 · I106 · I42 | Ativa aberta entra em `fat`/`totalMaq` · **fechado 15/07** |
| **I118** | **Caixa crash `maq is not defined`** | Toast “Erro ao carregar caixa” após I117 (contas tbody) | FE **v1.9.60** restaura `const maq` | I117 | render contas OK |
| **I119** | **Painel Conferência POS digitável removido** | Sócio: não serve na operação (Divergência fake) | FE **v1.9.61** remove gate I106 · mantém conferência maquininha/contas | I106 · I117 | Caixa sem digitar POS |
| **I120** | **Admin GP frio + comunicado/cache + cadastro edit** | Painel ~50–70s; recado Julia sumia (cache v2); sem editar nome no admin | GAS **v1.5.198** lite+expandRh false+invalidate v2 · FE **v1.9.62** editar cadastro + público nome | I115 · I116 | lite UI rápido · Julia vê recado ID 4 |
| **I120b** | **Cache comando morto (`_t`) + Julia rewrite + lite ainda frio** | FE sempre manda `_t` → ScriptCache nunca hit (~17s); `gpSyncJuliaPadrao_` regrava RH/escala a cada painel | GAS **v1.5.199** `comandoOp_v2_` ignora `_t` (só `force=1`); sync Julia idempotente; `gpLoadContext_({lite})` AUD 900 | `guard.i120.*` · **`TESTE_I120_ADMIN_PERF_READONLY`** | comando warm &lt;6s com `_t`; painel lite warm &lt;6s |
| **I121** | **Dashboard dessincronizado (Meta 0 × Centro 1 loc)** | `kpiMes` só Encerrada + cache 90s/5min; comando/resumo I117 conta Ativa — Meta/gráficos atrasados | GAS **v1.5.200** kpiMes+leading pay-first + invalidate dash; FE **v1.9.63** sync Meta←comando + TTL 45s | `guard.i121.*` · **`TESTE_I121_DASH_SYNC_READONLY`** | nHoje Meta = comando com loc Ativa |
| **I122** | **Locação fantasma no celular / sync não atualiza** | `carregarInicio` 22–36s + FE timeout 25s + `_t` zera ScriptCache a cada poll 5s → fallback `mk_inicio_cache` antigo | GAS **v1.5.201** `inicio_v4_` ignora `_t`; FE **v1.9.64** timeout 55s + não reaplicar cache com operação ativa | `guard.i122.*` | warm `carregarInicio` &lt;5s com `_t`; encerrar some do card |
| **I123** | **Gráfico Dashboard: 1 linha “projetado” ambígua (~491)** | Blend I107 35/65 recalculava; confunde com âncora 450 | FE **v1.9.65** Base (travada) × Ritmo (`projecaoFat`) × Real — DNA admin | só `mk-admin.js` chart · mockup `MOCKUP_GRAFICO_BASE_RITMO_2026-07.md` | 3 linhas; base não sobe com ritmo |
| **I124** | **Dashboard salada de projeções (7d ≠ GAS ≠ realista)** | Vários “faturamento projetado” sem hierarquia | FE **v1.9.66** capítulos Real / Previsão / Resultado · `mkDashCenariosMes_` (hero=ritmo) | só Dashboard FE · P0 zero | 1 hero ritmo + Base/7d laterais · 1 resultado |
| **I125** | **Salvar locação / ▶ cronômetro 18s+8s (reincidente)** | openById repetido; scan; FB; audit; setValues 28 cols; N writes | GAS **v1.5.205** I125d (lastRow 1× + nextId cache + salvar setValues 25 + ▶ 1 read/write C→Y) · FE **v1.9.69** | `guard.i125*` / `guard.i125d*` · **`TESTE_I125_SALVAR_INICIAR_PERF`** | salvar&lt;8s · ▶&lt;5s |
| **I126** | **Operadores ADM: Presentes≠badge · 0 turno · stuck lista rápida** | Hydrate `_partial` apagava lite/full (`gpAdmIsFullPanel_` falso); KPI=só balcão; painel em série após 8–16s | FE **v1.9.70** `gpAdmHasPanelPayload_` · KPI=ponto∨balcão · painel paralelo · banner parcial · órfãos RH | `mk-gestao-pessoas-admin.js` | lite aplica sem wipe · Raykelly “No balcão” · comTurno&gt;0 |
| **I126b** | **Folha presa em “painel rápido” / indisponível** | `mkGpAdmLoad_` incrementava `seq` antes do early-return e **cancelava full**; timeout do lite abortava full; aba Folha dava force e matava o voo; empty state “instale abas” mentia | FE **v1.9.71** seq só após early-return · lite try/catch · Folha `skipLite` · “Carregando folha…” | `mk-gestao-pessoas-admin.js` | Folha Jul/2026 lista Julia/Milena/Raykelly |
| **I126c** | **Faixa vermelha “Painel rápido” eterna + Escala OK** | Banner `_partial` em `gp-adm-err`; Escala já vinha do lite; promise resolvida bloqueava Folha full | FE **v1.9.72** remove banner lite · full só Folha/Avaliações · `gpAdmPanelInFlight_` | `mk-gestao-pessoas-admin.js` | sem faixa vermelha · Folha carrega ao abrir |
| **I127** | **Holerite Q2: adiantamento 1ª = R$ 0** | Cód 410 zerado; DP exige desconto do adiantamento na 2ª (art. 462 CLT / Contábeis) | FE **v1.9.73** `mk-holerite.js` · GAS **v1.5.206** `adiantamentoQ1` | Q2: salário mês − adiantamento 40% − encargos | Raykelly: 410 ≈ R$ 648,40 |
| **I128** | **Ficha: “Sem dias na competência” com ponto aberto** | Lite deixa `jornada.dias=[]`; full só rodava em Folha/Avaliações | FE **v1.9.74** Ficha pede full + loading jornada | `gpAdmEnsureFullPanel_('presenca')` | Raykelly Jul: 29 dias + 14:04 Aberto |
| **I141** | **Holerite Q2: bônus = 50% do mês final (errado)** | GAS `gpCalcHollerite_` metade; 1ª já pagou acumulado da época (Ray 150≠425) | FE **v1.9.86** `bonusQ2 = mês − Q1 memorial` · Ray 700 · Julia 750 | `mk-holerite.js` · `teste-i141-bonus-resto.cjs` | pacote 31/07: Ray **1652,22** · Julia **1702,22** |
| **I140** | **FGTS na cesta do holerite** | Encargo empregador misturado com bônus/VA | FE **v1.9.85** FGTS só no rodapé | `mk-holerite.js` | cesta sem cód 503 |
| **I139** | **Metas: “13 dias” parecia 13×R$100** | Badge só contava dias; FSS já era R$50 no GAS | FE **v1.9.84** badge dias+R$ + hint FSS | `gpAdmRenderMetas_` | Ray 13 dias · R$ 850 |
| **I138** | **Holerite: total 1ª inflado + VT no pacote** | “Já pago” usava meta atual (1273≠948); VT Q2 somava no fim | FE **v1.9.83** memorial Q1 · **I141** Ray 998,40 / Julia 948,40 · VT nunca no pacote | `mk-holerite.js` | Total 1ª = PIX+VA; VT semanal R$0 |
| **I137** | **Operadores lento mesmo com cache** | `mkGpAdmLoad_` após cache full ainda disparava lite+full → fila GAS | FE **v1.9.82** cache hit retorna sem painel | `mkGpAdmLoad_` | 2ª abertura Folha instantânea |
| **I136** | **Ficha “Carregando…” atrás do painel full** | Preview + `painelGestaoPessoasAdmin` em paralelo → Apps Script fila ~90s+ | FE **v1.9.81** espera painel em voo antes do preview | `gpAdmFetchFichaJornada_` | Julia: tabela após painel, sem fila dupla |
| **I135** | **Operadores: Folha/Escala “Carregando…” + NomeMeta** | Lite timeout **45s** &lt; lite real ~50s → stub `_fromQuick`; Folha usava `LoadPromise` e ficava eterna; Escala “Aguardando painel RH” | FE **v1.9.80** lite 90s / full 150s · retry UI · soft-title block | `mk-gestao-pessoas-admin.js` | Escala do lite; Folha com retry se full falhar |
| **I134** | **Julia: faltas fantasma após abono** | `abonar` não casava Date do Sheets; Sync jornada mantinha R$ | GAS **v1.5.209** abono por `fmtData_` + `limparFaltasOpMesAdmin` | `abonarFaltaRhAdmin_` | faltas=0 após Nova versão + limpar/abonar |
| **I133** | **Holerite Q2 solto + “faltas” fantasma** | Blocos Q1 fora da cesta; abono não batia data Sheets; rótulo sempre “faltas” | FE **v1.9.79** Q1 dentro da cesta · GAS **v1.5.208** abono `fmtData_` | `mk-holerite.js` · `gpBuildAbonoFaltasMap_` | Julia: sem linha 404 se 0; abonos valem |
| **I132** | **Holerite Q2 sem o que já foi pago na 1ª** | Só desconto adiantamento; colaborador não via cesta/PIX da Q1 | FE **v1.9.78** bloco “Já pago na 1ª” | `mk-holerite.js` | Q2: adiantamento+bônus+VA+total |
| **I131** | **Ficha ainda “Carregando…” (v1.9.76)** | `Object.assign(preview, pinParams)` sobrescrevia `operadorId`; EnsureFullPanel apagava UI | FE **v1.9.77** id por último + cache jornada + Ficha sem full panel | `gpAdmFetchFichaJornada_` | tabela Jul em ~3–5s |
| **I130** | **Ficha Operadores: “Carregando jornada…” eterno** | Painel full ~95s > timeout; lite sem `jornada.dias` | FE **v1.9.76** fetch preview por colaborador + timeout 120s | `gpAdmFetchFichaJornada_` | Raykelly: tabela Jul em &lt;90s |
| **I129** | **Ponto colab “não aparece” + banco −1000h** | FE `fmtDataHoje` DD/MM≠folha; cache 90s pós-batida; `gpPersistBancoFromJornada_` dobrava saldo | FE **v1.9.75** match data + refresh otimista + `force` · GAS **v1.5.207** · repair FOLHA/BANCO Raykelly | `mk-gestao-pessoas-ui.js` · `buscarPainelColaborador_` | Hub mostra entrada; banco abertura 0h00 |
| **I84** | **Meta colaborador contava sessões, não contas (I42)** | 4 encerramentos mesmo telefone = 4 loc na meta | GAS **v1.5.180** `metaOperadorSeenMark_` conta_id/telefone · FE **v1.9.16** scroll módulo | `metaOperadorTurno` | 1 loc por telefone/dia |
| **I42** | Conta do dia — mesmo telefone 10h–22h | Caixa `n` vs sessões; maquininha | GAS **v1.5.131+** col S `conta_id` | `TESTE_I42_CONTA_DIA_CAIXA` | não reduzir `COL_LOC_READ_` (ver I43) |
| **I41** | **`ping_` versão defasada** (v1.5.107 vs repo) | Confusão deploy / verify | GAS **v1.5.130** `ping_()` alinhado | `ping_` header alinhado | ping = v1.5.130 |
| I2 | GAS offline + timer local | Extra fantasma | ADM `somentePlano`; offline v1.7.6 | `FIX_OFFLINE_ENCERRAR` | tablet encerrar |
| I3 | Cache `?force=` / **`index.html ?v=` desatualizado** | JS antigo no tablet/admin | `mk-version` + `sw` + **index** alinhados | `pre-push-check` versões | `?force=VERSAO` · ver **11/06** |
| **I25** | **FOLHA `#NAME?` — `setValue('=SE...')` no GAS** | Aba FOLHA quebrada; Dashboard usa fallback 4926 | GAS **v1.5.91** `folhaFlushFormulasUser_` (USER_ENTERED) + `repairFolhaAdmin` | Nunca `setValue`/`setFormula` PT para fórmulas FOLHA | `TESTE_FOLHA_FORMULAS_READONLY.ps1` · **fechado 14/06** |
| **I24** | **Commit local sem `git push`** / Pages desatualizada | Banner "Nova versão" nunca aparece; remoto = local = versão velha | **`encerramento-sessao.ps1`** exit 0 · `guard-i24-publicacao.ps1` · push + **`verify-publish-complete.ps1`** | `guard.i24.*`, `git.not-ahead-of-origin`, `pages.version-live` | curl Pages `mk-version.js` · doc **26/06 controles** |
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
| `../arquivo/incidentes/INCIDENTE_I24_CONTROLES_PUBLICACAO_FE_2026-06-26.md` | **I24** — travas definitivas guard + encerramento-sessao |
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
| **`INCIDENTE_SESSAO_2026-07-09_I70_I75.md`** | **I70–I76** — Dashboard perf, gráfico meta, GP dropdown, Julia RH, deploy agente |
| **`../arquivo/incidentes/INCIDENTE_I96_I99_MULTI_VEICULO_2026-07-10.md`** | **I96–I103** — multi-veículo · overlay · contagem encerradas/caixa |

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
| `guard.i24.pre-push` | `pre-push-check.ps1` | I24 — I3 sujo |
| `guard.i24.sessao` | `encerramento-sessao.ps1` | I24 — Pages vs local |
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
34. **Sempre** VA mensal = teto **R$ 400** (FOLHA B11) — `va_diario` planilha **não** redefine mensal (I49).
35. **Sempre** proporcional admissão em holerite — admissão inválida = 0 dias, nunca mês cheio (I39).
35. **Hub benefícios** deve usar `pg.holerite` da API, não `calcFolhaPagamento` mensal (I40).
36. **Nunca** usar `getRange(..., COL_CONTA_ID_)` em `carregarInicio_`/`listarAtivas_` se a função lê `r[24]`/`r[25]` — usar **`COL_LOC_READ_` = 28** (I43 regressão I42).
37. **Sempre** rodar `TESTE_I43_CARREGAR_INICIO_READONLY.ps1` após mudança em sync/timer GAS (I43).
38. **Nunca** `gpPersistBancoFromJornada_` em leitura de painel admin/colaborador — só na **saída de ponto** (I44).
39. **Nunca** travar meta projeção no dia 1 do mês — usar `metaProjecaoStale_` + trava após 3 dias (I72).
40. **Nunca** rodar `alertasInteligentes_` no `kpiMes` lite — só no full em background (I73).
42. **Nunca** montar login colaborador com escritas FALTAS/HOLERITES + 2× `gpLoadContext_` + varredura AUDITORIA inteira — slim espelho I48 (I115).
42b. **Nunca** em login Colaboradores expandir `gpEnrichContextAudit_` para **todo** RH — usar `{ expandRh: false }` só com op + parceiro FSS (I116).
42c. **Nunca** atribuir lentidão “do app todo” só ao login Colaboradores — medir `kpiMes` / `painelGestaoPessoasAdmin` em separado (I116 · I73).
42. **Sempre** sync OPERADORES_SISTEMA → COLABORADORES_RH ao cadastrar operador ativo (I75).
43. **Nunca** passar `C:\Users\...` como link clicável para deploy GAS — usar **raw GitHub** (I76).
44. **Sempre** atualizar HANDOFF/ESTADO/DEPLOY/AGENTS ao encerrar sessão com mudança de versão (I76).
45. **Nunca** modo parcial Operadores com `listarOperadoresAdmin` sozinho — **`cadastroPct` vem de `listarColaboradoresGestao`** (I78 · lição I45/I36).

---

## Versões de referência (23/06/2026)

| Camada | Repo / produção | Mínimo operação |
|--------|-----------------|-----------------|
| Frontend | **v1.8.115** | `?force=1.8.115` |
| GAS | repo **v1.5.137** · ping **v1.5.136** | Nova versão Web v1.5.137 (I44) |
| Design System | **`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`** | Obrigatório antes de UI |
| Aba FOLHA | B68 ~5269,96 · `fonte=FOLHA` | `repairFolhaAdmin` após deploy que toque FOLHA |

Ver `ESTADO_ATUAL.md` para URLs e editor GAS.
