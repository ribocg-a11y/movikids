# MOVI KIDS — Planejamento atual (pós-FASE 5)

**Atualizado:** 26/06/2026 · FE **v1.8.121** · GAS **v1.5.165** · **Ciclo ativo: One UI**  
**Diagnóstico:** [`DIAGNOSTICO_SISTEMA_6_CAMADAS_2026-06.md`](DIAGNOSTICO_SISTEMA_6_CAMADAS_2026-06.md)  
**Sprint UI:** [`PLANEJAMENTO_ONE_UI_2026-06.md`](PLANEJAMENTO_ONE_UI_2026-06.md) ← **novo chat começa aqui**  
**Documentos irmãos:** `PLANO_PRIORIDADES_2026-06.md` · `MAPA_FASES.md` · `DEPLOY_ATUAL.md` · `HANDOFF_NOVO_CHAT.md`  
**Ciclo fechado:** FASE 0–5 · I52–I63 planilha · I64–I67 higiene/auditoria  
**Ciclo ativo:** **Premium One UI** — `PLANEJAMENTO_ONE_UI_2026-06.md` · FASE **16** visual → **18**

---

## 1. Resumo executivo

**Modo atual (26/06):** fundação + homolog tablet **fechados**. **Dev ativo = Premium One UI** (FASE 16 visual → FASE 18).

| Área | Status |
|------|--------|
| Planilha + GAS + homolog balcão | ✅ |
| FASE 16 Centro Comando | 🟡 **~92%** — Sprint A UI |
| FASE 17 Alertas + Gestor | 🟡 **~95%** — assinar + F9 |
| Raykelly cadastro | ⏳ P0-5 paralelo |

**Próximo passo dev:** `PLANEJAMENTO_ONE_UI_2026-06.md` → **UI-A1** sidebar admin mobile.

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

**Sequência imediata (pós-diagnóstico 25/06):** homolog tablet **P0** §9 → fechar **FASE 17** → rotina RH → backlog **FASE 10–14** / Premium **18–22**.

### I42 — Caixa / conta do dia — ✅ API · ⏳ homolog loja

| Item | Status | Nota |
|------|--------|------|
| Conta do dia (telefone 10h–22h) | ✅ GAS v1.5.165 | col S `conta_id` |
| Maquininha PIX+Crédito+Débito normalizada | ✅ | `ARQUITETURA_CAIXA_CONTA_DIA_2026-06.md` |
| FE caixa `n` vs `nSessoes` | ✅ v1.8.121 Pages | |
| Teste `TESTE_I42_CONTA_DIA_CAIXA.ps1` | ✅ 6/6 | |
| Homolog loja (maquininha = sistema) | ✅ **23/06** | Tablet I42 confirmado usuário |

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
| GAS repo ≠ ping (I26) | Ping string fixa — funcional OK se APIs respondem | Dev |
| **I35** PWA intercepta GAS | SW não intercepta `script.google.com` — FE **v1.8.104+** | Dev |
| **I36** `salvarCadastro` getRange | GAS **v1.5.127** — Raykelly 100% planilha | ✅ |
| **I37** Colaboradores Safari sem stale-sync | `gestao-pessoas.html` + `mk-gp-boot.js` — **v1.8.105** | Dev |
| **I38** Banner preview com PIN colab | FE **v1.8.110** — `p.preview` fantasma | ✅ repo |
| **I39** VA proporcional admissão | GAS **v1.5.129** · Web pendente | ⏳ |
| **I40** Hub benefícios ≠ holerite GAS | `gpBeneficiosResumo_` usa calc mensal | Aberto |

### P1 — RH / folha (auditoria 22/06)

| Item | Descrição | Doc |
|------|-----------|-----|
| **RH-G1** | Aba `HOLERITES` nunca gravada — arquivo mensal ausente | `AUDITORIA_RH_FOLHA_*` |
| **RH-G2** | `BANCO_HORAS` não atualizado após jornada | FASE 15b.7 |
| **RH-G3** | `FALTAS_AUSENCIAS` sem API — desconto falta não no holerite | backlog |
| **I40** | Hub chips VA/VT alinhar com `pg.holerite` | FE fix |
| **Deploy** | Nova versão Web GAS **v1.5.129** | sócio |
| **Push** | FE **v1.8.110** Pages | dev |

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

**Ao fechar Raykelly 100%** · assinar **FASE 17** · decisão **17.5 F9** · iniciar **FASE 10** ou **RH-G1**.

### 8a. Concluído desde 23/06 (não repetir)

| Item | Status |
|------|--------|
| Nova versão Web GAS v1.5.137+ (I44 banco) | ✅ v1.5.165 |
| Repair BANCO_HORAS + higiene I66 | ✅ |
| Protocolo planilha I52–I63 | ✅ |
| Auditoria célula 3 camadas + I67 | ✅ 25/06 |
| FE Pages v1.8.121 | ✅ |
| **Homolog tablet** I43 ▶ + I42 caixa + I47 PIN + Gestor | ✅ **23/06** |

### 8b. Bloqueios remanescentes (ver §9)

Raykelly cadastro · FASE 17 fechamento formal · decisão 17.5 F9 · RH-G1 holerites · ponto RH rotina.

---

## 9. Prioridades pós-diagnóstico 6 camadas (atualizado 23/06)

**Fonte:** `DIAGNOSTICO_SISTEMA_6_CAMADAS_2026-06.md` · integra ciclo Premium 16–22 não finalizado.

Legenda: **P0** bloqueia confiança operacional · **P1** valor imediato · **P2** próximo ciclo dev · **P3** backlog produto · **P4** pausado

### P0 — Concluído / restante

| ID | Ação | Quem | Status |
|----|------|------|--------|
| **P0-1** | Tablet `?force=1.8.121` — checklist §9.1 | Ops loja | ✅ **23/06** |
| **P0-2** | Homolog **I43** ▶ cronômetro não reverte | Ops loja | ✅ **23/06** |
| **P0-3** | Homolog **I42** conta do dia 10h–22h | Ops loja | ✅ **23/06** |
| **P0-4** | Login PIN **Milena + Raykelly** (I47) | Ops loja | ✅ **23/06** |
| **P0-5** | Raykelly cadastro **100%** `gestao-pessoas.html` | Colaborador | ⏳ **próximo** |

### P0-1 — Checklist homolog tablet ✅ (23/06 — confirmado usuário)

1. ✅ `?force=1.8.121` no PWA balcão  
2. ✅ Login operador — chip **Turno** visível  
3. ✅ Nova locação → **▶** → card conta (I43)  
4. ✅ Encerrar/anular locação teste  
5. ✅ Caixa — `n` vs sessões (I42)  
6. ✅ Perfil **Gestor** — sem CONFIG/Sistema (FASE 17)

Doc: `CHECKLIST_FASE5_TABLET.md` · `MAPA_ERROS` I20/I43/I42

### P1 — Próximas 2–4 semanas

| ID | Ação | Quem | Nota |
|----|------|------|------|
| **P1-1** | Fechar **FASE 17** — critérios formais (pills + presença) | Ops + sócio | Gestor homolog ✅ · assinar checklist |
| **P1-2** | Decisão **17.5 F9** Supervisor | **Sócio** | ⏳ **após P0-5** — manter pausado ou reativar |
| **P1-3** | Ponto RH diário (`FOLHA_PONTO`) | Ops | Rotina entrada/saída |
| **P1-4** | Rotina mensal dados | Agente | `HIGIENE` + `AUDITORIA_CELULA` + `BACKUP_RH` |
| **P1-5** | Sincronizar docs versão | Agente | `ESTADO_ATUAL` · `MAPA_CODIGO` · HANDOFF |
| **P1-6** | **RH-G1** — persistir aba `HOLERITES` | Dev | Arquivo mensal ausente |
| **P1-7** | Liberar sessões fantasma (se balcão livre) | Agente | `TESTE_SESSAO_LIBERAR_READONLY` |

### P2 — Ciclo produto 10–14 + técnico

| ID | Fase / item | Foco |
|----|-------------|------|
| **P2-1** | **FASE 10** CRM LTV / cohort | Relacionamento + Dashboard |
| **P2-2** | **FASE 12** Drill-down margem | Dashboard |
| **P2-3** | **FASE 13** Live BI frota | Firebase widget |
| **P2-4** | **FASE 14** Mini-DRE | ✅ prod — manter |
| **P2-5** | CI job noturno com rede | Remover `-SkipNetworkTests` |
| **P2-6** | Monitor externo ping GAS | UptimeRobot ou similar |
| **P2-7** | **RH-G3** faltas no holerite | API + desconto |

### P3 — Premium One UI 18–22

Ver `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md` — **após** P0-5 Raykelly + FASE 17 assinada.

| Fase | Nome | Prioridade |
|------|------|------------|
| 18 | Financeiro + previsão | P3 |
| 19 | Gamificação saudável | P3 |
| 20 | Portal analytics | P3 |
| 21 | Live BI frota (reforço) | P3 |
| 22 | Assistente IA | P4 decisão sócio |

### P4 — Pausado (não iniciar)

| Item | Motivo |
|------|--------|
| **F4** WhatsApp/SMS auto | QR only — `OPERACAO_COMUNICACAO_QR_ONLY.md` |
| **F9** Supervisor | Aguarda decisão **P1-2** |

### 9.1 — Sequência recomendada (roadmap 30 dias — revisado 23/06)

```
✅ Semana 1: P0-1…P0-4 homolog tablet (fechado 23/06)
Agora:     P0-5 Raykelly 100%
Semana 2:  P1-1 assinar FASE 17 + P1-2 decisão F9
Semana 3:  P1-3 ponto RH + P1-4 rotina mensal dados
Semana 4:  P1-6 RH-G1 holerites (dev) · P2-1 FASE 10 CRM
Paralelo:  P1-4 mensal · pre-push · verify-publish
```

### 9.2 — O que NÃO é prioridade agora

- Nova feature FASE 18+ antes de Raykelly 100% + FASE 17 assinada  
- `clasp deploy` / nova implantação GAS  
- Reabrir F4 SMS sem serviço contratado  
- Refatoração grande do `.gs` sem incidente

