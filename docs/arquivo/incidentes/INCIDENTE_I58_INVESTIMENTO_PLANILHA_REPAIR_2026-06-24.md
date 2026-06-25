# Incidente I58 — INVESTIMENTO protocolo abas planilha (payback)

**Data:** 24/06/2026 · **GAS:** v1.5.155 · **Aba:** INVESTIMENTO (camada 2)

## Correção

- `INV_HEADERS_` (6 cols) · memorial · header 9 · dados 11
- `repararInvestimentoPlanilhaAdmin` + `auditInvestimentoSampleCore_`
- `validarInvestimentoSchema_` em `validarSchema`
- `lerInvestimento_` usa `invDataStartRow_()`
- Formatos: R$ col D · validação Entra S/N

## Deploy

Nova versão Web **v1.5.155** + `REPARAR_INVESTIMENTO_PLANILHA_ADMIN.ps1`
