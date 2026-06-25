# Incidente I63 — Camada 5 RH resto protocolo abas planilha

**Data:** 25/06/2026 · **GAS:** v1.5.161 prod · **Abas:** ESCALA_COLABORADORES, FALTAS_AUSENCIAS, HOLERITES, METAS_COLABORADORES, COMUNICADOS_RH, AVALIACOES_RH

## Correção

- Headers canônicos: `ESCALA_HEADERS_` (10) · `FALTAS_HEADERS_` (8) · `HOLERITES_HEADERS_` (15) · `METAS_HEADERS_` (7) · `COMUNICADOS_HEADERS_` (9) · `AVALIACOES_HEADERS_` (7)
- `audit*SampleCore_` + `validar*Schema_` por aba
- Repairs individuais: `repararEscalaPlanilhaAdmin` · `repararFaltasPlanilhaAdmin` · `repararHoleritesPlanilhaAdmin` · `repararMetasPlanilhaAdmin` · `repararComunicadosRhPlanilhaAdmin` · `repararAvaliacoesRhPlanilhaAdmin`
- `repararRhCamada5RestoPlanilhaAdmin` — lote camada 5 resto
- `validarSchema` inclui 6 abas (total **23 abas** mapeadas)
- `diagnosticoPlanilhaCompletoAdmin` — audits I63
- Fix I62: `auditBancoHorasSampleCore_` aceita saldo negativo (`-19h53`)

## Deploy (prod 25/06)

Nova versão Web **v1.5.161** ✅ · agente executou repair + testes.

| Aba | Registros | schemaOk | audit prob |
|-----|-----------|----------|------------|
| ESCALA_COLABORADORES | 2 | True | 0 |
| FALTAS_AUSENCIAS | 1 | True | 0 |
| HOLERITES | 2 | True | 0 |
| METAS_COLABORADORES | 1 | True | 0 |
| COMUNICADOS_RH | 1 | True | 0 |
| AVALIACOES_RH | 0 | True | 0 |

`validarSchema` global **schemaOk=True** (23 abas) · `TESTE_RH_CAMADA5_RESTO_READONLY` **ok**

## Scripts

| Script | Uso |
|--------|-----|
| `REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN.ps1` | Repair lote 6 abas |
| `TESTE_RH_CAMADA5_RESTO_READONLY.ps1` | Dry-run + schema + diagnostico |
| `TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba ESCALA_COLABORADORES` | Por aba |

## Guard pre-push

`guard.gas.validarSchema.rhResto` — I63
