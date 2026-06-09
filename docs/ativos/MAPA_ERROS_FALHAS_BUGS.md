# MOVI KIDS — Mapa de erros, falhas e bugs

**Atualizado:** 09/06/2026 — **I22 fechado** (hotfix FE v1.8.2) — ver `../arquivo/incidentes/INCIDENTE_I22_HOME_FORA_DO_AR_FASE6_HTML_2026-06-09.md`  
**Uso anterior:** 09/06/2026 — **I21 fechado** (B8 v1.7.94/v1.5.72 + splash v1.7.96)  
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
| I1 | `clasp deploy` na Web App | 404; caixa quebrado | Só `clasp push` + Nova versão manual | Regra 8 / Regra 9 | ping |
| I2 | GAS offline + timer local | Extra fantasma | ADM `somentePlano`; offline v1.7.6 | `FIX_OFFLINE_ENCERRAR` | tablet encerrar |
| I3 | Cache `?force=` desatualizado | JS antigo no tablet | `mk-version` + `sw` + index alinhados | `pre-push-check` versões | `?force=VERSAO` |
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
| `EMERGENCIA_SMS_404.md` | URL morta |
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
| `guard.turno.chip` | `#hd-turno-chip` em index.html | I19 |
| `guard.html.page-balance` | balanceamento `<div>` page-home/nova/dashboard | I22 |
| `guard.operacao.livre` | `check-operacao-livre.ps1` se FE crítico alterado | I22 |
| `teste.paridade` | `scripts/testes/TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` | I15 |
| `teste.portal` | `scripts/testes/TESTE_PORTAL_READONLY.ps1` | portal |
| `teste.cronometro` | `scripts/testes/TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` | I16 |

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
- [ ] Ctrl+F5 com `?force=VERSAO_ATUAL`

---

## Aprendizados — nunca repetir

1. **Nunca** `clasp deploy`.
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

---

## Versões de referência (09/06/2026)

| Camada | Repo / produção | Mínimo I21 (B8) |
|--------|-----------------|-----------------|
| Frontend | **v1.7.96** | `?force=1.7.96` (mín. I21/B8: v1.7.94+) |
| GAS | **v1.5.72** | Nova versão Web se ping &lt; esperado |

Ver `ESTADO_ATUAL.md` para URLs e editor GAS.
