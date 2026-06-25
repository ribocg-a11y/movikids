# Incidente I62 — Camada 5 RH P0 protocolo abas planilha

**Data:** 25/06/2026 · **GAS:** v1.5.160 prod · **Abas:** COLABORADORES_RH, FOLHA_PONTO, BANCO_HORAS

## Correção

- `COLAB_RH_HEADERS_` (19) · `FOLHA_PONTO_HEADERS_` (9) · `BANCO_HORAS_HEADERS_` (3)
- `audit*SampleCore_` + `validar*Schema_` por aba
- `repararColaboradoresRhPlanilhaAdmin` · `repararFolhaPontoPlanilhaAdmin` · `repararBancoHorasPlanilhaAdmin`
- `repararRhCamada5PlanilhaAdmin` — lote P0
- `validarSchema` inclui 3 abas RH
- `diagnosticoPlanilhaCompletoAdmin` — audits RH P0

## Produção 25/06

| Aba | Registros | schemaOk |
|-----|-----------|----------|
| COLABORADORES_RH | 2 | True |
| FOLHA_PONTO | 9 | True |
| BANCO_HORAS | 4 | True |

`validarSchema` global **schemaOk=True** · `TESTE_RH_CAMADA5_READONLY` **ok**

**Avisos audit (nao bloqueantes):** FOLHA_PONTO L8 OK sem horario · BANCO_HORAS saldo negativo L3 · Eduarda id1 pct=0

**Raykelly:** cadastro **100%** apos repair (I45 resolvido operacionalmente).

## Deploy

Nova versão Web **v1.5.160** ✅
