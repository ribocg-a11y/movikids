# MOVI KIDS — Estado atual (07/06/2026)

Referência única para alinhamento local × produção.

**Handoff (novo chat):** **`HANDOFF_NOVO_CHAT.md`** ← ler primeiro  
**Acessos:** **`ACESSOS_E_AUTORIZACOES.md`** — papéis, PIN admin, agente vs humano  
**Índice:** `../INDICE.md` · **Prioridades:** **`PLANO_PRIORIDADES_2026-06.md`**  
**Planejamento ativo:** `PLANO_CONTINUIDADE_2026-06.md`  
**Mapa de erros/bugs:** **`MAPA_ERROS_FALHAS_BUGS.md`**  
**DNA visual:** `../referencia/DESIGN_DNA_MOVIKIDS.md`  
**Comunicação balcão:** **`DECISAO_COMUNICACAO_QR_CODE_2026-06.md`**  
**Incidentes (arquivo):** `../arquivo/incidentes/`  
**SMS gateway:** `../referencia/TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md`  
**Deploy GAS:** `DEPLOY_GAS_v1.5.32_AUTH.md` · **K.1:** `DEPLOY_v1.5.57_IMPORT_RESPONSAVEIS.md` · **Payback:** `DEPLOY_v1.5.63_PAYBACK.md`  
**Planos históricos:** `../arquivo/planos/`

---

## ALERTA P0 (05/06/2026)

**Nunca POST no `api()` do browser** — ver `../arquivo/incidentes/INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md`.  
FE mínimo em operação: **v1.7.35** (recomendado **v1.7.41+**). Teste tablet obrigatório após mudança em `api()`.

---

## Produção (verificar após cada deploy)

| Camada | Versão alvo | URL / ID |
|--------|-------------|----------|
| **Frontend** | **v1.7.81** | https://ribocg-a11y.github.io/movikids/?force=1.7.81 |
| **Apps Script** | **v1.5.66** (I20 `clientTs` + idempotência iniciarTimer) | Deploy `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |
| SMS Gateway Cloud | **DJVJRL** / device `wihWegHr4wXaVJQ1R-GZR` | Aparelho remoto ONLINE |
| Pacote SMS P0 | **FECHADO** | `PACOTE_SMS_P0_UNIFICADO_v1.5.38_v1.7.11.md` |
| Planilha | MOVIKIDS_Planilha_Base | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit — auditoria `AUDITORIA_PLANILHA_BASE_2026-06-06.md` |
| Portal responsável | acompanhar.html | mesma base GitHub Pages |
| Cronômetro curto | track.html | URL GAS alinhada (v1.7.6+) |

**Editor Apps Script:** https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit

**Teste rápido GAS (ping):**  
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping  
→ deve retornar `versao: v1.5.66` (ou header do `.gs`) e `postWriteActions` (POST só no GAS; FE usa GET — I15)

**URL morta (não usar):** `AKfycbzc...` → 404

---

## Arquivos canônicos

| Artefato | Arquivo |
|----------|---------|
| GAS | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (único na raiz; legados em `arquivo-historico/`) |
| Payback | `MEMORIAL_PAYBACK_INVESTIMENTO.md` · deploy `DEPLOY_v1.5.61_PAYBACK.md` (atualizar v1.5.63) |
| Clasp | `gas/Code.gs` (gerado por `scripts/sync-gas-to-clasp.ps1` — não editar à mão) |
| Login | `mk-auth.js` + gate em `index.html` |
| Versão FE | `mk-version.js`, `sw.js` |
| CSS FE | `mk-design.css`, `mk-app.css` (Pacote M.1) |
| Bootstrap FE | `mk-stale-sync.js`, `mk-cache-bust.js`, `mk-firebase.js` (Pacote M.2) |
| API FE | `mk-api.js` — `api()` + guards I15 (Pacote M.3) |
| Sync FE | `mk-sync.js` — `syncController` + merge Firebase (Pacote M.4) |
| Sessão FE | `mk-sessao.js` — SMS, timer, `saveSessions` (Pacote M.5) |
| Nova FE | `mk-nova.js` — fluxo Nova locação + `atualizarVeiculoGrid` (Pacote M.6) |
| Drawer FE | `mk-drawer.js` — drawer sessão + encerrar (Pacote M.7) |
| Operação FE | `mk-operacao.js` — alertas, SMS/WA, editar, iniciar, estender (Pacote M.8) |
| Home FE | `mk-home.js` — cards, painel, encHoje (Pacote M.9) |
| Nav FE | `mk-nav.js` — showPage, sidebar, roles gestão (Pacote M.10) |
| Admin FE | `mk-admin.js` — PIN, KPIs, caixa, config, sistema (Pacote M.11) |
| Histórico FE | `mk-historico.js` — período, analytics, ranking veículo (Pacote M.12) |
| Deploy | `DEPLOY_GAS_v1.5.32_AUTH.md`, `scripts/deploy-gas.ps1` |
| Limpeza testes | `scripts/testes/LIMPAR_TESTES_MOVIKIDS.ps1`, `scripts/testes/LIMPAR_SESSOES_TESTE_AGORA.ps1` |
| Paridade HTTP tablet | `scripts/testes/TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` |
| Paridade cronômetro portal | `scripts/testes/TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` |
| Pre-push (Pacote J) | `scripts/pre-push-check.ps1` — versões, guards I15–I20 |
| I20 cronômetro | `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md` — causa raiz + travas |
| Teste I20 | `scripts/testes/TESTE_I20_COMPLETO_PROD.ps1` |
| **Protocolo testes** | **`PROTOCOLO_DIAGNOSTICO_E_TESTES.md`** + `TESTE_PROTOCOLO_DIAGNOSTICO.ps1` |
| Mapa bugs | `MAPA_ERROS_FALHAS_BUGS.md` |
| Emergência | `scripts/corrigir-locacao-206.html`, `scripts/corrigir-locacoes-extras-lote.html` |

---

## Entregas recentes

| Versão | Entrega |
|--------|---------|
| **v1.7.78** | **I20 definitivo** — início otimista no ▶, `_localTimerStart`, `effectiveStartTs_`, botão imediato; validado tablet |
| **v1.7.81** | **Pacote M.12** — histórico/analytics extraídos para `mk-historico.js`; `index.html` ~2.018 linhas |
| **v1.7.80** | **Pacote M.11** — admin extraído para `mk-admin.js` |
| **v1.7.79** | **Pacote M.10** — `showPage` + sidebar extraídos para `mk-nav.js` |
| **Pacote M** | M.1–M.12 ✅ · **próximo M.13 `mk-relacionamento.js`** — `PACOTE_M_MODULARIZACAO.md` |
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

---

## Auth operadores — ADM (GAS 1.5.35+)

| Ação | API |
|------|-----|
| Resetar PIN | `resetarPinOperadorAdmin` + `adminPin=1416` |
| Liberar balcão | `liberarSessaoOperadorAdmin` |
| Corrigir locação encerrada | `corrigirFinanceiroLocacaoAdmin` + `zerarExtra` (v1.5.36+) |
| Limpar locações de teste | `limparLocacoesTesteAdmin` + `motivo` ≥10 chars |
| Logout por inatividade | 1h sem atividade — **pausado** se locação Ativa/Pendente no tablet (v1.7.46, I18) |

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
- [~] **Pacote K.3–K.4** — FE v1.7.49+ badge Cadastro; checklist tablet `CHECKLIST_PACOTE_K.md`
- [x] **Pacote M — Payback investimento** — GAS v1.5.60–63 + FE v1.7.63–64 (painel Dashboard)
- [x] **Portal foto moldura** — `foto-moldura.html` + botão no portal (v1.7.62+)
- [~] **Fase 4 WhatsApp / SMS auto — PAUSADA** (QR Code oficial — `DECISAO_COMUNICACAO_QR_CODE_2026-06.md`)
- [ ] **Pacote L** — UX polish (tiles, sync header, Sistema, QR balcão) ← **próximo pacote feature**
- [~] **Fase 9 supervisor — PAUSADA**

---

## Planejamento ativo (`PLANO_CONTINUIDADE_2026-06.md`)

| Sprint | Foco | Status |
|--------|------|--------|
| **1** | Estabilizar: checklist I.5, tablets v1.7.64, testes | **ativa** |
| **2** | **Pacote K** — K.1–K.2 feitos; **K.3–K.4 QA tablet** | **quase fechado** |
| **2b** | **Pacote M Payback** — código em prod; fechar regras §10 memorial | **em andamento** |
| **3** | **Pacote L** — UX polish + QR balcão | **próximo** (F4 pausado) |
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
| Faturamento **mês**, CTO, gestão avançada | **Dashboard** |
| Ativas / encerradas hoje (contagem) | **Home** stats-bar |
| Diagnóstico técnico | **Sistema** |

---

## Validação rápida (pós-deploy)

1. Ping GAS → `ok:true`, `versao` ≥ **v1.5.55** (I16 cronômetro)
2. Tablet → `?force=1.7.65`, rodapé **Online v1.7.65**
3. `.\scripts\pre-push-check.ps1` → status ok
4. Balcão + celular mesma locação → timer ± **2 s** (I16)
5. ADM liberar sessão → banner limpa sem Ctrl+F5 (I17)
6. Locação ativa + idle expirado → operador **permanece** logado (I18)
7. Nova locação salva no tablet (I15)

Scripts: `scripts/testes/` — ver `scripts/testes/README.md`

---

## Script Properties (SMS)

| Propriedade | Valor produção |
|-------------|----------------|
| `SMS_GATEWAY_USER` | `DJVJRL` |
| `SMS_GATEWAY_PASS` | `t4bh_q2x1favfo` |
| `SMS_GATEWAY_DEVICE_ID` | `wihWegHr4wXaVJQ1R-GZR` |
