# I67 — RESPONSAVEIS L233 duplicata Neide (tel curto)

**Data:** 25/06/2026 · **GAS:** v1.5.165 · **Camada:** auditoria célula P2

## Problema

- L233: Neide · tel `987203839` (9 dígitos) · import K.1
- Canônico mesmo telefone: **VERA** · `98987203839` (L232)

## Correção

1. Mescla crianca **Anthony** em VERA (L232)
2. Remove linha duplicata L233
3. Dry-run `repararResponsaveisPlanilhaAdmin` → **problemas=0** · cadastros=240
4. `criancasJson` VERA L232 normalizado → `["Anthony"]`

## Script OAuth (PC)

`C:\Users\riboc\Projects\google-drive-sheets-auth\scripts\corrigir-resp-neide-l233.js`

## Pós-fix

- Auditoria célula: **23/23 abas ok** (camada 2)
- `CHECKLIST_ABA_PLANILHA_RESPONSAVEIS.md` — aviso L233 resolvido
