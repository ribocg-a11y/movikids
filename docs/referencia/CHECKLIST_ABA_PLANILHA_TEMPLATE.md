# Checklist — Aba `[NOME_ABA]` (planilha MOVI KIDS)

**Camada:** [0–5] · **Protocolo:** `PROTOCOLO_AUDITORIA_ABAS_PLANILHA.md`  
**Data auditoria:** ____/____/2026 · **Responsável:** ______  
**GAS versão:** v____.__ · **Status:** ⏳ Em andamento | ✅ Fechada | 🚫 Legado

---

## A — Descoberta

| Item | Valor |
|------|-------|
| Grava runtime? | sim / não / só admin |
| Header row | linha ___ |
| Data row | linha ___ |
| Total cols GAS | ___ |
| `COL_*_READ_` | ___ (se aplicável) |
| APIs que escrevem | |
| APIs que leem | |
| Páginas impactadas | |
| Incidentes (I*) | |

---

## B — Schema

- [ ] Headers canônicos definidos no `.gs` (`*_HEADERS_`)
- [ ] `validarSchema` cobre todas as cols
- [ ] Guard no `pre-push-check.ps1`
- [ ] `schemaOk=true` em produção

**Divergências encontradas:**

| Col | Esperado | Atual | Resolvido? |
|-----|----------|-------|------------|
| | | | |

---

## C — Auditoria de dados (amostra ___ linhas)

- [ ] Enums válidos
- [ ] Datas consistentes
- [ ] Números/R$ numéricos
- [ ] FKs válidas
- [ ] Sem linhas teste em produção ativa

**Problemas:**

| Linha | Campo | Valor | Severidade |
|-------|-------|-------|------------|
| | | | P0/P1/P2 |

---

## D — Memorial e proteção

- [ ] Linha 1: título + “não editar manualmente”
- [ ] Linha 2: gravado por GAS + link doc
- [ ] Linha 3: cols críticas (se houver)
- [ ] Header row único (sem `\n` na célula)
- [ ] `setFrozenRows`
- [ ] Proteção memorial+header

---

## E — Formatação

| Col | Campo | Formato aplicado | OK? |
|-----|-------|------------------|-----|
| | | | |

**Validação de dados (dropdowns):**

| Col | Lista permitida | OK? |
|-----|-----------------|-----|
| | | |

---

## F — Higiene

- [ ] Linhas teste anuladas/removidas
- [ ] Cache GAS invalidado
- [ ] Duplicatas tratadas

---

## G — GAS repair

| Item | Valor |
|------|-------|
| API admin | `reparar___PlanilhaAdmin` |
| dryRun testado | sim/não |
| Repair aplicado em | __/__/2026 |
| Linhas formatadas | ___ |

---

## H — Testes

| Script | Status | Data |
|--------|--------|------|
| `TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba ___` | | |
| `TESTE_REAUDITORIA_PLANILHA.ps1` | | |
| Teste fluxo consumidor | | |

---

## I — Melhorias (backlog da aba)

| ID | Descrição | Prioridade | Status |
|----|-----------|------------|--------|
| M-___-1 | | P1/P2/P3 | ⏳ / ✅ |

---

## J — Fechamento

- [ ] MAPA_PLANILHA §6 atualizado
- [ ] HANDOFF/ESTADO se mudou prod
- [ ] Incidente registrado (se P0)
- [ ] **Aba fechada** conforme critérios do protocolo §7

**Observações finais:**
