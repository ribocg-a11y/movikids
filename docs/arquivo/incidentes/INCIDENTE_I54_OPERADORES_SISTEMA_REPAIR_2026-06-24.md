# Incidente I54 — OPERADORES_SISTEMA memorial, schema e repair

**Data:** 24/06/2026 · **GAS:** v1.5.151 · **Aba:** OPERADORES_SISTEMA (camada 1)

## Sintoma

- Aba sem memorial padronizado (header legado linha 1).
- `validarSchema` nao validava OPERADORES_SISTEMA.
- `OP_DATA_ROW=2` fixo — sem migracao layout I54.
- MAPA_PLANILHA desatualizado (col 2 = nome vs `criadoEm` no GAS).

## Correção

- Layout I54: memorial 1–3, header 4, dados 5+.
- `OPS_HEADERS_` (8 cols) · `opsDataStartRow_()` em todo auth.
- `repararOperadoresSistemaPlanilhaAdmin` + audit + formatos.
- `validarSchema` inclui OPERADORES_SISTEMA.

## Deploy

1. `prepare-gas-push.ps1`
2. Nova versao Web **v1.5.151**
3. `REPARAR_OPERADORES_SISTEMA_PLANILHA_ADMIN.ps1`

## Referências

- `CHECKLIST_ABA_PLANILHA_OPERADORES_SISTEMA.md`
- `MAPA_ERROS_FALHAS_BUGS.md` I54
