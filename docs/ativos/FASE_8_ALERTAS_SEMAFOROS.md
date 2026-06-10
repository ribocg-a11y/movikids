# FASE 8 — Alertas proativos e semáforos

**Status:** 🟢 **repo pronto** — publicar GAS **v1.5.79** + FE **v1.8.9** (ou já incluído no pacote v1.5.80)  
**Prioridade:** P1  
**Versão alvo:** FE **v1.8.9** · GAS **v1.5.79**  
**Plano mestre:** `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md` § FASE 8  
**Depende de:** FASE 6–7 publicadas · **v1.8.5+** / **v1.5.78** · hotfix **I22** · **Regra 14**

---

## 0. Pré-requisitos (obrigatório antes de codar)

| # | Gate | Comando / critério | Quem |
|---|------|-------------------|------|
| P0.1 | Home estável pós-I22 | Tablet F0: sessões, sync, Nova locação | Ops |
| P0.2 | Operacao livre | `.\scripts\check-operacao-livre.ps1` → 0 Ativa/Pendente | Dev |
| P0.3 | GAS FASE 6–7 em produção | Ping `versao: v1.5.78` | ✅ |
| P0.4 | FE cockpit+leading validado | PC admin `?force=1.8.7` — cockpit + leading + KPIs sem duplicata | Sócio |
| P0.5 | Documentar escopo | Só `#page-dashboard` + GAS `kpiMes` — **não** tocar Home | Dev |

**Nunca iniciar FASE 8 com locações ativas** (lição I22).

---

## 1. Objetivo

Antecipar problemas antes do P&L fechado: **semáforo verde/amarelo/vermelho** + lista acionável de alertas para o sócio — reutilizando lógica de `finSinalEmpresa_` (FinanceiroGeral) adaptada ao MOVI KIDS isolado.

---

## 2. Entregas (checklist)

### GAS v1.5.77

| ID | Entrega | Status |
|----|---------|--------|
| 8.1 | `buildAlertasGestao_(payload)` — regras v1 (tabela abaixo) | ✅ repo |
| 8.2 | Port/adaptar `finSinalEmpresa_` → `movikidsSinalEmpresa_` | ✅ repo |
| 8.3 | Campo `alertas: [{ nivel, codigo, titulo, mensagem, acionavel }]` em `kpiMes` | ✅ repo |
| 8.4 | Campo `sinalEmpresa: { nivel, label, motivo }` em `kpiMes` | ✅ repo |
| 8.5 | Doc **`DEPLOY_v1.5.79_FASE8_ALERTAS.md`** | ✅ |

### FE v1.8.3

| ID | Entrega | Status |
|----|---------|--------|
| 8.6 | `#mk-alert-strip` sob cockpit (max 3 + “ver todos”) | ✅ repo |
| 8.7 | Modal **Alertas do mês** | ✅ repo |
| 8.8 | Semáforo payback strip + margem cockpit | ✅ repo |
| 8.9 | Badge sidebar Dashboard (alertas críticos) | ✅ repo |
| 8.10 | Dismiss sessionStorage (`mk_alert_dismiss_*`) | ✅ repo |
| 8.11 | Manter `#nk-alerta` FASE 5 (faturamento dia) — não conflitar | ✅ |
| 8.12 | Só admin vê alertas gestão | ✅ repo |

### QA

| ID | Entrega | Status |
|----|---------|--------|
| 8.13 | `TESTE_FASE8_ALERTAS_READONLY.ps1` | ✅ repo |
| 8.14 | `pre-push-check` verde + `guard.html.page-balance` | ⏳ |
| 8.15 | PDF executivo — box “Pontos de atenção” (opcional nesta fase) | ⏳ |

---

## 3. Regras de alerta (v1)

| Código | Condição | Nível | Acionável |
|--------|----------|-------|-----------|
| `MARGEM_BAIXA` | margem < 10% | vermelho | Sócio — revisar custos |
| `MARGEM_ATENCAO` | margem 10–18% | amarelo | Sócio |
| `OCUPACAO_BAIXA` | ocupação média < 25% | amarelo | Ops — horário/preço |
| `CANCEL_ALTO` | taxa cancel > 8% | amarelo | Ops — treino |
| `PAYBACK_ATRASO` | projeção payback > 24m | amarelo | Sócio |
| `CTO_MINIMO` | ctoPagar === ctoMinimo | info | Sócio — volume |
| `SEM_MOVIMENTO` | diasOperando < 3 e dia > 10 | vermelho | Ops |

**Sinal empresa** (`movikidsSinalEmpresa_`): ok / atencao / perigo — espelha `finSinalEmpresa_` com 3 meses recentes.

---

## 4. Impacto visual

| Página | Seção | Mudança |
|--------|-------|---------|
| **Dashboard** | Sob `#mk-exec-cockpit` | Faixa `#mk-alert-strip` (amarelo/vermelho) |
| **Dashboard** | Payback / margem pills | Borda semáforo |
| **Sidebar** | Dashboard | Badge numérico críticos |
| **Sistema** | Diagnóstico | Histórico alertas mês (readonly) |
| **Home balcão** | — | **Sem mudança** |

---

## 5. Ordem de implementação sugerida

```
1. GAS: movikidsSinalEmpresa_ + buildAlertasGestao_ + kpiMes.alertas
2. TESTE_FASE8_ALERTAS_READONLY.ps1 (verde antes do FE)
3. FE: renderAlertStrip_ + modal (mk-admin.js, mk-app.css)
4. FE: semáforos cockpit/payback + sidebar badge
5. Deploy doc + pre-push + check-operacao-livre
6. PC admin homolog → depois tablet F0 smoke (Regra 14)
```

---

## 6. Critério de pronto

- [ ] Margem baixa simulada → alerta vermelho no Dashboard admin  
- [ ] Operador na Home **não** vê `#mk-alert-strip`  
- [ ] `kpiMes.alertas` array não vazio quando regra dispara  
- [ ] Teste readonly verde · pre-push verde  
- [ ] Push só com `check-operacao-livre.ps1` ok  

---

## 7. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Repetir I22 (`index.html`) | Contagem divs + `guard.html.page-balance`; diff mínimo só Dashboard |
| Alertas duplicados FASE 5 | `#nk-alerta` = dia; `#mk-alert-strip` = mês/gestão |
| Deploy com locação ativa | Regra 14 + gate no pre-push |
| GAS 6–7 não publicado | Fechar P0.3 antes de FE alertas |

---

## 8. Após FASE 8

**FASE 9** — DNA visual admin (hero glass, colapsáveis) — consolida cockpit + leading + alertas numa hierarquia visual única.
