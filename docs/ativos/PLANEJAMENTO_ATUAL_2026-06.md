# MOVI KIDS — Planejamento atual (pós-FASE 5)

**Atualizado:** 09/06/2026  
**Produção:** FE **v1.7.97** · GAS **v1.5.73** · Git `main` @ `9efa30a`  
**Documentos irmãos:** `PLANO_PRIORIDADES_2026-06.md` · `PLANO_CONTINUIDADE_2026-06.md` · `HANDOFF_NOVO_CHAT.md`

---

## 1. Resumo executivo

Ciclo **FASE 0–5 concluído** (07–09/06/2026). Sistema em **operação madura** no balcão (tablet Milena homologado), portal QR, payback, CONFIG planilha e APIs unificadas (`resumoDia`, `kpiMes`, idle I21).

**Modo atual:** manutenção + melhorias sob demanda. **Não há fase ativa obrigatória** até nova decisão do sócio.

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
| **P3** Backlog produto | 09/06 | B3+B4+B5+N2, CRM recorrente | `DEPLOY_v1.5.73_P3_BACKLOG.md` |

### Pacotes históricos fechados (pré-fases)

A–M (modularização FE), SMS P0, fixes I15–I21, Pacote K CRM, Pacote M M.1–M.17.

---

## 3. Fases / itens em aberto (por prioridade)

Legenda: **P0** bloqueia operação · **P1** valor imediato · **P2** próximo ciclo · **P3** backlog · **P4** pausado

### P0 — Monitorar (sem dev ativo)

| Item | Ação | Responsável |
|------|------|-------------|
| Tablet em versão antiga | Manter `?force=1.7.97` no PWA balcão | Ops |
| POST no browser (I15) | Nunca reintroduzir | Dev |
| Deploy ID GAS | Só Nova versão Web — nunca `clasp deploy` | Dev/Ops |
| Regressão I20 cronômetro | Antes de mexer em timer: `TESTE_I20_COMPLETO_PROD.ps1` | Dev |

### P1 — Operação contínua (sem feature nova)

| Item | Descrição | Esforço |
|------|-----------|---------|
| **O1** | Rodar `TESTE_B7_REGRESSAO_WRITE.ps1` 1×/semana (fora do pico) | 5 min |
| **O2** | `pre-push-check` antes de cada push FE | automático |
| **O3** | Ping GAS após qualquer deploy `.gs` | 1 min |
| **O4** | QR portal fixo na mesa (decisão QR) | Ops |

### P2 — Backlog técnico (FASE 5 remanescente + qualidade)

| ID | Item | Valor | Esforço |
|----|------|-------|---------|
| **B6** | PIN admin só via GAS (T4) | Segurança | médio |
| **Q1** | GitHub Actions (CI remoto espelhando pre-push) | Confiança deploy | médio |
| **Q2** | Teste F10 duas abas físicas (sync multi-canal) | Cobertura protocolo | baixo |
| **Q3** | Reauditoria planilha trimestral | Dados limpos | baixo |

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

## 4. Sugestões de melhoria (ordenadas)

### Curto prazo (jun–jul 2026)

1. **Manter tablet em v1.7.97** — P3 admin no PC; balcão operacional v1.7.96+ ok.
2. **Rotina B7 semanal** — detectar regressão write antes do operador.
3. **Cartaz QR** — impresso e treinamento “escaneie + DDD” (`DECISAO_COMUNICACAO_QR_CODE_2026-06.md`).
4. **B6 PIN admin via GAS** — reduzir PIN 1416 hardcoded no FE.

### Médio prazo (ago–set 2026)

5. ~~**PDF executivo** (B5)~~ — ✅ 09/06 v1.5.73.
6. **CI GitHub Actions** — bloquear merge se pre-push falhar.
7. ~~**Auditoria por operador** (B3)~~ — ✅ 09/06.
8. **Reavaliar F4** — só se SMS manual comprovado estável 30 dias.

### Longo prazo (out–dez 2026)

9. **Portal como canal #1** — métricas de uso `acompanhar.html`.
10. **CONFIG self-service** — operador admin edita frota sem dev.
11. **Maturidade protocolo nível 4→5** — E2E tablet automatizado onde possível.

---

## 5. Fluxos e processos (referência rápida)

| Processo | Documento | Comando / artefato |
|----------|-----------|-------------------|
| Novo chat Cursor | `HANDOFF_NOVO_CHAT.md` | Mensagem mínima |
| Publicar FE | `REGRAS_DE_PUBLICACAO_SEGURA.md` | `pre-push-check` → push |
| Publicar GAS | `DEPLOY_GAS_v1.5.32_AUTH.md` | Nova versão Web |
| Testar deploy | `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` | `TESTE_PROTOCOLO_DIAGNOSTICO.ps1` · P3: `TESTE_P3_READONLY.ps1` |
| Homologação tablet | `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md` | Checklists K/L/FASE5 |
| Mock idle homolog | `assets/mock-idle-homolog.html` | HTTPS mesmo domínio |
| Incidente novo | `MAPA_ERROS_FALHAS_BUGS.md` | + `docs/arquivo/incidentes/` |
| Arquitetura | `MAPA_CODIGO_ARQUITETURA.md` | Fluxos F0–F14 |

---

## 6. Histórico recente (commits)

| Hash | Data | Entrega |
|------|------|---------|
| `9efa30a` | 09/06 | **P3** — GAS v1.5.73 + FE v1.7.97 (auditoria, PDF executivo, caixa WA/email, CRM) |
| `91cc08f` | 09/06 | **v1.7.96** — fix splash idle boot (I21) |
| `8173d10` | 09/06 | FASE 5 docs + mock-idle Pages |
| `0e9e47c` | 09/06 | v1.7.95 — portal fixo Home |
| `c3f92ac` | 09/06 | v1.7.94 + GAS v1.5.72 — B8 idle |

---

## 7. Próxima revisão

**13/06/2026** ou quando iniciar item P2+.

Ao iniciar nova fase: atualizar `HANDOFF_NOVO_CHAT.md` + seção **Execução** em `PLANO_PRIORIDADES_2026-06.md`.
