# Incidente I56 — DASHBOARD memorial, audit formulas, sync KPI

**Data:** 24/06/2026 · **GAS:** v1.5.153 · **Aba:** DASHBOARD (camada 2)

## Contexto

Aba majoritariamente **fórmulas** (SUMIFS em LOCACOES). GAS escreve apenas **C5:C11** via `atualizarKPIs`. FE/admin usa `kpiMes` / `buscarKPIsAdmin` (memória).

## Correção (conservadora)

- Memorial linhas 1–3 + proteção só memorial
- **Não** reescreve headers nem fórmulas
- `auditDashboardSampleCore_` — detecta `#REF!`, `#NAME?`, etc.
- `repairDashboardKpiSyncCore_` — chama `atualizarKPIs()` no repair real
- `validarDashboardSchema_` em `validarSchema`

## Deploy

Nova versão Web **v1.5.153** + `REPARAR_DASHBOARD_PLANILHA_ADMIN.ps1`

## Validação prod 24/06

- ping **v1.5.153** · repair **schemaOk=True**
- audit formulas: **0 problemas**
- KPI C5=10637,4 · C6=530 · paridade `kpiMes`/`buscarKPIsAdmin` OK
