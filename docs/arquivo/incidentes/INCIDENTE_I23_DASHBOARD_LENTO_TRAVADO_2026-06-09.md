# Incidente I23 — Dashboard lento / KPIs em "Calculando..." (09/06/2026)

**Registrado em:** 09/06/2026  
**Severidade:** P1 — gestão degradada (balcão operacional ok)  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I23**  
**Correção fase 1:** FE **v1.8.4** + GAS **v1.5.77**  
**Correção fase 2 (perf):** FE **v1.8.5** + GAS **v1.5.78**  
**Deploy:** `DEPLOY_v1.5.77_FASE7_PERF.md` · **`DEPLOY_v1.5.78_FASE7_KPI_PERF.md`** · **`DEPLOY_FE_v1.8.5_DASHBOARD_PERF.md`**

---

## Resumo executivo

| O que o usuário viu | O que o sistema fazia |
|---------------------|------------------------|
| Dashboard com KPIs em `"..."` / `"Calculando..."` por longo tempo ou para sempre | `carregarKPIsDashboard` **abortava** se `_kpiInFlight` já estava true |
| Sensação de app "pesado" após FASE 6–7 | FASE 7 chamava `buildKpiMesPayload_` **inteiro** em cada `resumoDia` |
| Maio/Junho no seletor sem atualizar | Troca de mês durante load perdida (mesmo mutex) |

**Causa raiz:** mutex único `_kpiInFlight` entre hub (`carregarKPIs`) e dashboard (`carregarKPIsDashboard`) + enriquecimento FASE 7 pesado no GAS.

---

## Linha do tempo

| Momento | Evento |
|---------|--------|
| 09/06 | FASE 6–7 publicadas no repo — cockpit + leading |
| 09/06 | Usuário abre Dashboard admin — KPIs não preenchem |
| 09/06 | Medição: `kpiMes` ~6 s (GAS v1.5.74 prod); ping desalinhado no código |
| 09/06 | Fix FE v1.8.4 + GAS v1.5.77 (mutex + resumoDia leve) |
| 09/06 | Usuário ainda vê `"Calculando..."` ~6s+ — **C4** não resolvida só com mutex |
| 09/06 | Fix FE **v1.8.5** + GAS **v1.5.78** — leitura única + lite + cache |

---

## Mapa de causas

### C1 — Mutex `_kpiInFlight` compartilhado (FE)

```
showPage('admin')  → carregarKPIs()     → _kpiInFlight = true
showPage('dashboard') → carregarKPIsDashboard() → return imediato (silencioso)
```

### C2 — `enrichResumoDiaLeading_` chamava `buildKpiMesPayload_` (GAS FASE 7)

Cada `resumoDia` (Caixa, hub, sync admin) recalculava payback + auditoria + narrativa — **mesmo trabalho do Dashboard**.

### C3 — Dashboard pedia `kpiMes` + `resumoDia` em paralelo

Até **2×** `buildKpiMesPayload_` por abertura do Dashboard (com GAS v1.5.76).

### C4 — `kpiMes` intrinsecamente pesado (~5–8 s)

Leituras: locações (27 cols) + custos + auditoria + payback (relê loc+cus) + cockpit/leading.

### C5 — `ping_()` desatualizado (v1.5.74 no código vs header v1.5.76)

Ops não sabia qual versão estava publicada.

---

## Correções

| # | Correção | Artefato |
|---|----------|----------|
| 1 | Locks separados `_kpiHubInFlight` / `_kpiDashInFlight` + fila `_kpiDashPending` | `mk-admin.js` |
| 2 | Dashboard: só `kpiMes`; `resumoDia` em background | `mk-admin.js` |
| 3 | Toast se `kpiMes` falhar | `mk-admin.js` |
| 4 | `calcLeadingDiaPatch_` leve no `resumoDia` | `.gs` v1.5.77 |
| 5 | `ping_()` → v1.5.77 | `.gs` |
| 6 | Pacote deploy regra de ouro completo | `DEPLOY_v1.5.76`, `DEPLOY_v1.5.77` |
| 7 | Leitura única LOCAÇÕES+CUSTOS; payback via mapas | `.gs` v1.5.78 |
| 8 | `kpiMes&lite=1` + CacheService 90s | `.gs` v1.5.78 |
| 9 | Cache sessionStorage SWR + render core imediato | FE v1.8.5 |
| 10 | Pacote deploy **completo** (modelo v1.5.76) | `DEPLOY_v1.5.78`, `DEPLOY_FE_v1.8.5` |

---

## Regras — nunca repetir

1. **Nunca** compartilhar mutex entre fluxos hub (leve) e dashboard (pesado).
2. **Nunca** chamar `buildKpiMesPayload_` dentro de `resumoDia` — usar patch lite ou cache.
3. **Sempre** alinhar `ping_().versao` ao header do `.gs`.
4. **Sempre** pacote deploy completo (regra de ouro — **modelo `DEPLOY_v1.5.76`**) ao entregar fase GAS+FE: caminho PC, clasp, links, testes, checklist tablet, critério de pronto.
5. **Nunca** entregar só código + doc resumido de 40 linhas — violação Regra 8.

---

## Referências

- Arquitetura Dashboard: `MAPA_CODIGO_ARQUITETURA.md` §12  
- I22 (HTML): `INCIDENTE_I22_HOME_FORA_DO_AR_FASE6_HTML_2026-06-09.md`  
- Deploy fase 1: `DEPLOY_v1.5.77_FASE7_PERF.md`  
- Deploy fase 2: **`DEPLOY_v1.5.78_FASE7_KPI_PERF.md`** · **`DEPLOY_FE_v1.8.5_DASHBOARD_PERF.md`**
