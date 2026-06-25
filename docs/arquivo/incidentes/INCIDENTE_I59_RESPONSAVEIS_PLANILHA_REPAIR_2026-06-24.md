# Incidente I59 — RESPONSAVEIS protocolo abas planilha (CRM)

**Data:** 24/06/2026 · **GAS:** v1.5.156 · **Aba:** RESPONSAVEIS (camada 3)

## Contexto

~240 cadastros canônicos (K.1). Layout **legado**: header linha 1, dados linha 2+ — **sem migrar linhas**.

## Correção

- `RESP_HEADERS_` (9 cols) · proteção header L1
- `repararResponsaveisPlanilhaAdmin` + `auditResponsaveisSampleCore_`
- `validarResponsaveisSchema_` em `validarSchema`
- `lerResponsaveisCanonicos_` usa `respDataStartRow_()`
- Mantém `importarResponsaveisAdmin` (legado K.1)

## Deploy

Nova versão Web **v1.5.156** + `REPARAR_RESPONSAVEIS_PLANILHA_ADMIN.ps1`

## Validação prod 24/06

- ping **v1.5.156** · repair **schemaOk=True**
- 241 cadastros · listarResponsaveis OK
- 1 aviso audit: L233 telefone curto (987203839)
