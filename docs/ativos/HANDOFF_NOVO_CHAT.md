# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 29/08/2026 · FE **v1.9.102** · GAS repo/Web **v1.5.210** ✅ · **I145** · **I143** · encerrar extra **I85** v1.9.98–100  
**Ambiente do agente:** **This PC** (Windows) — **não** Cloud. Pasta C: alinhar com `git pull` ou `.\scripts\sync-pasta-c-pc.ps1` após cada push FE.  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**I85 encerrar extra (29/08):** FE **v1.9.98–v1.9.101** — pagamento extra no alerta/drawer · justificativa · sync cards · toque.

**P0 local-first (29/08):** FE **v1.9.101–102** — boot sem `mk_sessions` cru · snapshot `mk_snapshot_v1` (LS + **IndexedDB** Fase 1) · chip status **local · nuvem** · poll idle **60 s** · cache 1 h · sync horário warm · botão limpar cache no Diagnóstico. Tablet: `?force=1.9.102`.

**I145 (13/08):** lentidão recorrente não foi regressão I143 — `mk-sync` ainda disparava `carregarInicio?force=1` ao desligar a tela (30s) e no idle 5 min. Planilha **0** Pendente/Ativa (fantasmas = cache PWA). FE warm sync. Doc: `INCIDENTE_I145_SYNC_FORCE_IDLE_2026-08-13.md`

**I144 (12/08):** diagnóstico balcão sem App Script — Milena **logada** 10:51 · locação **2714** salva/encerrada 10:54 (Alcides Neto / Cadu E Carlos). Anormalidade: páginas `liberar-*-agora.html` ainda usavam PIN **1416** (rejeitado). Correção: **`ops-balcao.html`** + PIN digitado. Doc: `INCIDENTE_I144_OPS_PIN_1416_LIBERAR_BALCAO_2026-08-12.md` · URL: https://ribocg-a11y.github.io/movikids/ops-balcao.html

**I143 (06/08):** salvar/▶ “erro” + cronômetro some + várias locações ao retentar — timeout ▶ fazia rollback + `force=1` (sync frio ~80s); unstick pedia salvar de novo. FE keep-optimistic + dedup 90s; GAS `veiculoJaAberto_`. Validação: salvar~3.9s · ▶~3.1s · dup 409 · limpeza OK. Doc: `INCIDENTE_I143_SALVAR_DUP_TIMEOUT_FORCE_2026-08-06.md`

**I142b (31/07):** print SPA saía em branco → print em janela isolada. PDFs prontos: `entregas/holerite-mes-2026-07/` (Raykelly + Julia).

**I142 (31/07):** holerite PDF com conferência do mês (Salário/VA/VT/Bônus Q1·Q2·Soma) + tabela dias de bônus · botão Salvar PDF. Teste `teste-i141-bonus-resto.cjs` (I141+I142).

**I141 (31/07):** bônus 2ª = resto do mês (não 50% de novo). Memorial Q1: Ray **150/998,40** · Julia **100/948,40**. Pacote 31/07: Ray **1652,22** · Julia **1702,22**.

**I140 (30/07):** FGTS fora da cesta (rodapé).

**I139 (30/07):** Metas badge mostra R$ (FSS R$50).

**I138 (30/07):** holerite VT semanal fora do pacote · memorial Q1 (corrigido I141 por pessoa).

**I137 (30/07):** cache full do Operadores não re-pede painel GAS.

**I136 (30/07):** Ficha não dispara preview enquanto painel RH full está em voo (fila GAS).

**I135 (30/07):** Folha/Escala “não carrega” = timeout lite 45s &lt; ~50s real → stub rápido; FE **v1.9.80** sobe timeouts + botão Tentar de novo + CSS `NomeMeta`.  


**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**GAS canônico (raw):** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  
**GitHub:** `ribocg-a11y/movikids` · branch `main` · **I125d:** salvar/▶ batch — mediana ~4.9s / ~3.4s (antes 18s / 8s)

**Mensagem mínima no novo chat:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

**Mensagem para retomar deste ponto (13/08 — cole esta):**

> *Continuar MOVI KIDS no PC — HANDOFF_NOVO_CHAT.md. FE v1.9.102 / GAS v1.5.210. Tablet `?force=1.9.102` (PWA). Próximo: Sprint D smoke D4 · assinar FASE 17. Sem App Script.*

**Mensagem para ciclo UI:**

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

## Como abrir o Cursor **já no PC** (novo agente)

**Continue on → This PC** (não Cloud). Cloud não vê a pasta C.

1. PowerShell (alinhar pasta C após push FE):

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

Ou manualmente:

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
git pull origin main
```

2. Abrir o repo no Cursor Desktop:

```powershell
cursor "C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github"
```

3. Novo Agent chat · colar a mensagem “retomar deste ponto” acima.

4. Tablet (Ops): https://ribocg-a11y.github.io/movikids/?force=1.9.102 — chip **local · nuvem** · se card fantasma, Diagnóstico → Limpar cache local + sync.

Emergência celular: https://ribocg-a11y.github.io/movikids/ops-balcao.html

---

### O que o agente faz sozinho (não pedir autorização)

- Ler docs ativos (ordem abaixo)
- **UI:** consultar `DESIGN_SYSTEM_MOVIKIDS.md` + `PLANEJAMENTO_ONE_UI_2026-06.md`
- **FE:** editar → `pre-push-check` → commit → push → `verify-publish-complete`
- Testes, ping GAS, planilha OAuth, docs, incidentes no mapa I*
- Toda resposta: bloco **Versões (encerramento)** + `Mudança no AppScript` (Regra 16)

**Só com pedido explícito:** `clasp push` / `prepare-gas-push.ps1` · mudar auth/PIN · Nova versão Web GAS.

---

## Produção (29/08/2026)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.9.102** | https://ribocg-a11y.github.io/movikids/?force=1.9.102 |
| **Gestão Pessoas** | **v1.9.102** | `gestao-pessoas.html?force=1.9.102` |
| **Service Worker** | **1.9.102** | `sw.js` · `mk-idb-store.js` |
| **Apps Script** | repo/Web **v1.5.210** ✅ | ping alinhado · I143 · I145 FE |
| **Pasta C** | `10f1dc6+` | `sync-pasta-c-pc.ps1` após push |
| **Baseline P0** | ✅ | `docs/ativos/BASELINE_CODIGO_P0.md` |
| **PIN admin** | **1421** | Script Property `ADMIN_PIN` |
| **Homolog tablet** | ✅ 23/06 | I43 · I42 · I47 · Gestor — smoke FE recente pendente Ops (D4) |
| **Planilha** | 23 abas | `schemaOk=True` · `validarSchema` **31/07** |
| **FOLHA VT (I68)** | ✅ 26/06 | B9 **8,80** · B10/B12 **22** · B68 **5253,96** · B25 **18,18** |
| **Holerite Q2 31/07** | ✅ I141+I142 | Ray pacote **1652,22** · Julia **1702,22** · bônus resto |
| **PDFs mês** | ✅ entregas | https://ribocg-a11y.github.io/movikids/entregas/holerite-mes-2026-07/ |
| **Bônus jul** | ✅ 13 dias | Ray/Julia **R$ 850** (FSS R$50) |
| **Colaboradores RH** | ✅ I75+I79 | Julia Atendente 2 · Raykelly id 3 · 100% |
| **Design System** | **v1.1** | `DESIGN_SYSTEM_MOVIKIDS.md` |
| **Multi-veículo** | ✅ I97–I99 | Cesta Nova locação · batch GAS · overlay |
| **I103 / I117** | ✅ | Encerradas=contas · Caixa=todas · pay-first |
| **I123–I124** | ✅ | Dashboard Base×Ritmo×Real · capítulos |
| **I125d perf** | ✅ | salvar/▶ batch · mediana ~4.9s / ~3.4s |
| **BANCO_HORAS** | ✅ I129 | ops 1–4 **0h00** |
| **I129 ponto colab** | ✅ | FE v1.9.75+ · GAS Web **v1.5.210** |

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
| **T** | Tablet PWA **v1.9.102** (`?force=1.9.102`) — I146 chip local/nuvem · I145 idle | Ops | ⏳ **primeiro** |
| **0d** | **I145** sync idle/visibility sem `force=1` | Agente | ✅ **13/08** Pages + C |
| **0f** | **I146** P0 local-first · IndexedDB Fase 1 · anti-fantasma boot | Agente | ✅ **29/08** FE **v1.9.102** |
| **0e** | **I144** `ops-balcao.html` PIN digitado | Agente | ✅ **13/08** |
| **0** | **I141–I142b** holerite Q2 resto + PDF conferência mês | Agente | ✅ **31/07** FE **v1.9.88** · PDFs em `entregas/` |
| **0a** | **I125–I137** perf balcão/Operadores/ficha/cache | Agente | ✅ jul/2026 |
| **0b** | **I122** / **I143** anti-fantasma + anti-duplicata salvar/▶ | Agente | ✅ GAS **v1.5.210** · FE **v1.9.96+** |
| 1 | **Sprint D1** homolog PC admin | Agente | ✅ **27/06** |
| 2 | Assinar **FASE 17** (só falta **17.5 F9**) + smoke tablet D4 | Sócio + Ops | ⏳ após T |
| 3 | Smoke tablet **v1.9.102** (multi-veículo + overlay + timer + I145 + I146) | Ops | ⏳ Sprint D4 |
| 4 | Sprint E — FASE 19 Performance (ranking opt-in) | Agente | 📋 após D2–D4 |

Docs: `INCIDENTE_I145_*` · `INCIDENTE_I144_*` · `MAPA_ERROS` · `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`

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

*Preparado para novo chat — ciclo Premium One UI · FE v1.9.88 · GAS v1.5.209 · I141/I142 holerite PDF · próximo: FASE 17 / smoke tablet D4.*
