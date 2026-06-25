# Checklist — Aba RELATORIOS (planilha MOVI KIDS) — I60

**Camada:** 2 — PDFs mensais · **GAS:** v1.5.158 prod · **Status:** ✅ prod 24/06

## Schema

| Col | Campo |
|-----|-------|
| A | # |
| B | Mes/Ano |
| C | Data Envio |
| D | Link |
| E | Tipo |
| F | Obs |

**Layout:** header **linha 1** · dados **linha 2+**

## Produção

| Teste | Resultado |
|-------|-----------|
| repair | OK · 1 registro · **schemaOk=True** |
| `TESTE_PROTOCOLO_ABA` | **ok** |
| `listarRelatorios` | 1 PDF indexado |

## GAS

- API: `repararRelatoriosPlanilhaAdmin`
- Legado: `listarRelatorios`, `registrarRelatorio_`
- Script: `REPARAR_RELATORIOS_PLANILHA_ADMIN.ps1`
- Teste: `TESTE_RELATORIOS_READONLY.ps1`
