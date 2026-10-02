# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 02/10/2026 · FE **v1.9.155** · GAS **v1.5.231** · receita dia a dia (consulta) · **I165** · Golden fechamento ✅ · I164d · I161 ✅

## Produção (agora)

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.155** | https://ribocg-a11y.github.io/movikids/?force=1.9.155 |
| Gestão Pessoas | **v1.9.155** | `gestao-pessoas.html?force=1.9.155` |
| GAS | ping Web **v1.5.231** ✅ | I160 escala null + I159t LV |
| Design System | v1.1 | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

**Deploy ID:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## I159 — Multi-unidade Golden × La Ville (status 29/09)

### Já feito ✅

| # | Item | Onde |
|---|------|------|
| I159–b | Hub 3 portas + preços/frota La Ville (LV*) no FE | FE |
| I159c | GAS preços/frota por `unidadeId` | repo **v1.5.223+** |
| I159d | Holding ADM lado a lado | FE |
| I159e | Col AC `unidade_id` · filtro `carregarInicio`/`listarAtivas`/`kpiMes` | repo **v1.5.224** · Web parcial |
| I159f | Dual ADM (Caixa/Dash/Painel/Hist/Rel/Custo) · La Ville ≠ 6 fantasma · CUSTOS col G | FE **v1.9.126–128** · GAS repo **v1.5.225** |
| I159g | Badge loja no balcão · holding não zera encerradas Golden | FE **v1.9.131** |
| I158 | Relatório Golden via `kpiMes` (sem Cancelada) | FE ✅ |
| Planilha hoje | Golden 6 contas/7 sess/R$116 · La Ville 0 · `carregarInicio` OK | API |

### Ainda falta ⏳

| # | Item | Quem | Bloqueio |
|---|------|------|----------|
| **B** | ~~Backfill `unidade_id` LOCAÇÕES~~ | ✅ 29/09 | **3947** linhas atualizadas / 3950 lidas (`backfillUnidadeIdLocacoesAdmin`) |
| **C** | Smoke PC: Holding filtro · Caixa Golden ≠ 0 · Avulso tipos LV · balcão LV 0 | Agente | ✅ **01/10** `TESTE_HOLDING_SMOKE_C_READONLY` · Golden fat **87**/n**3** · LV **0** · Avulso Drift/Dino FE |
| **D** | ~~Frota La Ville~~ · e-mail CTO ainda | ✅ FE+GAS **v1.5.226** | label UI **I159o** (sem LV na tela) |
| **E** | Tablet smoke D4 · PDF Golden 01/10 · FASE 17 | Ops/Sócio | Ops |
| **F** | ~~GAS lookback `resumoDia`~~ | ✅ Web **v1.5.226** | dia = cauda 600 |

**Nova versão Web:** ✅ ping **v1.5.231** (I160). FE **v1.9.149** **I164** — cartaz QR Golden/La Ville + `track.html`/`foto-moldura`/`manifest` multi-loja (floresta). **I162** logo dino + loja do operador. **I161** Holding×Balcão. Suite: `entregas/DIAGNOSTICO_LAVILLE_SUITE40_2026-09-30.md`.

### I164 — Cartaz QR + track + foto moldura (smoke)

| Check | Esperado |
|-------|----------|
| `assets/qr-balcao-imprimir.html?loja=laville` | Cartaz floresta · venue **La Ville Mall** · mesmo QR portal |
| `?loja=golden` | Mesmo DNA floresta · venue Golden |
| `foto-moldura.html?unidade=laville` | Rodapé/legenda **La Ville Mall** · moldura verde floresta |
| `track.html?s=…&unidade=laville` | Floresta + plano/rodapé La Ville · link balcão manda `unidade=` |

### I163 — Portal responsáveis floresta (smoke celular)

| Check | Esperado |
|-------|----------|
| `acompanhar.html?force=1.9.149` | Floresta + logo dino + “Entrar na floresta” |
| Loc Golden | Chip **Golden** · brinquedo sem prefixo LV |
| Loc La Ville (veículo LV *) | Chip **La Ville** · label sem “LV ” |
| Mesmo tel nas 2 lojas | Ambas no carrossel · chip avisa multi-loja |

### I162 / I162b / I162c — Logo + sessão por loja (smoke PC)

| Check | Esperado |
|-------|----------|
| Empty home / splash / sidebar | Mascote dino + MOVI KIDS (fundo transparente) |
| Karen/Ray Golden logada; admin abre balcão LV | Linha **Balcão some** (só TABLET admin) |
| Mesma pessoa no balcão Golden | `Karen · Golden` / `Raykelly · Golden` |
| Carga pós-login (I162c) | **Sem** `listarOperadoresLogin&all&_t` extra · home/sync warm estável (I155) |
| RH / OPS | Colunas `unidade_id` já existem (RH **T**, OPS **I**) |

### I165 — Chip Caixa por loja (smoke PC) — **obrigatório**

| Check | Esperado |
|-------|----------|
| Balcão La Ville (ainda sem operação) | Tiles **0** · chip **Caixa hoje: 0 locações** (não o número do Golden) |
| Balcão Golden | Chip = locações Golden do dia |
| Holding Todas | Dual cards; cada loja com seu fat |

### I161 — Holding × Balcão (smoke PC)

| Check | Esperado |
|-------|----------|
| Login admin | Chip **Holding · Todas**; menu sem Nova/Painel/Avulso |
| Pill La Ville no Dashboard | Fat/caixa da LV; **sem** alerta meta Milena/Golden |
| Pill Todas | Dual cards Golden+La Ville; chip Holding · Todas |
| Lojas → Abrir balcão La Ville | Chip **📍 La Ville**; menu Nova/Home/Painel; Dashboard some |
| ← Lojas | Volta Holding; ops somem de novo |

### Planilha Google (multi-unidade) — o que mudou / falta

| Aba | Status | Detalhe |
|-----|--------|---------|
| **LOCACOES** | Schema ✅ col **AC `unidade_id`** | Backfill ✅ **3947** linhas (29/09) · novas locs gravam unidade |
| **CUSTOS** | Schema ✅ col **G `unidade_id`** | Novos custos com unidade; antigos = golden default |
| **COLABORADORES_RH** | ✅ col **T** | **La Ville equipe 0 = intencional** (ainda sem contratação) |
| **OPERADORES_SISTEMA** | ✅ col **I** | Ao contratar: loja `laville` → escala **14h–21:30 · folga terça** (GAS **v1.5.230**) |
| **ESCALA La Ville** | Padrão I159t | Seg–Dom `14–21:30` · **Ter=OFF** · demais params = Golden (salário/VA/meta 20/bônus) |
| **CONFIG** | Ping lista golden + laville | Preços La Ville oficiais (Brinquedos+Dinos); frota LV* |
| **DASHBOARD / RELATORIOS / FOLHA** | Sem aba por loja | Filtro por `unidadeId` na API — **não** há sheet “La Ville” separada |
| **AUD_SMS / SMS** | Fora do menu FE | QR-only; abas podem existir na planilha sem uso operacional |

Diagnóstico 29/09: `diagnosticoPlanilhaCompletoAdmin` → LOCACOES/CUSTOS/CONFIG **ok**. API `resumoDia` hoje: Golden **R$ 178 / 8 contas**; La Ville **0**.

### Matriz páginas (smoke 29/09) — I159h

| Página | Status | Nota |
|--------|--------|------|
| Holding / Lojas | ✅ FE 1.9.132 | Filtro Todas/Golden/La Ville **esconde coluna**; sem card sessão |
| Balcão Home | ✅ | Badge loja + card sessão só aqui |
| Nova Locação | ✅ | Frota/preços por unidade |
| Painel Operação | ✅ | Pills dual + frota LV oficial |
| Relacionamento | ✅ | Badge + filtro dual |
| Hist. locações | ✅ 1.9.135 | KPIs/lista/ranking seguem filtro dual |
| **Caixa do dia** | ✅ 1.9.132 | 1× `resumoDia(all)` + fatia FE |
| Dashboard | ✅ 1.9.134 | Cache por unidade; 1ª carga GAS frio |
| Centro de gestão | ✅ 1.9.135 | Pills dual · porta Sistema oculta |
| Hist. custos | ✅ 1.9.133 | Pills dual + fatia FE |
| Registrar Custo | ✅ 1.9.133 | Pills + lista filtrada |
| **Avulso** | ✅ | Tipos/preços por loja |
| Colaboradores | ✅ | `?unidade=` + subtítulo |
| Menu | ✅ 1.9.134+ | Sem SMS/Sistema · Sair fixo |
| Relatório mensal Golden | ✅ I158 | `kpiMes` FE |

---



## I158 — Relatório Golden (fechado nesta sessão)

| Item | Valor |
|------|--------|
| Problema | PDF/e-mail GAS contava **Cancelada** → fat/CTO inflados |
| Correção | FE **v1.9.120** — `mkHtmlRelatorioGoldenFromKpi_` via **`kpiMes`** (sem AppScript) |
| Agosto enviado (histórico) | R$ **17.212** · 957 · CTO **R$ 1.721,20** — **não reenviar** |
| Setembro prévia **29/09** | R$ **14.371** · **675** · CTO **R$ 1.500** |
| Setembro prévia **30/09** | R$ **14.525** · **682** · CTO **R$ 1.500** |
| **Setembro FECHAMENTO 01/10** (`kpiMes` golden) | R$ **14.577** · **684** · extra **R$ 8** · ticket **R$ 21,31** · CTO **R$ 1.500** (10% = **1.457,70**) |
| PDF/HTML fechamento | `entregas/MOVI-KIDS-Relatorio-Setembro-2026-Golden-fechamento-2026-10-01.pdf` (+ `.html`) |
| JSON evidência | `entregas/kpiMes-golden-2026-09-fechamento-20261001_095523.json` |
| PDF ago dia a dia | `entregas/MOVI-KIDS-Relatorio-Agosto-2026-Golden-diario.pdf` |
| Docs | `INCIDENTE_I158_*` · `guard.i158.fe.golden` · `TESTE_I158_GOLDEN_*` |

**CTO R$ 1.500:** mínimo contratual. Fechamento: 10% de 14.577 = **1.457,70** &lt; mínimo → **R$ 1.500**. Vencimento ref. **05/10/2026**.

**Pronto para envio ao Golden** — PDF/HTML gerados 01/10 (FE v1.9.149 · kpiMes sem canceladas). E-mail GAS legado desligado; sócio envia o PDF.

---

## Erros do agente nesta sessão (registrar — não repetir)

| # | Erro | Regra violada | Correção |
|---|------|---------------|----------|
| 1 | Entregou números `kpiMes` (16.140) quando o sócio pediu o relatório **igual ao enviado ao Golden** (17.212) | Ouvir pedido literal | Agosto histórico = GAS legado; set+ = caixa |
| 2 | Propôs/alterou `.gs` e depois reverteu; confusão “cadê o código AppScript?” | Usuário: sem AppScript agora | Correção I158 = **só FE** |
| 3 | **Demorou a publicar FE** (Pages ficou em 1.9.119) esperando o sócio pedir merge | **§7.2 / I24** — commit+push FE **sem pedir** | Merge+push `main` na hora; `encerramento-sessao` exit 0 |
| 4 | Respostas longas / links misturados (GAS vs FE) | Clareza operacional | Uma frase: “novo código = `mk-admin.js` no GitHub; Code.gs sem mudança” |

**Lição:** correção FE pronta → **publicar na mesma sessão**. Não transferir “merge/push” ao usuário.

---

## Ops RH

| Pessoa | Status |
|--------|--------|
| **Karen** id5 | Operadora ativa · Sem PIN (1º acesso) · Freelancer |
| **Julia** id4 | **Pausa** — fora do login balcão |

**Ambiente:** Cloud Agent OK para FE/docs · pasta C / AppScript = sócio no PC.  
**GitHub:** `ribocg-a11y/movikids` · `main`

---

## Travas confiabilidade

| Família | Travas |
|---------|--------|
| **I158** Golden | `guard.i158.fe.golden` · `TESTE_I158_*` · Relatório via kpiMes |
| **I151** fantasma | `guard.i151.*` · `TESTE_I151_*` |
| **I153–I155** | duplicata / 404 / lookback 600 |

---

## Abrir agente no PC (C:)

| Item | Valor |
|------|--------|
| Workspace | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` |
| Modo | **Agent local / This PC** |
| 1º turno | `.\scripts\relatorio-versoes.ps1 -Markdown` · Pages **1.9.122** · ping **v1.5.221** |

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
.\scripts\relatorio-versoes.ps1 -Markdown
```

---

## Mensagem para colar no novo chat (PC)

> *Continuar MOVI KIDS **no PC** — pasta C (`movikids-github`). Ler `HANDOFF_NOVO_CHAT.md`. FE **v1.9.151** Pages · GAS ping **v1.5.231**. Golden set fechamento ✅ R$ 14.577 / CTO R$ 1.500. I164 floresta multi-loja ✅. Próximo: enviar PDF Golden · imprimir QR La Ville · tablet D4 · assinar FASE 17 (só 17.5 F9). **This PC.***

**Mínima:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

---

## Próximo passo (por peso)

| Peso | # | Ação | Quem | Status |
|------|---|------|------|--------|
| **P0** | 1 | **Enviar** PDF Golden set/2026 ao shopping | **Sócio** | ✅ artefato pronto · fat **R$ 14.577** · n **684** · CTO **R$ 1.500** · `entregas/...fechamento-2026-10-01.pdf` |
| **P0** | 2 | Imprimir cartaz QR La Ville (`?loja=laville`) + fixar na mesa | Ops | ⏳ FE **v1.9.151** |
| **P1** | 3 | Tablet smoke D4 `?force=1.9.151` | Ops | ⏳ |
| **P1** | 4 | Smoke portal+foto La Ville no celular | Ops | ⏳ PC ✅ · falta celular |
| **P1** | 5 | Assinar FASE 17 (decisão 17.5 F9) | Sócio | ⏳ |
| **P1** | 5b | Bump moldura/cartaz/track floresta | Agente | ✅ FE **v1.9.151** (I164–I164d) |
| **P2** | 6 | Contratar 1ª equipe La Ville (RH `unidade_id=laville`) | Ops/RH | ⏳ escala 14–21:30 / terça OFF |
| **P2** | 7 | E-mail CTO / frota labels oficiais LV | Sócio | ⏳ |
| **P3** | 8 | Holding smoke C (Caixa≠0 · Avulso LV) | Agente | ✅ 01/10 · Golden fat **R$ 87** · LV **0** · `TESTE_HOLDING_SMOKE_C_READONLY` |
| **P4** | 9 | F4 WhatsApp/SMS · F9 Supervisor | — | pausado |

**Plano:** `docs/ativos/PLANO_MULTI_UNIDADE_GOLDEN_LAVILLE_2026-09.md`

---

## Comandos úteis (PC)

```powershell
.\scripts\encerramento-sessao.ps1
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY.ps1
node scripts\testes\teste-estabilidade-pos-i155.cjs
```

Ver: `ROTEIRO_AGENTE_OBRIGATORIO.md` · `PROTOCOLO_ATUALIZAR_TUDO.md` · `ESTADO_ATUAL.md` · `MAPA_ERROS_FALHAS_BUGS.md`
