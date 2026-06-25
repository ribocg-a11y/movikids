# Incidente I57 — FOLHA protocolo abas planilha (extensão I25)

**Data:** 24/06/2026 · **GAS:** v1.5.154 · **Aba:** FOLHA (camada 2)

## Contexto

I25 (v1.5.91) já tinha `repairFolhaAdmin` com `repairFolhaFormulasCore_` (USER_ENTERED). I57 integra ao **protocolo de abas** com audit, validarSchema e API unificada.

## Correção

- `validarFolhaSchema_` — memorial, B68/B25, `folhaPlanejamento.fonte=FOLHA`
- `auditFolhaSampleCore_` — chaves B5–B68 + grid empregados
- `repararFolhaPlanilhaAdmin` — memorial (se ausente) + formulas I25 + audit
- Mantém `repairFolhaAdmin` (legado)

## Deploy

Nova versão Web **v1.5.154** + `REPARAR_FOLHA_PLANILHA_ADMIN.ps1`

## Validação prod 24/06

- ping **v1.5.154** · repair **schemaOk=True**
- B68=5269,96 · B25=15,38 · VA 400/26 dias
- audit: **0 problemas** · `folhaPlanejamento.fonte=FOLHA`
- TESTE_PROTOCOLO_ABA FOLHA: **ok**
