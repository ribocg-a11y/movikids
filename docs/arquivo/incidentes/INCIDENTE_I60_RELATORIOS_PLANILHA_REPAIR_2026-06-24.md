# Incidente I60 — RELATORIOS protocolo abas planilha (PDFs mensais)

**Data:** 24/06/2026 · **GAS:** v1.5.158 prod · **Aba:** RELATORIOS (camada 2)

## Correção

- `REL_HEADERS_` (6 cols) · header L1 protegido
- `repararRelatoriosPlanilhaAdmin` + `auditRelatoriosSampleCore_`
- `validarRelatoriosSchema_` substitui entrada inline em `validarSchema`
- `listarRelatorios_` / `registrarRelatorio_` usam constantes I60

## Produção 24/06

| Teste | Resultado |
|-------|-----------|
| ping | **v1.5.158** |
| repair | OK · 1 registro · **schemaOk=True** |
| `TESTE_RELATORIOS_READONLY` | **ok** |
| `TESTE_PROTOCOLO_ABA` | **ok** (sem avisos) |

**v1.5.158:** audit aceita link `(email)` quando tipo Email (`registrarRelatorio_`).

## Deploy

Nova versão Web **v1.5.158** ✅
