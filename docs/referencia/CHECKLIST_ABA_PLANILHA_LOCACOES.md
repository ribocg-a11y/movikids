# Checklist — Aba LOCACOES (planilha MOVI KIDS) — PILOTO I52

**Camada:** 1 — Operação P0 · **Protocolo:** `PROTOCOLO_AUDITORIA_ABAS_PLANILHA.md`  
**Data auditoria:** 24/06/2026 · **GAS:** v1.5.149 · **Status:** ✅ Fechada (piloto)

---

## A — Descoberta

| Item | Valor |
|------|-------|
| Grava runtime? | **sim** — operador/admin via GAS |
| Header row | **9** |
| Data row | **11** (`DATA_ROW`) |
| Total cols GAS | **28** (A–AB) |
| `COL_LOC_READ_` | **28** |
| APIs que escrevem | `salvarLocacao_`, `editarLocacao_`, `iniciarTimer_`, `encerrarLocacao_`, `estenderLocacao_`, `cancelarLocacao_` |
| APIs que leem | `listarAtivas_`, `carregarInicio_`, `resumoDia_`, `buscarPortalResponsavel_`, KPIs, CRM |
| Páginas impactadas | `index.html`, `acompanhar.html`, caixa, dashboard |
| Incidentes | I42 conta_id col S · I43 startTimestamp col Y · I32 lock · I52 schema |

---

## B — Schema

- [x] `LOC_HEADERS_` — 28 cols no `.gs`
- [x] `validarSchema` cobre 28 cols
- [x] `guard.gas.listarAtivas.colY` + `guard.gas.validarSchema.loc28`
- [x] `schemaOk=true` em produção (24/06)

---

## C — Auditoria

- [x] Status enum validado
- [x] Ativa exige col Y > 0
- [x] R$ numérico col H/J/K
- [x] Linhas teste flagadas (amostra pode listar histórico cancelado)

---

## D — Memorial

- [x] Linha 1: MOVI KIDS — LOCAÇÕES · não editar manualmente
- [x] Linha 2: app balcão/GAS · MAPA §6
- [x] Linha 3: S=conta_id · Y=timestamp · Z/AA=extensão
- [x] Header linha 9 — 28 títulos em uma linha
- [x] Congelado linha 9
- [x] Proteção linhas 1–9

---

## E — Formatação

| Col | Campo | Formato | OK |
|-----|-------|---------|-----|
| B | Data | dd/mm/yyyy | ✅ |
| C–D | Hora | hh:mm | ✅ |
| H,J,K | R$ | `"R$" #,##0.00` | ✅ |
| AA | Ext R$ | `"R$" #,##0.00` | ✅ |
| N | Telefone | `@` | ✅ |
| O | Status | Pendente/Ativa/Encerrada/Cancelada | ✅ |

---

## F — Higiene

- [x] `limparLocacoesTesteAdmin` integrado ao repair
- [x] Cache `invalidateInicioResumoCache_`

---

## G — GAS

| Item | Valor |
|------|-------|
| API | `repararLocacoesPlanilhaAdmin` |
| Script | `REPARAR_LOCACOES_PLANILHA_ADMIN.ps1` |
| Repair 24/06 | 833 linhas formatadas · schemaOk=True |

---

## H — Testes

| Script | Status |
|--------|--------|
| `REPARAR_LOCACOES_PLANILHA_ADMIN.ps1` | ✅ |
| `TESTE_REAUDITORIA_PLANILHA.ps1` | ✅ |
| `TESTE_I43_CARREGAR_INICIO_READONLY.ps1` | ✅ |
| `TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba LOCACOES` | ✅ |

---

## I — Melhorias backlog

| ID | Descrição | P | Status |
|----|-----------|---|--------|
| M-LOC-1 | Normalizar `\n` no header em `validarSchema` | P2 | ⏳ |
| M-LOC-2 | OAuth audit 50 linhas | P2 | ⏳ |
| M-LOC-3 | Arquivar aba Analise | P3 | ⏳ |

---

## J — Fechamento

- [x] MAPA_PLANILHA §6 e §9 atualizados
- [x] HANDOFF/ESTADO/MAPA_ERROS I52
- [x] **Piloto fechado** — replicar modelo na aba CONFIG
