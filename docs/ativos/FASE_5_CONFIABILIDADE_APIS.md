# FASE 5 — Confiabilidade e APIs

**Status:** 🟡 **ativa** (08/06/2026)  
**Prioridade:** B7 → B1 → B2  
**Referência:** `PLANO_PRIORIDADES_2026-06.md` § FASE 5

---

## Objetivo

Reduzir divergência entre app e planilha, e garantir que o ciclo **iniciar → estender → encerrar** permanece estável em produção com teste automatizado e cleanup.

---

## Backlog

| ID | Item | Prioridade | Status |
|----|------|------------|--------|
| **B7** | Regressão write controlada | Alta | 🟡 baseline ok 08/06 |
| **B1** | API `resumoDia(data)` única (Caixa + chip) | Média | 🟡 código FE+GAS; **Nova versão Web** |
| **B2** | API `kpiMes` — Dashboard só visualiza | Média | ⬜ |
| **B6** | PIN admin só via GAS (T4) | Média | ⬜ |
| **B3** | Auditoria UI por operador | Baixa | ⬜ |
| **B5** | PDF resumo executivo | Baixa | ⬜ |

---

## B7 — Checklist

| # | Ação | Quem | OK |
|---|------|------|-----|
| 5.B7.1 | Script `TESTE_B7_REGRESSAO_WRITE.ps1` | Dev | [x] 08/06 |
| 5.B7.2 | Rodar em produção (janela controlada + cleanup) | Agente | [x] 08/06 |
| 5.B7.3 | Incluir no protocolo readonly vs write (doc) | Dev | [x] 08/06 |
| 5.B7.4 | Homologar tablet após mudança em write GAS/FE | Ops | [ ] |

### Fluxo coberto (B7)

1. `salvarLocacao` → Pendente  
2. `verificarSessao` → sem timer  
3. `iniciarTimer` + idempotência (2ª chamada)  
4. `estenderLocacao`  
5. `encerrarLocacao`  
6. `listarAtivas` sem a encerrada  
7. `cancelarLocacao` em pendente paralelo  
8. `limparLocacoesTesteAdmin` (cleanup)

```powershell
.\scripts\testes\TESTE_B7_REGRESSAO_WRITE.ps1
```

**Atenção:** grava locações `[TESTE]` na planilha — só rodar fora do pico ou com cleanup garantido.

### Baseline produção (08/06/2026)

`TESTE_B7_REGRESSAO_WRITE.ps1` → **ok** (GAS v1.5.69, cleanup 3 anuladas)

---

## B1 — `resumoDia` (entregue no código 08/06)

| Artefato | Detalhe |
|----------|---------|
| GAS | `calcResumoDiaCore_` + `resumoDia` v1.5.70 |
| FE | `mk-admin.js` v1.7.92 — Caixa + chip via `resumoDia` |
| Teste | `TESTE_RESUMO_DIA_READONLY.ps1` |
| Deploy | `DEPLOY_v1.5.70_RESUMO_DIA.md` |

**Você:** Nova versão Web GAS v1.5.70 → ping `v1.5.70` → rodar teste → tablet `?force=1.7.92`.

---

## B2 — Depois de B1

Dashboard hoje chama `buscarKPIsAdmin` (pesado). **Meta:** `kpiMes` read-only para visualização mensal.

---

## Critério para fechar FASE 5

- [ ] B7 baseline **ok** em produção (3 execuções sem falha)  
- [ ] B1 `resumoDia` em produção + Caixa/chip alinhados  
- [ ] B2 `kpiMes` ou decisão explícita de adiar
