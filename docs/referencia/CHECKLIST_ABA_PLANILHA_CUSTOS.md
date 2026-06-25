# Checklist — Aba CUSTOS (planilha MOVI KIDS) — I55

**Camada:** 2 — Caixa/financeiro · **GAS:** v1.5.152 · **Status:** ✅ Fechada (prod)

## Schema

| Col | Campo | Formato |
|-----|-------|---------|
| A | # | id |
| B | Data | dd/mm/yyyy |
| C | Hora | hh:mm |
| D | Descricao | texto |
| E | Categoria | mini-DRE |
| F | Valor | R$ |

**Layout:** memorial 1–3 · header **9** · dados **11** (igual LOCACOES)

## GAS

- API: `repararCustosPlanilhaAdmin`
- Script: `REPARAR_CUSTOS_PLANILHA_ADMIN.ps1`
- Teste: `TESTE_CUSTOS_READONLY.ps1`

## Resultado 24/06

| Item | Valor |
|------|-------|
| Repair | 10 linhas formatadas · memorial I55 |
| Mes atual | 10 registros · soma R$ 3.477,99 |
| validarSchema | **schemaOk=True** |
| TESTE_CUSTOS_READONLY | **ok** |

**Deploy:** ✅ Nova versão Web v1.5.152 · repair 24/06
