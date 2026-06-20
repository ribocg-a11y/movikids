# MOVI KIDS — Plano de prioridades (análise de sistemas)

**Data-base:** 09/06/2026 · **Revisado:** 20/06/2026  
**Função:** documento único de **o que fazer agora**, por ordem de prioridade.  
**Local:** `docs/ativos/` · **Índice:** `../INDICE.md`  
**Handoff:** `HANDOFF_NOVO_CHAT.md` · **Complementa:** `ESTADO_ATUAL.md`, `PLANO_CONTINUIDADE_2026-06.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`.

---

## Execução — status ao vivo

| Fase | Status | Início |
|------|--------|--------|
| **FASE 0** Alinhar base | ✅ fechada | 07/06/2026 |
| **FASE 1** Homologação | ✅ fechada | 08/06/2026 (assinada) |
| **FASE 2** Payback negócio | ✅ fechada | 08/06/2026 (INVESTIMENTO + GAS v1.5.69) |
| **FASE 3** Pacote L | ✅ fechada | 08/06/2026 (FE **v1.7.91** validado) |
| **FASE 4** CONFIG planilha | ✅ fechada | 08/06/2026 (`FASE_4_CONFIG_PLANILHA.md`) |
| **FASE 5** Confiabilidade/APIs | ✅ **fechada** | 09/06/2026 (`CHECKLIST_FASE5_TABLET.md` Milena) |
| **P3** Backlog produto | ✅ fechada | 09/06/2026 |
| **P2** Backlog técnico | ✅ fechada | 09/06/2026 |
| **FASE 6** Cockpit executivo | ✅ repo + I22 hotfix | FE v1.8.2 → **v1.8.4** / GAS v1.5.75 |
| **FASE 7** Leading financeiros | ✅ repo + I23 | FE v1.8.4 → **v1.8.5** / GAS v1.5.77 → **v1.5.78** |
| **FASE 8** Alertas proativos | ✅ repo | FE v1.8.9 / GAS v1.5.79 |
| **FASE 9** Folha CLT + viabilidade | ✅ **prod fechado** | GAS **v1.5.91** · testes ok **14/06** · I25 fechado |
| **Dashboard narrativo + folha prop.** | ✅ prod | FE v1.8.11–1.8.15 · `DEPLOY_FE_v1.8.15_SEMANA_ATUAL.md` |
| **FASE 14** Mini-DRE | ✅ prod | FE v1.8.16+ · cascata Dashboard |
| **FE UX mobile + DNA admin** | ✅ prod | v1.8.23–1.8.30 · I28 · `CHECKLIST_FASE9_DNA_ADMIN.md` |
| **FASE 15** Gestão Pessoas | 🟡 repo | FE **v1.8.68** · GAS repo **v1.5.111** (ping **v1.5.107**) · I29/I30 · `FASE_15_GESTAO_PESSOAS.md` |
| **Design System v1.0** | ✅ repo | `DESIGN_SYSTEM_MOVIKIDS.md` · regra Cursor obrigatória |

**Próximo passo imediato:**

1. PC: `gestao-pessoas.html?force=1.8.68` — validar I29 (auth DNA) · Design System §9
2. **Nova versão Web GAS v1.5.111** — alinhar ping (hoje v1.5.107)
3. **Tablet loja** — F5/F7/F10/F11 (regressão balcão)
4. **FASE 10** CRM LTV — próximo ciclo dev (GAS — pedir §7.3)

### FASE 0 — checklist

| # | Ação | Status |
|---|------|--------|
| 0.1 | Tablets **v1.7.64** → evoluído **v1.7.87** (M.17) | ✅ 08/06 |
| 0.2 | `sw.js` alinhado `mk-version.js` | ✅ 08/06 (1.7.87) |
| 0.3 | `ESTADO_ATUAL.md` atualizado | ✅ 07/06 |
| 0.4 | Ping GAS v1.5.66 | ✅ 07/06 |
| 0.5 | **I20 cronômetro** — tablet ▶→10:00 | ✅ 07/06 |
| 0.5 | `PLANO_PRIORIDADES` + deploy docs | ✅ 07/06 |
| 0.6 | `pre-push-check.ps1` verde | ✅ 07/06 |
| 0.7 | Saneamento docs → `docs/` | ✅ 07/06 |
| 0.8 | Saneamento código → `arquivo-historico/` + `scripts/testes/` | ✅ 07/06 |
| 0.9 | Handoff ativo `HANDOFF_NOVO_CHAT.md` + `AGENTS.md` + regra Cursor | ✅ 07/06 |
| 0.10 | `ACESSOS_E_AUTORIZACOES.md` + planilha OAuth (`google-drive-sheets-auth`) | ✅ 07/06 |
| 0.11 | `MAPA_CODIGO_ARQUITETURA.md` — anatomia e chaves mestras | ✅ 07/06 |

**FASE 1 fechada 08/06/2026:** I.5 assinado · K.3–K.4 tablet · checklist A–F · payback Dashboard · tablet v1.7.87. Sprint 1 + Sprint 2 (K) declarados fechados.

---

## 1. Diagnóstico — como está o sistema hoje

### 1.1 Versões (fonte de verdade)

| Camada | Repo (GitHub) | Produção (verificado) | Alinhado? |
|--------|---------------|------------------------|-----------|
| **Frontend** | **v1.8.10** (`mk-version.js`) | após push | ⏸ |
| **Service Worker** | v1.8.10 (`sw.js`) | — | ✅ |
| **GAS** | **v1.5.80** (header `.gs`) | Ping prod. **v1.5.79** · alvo **v1.5.80** | ⏸ |
| **Deploy ID** | `AKfycbwakQ...` | Mesmo ID | ✅ |
| **Git main** | `dca694f` | `origin/main` alinhado | ✅ |

**Teste rápido:** https://ribocg-a11y.github.io/movikids/?force=1.8.10  
**Ping GAS:** `?action=ping` → alvo `versao: v1.5.80`  
**CONFIG:** `TESTE_OPERACAO_CONFIG_READONLY.ps1` → baseline ok 08/06

**I20 cronômetro:** RESOLVIDO — `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`. Não regredir sem `TESTE_I20_COMPLETO_PROD.ps1` + tablet.

### 1.2 Maturidade por área

| Área | Status | Notas |
|------|--------|-------|
| **Balcão (tablet)** | ✅ Homologado FASE 1 | v1.7.87 assinado 08/06; I.5 + checklist A–F |
| **Auth operadores** | ✅ Produção | PIN, sessão única, liberar sessão ADM, chip Turno |
| **Portal responsável** | ✅ Produção | `acompanhar.html`, cronômetro I16, rate limit GAS |
| **Foto moldura** | ✅ Produção | `foto-moldura.html`, botão no portal |
| **Dashboard / KPIs** | ✅ Produção | Pacote F completo, fatAno v1.5.59, comparativo semanal |
| **Payback investimento** | ✅ FASE 2 fechada | GAS v1.5.69 + INVESTIMENTO; `DECISAO_PAYBACK_FASE2_2026-06.md` |
| **CRM / RESPONSAVEIS** | ✅ K.1–K.4 homologado | 240 importados; K.3–K.4 assinado tablet 08/06 |
| **SMS gateway** | ⏸ **Fora da operação** | QR portal oficial · reativar com serviço contratado |
| **Config frota/preços** | ✅ FASE 4 fechada | `okConfig: true`, 9 veículos, 3h 130/150 |
| **CI local** | ✅ | `pre-push-check.ps1`; sem GitHub Actions |
| **Documentação** | ✅ Estruturada | Handoff ativo + `docs/ativos/` (ver §1.3) |

### 1.3 Fontes de verdade (usar nesta ordem)

| Prioridade | Documento | Conteúdo |
|------------|-----------|----------|
| **1** | `HANDOFF_NOVO_CHAT.md` | Entrada para novo chat; produção; próximo passo |
| **2** | **Este arquivo** | Fases, checklist vivo, prioridades |
| **3** | `ESTADO_ATUAL.md` | Versões, pacotes, links, validação |
| **4** | `mk-version.js` + header `.gs` + ping GAS | Versão em código e produção |
| **5** | `ACESSOS_E_AUTORIZACOES.md` | Papéis, PIN admin, agente vs humano |
| **6** | `DEPLOY_GAS_v1.5.32_AUTH.md` | Deploy GAS mestre (v1.5.63) |

**Não usar para versão atual:** `docs/arquivo/obsoleto/`, `docs/arquivo/planos/HANDOFF_NOVO_CHAT_2026-06-05.md`, `docs/arquivo/deploy/` (histórico), `arquivo-historico/*.gs`.

### 1.4 Pacotes entregues (fechados)

A, B, C, D, E, F, G, H, I, J, SMS P0, **K.1–K.4** (homologado 08/06), fixes I16–I20, **Payback M** (código), **Pacote M** M.1–M.17 (v1.7.87), **FASE 1 homologação**.

### 1.5 Explicitamente pausado (não executar)

| Item | Motivo | Doc |
|------|--------|-----|
| **F4** WhatsApp / SMS (auto ou manual) | ⏸ **Zero envio na operação** | `OPERACAO_COMUNICACAO_QR_ONLY.md` |
| **F9** Supervisor | Operadores precisam autonomia total no balcão | GAS v1.5.52 reverteu restrições |

---

## 2. Hierarquia de prioridades

Legenda: **P0** = bloqueia operação ou confiança · **P1** = valor imediato · **P2** = próximo ciclo · **P3** = backlog · **P4** = futuro/pausado

---

### FASE 0 — Alinhar base (P0) · ~1 dia

Objetivo: uma única verdade entre código, produção, tablets e documentação.

| # | Ação | Responsável | Critério de pronto |
|---|------|-------------|-------------------|
| 0.1 | Tablets balcão em **v1.7.87** (`?force=1.7.87` ou reinstalar PWA) | Ops | Rodapé mostra v1.7.87; chip Turno verde |
| 0.2 | **sw.js** alinhado com `mk-version.js` (1.7.87) | Dev | `pre-push-check` verde |
| 0.3 | Atualizar **`ESTADO_ATUAL.md`** com versões e entregas payback/foto | Dev | Tabela produção = ping + mk-version |
| 0.4 | Confirmar ping GAS **v1.5.63** após cada deploy | Ops | `?action=ping` |
| 0.5 | Rodar **`pre-push-check.ps1`** antes de cada push | Dev | Sem falhas |

---

### FASE 1 — Homologação operacional (P0) · ~2–3 dias

Objetivo: fechar Sprint 1 do `PLANO_CONTINUIDADE` com evidência, não só código.

| # | Ação | Critério de pronto | Status |
|---|------|-------------------|--------|
| 1.1 | Checklist **I.5** | Assinado | ✅ 08/06/2026 |
| 1.2 | **K.3–K.4** tablet | Assinado | ✅ 08/06/2026 |
| 1.3 | Paridade cronômetro (I16) | Script ok | ✅ 08/06 |
| 1.4 | Paridade HTTP (I15) | Script ok | ✅ 08/06 |
| 1.5 | Payback Dashboard admin | Assinado | ✅ 08/06/2026 |
| 1.6 | Tablet **A–F** | Assinado | ✅ 08/06/2026 |
| 1.7 | F5/F7/F10/F11 + I20 | Homologado | ✅ 08/06/2026 |

**Saída:** Sprint 1 e Sprint 2 (K) **fechados** para operação (08/06/2026).

---

### FASE 2 — Payback e dados financeiros (P1) · ~1 semana

Objetivo: painel estratégico confiável para o sócio; fechar regras de negócio.

| # | Ação | Critério de pronto |
|---|------|-------------------|
| 2.1 | Validar aba **INVESTIMENTO** (B3=`27/05/2026`, B4=`05/2026`; capital giro Entra=S) | ✅ 08/06/2026 |
| 2.2 | Perguntas memorial **§10** | ✅ `DECISAO_PAYBACK_FASE2_2026-06.md` |
| 2.3 | Relatório Golden sem dados ADM | ✅ GAS **v1.5.68**–**v1.5.69** |
| 2.4 | Deploy GAS v1.5.69 no editor | ✅ 08/06 — ping **v1.5.69** |
| 2.5 | Payback no PDF Golden | ✅ **não** (decisão sócio) |

---

### FASE 3 — Pacote L: UX polish (P1) · ~2 semanas

Objetivo: balcão mais rápido; menos ruído visual. **Próximo pacote de feature** após K.

| # | Entrega | Origem |
|---|---------|--------|
| L.1 | Tiles veículo unificados (Home / Painel / Nova) | Plano mestre §3.2 |
| L.2 | Barra resumo fixa na Nova locação | §4.1 |
| L.3 | Header “Última sync · há Xs” | Backlog |
| L.4 | Dashboard: atalho caixa hoje sem duplicar número | §5 |
| L.5 | Página Sistema: diagnóstico + liberar sessão | §9 |
| L.6 | QR portal no balcão (`assets/qr-balcao-imprimir.html`) | Decisão QR |

**Versão alvo:** FE **v1.7.65+** · GAS mínimo **v1.5.63**

---

### FASE 4 — Config e planilha (P2) · ~1 semana

| # | Ação | Valor |
|---|------|-------|
| 4.1 | Preencher **CONFIG JSON** na planilha (frota/preços) | Admin edita sem redeploy GAS |
| 4.2 | Reauditar planilha pós-mudanças | `AUDITORIA_PLANILHA_BASE_*.md` |
| 4.3 | Decidir destino `scripts/liberar-milena-agora.html` | ✅ `scripts/ops/` (08/06) |

---

### FASE 5 — Confiabilidade e APIs · ✅ fechada 09/06/2026

| ID | Item | Status |
|----|------|--------|
| B7 | Regressão write + tablet | ✅ |
| B1 | `resumoDia` | ✅ |
| B2 | `kpiMes` | ✅ |
| B8 | Idle I21 + v1.7.96 splash | ✅ |
| B6 | PIN admin só GAS | ✅ 09/06 P2 |
| B3 | Auditoria UI operador | ✅ 09/06 P3 |
| B5 | PDF executivo | ✅ 09/06 P3 |
| B4 | Export caixa WA/email | ✅ 09/06 P3 |
| N2 | Golden + payback PDF | ✅ 09/06 P3 |

---

### FASE 6–15 — Cockpit executivo, UX gestão e inteligência financeira · 🟡 ativo

**Documento mestre:** **`PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md`** (benchmark jun/2026 → 10 fases + FASE 16 backlog + Anexo A futuro)

| Fase | Nome | P | FE | GAS | Impacto visual |
|------|------|---|-----|-----|----------------|
| **6** | Cockpit 5 KPIs + narrativa | P1 | v1.8.0 | v1.5.75 | Dashboard topo |
| **7** | Leading financeiros | P1 | v1.8.1 | v1.5.76 | Dashboard + Caixa |
| **8** | Alertas / semáforos | P1 | v1.8.2 | v1.5.77 | Dashboard + sidebar |
| **9** | DNA visual admin | P1 | v1.8.5 | — | Dashboard, Caixa, CRM, Sistema |
| **10** | CRM LTV / cohort | P2 | v1.8.6 | v1.5.78 | Relacionamento |
| **11** | Holding Movi+ZapClin | P2 | v1.8.7 | v1.5.79 | Página Holding |
| **12** | Drill-down + simulação | P2 | v1.8.8 | v1.5.80 | Dashboard gráficos |
| **13** | Live BI Firebase | P2 | v1.8.9 | v1.5.81 | Widget frota live |
| **14** | Plano contas + mini-DRE | P2 | v1.8.16 | v1.5.82 | Cascata margens · 🟡 docs 11/06 |
| **15** | Gestão Pessoas / holerite | P1 | v1.8.68 | v1.5.111 (repo) | `gestao-pessoas.html` |

---

### FASE 6 legado — Pausado / trimestre (P4)

| Item | Reavaliar quando |
|------|------------------|
| **F4** WhatsApp / SMS auto | Entrega manual comprovada + conta estável |
| **F9** Supervisor | K + L estáveis 30 dias |
| Modularização `index.html` | **Pacote M FECHADO** — M.1–M.17 ✅ (v1.7.87; zero JS inline) — `PACOTE_M_MODULARIZACAO.md` |

---

## 3. Ordem de execução recomendada (resumo executivo)

```
FASE 0  Alinhar versões + docs base          [✅ fechada 07/06]
   ↓
FASE 1  Homologação tablet + K.3/K.4 + I.5 [✅ fechada 08/06]
   ↓
FASE 2  Payback negócio + deploy docs      [✅ fechada 08/06]
   ↓
FASE 3  Pacote L UX + QR balcão            [✅ fechada — v1.7.91]
   ↓
FASE 4  CONFIG planilha + auditoria        [✅ fechada — 08/06]
   ↓
FASE 5  B7 + B1/B2/B8 + tablet Milena     [✅ fechada 09/06 — v1.7.96]
   ↓
P2/P3   B6 + CI + backlog produto          [✅ fechada 09/06]
   ↓
FASE 6  Cockpit executivo (5 KPIs)         [🟡 PRÓXIMA — v1.8.0]
   ↓
FASE 7–8 Leading + alertas               [⏳ P1]
   ↓
FASE 9  DNA visual admin                   [⏳ P1]
   ↓
FASE 10–15 CRM, holding, drill, live, DRE [⏳ P2/P3]
   ↓
Anexo A ROIC/ERP/multi-loja                [⏸ só decisão sócio]
```

**Plano completo:** `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md`

**Não iniciar:** F4, F9 (pausados — Anexo A plano 6–15).

---

## 4. Mapa de documentos — o que ler para cada tarefa

Todos em `docs/ativos/` salvo indicação. Índice completo: `docs/INDICE.md`.

| Tarefa | Ler primeiro |
|--------|--------------|
| **Novo chat** | `HANDOFF_NOVO_CHAT.md` → este arquivo |
| Acessos / quem faz o quê | `ACESSOS_E_AUTORIZACOES.md` |
| Deploy GAS | `DEPLOY_GAS_v1.5.32_AUTH.md` + deploy específico |
| Publicar FE | `REGRAS_DE_PUBLICACAO_SEGURA.md` + `pre-push-check.ps1` |
| Incidente / bug | `MAPA_ERROS_FALHAS_BUGS.md` → `docs/arquivo/incidentes/` |
| Payback fórmulas | `MEMORIAL_PAYBACK_INVESTIMENTO.md` |
| **Ciclo FASE 6–15 (cockpit/UX/financeiro)** | **`PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md`** |
| Portal / QR | `DECISAO_COMUNICACAO_QR_CODE_2026-06.md` |
| Tablet QA | `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md`, `CHECKLIST_PACOTE_K.md` |
| Roadmap sprints | `PLANO_CONTINUIDADE_2026-06.md` |
| **Prioridades** | **este arquivo** |

---

## 5. Riscos ativos (monitorar)

| Risco | Mitigação |
|-------|-----------|
| Tablet em versão antiga (cache PWA) | `?force=1.7.96`, reinstalar ícone |
| Doc defasado → deploy errado | FASE 0.3; confiar em `mk-version.js` + ping |
| Payback mal interpretado pelo sócio | Nota no painel (v1.7.64); memorial §10 |
| POST no browser (I15) | Nunca reintroduzir; `pre-push-check` guard |
| Novo Deploy ID GAS | Proibido — Regra 8 |
| CONFIG planilha | FASE 4 ✅ — `TESTE_OPERACAO_CONFIG_READONLY.ps1` |

---

## 6. Visão futura (6–12 meses)

1. **Operação madura:** tablet homologado, QR no balcão, portal como canal principal dos pais.
2. **Gestão financeira:** payback + CTO + Dashboard num único PDF mensal para o shopping.
3. **Dados:** CONFIG na planilha; APIs `resumoDia` / `kpiMes` reduzindo duplicação.
4. **Relacionamento:** Pacote K em uso diário (cadastro canônico, recorrência).
5. **Comunicação:** reavaliar F4 só com evidência de entrega; até lá QR + manual.
6. **Arquitetura:** Pacote M + L + CONFIG + FASE 5 APIs entregues.

---

## 7. Planejamento pós-FASE 5

**Documento mestre ciclo ativo:** **`PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md`**  
**Resumo operação:** **`PLANEJAMENTO_ATUAL_2026-06.md`** — fases 6–15, B7, treino N1.

---

*Próxima revisão: **14/06/2026**.*
