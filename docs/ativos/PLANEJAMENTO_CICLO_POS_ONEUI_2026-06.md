# MOVI KIDS — Planejamento pós One UI (jun–jul/2026)

**Criado:** 27/06/2026 · **Substitui backlog ativo** de `PLANEJAMENTO_ONE_UI_2026-06.md` (Sprints A–C ✅)  
**Produção:** FE **v1.9.3** · GAS **v1.5.167** · Pages confirmado 29/06  
**Mestre:** `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md` · **Roteiro agente:** `ROTEIRO_AGENTE_OBRIGATORIO.md`

---

## 1. O que acabou (não repetir)

| Entrega | Versão | Data |
|---------|--------|------|
| Sprint A — FASE 16 visual (comando, caixa, hist, presença, frota, mobile) | v1.9.0 | 27/06 |
| Sprint B — FASE 18 UI (previsão mês + comparativo 30d) | v1.9.1 | 27/06 |
| Sprint C — RH hub + holerite widget | v1.9.2 | 27/06 |
| Travas I24 publicação FE | scripts + regras | 27/06 |
| Raykelly cadastro 100% | API | 26/06 |
| **I69** ponto mock (Raykelly) | v1.9.3 | 27–29/06 |
| Homolog tablet I43/I42/I47/Gestor | loja | 23/06 |

---

## 2. Estado das fases Premium (16–22)

| Fase | Nome | % | Falta fechar |
|------|------|---|--------------|
| **16** | One UI + Centro Comando | **~98%** | Assinatura formal + smoke tablet v1.9.2 |
| **17** | Alertas + Gestor | **~98%** | Assinatura D2 · decisão **17.5 F9** |
| **18** | Financeiro previsão | **~70%** | UI ✅ · PDF premium · campos GAS opcionais |
| **19** | Performance / gamificação | **0%** | Próximo ciclo dev **P2** |
| **20** | Portal analytics + CONFIG UI | **~15%** | Herda FASE 15 |
| **21** | Live BI frota | **~10%** | Herda FASE 13 |
| **22** | Assistente IA | **0%** | P4 — decisão sócio |

---

## 3. Frase guia do ciclo

> *Fechar confiança (FASE 17) → reconhecer equipe (FASE 19) → crescer receita (FASE 10 CRM) — sem tocar balcão.*

---

## 4. Backlog — ordem de execução

### Sprint D — Fechamento FASE 16 + 17 (P1 · ~1 semana)

**Objetivo:** assinar checklists · zero pendência visual admin v1.9.2

| ID | Entrega | Quem | Critério pronto |
|----|---------|------|-----------------|
| **D1** | Homolog **PC admin** v1.9.2 — comando, pills alerta, presença badges | Agente + sócio | ✅ **27/06** — ver `EVIDENCIA_SPRINT_D1_HOMOLOG_2026-06-27.md` |
| **D2** | Checklist **FASE 17** critérios 3–4 ✅ | Ops/sócio | Critérios 1–6 ✅ · falta **7 F9** + assinatura |
| **D3** | Decisão **17.5 F9** Supervisor | **Sócio** | Registro em `MATRIZ_PERMISSOES_PERFIS_2026-06.md` |
| **D4** | Smoke tablet **v1.9.2** (sem regressão balcão) | Ops loja | F5/F7/F10/F11 + 1 locação teste |
| **D5** | Marcar FASE 16/17 ✅ em `PLANO_PRIORIDADES` + `MAPA_FASES` | Agente | docs alinhados |
| **D6** | GAS ping Web **v1.5.167** (se ainda 165) | Sócio | Nova versão Web · ping alinhado |

**FE alvo:** manter **v1.9.2** (só bump se fix visual D1)

**Testes:** `TESTE_FASE16` · `TESTE_FASE17` · `TESTE_TABLET_*` se D4

---

### Sprint E — FASE 19 Performance saudável (P2 · ~1–2 semanas)

**Objetivo:** reconhecimento operadores sem competição tóxica · Manual §4.5, 8

| ID | Entrega | Arquivos | FE alvo |
|----|---------|----------|---------|
| **E1** | Ranking mês opt-in (top 3 loc/mês, sem salário) | `mk-gestao-pessoas-admin.js`, GAS read-only | v1.9.3 |
| **E2** | Badges conquistas no hub colaborador | `mk-gestao-pessoas-ui.js`, `mk-gestao-pessoas.css` | v1.9.3 |
| **E3** | Mensagem positiva hub (*"Entre os melhores do mês"*) | hub colaborador | v1.9.3 |
| **E4** | Admin painel evolução equipe (gráfico por operador) | `index.html` Operadores ou Dashboard | v1.9.4 |
| **E5** | CONFIG flag `ranking_habilitado` (default off) | GAS CONFIG + admin | v1.9.4 + GAS pedido |
| **E6** | Doc `FASE_19_PERFORMANCE_GAMIFICACAO.md` + teste readonly | `docs/ativos/`, `scripts/testes/` | — |

**Regra:** ranking **desligado por padrão** — sócio liga na CONFIG.

**GAS:** preferir agregar de `METAS_COLABORADORES` + locações existentes — pedido explícito se API nova.

---

### Sprint F — RH-G1 + rotina Ops (P1 · paralelo)

| ID | Entrega | Quem |
|----|---------|------|
| **F1** | Persistir aba **HOLERITES** (arquivo mensal) | Dev + GAS |
| **F2** | Rotina **ponto RH** diário | Ops |
| **F3** | Rotina mensal `HIGIENE` + `AUDITORIA_CELULA` + `BACKUP_RH` | Agente |

Doc: `PLANEJAMENTO_ATUAL_2026-06.md` §9 P1-3, P1-6

---

### Sprint G — FASE 10 CRM LTV (P2 · ~2 semanas)

| ID | Entrega | Foco |
|----|---------|------|
| **G1** | Cohort / recorrente no Relacionamento | `mk-relacionamento.js` |
| **G2** | Widget LTV no Dashboard | `mk-admin.js` |
| **G3** | Doc + teste readonly | `FASE_10_CRM_LTV.md` |

**FE alvo:** v1.9.5+

---

### Sprint H — FASE 18 complemento (P2 · opcional após E)

| ID | Entrega | Nota |
|----|---------|------|
| **H1** | Export PDF financeiro premium (layout holerite DNA) | `mk-admin.js` |
| **H2** | Gráfico entradas/saídas 30d (Chart.js) | Dashboard |
| **H3** | Break-even do dia no Caixa (herda FASE 7) | Caixa widget |

UI previsão já entregue Sprint B (UI-B1/B2).

---

### Não iniciar neste ciclo

| Item | Motivo |
|------|--------|
| FASE 22 IA | P4 — decisão sócio |
| F4 WhatsApp/SMS | QR only |
| F9 Supervisor | Aguarda D3 |
| Mudanças `api()` / auth / cronômetro | Homolog tablet |

---

## 5. Roadmap 30 dias (27/06 → 27/07)

```
Semana 1 (27/06–03/07)  Sprint D — fechar FASE 16/17 · smoke v1.9.2 · F9
Semana 2 (04/07–10/07)  Sprint E — FASE 19 E1–E3 (hub + badges)
Semana 3 (11/07–17/07)  Sprint E — E4–E6 + Sprint F1 RH-G1 início
Semana 4 (18/07–27/07)  Sprint G — FASE 10 CRM LTV · rotina Ops F2/F3
Paralelo contínuo:      ponto RH · pre-push · encerramento-sessao I24
```

---

## 6. Versões alvo

| Marco | FE | GAS |
|-------|-----|-----|
| FASE 17 assinada | v1.9.2 | v1.5.167 Web |
| FASE 19 MVP | v1.9.4 | read-only ou v1.5.170+ |
| FASE 10 CRM | v1.9.5 | conforme API |
| Design System doc | v1.2 | — (ao nascer badge/conquista) |

---

## 7. Próximo passo único (agente)

**Sprint D1** — ✅ homolog PC 27/06 (evidência `EVIDENCIA_SPRINT_D1_HOMOLOG_2026-06-27.md`).

**Paralelo sócio:** D2 assinar F17 · D3 decisão F9 · D6 GAS ping se necessário.

**Ops:** D4 smoke tablet v1.9.2.

---

## 8. Fluxo agente (inalterado)

Ver `ROTEIRO_AGENTE_OBRIGATORIO.md` — commit → pre-push → push → verify → encerramento exit 0.

---

*Revisar ao assinar FASE 17 e ao fechar Sprint E.*
