# Checklist — Aba INVESTIMENTO (planilha MOVI KIDS) — I58

**Camada:** 2 — Payback · **GAS:** v1.5.155 · **Status:** 🟡 Repo fechado · aguarda Nova versão Web

## Schema

| Col | Campo |
|-----|-------|
| A | # |
| B | Categoria |
| C | Item |
| D | Valor R$ |
| E | Entra? (S/N) |
| F | Observacao |

**Layout:** memorial 1–3 · B3/B4 datas · header **9** · dados **11+**

## GAS

- API: `repararInvestimentoPlanilhaAdmin`
- Script: `REPARAR_INVESTIMENTO_PLANILHA_ADMIN.ps1`
- Teste: `TESTE_INVESTIMENTO_READONLY.ps1`

## Pós-deploy

1. Colar `.gs` v1.5.155 + Nova versão Web
2. `.\scripts\testes\REPARAR_INVESTIMENTO_PLANILHA_ADMIN.ps1`
3. `.\scripts\testes\TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba INVESTIMENTO`
4. `validarSchema` → `INVESTIMENTO.ok=true` · `kpiMes.payback.ok=true`

**Consumidor FE:** painel Payback no Dashboard admin (`kpiMes.payback`).
