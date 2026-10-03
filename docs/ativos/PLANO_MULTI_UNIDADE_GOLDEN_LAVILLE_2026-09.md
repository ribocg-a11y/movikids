# PLANO — Multi-unidade MOVI KIDS (Golden × La Ville Mall)

**Status:** 🟢 **Operacional** — multi-loja em produção (I159–I165) · inauguração física / RH / CTO LV ainda abertos  
**Atualizado:** 02/10/2026 · FE **v1.9.161** · GAS Web **v1.5.231** · planilha única  
**Pedido:** 2ª unidade em **La Ville Mall**; Golden permanece. Operadoras escolhem onde logar; unidades **não conversam**; **só ADM** vê as duas juntas. Preços, minutos e frota **diferentes** por unidade.  
**Arquitetura:** ✅ **Opção A** — **1 planilha** + `unidade_id` + CONFIG por unidade (sócio 29/09).  
**Sócio entregou (29/09):** tabelas Brinquedos + Dinos + frota FE LV*. **Ainda falta:** CTO/e-mail shopping La Ville · 1ª equipe RH.

---

## 0. Diagnóstico do sistema atual (single-tenant)

Hoje o produto é **1 unidade implícita**. Não existe `unidade_id` em nenhuma aba, API ou sessão.

| Camada | Estado atual | Evidência |
|--------|--------------|-----------|
| **Hub tablet** | 3 portas; subtítulo fixo “Golden Shopping Calhau” | `index.html` `#mk-tablet-hub` |
| **Auth** | Sessão `mk_auth_session_v1` sem unidade; 1 operador no balcão (Script Properties) | `mk-auth.js` · `loginOperador_` |
| **Preços / planos** | `PRECOS` + `CONFIG.precos_json` (1 tabela) | GAS + `mk-globals.js` + `aplicarOperacaoConfig_` |
| **Frota** | `VEICULOS_VALIDOS` + `CONFIG.veiculos_validos_json` (1 lista) | GAS + `TODOS_VEICULOS_DEF` |
| **Locações** | 1 aba `LOCACOES` · 28 cols · **sem** coluna unidade | `LOC_HEADERS_` |
| **KPI / Dash / Caixa** | `kpiMes` / `resumoDia` leem **toda** LOCACOES | GAS |
| **CTO / Golden PDF** | Contrato + e-mail **só Golden** | `CONTRATO_INICIO`, `EMAIL_RELATORIO`, `mkHtmlRelatorioGoldenFromKpi_` |
| **Portal / QR** | URL única `acompanhar.html` | `PORTAL_RESPONSAVEL_URL` |
| **RH / Colaboradores** | Abas RH únicas; não amarradas a shopping | Camada 5 |
| **Workbook** | **Um** Spreadsheet ID | `SHEET_ID` / `ss_()` |

**Conclusão:** “é a mesma coisa, só muda o local” **não** é só troca de texto. Exige **isolamento de dados + config por unidade + ADM consolidado**. Sem isso, La Ville e Golden misturam caixa, frota, timer e relatório.

---

## 1. Regras de alteração (obrigatórias antes de codar)

### R1 — Isolamento operacional
1. Locação, timer, caixa do dia, frota ativa, fila offline e sessão balcão são **sempre** de **uma** unidade.
2. Operadora **não** vê nem altera dados da outra unidade.
3. Vazamento entre unidades = **bug P0** (igual misturar Cancelada no Golden — I158).

### R2 — ADM consolidado
1. Só **admin** (PIN admin / `authRole=admin`) pode escolher filtro **Todas | Golden | La Ville**.
2. Default ADM na abertura: **Todas** (visão holding) **ou** última escolhida — decidir na implementação.
3. Gestor/supervisor (se F9): **só** a unidade da sessão (não consolidado), salvo decisão futura.

### R3 — Config por unidade
1. Preços, minutos/planos, frota/brinquedos, formas de pagamento e CTO são **por unidade**.
2. Defaults no código (`PRECOS`, `VEICULOS_VALIDOS`) viram **fallback** da unidade Golden; La Ville **não** herda preços Golden por acidente.

### R4 — Identidade estável
1. Códigos canônicos: `golden` · `laville` (slug ASCII; labels UI: “Golden Shopping Calhau” · “La Ville Mall”).
2. Toda escrita crítica carrega `unidadeId` (query GET — **nunca** POST browser, I15).
3. Sessão FE persiste `unidadeId` junto do auth (localStorage/session).

### R5 — Sessão balcão
1. Mutex “1 operador por vez” é **por unidade** (dois balcões físicos podem operar em paralelo). Hoje a Property é **global** (`MK_SESSAO_OPERADOR_ATIVA`) — blocker confirmado.
2. Tablet fixo na loja: unidade pode ser **pré-selecionada** (URL `?unidade=laville`) **e** confirmável no hub.

### R6 — Ordem de entrega (não pular)
1. Doc + decisões (este arquivo) → dados La Ville (sócio) → schema planilha → GAS (§7.3 pedido) → FE hub/auth → balcão → admin dash → portal/QR → testes → homolog tablet **duas** lojas.
2. **Não** publicar FE multi-unidade sem GAS + planilha prontos (I24 + I22).

### R7 — O que NÃO misturar
1. Não criar 2 apps / 2 repositórios / 2 Pages.
2. Não duplicar `mk-admin.js` por unidade.
3. Não usar “duas planilhas” como 1º caminho sem decidir ADM (ver §2).
4. Não reintroduzir POST no browser.
5. Não alterar AppScript sem pedido explícito §7.3.

### R8 — Nome de veículos
1. Unicidade de veículo aberto (`veiculoJaAberto_`) é **por unidade**.
2. Preferência: nomes **com prefixo de unidade** na frota La Ville (ex. `LV Carro 01`) **ou** chave composta `(unidadeId, veiculo)` — decidir com a lista de brinquedos.

---

## 2. Decisão de arquitetura (escolher antes de implementar)

### Opção A — ✅ **ESCOLHIDA (29/09):** 1 planilha + coluna `unidade_id` + CONFIG por unidade

```
Workbook único (mesmo SHEET_ID de produção)
  LOCACOES     + col unidade_id
  CONFIG       + chaves *_golden / *_laville  (ou aba UNIDADES)
  CUSTOS       + unidade_id
  …            filtrar ou marcar
  ADM          kpiMes(unidade=all|golden|laville)
```

| Prós | Contras |
|------|---------|
| ADM “vê as duas juntas” natural | Todo `getRange`/KPI precisa filtrar (risco de bug se esquecer) |
| 1 GAS, 1 deploy, 1 Pages | Lookback I155 continua, mas scans maiores |
| Mesmo tablet URL + `?unidade=` | Migração: backfill Golden = `golden` |

### Opção B — 2 planilhas (1 por shopping) + GAS com 2 `SHEET_ID` — **descartada**

| Prós | Contras |
|------|---------|
| Isolamento físico forte | ADM consolidado = 2 leituras + merge (lento/timeout) |
| Menos risco de misturar linhas | 2× repair schema, 2× OAuth, ops mais caras |

### Opção C — Abas espelhadas (`LOCACOES_LAVILLE`, …) — **descartada**

| Prós | Contras |
|------|---------|
| Separação visual na planilha | Explosão de abas; guards I43/I155 duplicados |

**Decisão:** **Opção A**. Guards obrigatórios: “toda API operacional exige `unidadeId`” + ADM `unidade=all|golden|laville`.

> ✅ Arquitetura fechada. **Ainda sem código** até dados La Ville (§6) + respostas §11.

---

## 2b. Auditoria técnica (exploração 29/09 — reforço do mapa)

Fontes: [Map auth login hub](1e0faf26-701e-4ba6-a720-905a93c8a3b3) · [Map planilha sheets schema](52e46886-ea4d-4a83-85c3-254d1125b692) · [Map prices fleet KPI](bf79b760-f29a-43f8-bd1a-a7b440d41d67).

### Auth / hub — pontos de injeção

| Ordem | Onde | O quê |
|-------|------|--------|
| 1 | `#mk-tablet-hub` → seletor **antes** das 3 portas | `mk_unidade_ativa_v1` (localStorage) |
| 2 | `mk_auth_session_v1` (+ persist 24h) | Campo `unidadeId` no JSON da sessão |
| 3 | `operadorApiParams_` / `apiParamsComAuth_` | Enviar `unidadeId` em toda chamada |
| 4 | GAS `OPS_HEADERS_` | Hoje: `id…perfil` (8 cols) — **sem** unidade; filtrar `listarOperadoresLogin_` |
| 5 | Script Property `MK_SESSAO_OPERADOR_ATIVA` | Hoje **global** → namespaced `…_{unidadeId}` |
| 6 | `gestao-pessoas.html` | Query `?unidade=` + caches `mk_gp_*` com sufixo |
| 7 | Admin PIN | 1 PIN por projeto GAS hoje; multi-unidade = mesmo PIN holding (OK) ou mapa por unidade (futuro) |

### Planilha — blockers extras confirmados

| Risco | Detalhe |
|-------|---------|
| **Veículo homônimo** | `Carro 01` nas duas lojas → 409 falso / ocupação errada se não filtrar |
| **`conta_id` (I42)** | Conta do dia por telefone — telefone nas duas lojas misturaria cesta |
| **Portal por telefone** | `buscarPortalResponsavel_` sem unidade → responsável vê timers dos **dois** shoppings |
| **Caches GAS** | `listar_ativas_v2`, `operacaoConfig_v1`, `inicio_v4_*`, `kpiMes83_*`, `resumoDia_*` → sufixo unidade |
| **Mínimo que não pode ficar global** | LOCACOES, CONFIG, CUSTOS, OPS+sessão, AUDITORIA, AUD_TURNO, FOLHA_PONTO, caminho KPI/CTO/relatório |
| **Shared com cuidado** | RESPONSAVEIS (CRM) + PLANO_CONTAS; portal **obrigado** a filtrar LOCACOES |

### Preços / KPI / CTO — funções a filtrar (checklist)

- Escritas: `salvarLocacao_`, multi, avulso, estender/encerrar/editar  
- Sync: `carregarInicio_`, `listarAtivas_`  
- KPI: `calcResumoDiaCore_`, `kpiMes_` / `buildKpiMesPayload_`, `calcOcupacaoFrotaLite_`  
- Config: `operacaoConfig_`, `veiculosOp_`, `planoCfgOp_`, `salvarOperacaoConfigAdmin_`  
- CTO: `ctoMinimo_`, `mesContrato_`, `CONTRATO_INICIO`, `EMAIL_RELATORIO` → **por unidade**  
- FE I158: `mkHtmlRelatorioGoldenFromKpi_` (branding + mailto)  
- QR/SMS: `PORTAL_RESPONSAVEL_URL` / arte QR por loja (modo atual `qr_only`)

### R9 — Portal e conta do dia
1. Portal filtra por `unidade_id` da locação (e/ou `?u=` no QR).  
2. `conta_id` / cesta multi-veículo é **por unidade** (mesmo telefone em shoppings diferentes = contas separadas).

---

## 3. Fluxos novos (UX)

### F1 — Hub: escolher unidade → depois a porta

Hoje: Hub 3 portas → login.  
Novo:

```
[Logo Movi Kids]
[ Escolha a unidade ]
  (○ Golden Shopping Calhau)  (○ La Ville Mall)
        ↓
[ Entrar no sistema | Colaboradores | Administração ]
  subtítulo = unidade escolhida
```

- Voltar: permite trocar unidade **só se** não houver sessão ativa / locações locais da outra unidade.
- Tablet La Ville: pode abrir `?force=1.9.x&unidade=laville` (pré-seleciona + trava opcional).

### F2 — Login balcão

1. Unidade já na sessão FE.  
2. `listarOperadoresLogin` + `loginOperador` com `unidadeId`.  
3. Mutex Script Properties: chave `sessaoOperadorAtiva_{unidadeId}`.  
4. Cards Home / `listarAtivas` / `carregarInicio` só da unidade.

### F3 — Colaboradores

- Ponto/RH: decidir se colaborador é **global** ou **por unidade** (ver §5 RH).  
- Hub Colaboradores mostra unidade no cabeçalho.

### F4 — Administração (**I161** Holding × Balcão — FE v1.9.144+)

1. PIN admin → entra em **modo Holding** (default filtro **Todas**).  
2. **Dois modos (não misturar):**  
   - **Holding** — chip `Holding · Todas` / `Visão: Golden|La Ville`; menu só páginas agregáveis (Lojas, Dashboard, Caixa, Hist, Relatório, Operadores, Colaboradores).  
   - **Balcão** — só após **Abrir balcão** numa loja; chip `📍 loja`; menu Nova/Home/Painel/Relacionamento/Avulso/Custo.  
3. Pills **Todas | Golden | La Ville** = filtro ADM (storage `mk_unidade_filtro_adm_v1`); unidade do tablet = `mk_unidade_ativa_v1`.  
4. Dash / caixa / hist / KPI respeitam o filtro; alertas sem `unidadeId` somem no filtro La Ville (anti-salada Golden).  
5. Relatório Golden (CTO) **só** com filtro Todas/Golden (item some em La Ville).  
6. Carga enxuta: sem `kpiMes`/ops no boot admin — prefetch só ao abrir Dashboard.

### F5 — Nova locação / timer / portal

- Preços e veículos = config da unidade da sessão.  
- Portal: telefone continua chave; locações retornadas **filtradas** pela unidade da locação (QR pode carregar `?u=laville` se necessário).

---

## 4. Mapa ponta a ponta — o que muda onde

### 4.1 Frontend (Pages — mesmo app)

| Superfície | Arquivos | Ação necessária |
|------------|----------|-----------------|
| Hub 3 portas | `index.html` `#mk-tablet-hub`, CSS hub | Passo **unidade** + labels dinâmicos |
| Auth gate | `index.html` `#mk-auth-gate`, `mk-auth.js` | Persistir `unidadeId`; listar/login com unidade |
| Sessão / idle | `mk-auth.js`, `mk-update.js` | Keys podem virar `…_v2` **ou** campo dentro do JSON atual |
| API client | `mk-api.js`, `mk-core.js` `apiParamsComAuth_` | Anexar `unidadeId` em **todas** escritas e leituras operacionais |
| Config runtime | `mk-core.js` `aplicarOperacaoConfig_` | Carregar preços/frota **da unidade** |
| Defaults FE | `mk-globals.js` `PRECOS` | Fallback Golden; La Ville só via CONFIG |
| Nova / Home / op | `mk-nova.js`, `mk-operacao.js`, `mk-sync.js`, `mk-sessao.js` | Escopo unidade em merge/listar/salvar |
| Offline I147 | fila IndexedDB | `unidadeId` no payload + chave de idempotência |
| Admin hub/dash | `mk-admin.js` | Filtro unidade; KPI; caixa; gráficos; ritmo |
| Relatório | `mkHtmlRelatorioGoldenFromKpi_` | Nome shopping + CTO + e-mail **por unidade** |
| Gestão Pessoas | `gestao-pessoas.html` + `mk-gestao-pessoas-*.js` | Unidade no header; ponto se RH for por unidade |
| Portal | `acompanhar.html` | Filtrar locações; branding por unidade |
| Branding hardcoded | vários HTML (“Golden Shopping…”) | Token `mkUnidadeLabel_(id)` |
| Versionamento I3 | `mk-version.js` / `sw.js` / `?v=` | Bump só quando FE multi-unidade entrar |

### 4.2 Apps Script (só com pedido §7.3)

| Área | Funções / constantes | Ação |
|------|----------------------|------|
| Identidade | novo `UNIDADES_`, `unidadeIdFrom_(p)` | Validar slug; default `golden` só em migração |
| Sessão balcão | `loginOperador_`, Script Properties | Chave por unidade |
| Sync | `carregarInicio_`, `listarAtivas_`, `salvarLocacao_`, `iniciarTimer_`, … | Filter + gravar `unidade_id` |
| Config | `operacaoConfig_(unidadeId)` | Ler JSON por unidade |
| Preços/frota | validadores Pacote H | Validar frota/preço **da** unidade |
| KPI | `kpiMes`, `resumoDia`, `comandoOperacional`, leading | Agregar ou filtrar |
| CTO | `CONTRATO_INICIO`, `ctoMinimo_` | Tabela CTO **por** unidade |
| Relatório | `_gerarHtmlRelatorio_` (legado) + FE I158 | Destinatário e texto por unidade |
| Schema | `LOC_HEADERS_`, `validarSchema_`, repairs | Coluna nova + backfill |
| Anti-dup I143 | `veiculoJaAberto_` | Escopo unidade |

### 4.3 Planilha — sheet a sheet (Opção A)

Legenda: **Obrigatório** / **Recomendado** / **Shared OK** / **Decisão RH**

| Aba | Impacto | Mudança proposta |
|-----|---------|------------------|
| **LOCACOES** | **Obrigatório** | Coluna `unidade_id` (ex. col AC → sobe `COL_LOC_READ_`); backfill `golden`; I43/I155 guards |
| **CONFIG** | **Obrigatório** | Chaves por unidade: `precos_json__golden`, `precos_json__laville`, `veiculos_validos_json__*`, `formas_pagamento_json__*`, `cto_contrato_json__*`, `unidade_meta_json` **ou** aba nova **UNIDADES** |
| **OPERADORES_SISTEMA** | **Recomendado** | Col `unidades` (csv `golden,laville`) — quem pode logar onde |
| **CUSTOS** | **Obrigatório** | Col `unidade_id` (custo da loja) |
| **DASHBOARD** | **Recomendado** | Abas/blocos por unidade **ou** fórmulas que respeitam filtro (hoje é auxiliar; KPI real vem do GAS) |
| **FOLHA** (memorial) | **Shared OK** / depois | Memorial CLT pode ser holding; rateio depois |
| **INVESTIMENTO** | **Recomendado** | Col unidade **ou** linhas tagueadas (payback por loja) |
| **RESPONSAVEIS** | **Shared OK** | CRM por telefone pode ser global; locações já têm unidade |
| **RELATORIOS** | **Recomendado** | Col unidade + tipo (Golden shopping vs interno) |
| **AUDITORIA** | **Obrigatório** | Col `unidade_id` (metas/bônus por loja) |
| **AUD_TURNO** | **Obrigatório** | Col `unidade_id` |
| **AUD_SMS / WA / RESP** | **Recomendado** | Col unidade se reativar F4 |
| **COLABORADORES_RH** | **Decisão RH** | Ver §5 |
| **FOLHA_PONTO / ESCALA / FALTAS / HOLERITES / BANCO_HORAS / METAS / COMUNICADOS / AVALIACOES** | **Decisão RH** | Se ponto for por loja → `unidade_id`; se holding → shared |
| **PLANO_CONTAS** | Futuro | Por unidade se ativar F14 |
| **Analise** | Ignorar | Legado |

**Nova aba sugerida (Opção A limpa):**

| Aba **UNIDADES** | Colunas exemplo |
|------------------|-----------------|
| `id`, `nome`, `status`, `timezone`, `email_relatorio`, `cto_json`, `endereco`, `ativa` | Cadastro mestre das lojas |

### 4.4 Fora da planilha

| Item | Impacto |
|------|---------|
| Script Properties sessão | 1 chave → N chaves por unidade |
| Cache GAS (`listar_ativas_v2`, kpi, comando) | Sufixo `_{unidadeId}` / `all` |
| GitHub Pages | Mesma URL; query `unidade=` |
| Tablet físico | 1 aparelho por loja; `?unidade=` no atalho PWA |
| OAuth / scripts PC | Continuam no workbook único (A) |

---

## 5. Decisões RH / pessoas (precisa do sócio)

| Pergunta | Opção 1 | Opção 2 |
|----------|---------|---------|
| Mesma operadora trabalha nas duas lojas? | Sim — login escolhe unidade; RH shared | Não — cadastros separados |
| Ponto / escala / holerite | Por unidade (onde bateu ponto) | Holding (1 folha; rateio manual) |
| Meta FSS R$100 (I149) | Por unidade | Holding (soma) — **perigoso** misturar |

**Recomendação:** operadoras **podem** ter acesso às duas (col `unidades`); ponto e meta **por unidade** no dia a dia; holerite holding se for a mesma CLT.

---

## 6. Preços, minutos e brinquedos (aguardando dados)

### Hoje (Golden — defaults código)

| Tipo | 10 | 20 | 30 | 40 | 60 | 3h | Adicional/min |
|------|----|----|----|----|----|-----|---------------|
| Carro / Triciclo | 12 | 22 | 30 | 40 | 55 | 130 | 1,00 |
| Pelúcia | 15 | 25 | 35 | 45 | 65 | 150 | 1,20 |

**Frota Golden atual:** Carro 01–04 · Triciclo 01–02 · Pelúcia 01–04.

### La Ville — entregue pelo sócio (29/09)

| Campo | Valor La Ville |
|-------|----------------|
| Tipos | Brinquedos (Carro/Triciclo/Pelúcia/Driffyt) + Dinos |
| Planos | 10/20/30/40/60 min (**sem** 3h) |
| Brinquedos | R$ 15/25/35/45/65 · + R$ 1,50/min |
| Dinos | R$ 20/35/50/65/90 · + R$ 2,00/min |
| Frota FE | **2** Carro · **2** Triciclo · **3** Pelúcia · **2** Driffyt · **2** Dino (LV*) |
| Formas de pagamento | PIX / Débito / Crédito / Dinheiro |
| CTO / e-mail shopping | ⏳ **pendente** (bloqueia PDF mensal LV) |

FE **v1.9.136+**: sem badge “frota provisória”. Consulta fatura dia a dia = página **Receita dia a dia** (filtro loja) — FE **1.9.157+**.

---

## 7. Dashboard, gráficos, caixa, relatórios (ADM)

| Bloco UI | Comportamento com filtro |
|----------|---------------------------|
| Centro de comando / `resumoDia` | Unidade ou soma (Todas) |
| `kpiMes` lite/full | Idem; séries podem empilhar Golden vs La Ville |
| Gráfico Base × Real × Ritmo (I156/I157) | Por unidade; Todas = linhas separadas ou empilhadas |
| Mini-DRE / CTO strip | CTO **não** soma cegamente — cada shopping tem contrato |
| Caixa do dia | Só faz sentido **por unidade** (duas maquininhas) |
| Relatório mensal shopping | Template por unidade (nome + e-mail + CTO) |
| PDF executivo / payback | Holding (Todas) **ou** por loja — decidir |
| Alertas FASE 8/17 | Tag de unidade no card |

---

## 8. Mapa de ações (checklist de implementação)

Ordem após Opção A + dados La Ville:

| # | Ação | Quem | Status |
|---|------|------|--------|
| 0 | Confirmar Opção A/B/C + RH | Sócio | ✅ **A** 29/09 · RH decisões §11 ainda abertas |
| 0b | Fundação FE/GAS soft (hub + unidadeId) | Agente | ✅ FE + GAS Web **v1.5.231** |
| 1 | Preços/frota La Ville | Sócio+Agente | ✅ preços/frota FE+GAS · ⏳ CTO/e-mail |
| 2 | Spec colunas + `unidade_id` | Agente | ✅ LOC/CUSTOS/RH/OPS |
| 3 | Backfill `golden` LOCAÇÕES | Agente OAuth | ✅ **3947** linhas (29/09) |
| 4 | GAS filtro + config por unidade | Agente + Nova versão Web | ✅ Web **v1.5.231** |
| 5 | FE liberar LV + ADM filtro Todas | Agente | ✅ Holding/balcão/I161/I165 |
| 6 | Portal / QR branding por unidade | Agente | ✅ I164 floresta · FE **1.9.161** |
| 7 | Homolog tablet 2 lojas + inauguração | Ops | ⏳ QR mesa · D4 · celular · equipe |

---

## 9. Riscos e armadilhas (não repetir)

| Risco | Mitigação |
|-------|-----------|
| KPI misturar lojas | Guard: `kpiMes` sem `unidadeId` falha em prod após cutover |
| Veículo “Carro 01” nas duas | Prefixo ou unicidade composta |
| Sessão balcão única global | Properties por unidade |
| Offline gravar na unidade errada | `unidadeId` imutável na fila |
| Relatório Golden com fat La Ville | Template amarra `unidadeId=golden` |
| CTO La Ville usando curva Golden | `cto_contrato_json` por unidade |
| I43 `COL_LOC_READ_` | Atualizar constante se nova coluna |
| I22 push com loja aberta | Manter `check-operacao-livre` |
| Publicar FE antes do GAS | Proibido (R6) |

---

## 10. Fora de escopo nesta fase

- Franquia / white-label  
- App nativo separado  
- ERP / multi-empresa fiscal  
- Trocar Sheets por banco  
- Reativar SMS/WhatsApp (F4) — só lembrar que logs ganham unidade  

---

## 11. Perguntas ao sócio (responder antes de codar)

1. ~~Confirma **Opção A** (1 planilha + `unidade_id`)?~~ ✅ **A** (29/09)  
2. Operadora pode trabalhar nas **duas** lojas no mesmo cadastro? ⏳  
3. Ponto RH / meta: **por loja** ou holding? ⏳  
4. ~~No ADM, default do filtro: **Todas** ou última unidade?~~ ✅ Holding default **Todas** (I161)  
5. Tablet La Ville: URL `?unidade=laville` — recomendado travar na mesa ⏳ Ops  
6. ~~Tabela preços/frota~~ ✅ · **CTO/e-mail La Ville** ⏳  

---

## 12. Referências no repo

- Hub: `index.html` `#mk-tablet-hub`  
- Auth: `mk-auth.js`  
- Config FE: `mk-core.js` `aplicarOperacaoConfig_` · `mk-globals.js` `PRECOS`  
- Planilha: `docs/referencia/MAPA_PLANILHA_ABAS_MOVIKIDS.md`  
- CTO Golden: `docs/referencia/CONTRATO_CTO_REFERENCIA.md`  
- GAS: `MOVIKIDS_Code_…gs` (`PRECOS`, `VEICULOS_VALIDOS`, `LOC_HEADERS_`, `operacaoConfig_`)  
- Relatório FE I158: `mk-admin.js` `mkHtmlRelatorioGoldenFromKpi_`  
- Receita dia a dia: `mk-admin.js` `carregarReceitaDiaria` · `#page-receita-diaria`  
- Handoff inauguração: `docs/ativos/HANDOFF_NOVO_CHAT.md`  

---

**Próximo passo:** Ops — checklist inauguração no HANDOFF (QR · tablet D4 · celular). Sócio — CTO/e-mail LV + 1ª equipe. Agente — sem AppScript até pedido §7.3; PDF mensal LV só após CTO.
