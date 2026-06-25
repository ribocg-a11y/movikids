# Incidente I61 — Camada 4 AUD_* protocolo abas planilha

**Data:** 24/06/2026 · **GAS:** v1.5.159 prod · **Abas:** AUDITORIA, AUD_TURNO, AUD_SMS, AUD_WHATSAPP, AUD_RESPONSAVEIS

## Correção

- Constantes `AUD_*_HEADERS_` (8/7/13/12/7 cols)
- `audit*SampleCore_` + `validar*Schema_` por aba
- `reparar*PlanilhaAdmin` — **somente header** (log append-only intacto)
- `repararAudCamada4PlanilhaAdmin` — repair em lote
- `validarSchema` inclui 5 abas camada 4
- `diagnosticoPlanilhaCompletoAdmin` — audits camada 4

## Produção 25/06

| Aba | Registros | schemaOk |
|-----|-----------|----------|
| AUDITORIA | 2657 | True |
| AUD_TURNO | 235 | True |
| AUD_SMS | 630 | True |
| AUD_WHATSAPP | 36 | True |
| AUD_RESPONSAVEIS | 240 | True |

`validarSchema` global **schemaOk=True** · `TESTE_AUD_CAMADA4_READONLY` **ok**

## Deploy

Nova versão Web **v1.5.159** ✅
