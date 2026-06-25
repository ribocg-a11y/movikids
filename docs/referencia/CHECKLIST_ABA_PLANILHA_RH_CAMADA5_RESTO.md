# Checklist — Camada 5 RH resto (planilha MOVI KIDS) — I63

**Camada:** 5 — Gestão Pessoas · **GAS:** v1.5.161 prod · **Status:** ✅ prod 25/06

## Abas

| Aba | Cols | Repair API | Consumidor |
|-----|------|------------|------------|
| ESCALA_COLABORADORES | 10 | `repararEscalaPlanilhaAdmin` | Jornada · faltas auto I51 |
| FALTAS_AUSENCIAS | 8 | `repararFaltasPlanilhaAdmin` | Abono ADM · holerite |
| HOLERITES | 15 | `repararHoleritesPlanilhaAdmin` | Snapshot folha |
| METAS_COLABORADORES | 7 | `repararMetasPlanilhaAdmin` | Bonus demo (header only) |
| COMUNICADOS_RH | 9 | `repararComunicadosRhPlanilhaAdmin` | Portal RH |
| AVALIACOES_RH | 7 | `repararAvaliacoesRhPlanilhaAdmin` | Nota 0-10 |

**Layout:** header **linha 1** · dados **linha 2+**

## Scripts

- Lote: `REPARAR_RH_CAMADA5_RESTO_PLANILHA_ADMIN.ps1`
- Teste: `TESTE_RH_CAMADA5_RESTO_READONLY.ps1`
- Protocolo por aba: `TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba <NOME>`

## Produção

| Teste | Resultado |
|-------|-----------|
| repair lote I63 | OK · **schemaOk=True** (23 abas) |
| `TESTE_RH_CAMADA5_RESTO_READONLY` | **ok** |
| audits 6 abas | **0 problemas** |

## Pós-deploy

Concluído 25/06 — agente executou repair + testes após Web v1.5.161.
