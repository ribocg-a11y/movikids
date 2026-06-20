# MOVI KIDS — Planejamento atual (pós-FASE 5)

**Atualizado:** 20/06/2026 (FASE 15 **✅ homolog tablet** · jornada v1.5.111 · FE **v1.8.71**)  
**Produção:** FE **v1.8.71** · GAS **v1.5.111** Web **165** (20/06)  
**Documentos irmãos:** `PLANO_PRIORIDADES_2026-06.md` · `MAPA_FASES.md` · `DEPLOY_ATUAL.md` · `HANDOFF_NOVO_CHAT.md`  
**Ciclo ativo:** **`PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md`** · FASE 15: **`FASE_15_GESTAO_PESSOAS.md`** ✅  
**Próximo ciclo:** **`PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md`** ← manual Premium + One UI (20/06/2026)

---

## 1. Resumo executivo

Ciclo **FASE 0–5 + P2/P3 concluído** (07–09/06/2026). Balcão homologado, portal QR, payback, CONFIG e APIs unificadas.

**Modo atual:** **FASE 15 Gestão Pessoas** ✅ (homolog tablet 20/06) · **FASE 16 Premium** — próximo ciclo · FASE 14 mini-DRE ✅

---

## 1b. Próximo ciclo — Premium + One UI (FASES 16–22)

**Documento mestre:** [`PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md`](PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md)  
**Origem:** Manual Plataforma Gestão Premium (26/06/2026)

| Fase | Nome | Prioridade | Foco |
|------|------|------------|------|
| **16** | Premium One UI + Centro de Comando | **P1** | KPI com contexto · tempo real · tipografia leve |
| **15b** | RH completo (comunicados, histórico, avaliações) | **P1** | Colaborador: *"sei o que fazer e acompanho crescimento"* |
| **17** | Alertas inteligentes + permissões Gestor | **P1** | Banco horas, queda fat, frota parada |
| **18** | Financeiro + previsão | P2 | Projeção mês · comparativo 30d |
| **19** | Performance + gamificação saudável | P2 | Ranking opt-in · conquistas · badges |
| **20** | Portal analytics + CONFIG UI | P2 | Herda FASE 15 original |
| **21** | Live BI frota | P2 | Herda FASE 13 |
| **22** | Assistente IA gestão | P3 | Anexo — decisão sócio |

**Sequência imediata:** kickoff **FASE 16** mock Premium One UI (FASE 15 ✅ homolog tablet 20/06).

---

## 2. Fases concluídas

| Fase | Período | Entrega principal | Evidência |
|------|---------|-------------------|-----------|
| **0** Alinhar base | 07/06 | Versões, docs, pre-push, handoff | `PLANO_PRIORIDADES` § FASE 0 |
| **1** Homologação | 08/06 | I.5, K.3–K.4, checklist A–F, I20 tablet | `CHECKLIST_TABLET_v1.7.85.md` |
| **2** Payback | 08/06 | INVESTIMENTO, GAS v1.5.69, decisão §10 | `DECISAO_PAYBACK_FASE2_2026-06.md` |
| **3** Pacote L | 08/06 | UX polish + QR balcão v1.7.91 | `CHECKLIST_PACOTE_L.md` |
| **4** CONFIG | 08/06 | Frota/preços na planilha sem redeploy | `FASE_4_CONFIG_PLANILHA.md` |
| **5** Confiabilidade | 09/06 | B7+B1+B2+B8, tablet Milena, I21 v1.7.96 | `CHECKLIST_FASE5_TABLET.md` |
| **P3** Backlog produto | 09/06 | B3+B4+B5+N2, CRM recorrente | `../arquivo/deploy/DEPLOY_v1.5.73_P3_BACKLOG.md` |
| **P2** Backlog técnico | 09/06 | B6 PIN GAS, CI, F10, schema | `../arquivo/deploy/DEPLOY_v1.5.74_B6_PIN_ADMIN.md` · `.github/workflows/ci.yml` |

### Pacotes históricos fechados (pré-fases)

A–M (modularização FE), SMS P0, fixes I15–I21, Pacote K CRM, Pacote M M.1–M.17.

---

## 3. Ciclo FASES 6–15 (ativo)

**Documento mestre:** [`PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md`](PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md)

| Fase | Nome | Prioridade | Status | Impacto visual principal |
|------|------|------------|--------|--------------------------|
| **6** | Cockpit executivo | P1 | ✅ repo · I22 hotfix | Dashboard topo |
| **7** | Leading financeiros + causalidade | P1 | ✅ repo · I23 perf | Dashboard + Caixa |
| **8** | Alertas e semáforos | P1 | ✅ repo | Dashboard + sidebar |
| **9** | Folha CLT + viabilidade | P1 | ✅ repo | Dashboard `#mk-contratacao-panel` |
| **9b** | DNA visual admin | P1 | ✅ repo v1.8.28 | Dashboard, Caixa, CRM, Sistema |
| **10** | CRM LTV / cohort | P2 | ⏳ | Relacionamento + Dashboard |
| **11** | Holding Movi + ZapClin | P2 | ⏳ | Nova página Holding |
| **12** | Drill-down + simulação margem | P2 | ⏳ | Dashboard gráficos |
| **13** | Live BI Firebase | P2 | ⏳ | Dashboard widget frota |
| **14** | Plano contas + mini-DRE | P2 | ⏳ | Dashboard + Custos |
| **15** | Gestão Pessoas / colaboradores | P1 | ✅ **v1.8.71** homolog tablet 20/06 | `gestao-pessoas.html` · `mk-holerite.js` |

Detalhe entrega/melhoria/página: tabelas por fase no plano mestre · **FASE 16** (telemetria balcão) = backlog opcional · **Anexo A** = ROIC/ERP (fora do ciclo).

---

## 4. Fases / itens em aberto (operação + legado)

Legenda: **P0** bloqueia operação · **P1** valor imediato · **P2** próximo ciclo · **P3** backlog · **P4** pausado

### P0 — Monitorar (sem dev ativo)

| Item | Ação | Responsável |
|------|------|-------------|
| **I22 — janela operacional** | `check-operacao-livre.ps1` antes de push FE crítico | Dev |
| **I23 — Dashboard perf** | Mutex KPI + GAS v1.5.77+ já em prod | Dev |
| Tablet em versão antiga | Manter `?force=1.8.71` no PWA balcão | Ops |
| POST no browser (I15) | Nunca reintroduzir | Dev |
| Deploy ID GAS | Só Nova versão Web — nunca `clasp deploy` sem `-i` | Dev/Ops |
| Regressão I20 cronômetro | Antes de mexer em timer: `TESTE_I20_COMPLETO_PROD.ps1` | Dev |
| GAS repo ≠ ping (I26) | Publicar **v1.5.111** em janela segura | Sócio |

### P1 — Operação contínua (sem feature nova)

| Item | Descrição | Esforço |
|------|-----------|---------|
| **O1** | Rodar `TESTE_B7_REGRESSAO_WRITE.ps1` 1×/semana (fora do pico) | 5 min |
| **O2** | `pre-push-check` antes de cada push FE | automático |
| **O3** | Ping GAS após qualquer deploy `.gs` | 1 min |
| **O4** | QR portal fixo na mesa (decisão QR) | Ops |

### P2 — Backlog técnico — ✅ fechado 09/06/2026

| ID | Item | Status |
|----|------|--------|
| **B6** | PIN admin só via GAS (T4) | ✅ v1.5.74 + FE v1.7.98 |
| **Q1** | GitHub Actions CI | ✅ `.github/workflows/ci.yml` |
| **Q2** | Teste F10 duas leituras sync | ✅ `TESTE_F10_DUAS_ABAS.ps1` |
| **Q3** | Reauditoria planilha readonly | ✅ `TESTE_REAUDITORIA_PLANILHA.ps1` |

### P3 — Backlog produto — ✅ fechado 09/06/2026

| ID | Item | Status |
|----|------|--------|
| **B3** | Auditoria UI filtrada por operador | ✅ v1.5.73 + Sistema admin |
| **B5** | PDF resumo executivo mensal | ✅ Golden + payback (`executivo`) |
| **B4** | Export fechamento WhatsApp/e-mail | ✅ Caixa do dia |
| **N2** | Relatório Golden + payback num PDF | ✅ (mesmo que B5) |
| **N1** | Recorrência CRM — treino operadores | 🟡 badge **Recorrente** no app; treino ops pendente |

### P4 — Pausado (não iniciar)

| Item | Motivo | Reavaliar |
|------|--------|-----------|
| **F4** WhatsApp / SMS automático | Conta bloqueada; QR é canal oficial | Entrega manual comprovada |
| **F9** Supervisor | Operadores precisam autonomia total | K+L estáveis 30d — **já atingido**; decidir se ainda relevante |

---

## 5. Sugestões absorvidas no plano FASES 6–15

| Sugestão antiga | Fase |
|-----------------|------|
| Cockpit sócio / KPIs síntese | **FASE 6** |
| Leading + simulação margem | **FASE 7**, **12** |
| DNA admin | **FASE 9** |
| CRM LTV | **FASE 10** |
| Financeiro consolidado | **FASE 11** |
| Métricas portal | **FASE 15** |
| CONFIG self-service | **FASE 15** |

### Operação contínua (paralelo às fases)

1. **Tablet** — `?force=` versão atual após cada deploy FE admin.
2. **Rotina B7 semanal** — `TESTE_B7_REGRESSAO_WRITE.ps1`.
3. **Cartaz QR** — ops (`DECISAO_COMUNICACAO_QR_CODE_2026-06.md`).
4. **Treino N1** — badge Recorrente (**FASE 10** reforça).
5. **Reavaliar F4** — após 90d manual estável (Anexo A plano 6–15).

---

## 6. Fluxos e processos (referência rápida)

| Processo | Documento | Comando / artefato |
|----------|-----------|-------------------|
| Novo chat Cursor | `HANDOFF_NOVO_CHAT.md` | Mensagem mínima |
| Publicar FE | `REGRAS_DE_PUBLICACAO_SEGURA.md` | `pre-push-check` → push |
| Publicar GAS | `DEPLOY_GAS_v1.5.32_AUTH.md` | Nova versão Web |
| Testar deploy | `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` | `TESTE_PROTOCOLO_DIAGNOSTICO.ps1` · P3: `TESTE_P3_READONLY.ps1` |
| Homologação tablet | `CHECKLIST_FASE5_TABLET.md` | Checklists K/L/FASE5 |
| Mock idle homolog | `assets/mock-idle-homolog.html` | HTTPS mesmo domínio |
| Incidente novo | `MAPA_ERROS_FALHAS_BUGS.md` | + `docs/arquivo/incidentes/` |
| Arquitetura | `MAPA_CODIGO_ARQUITETURA.md` | Fluxos F0–F14 |

---

## 7. Histórico recente (commits)

| Hash | Data | Entrega |
|------|------|---------|
| `dbf5c49` | 09/06 | fix pre-push I22 ASCII |
| `59e4ca4` | 09/06 | **I22** pós-mortem + Regra 14 + gates |
| `f2574da` | 09/06 | **hotfix** Home — FE v1.8.2 |
| `6e6f42e` | 09/06 | **FASE 6–7** cockpit + leading (repo) |
| `9efa30a` | 09/06 | **P3** — GAS v1.5.73 + FE v1.7.97 |

---

## 8. Próxima revisão

**Ao homologar FASE 15** (tablet + abas planilha) · meio ciclo **FASE 10**.

**Sequência imediata (20/06):**

1. PC: `gestao-pessoas.html?force=1.8.71` — holerite PDF + CNPJ · auth DNA
2. **Nova versão Web GAS v1.5.111** (ping atual v1.5.107) — **janela sem loc aberta**
3. Tablet loja — 1 locação pós-I32 + F5/F7/F10/F11
4. **FASE 16 Premium** — próximo ciclo (janela aberta · ver `MAPA_FASES.md`)

Incidentes: **I29–I34** — `MAPA_ERROS_FALHAS_BUGS.md`
