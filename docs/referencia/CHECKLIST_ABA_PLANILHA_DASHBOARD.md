# Checklist — Aba DASHBOARD (planilha MOVI KIDS) — I56

**Camada:** 2 — KPIs planilha · **GAS:** v1.5.153 · **Status:** ✅ Fechada (prod)

## Layout

| Área | Conteúdo |
|------|----------|
| L1–L3 | Memorial I56 (protegido) |
| B5–B11 | Labels KPI |
| C5–C11 | Valores — sync GAS `atualizarKPIs` |
| Demais | Fórmulas SUMIFS — **não editar no repair** |

## GAS

- API: `repararDashboardPlanilhaAdmin`
- Script: `REPARAR_DASHBOARD_PLANILHA_ADMIN.ps1`
- Teste: `TESTE_DASHBOARD_READONLY.ps1`

## Resultado 24/06

| Item | Valor |
|------|-------|
| Repair | memorial I56 · KPI sync C5–C11 |
| KPI mês | fat=10637,40 · n=530 · ticket ~20,07 |
| Audit formulas | **0 erros** |
| validarSchema | **schemaOk=True** |
| TESTE_DASHBOARD_READONLY | **ok** |
| TESTE_PROTOCOLO_ABA | **ok** |

**Deploy:** ✅ Nova versão Web v1.5.153 · repair 24/06

**Consumidor FE:** `kpiMes` / cockpit admin — memória (I23), não lê aba diretamente.
