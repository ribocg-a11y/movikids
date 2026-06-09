# MOVI KIDS — Plano de prioridades (análise de sistemas)

**Data:** 09/06/2026  
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
| **FASE 5** Confiabilidade/APIs | 🟡 **ativa** | 08/06/2026 (`FASE_5_CONFIABILIDADE_APIS.md`) |

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

**Próximo passo imediato:** tablet balcão `?force=1.7.95` (portal sem ✕ + 5.B7.4 + mock idle I21) + 3× `TESTE_B7_REGRESSAO_WRITE` sem falha · fechar FASE 5.

**FASE 1 fechada 08/06/2026:** I.5 assinado · K.3–K.4 tablet · checklist A–F · payback Dashboard · tablet v1.7.87. Sprint 1 + Sprint 2 (K) declarados fechados.

---

## 1. Diagnóstico — como está o sistema hoje

### 1.1 Versões (fonte de verdade)

| Camada | Repo (GitHub) | Produção (verificado) | Alinhado? |
|--------|---------------|------------------------|-----------|
| **Frontend** | **v1.7.95** (`mk-version.js`) | GitHub Pages v1.7.95 | ✅ |
| **Service Worker** | v1.7.95 (`sw.js`) | — | ✅ |
| **GAS** | **v1.5.72** (header `.gs`) | Ping **v1.5.72** | ✅ |
| **Deploy ID** | `AKfycbwakQ...` | Mesmo ID | ✅ |
| **Git main** | `5a62726` | `origin/main` alinhado | ✅ |

**Teste rápido:** https://ribocg-a11y.github.io/movikids/?force=1.7.95  
**Ping GAS:** `?action=ping` → `versao: v1.5.72`  
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
| **SMS gateway** | ✅ Produção manual | DJVJRL; **auto/F4 pausado** |
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
| **F4** WhatsApp / SMS automático | Conta bloqueada; QR portal é canal oficial | `DECISAO_COMUNICACAO_QR_CODE_2026-06.md` |
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

### FASE 5 — Confiabilidade e APIs (P2–P3) · backlog

| ID | Item | Prioridade |
|----|------|------------|
| B7 | Regressão write controlada (iniciar/estender/encerrar) | Alta |
| B1 | API `resumoDia(data)` única (Caixa + chip) | Média |
| B2 | API `kpiMes` — Dashboard só visualiza | Média |
| **B8** | Idle sessão 1h FE+GAS (I21) | Alta |
| B6 | PIN admin só via GAS (T4) | Média |
| B3 | Auditoria UI por operador | Baixa |
| B5 | PDF resumo executivo | Baixa |

---

### FASE 6 — Pausado / trimestre (P4)

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
FASE 5  B7 write + APIs B1/B2/B8           [🟡 ativa — B8 I21 09/06]
```

**Não iniciar:** F4, F9 (pausados).

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
| Portal / QR | `DECISAO_COMUNICACAO_QR_CODE_2026-06.md` |
| Tablet QA | `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md`, `CHECKLIST_PACOTE_K.md` |
| Roadmap sprints | `PLANO_CONTINUIDADE_2026-06.md` |
| **Prioridades** | **este arquivo** |

---

## 5. Riscos ativos (monitorar)

| Risco | Mitigação |
|-------|-----------|
| Tablet em versão antiga (cache PWA) | `?force=1.7.95`, reinstalar ícone |
| Doc defasado → deploy errado | FASE 0.3; confiar em `mk-version.js` + ping |
| Payback mal interpretado pelo sócio | Nota no painel (v1.7.64); memorial §10 |
| POST no browser (I15) | Nunca reintroduzir; `pre-push-check` guard |
| Novo Deploy ID GAS | Proibido — Regra 8 |
| CONFIG planilha | FASE 4 ativa — `TESTE_OPERACAO_CONFIG_READONLY.ps1` baseline ok |

---

## 6. Visão futura (6–12 meses)

1. **Operação madura:** tablet homologado, QR no balcão, portal como canal principal dos pais.
2. **Gestão financeira:** payback + CTO + Dashboard num único PDF mensal para o shopping.
3. **Dados:** CONFIG na planilha; APIs `resumoDia` / `kpiMes` reduzindo duplicação.
4. **Relacionamento:** Pacote K em uso diário (cadastro canônico, recorrência).
5. **Comunicação:** reavaliar F4 só com evidência de entrega; até lá QR + manual.
6. **Arquitetura:** Pacote M fechado — Pacote L v1.7.91 entregue; CONFIG na planilha (FASE 4).

---

*Próxima revisão: ao fechar FASE 5 ou 13/06/2026.*
