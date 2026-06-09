# FASE 5 — Confiabilidade e APIs

**Status:** ✅ **fechada** (09/06/2026 — tablet 5.B7.4 assinado Milena; I21 mock opcional)  
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
| **B1** | API `resumoDia(data)` única (Caixa + chip) | Média | ✅ GAS v1.5.71 + teste readonly 08/06 |
| **B2** | API `kpiMes` — Dashboard só visualiza | Média | ✅ GAS v1.5.71 + teste readonly 08/06 |
| **B8** | Idle sessão 1h — FE+GAS alinhados (v1.7.94/v1.5.72) | Alta | ✅ 09/06 — GAS v1.5.72 + protocolo + `TESTE_SESSAO_IDLE_READONLY` |
| **B6** | PIN admin só via GAS (T4) | Média | ⬜ |
| **B3** | Auditoria UI por operador | Baixa | ✅ 09/06 P3 |
| **B5** | PDF resumo executivo | Baixa | ✅ 09/06 P3 |

---

## B7 — Checklist

| # | Ação | Quem | OK |
|---|------|------|-----|
| 5.B7.1 | Script `TESTE_B7_REGRESSAO_WRITE.ps1` | Dev | [x] 08/06 |
| 5.B7.2 | Rodar em produção (janela controlada + cleanup) | Agente | [x] 08/06 |
| 5.B7.3 | Incluir no protocolo readonly vs write (doc) | Dev | [x] 08/06 |
| 5.B7.4 | Homologar tablet após mudança em write GAS/FE | Ops | [x] **09/06** — Milena; ver `CHECKLIST_FASE5_TABLET.md` |

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

**Produção 08/06:** GAS v1.5.71 · `TESTE_RESUMO_DIA_READONLY.ps1` → ok (nHoje=4, fatHoje=103.2).

---

## B2 — `kpiMes` (entregue no código 08/06)

| Artefato | Detalhe |
|----------|---------|
| GAS | `buildKpiMesPayload_` + `kpiMes` v1.5.71 |
| FE | Hub/Sistema: só `resumoDia` · Dashboard: `kpiMes` v1.7.93 |
| Teste | `TESTE_KPI_MES_READONLY.ps1` |
| Deploy | `DEPLOY_v1.5.71_KPI_MES.md` |

**Produção 08/06:** GAS v1.5.71 · `TESTE_KPI_MES_READONLY.ps1` → ok (paridade com `buscarKPIsAdmin`).

---

## B8 — Idle sessão 1h (entregue no código 09/06)

| Artefato | Detalhe |
|----------|---------|
| GAS | `lastActivityAt` + idle 1h + `touchSessaoOperador` v1.5.72 |
| FE | Relógio real (`mkAuthIdleRemainingMs_`); `mkAuthReleaseBalcaoServer_`; PIN admin preserva operador local v1.7.94 |
| Teste | `TESTE_SESSAO_IDLE_READONLY.ps1` |
| Deploy | `DEPLOY_v1.5.72_SESSAO_IDLE.md` |

**Produção 09/06:** ping **v1.5.72** · `TESTE_SESSAO_IDLE_READONLY.ps1` → ok · protocolo F0+F1 ok.

**Tablet opcional (I21):** mock `mk_auth_last_activity` -61min + reload → gate login.

---

### 3× regressão write (09/06/2026)

| Run | Status | GAS | Cleanup |
|-----|--------|-----|---------|
| 1/3 | ok | v1.5.72 | 2 anuladas |
| 2/3 | ok | v1.5.72 | 2 anuladas |
| 3/3 | ok | v1.5.72 | 2 anuladas |

---

## Critério para fechar FASE 5

- [x] B7 baseline **ok** em produção (3 execuções sem falha) — **09/06/2026**  
- [x] B1 `resumoDia` em produção + teste readonly ok (08/06)  
- [x] B2 `kpiMes` em produção + teste readonly ok (08/06)  
- [x] **B8** idle FE+GAS + teste readonly ok (09/06)  
- [x] Tablet balcão `?force=1.7.95` — portal sem ✕ + smoke write B7 — **09/06 Milena**  
- [x] Mock idle I21 no tablet — **09/06 v1.7.96** (fix splash boot)
