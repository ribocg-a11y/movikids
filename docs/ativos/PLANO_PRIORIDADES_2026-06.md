# MOVI KIDS — Plano de prioridades (análise de sistemas)

**Data:** 07/06/2026  
**Função:** documento único de **o que fazer agora**, por ordem de prioridade.  
**Local:** `docs/ativos/` · **Índice:** `../INDICE.md`  
**Handoff:** `HANDOFF_NOVO_CHAT.md` · **Complementa:** `ESTADO_ATUAL.md`, `PLANO_CONTINUIDADE_2026-06.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`.

---

## Execução — status ao vivo

| Fase | Status | Início |
|------|--------|--------|
| **FASE 0** Alinhar base | ✅ fechada | 07/06/2026 |
| FASE 1 Homologação | 🟡 próxima | 07/06/2026 |
| FASE 2 Payback negócio | ⬜ | — |
| FASE 3 Pacote L | ⬜ | — |

### FASE 0 — checklist

| # | Ação | Status |
|---|------|--------|
| 0.1 | Tablets **v1.7.64** | ✅ 07/06 Ops |
| 0.2 | `sw.js` = 1.7.64 | ✅ 07/06 |
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

**Próximo passo imediato:** **FASE 1** — homologação (`HOMOLOGACAO_PRODUCAO_ASSISTIDA.md` checklist I.5 + payback Dashboard).

---

## 1. Diagnóstico — como está o sistema hoje

### 1.1 Versões (fonte de verdade)

| Camada | Repo (GitHub) | Produção (verificado) | Alinhado? |
|--------|---------------|------------------------|-----------|
| **Frontend** | **v1.7.78** (`mk-version.js`) | GitHub Pages após push | ✅ |
| **Service Worker** | v1.7.78 (`sw.js`) | — | ✅ |
| **GAS** | **v1.5.66** (header `.gs`) | Ping **v1.5.66** (07/06) | ✅ |
| **Deploy ID** | `AKfycbwakQ...` | Mesmo ID | ✅ |

**Teste rápido:** https://ribocg-a11y.github.io/movikids/?force=1.7.64  
**Ping GAS:** `?action=ping` → `versao: v1.5.66`

**I20 cronômetro:** RESOLVIDO — `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`. Não regredir sem `TESTE_I20_COMPLETO_PROD.ps1` + tablet.

### 1.2 Maturidade por área

| Área | Status | Notas |
|------|--------|-------|
| **Balcão (tablet)** | 🟡 Estável com ressalvas | I15 GET, I18 idle, I19 sessão fantasma corrigidos; **tablets precisam `?force=1.7.64`** |
| **Auth operadores** | ✅ Produção | PIN, sessão única, liberar sessão ADM, chip Turno |
| **Portal responsável** | ✅ Produção | `acompanhar.html`, cronômetro I16, rate limit GAS |
| **Foto moldura** | ✅ Produção | `foto-moldura.html`, botão no portal |
| **Dashboard / KPIs** | ✅ Produção | Pacote F completo, fatAno v1.5.59, comparativo semanal |
| **Payback investimento** | 🟡 Código ok, negócio aberto | GAS v1.5.63 + FE v1.7.64; planilha INVESTIMENTO preenchida (~R$ 65.410); perguntas §10 memorial |
| **CRM / RESPONSAVEIS** | 🟡 K.1–K.2 ok, QA pendente | 240 importados; checklist tablet K.3–K.4 não assinado |
| **SMS gateway** | ✅ Produção manual | DJVJRL; **auto/F4 pausado** |
| **Config frota/preços** | 🟡 Fallback GAS | Aba CONFIG sem JSON na planilha — usa constantes no `.gs` |
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

A, B, C, D, E, F, G, H, I, J, SMS P0, K.1, K.2, fixes I16–I19, **Payback M** (código v1.5.60–63 + FE v1.7.63–64).

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
| 0.1 | Tablets balcão em **v1.7.64** (`?force=1.7.64` ou reinstalar PWA) | Ops | Rodapé mostra v1.7.64; chip Turno verde |
| 0.2 | Corrigir **sw.js** → 1.7.64 (alinhar com `mk-version.js`) | Dev | `pre-push-check` verde |
| 0.3 | Atualizar **`ESTADO_ATUAL.md`** com versões e entregas payback/foto | Dev | Tabela produção = ping + mk-version |
| 0.4 | Confirmar ping GAS **v1.5.63** após cada deploy | Ops | `?action=ping` |
| 0.5 | Rodar **`pre-push-check.ps1`** antes de cada push | Dev | Sem falhas |

---

### FASE 1 — Homologação operacional (P0) · ~2–3 dias

Objetivo: fechar Sprint 1 do `PLANO_CONTINUIDADE` com evidência, não só código.

| # | Ação | Critério de pronto |
|---|------|-------------------|
| 1.1 | Checklist **I.5** em `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md` | Todos itens `[x]` com data |
| 1.2 | **Pacote K.3–K.4** — `CHECKLIST_PACOTE_K.md` no tablet | Badge Cadastro, Nova locação, Nova criança validados |
| 1.3 | Paridade cronômetro balcão × portal (I16) | `TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` ok |
| 1.4 | Paridade HTTP tablet (I15) | `TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` ok |
| 1.5 | Teste payback no Dashboard admin | Painel roxo com % e previsão projetada coerente |

**Saída:** Sprint 1 e Sprint 2 (K) declarados **fechados** para operação.

---

### FASE 2 — Payback e dados financeiros (P1) · ~1 semana

Objetivo: painel estratégico confiável para o sócio; fechar regras de negócio.

| # | Ação | Critério de pronto |
|---|------|-------------------|
| 2.1 | Validar aba **INVESTIMENTO** na planilha (B3 inauguração, B4 início payback, B6 total) | Valores batem com realidade (~R$ 65.410) |
| 2.2 | Responder perguntas **`MEMORIAL_PAYBACK_INVESTIMENTO.md` §10** | Capital de giro, data início, PDF payback |
| 2.3 | Criar **`DEPLOY_v1.5.63_PAYBACK.md`** (v1.5.62 parse data + v1.5.63 projeção) | Deploy documentado |
| 2.4 | Atualizar **`DEPLOY_GAS_v1.5.32_AUTH.md`** | Versões e links corretos |
| 2.5 | (Opcional) Seção Payback no **PDF mensal** | Espelha CTO |

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
| 4.3 | Decidir destino `scripts/liberar-milena-agora.html` | Commit ops ou mover para `scripts/ops/` |

---

### FASE 5 — Confiabilidade e APIs (P2–P3) · backlog

| ID | Item | Prioridade |
|----|------|------------|
| B7 | Regressão write controlada (iniciar/estender/encerrar) | Alta |
| B1 | API `resumoDia(data)` única (Caixa + chip) | Média |
| B2 | API `kpiMes` — Dashboard só visualiza | Média |
| B6 | PIN admin só via GAS (T4) | Média |
| B3 | Auditoria UI por operador | Baixa |
| B5 | PDF resumo executivo | Baixa |

---

### FASE 6 — Pausado / trimestre (P4)

| Item | Reavaliar quando |
|------|------------------|
| **F4** WhatsApp / SMS auto | Entrega manual comprovada + conta estável |
| **F9** Supervisor | K + L estáveis 30 dias |
| Modularização `index.html` | **Pacote M** — M.1 ✅; M.2+ em `PACOTE_M_MODULARIZACAO.md` |

---

## 3. Ordem de execução recomendada (resumo executivo)

```
FASE 0  Alinhar versões + docs base          [agora — 1 dia]
   ↓
FASE 1  Homologação tablet + K.3/K.4 + I.5 [2–3 dias]
   ↓
FASE 2  Payback negócio + deploy docs      [1 semana, paralelo possível]
   ↓
FASE 3  Pacote L UX + QR balcão            [2 semanas]
   ↓
FASE 4  CONFIG planilha + auditoria        [1 semana]
   ↓
FASE 5  Backlog B7, B1, B2                 [contínuo]
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
| Tablet em versão antiga (cache PWA) | `?force=1.7.64`, reinstalar ícone |
| Doc defasado → deploy errado | FASE 0.3; confiar em `mk-version.js` + ping |
| Payback mal interpretado pelo sócio | Nota no painel (v1.7.64); memorial §10 |
| POST no browser (I15) | Nunca reintroduzir; `pre-push-check` guard |
| Novo Deploy ID GAS | Proibido — Regra 8 |
| CONFIG vazio | Constantes no GAS até FASE 4 |

---

## 6. Visão futura (6–12 meses)

1. **Operação madura:** tablet homologado, QR no balcão, portal como canal principal dos pais.
2. **Gestão financeira:** payback + CTO + Dashboard num único PDF mensal para o shopping.
3. **Dados:** CONFIG na planilha; APIs `resumoDia` / `kpiMes` reduzindo duplicação.
4. **Relacionamento:** Pacote K em uso diário (cadastro canônico, recorrência).
5. **Comunicação:** reavaliar F4 só com evidência de entrega; até lá QR + manual.
6. **Arquitetura:** modularização só se equipe crescer; monólito `index.html` é risco aceito hoje.

---

*Próxima revisão: ao fechar FASE 1 ou 13/06/2026.*
