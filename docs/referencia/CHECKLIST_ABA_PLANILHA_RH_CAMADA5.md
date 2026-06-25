# Checklist — Camada 5 RH P0 (planilha MOVI KIDS) — I62

**Camada:** 5 — Gestão Pessoas · **GAS:** v1.5.160 prod · **Status:** ✅ prod 25/06

## Produção

| Teste | Resultado |
|-------|-----------|
| repair lote | OK · **schemaOk=True** |
| `TESTE_PROTOCOLO_ABA` COLABORADORES_RH | **ok** |
| Milena / Raykelly | **100%** cadastro |
| Eduarda id1 | warn pct=0 |

## Abas P0

| Aba | Cols | Repair API | Consumidor |
|-----|------|------------|------------|
| COLABORADORES_RH | 19 | `repararColaboradoresRhPlanilhaAdmin` | Gate 428 · holerite · `gestao-pessoas.html` |
| FOLHA_PONTO | 9 | `repararFolhaPontoPlanilhaAdmin` | Meu ponto · jornada |
| BANCO_HORAS | 3 | `repararBancoHorasPlanilhaAdmin` | Saldo RH · I44 |

**Layout:** header **linha 1** · dados **linha 2+**

## Scripts

- Lote: `REPARAR_RH_CAMADA5_PLANILHA_ADMIN.ps1`
- Teste: `TESTE_RH_CAMADA5_READONLY.ps1` · `TESTE_CADASTRO_RH_READONLY.ps1`
- Legado: `REPARAR_RH_PLANILHA_ADMIN.ps1` (repararRhPlanilhaAdmin)

## Pós-deploy

1. Colar `.gs` v1.5.160 + Nova versão Web
2. `.\scripts\testes\REPARAR_RH_CAMADA5_PLANILHA_ADMIN.ps1`
3. `.\scripts\testes\TESTE_RH_CAMADA5_READONLY.ps1`

**BANCO_HORAS reset:** só com `-RepairBanco sim` (I44) — padrão **não** zera saldos.

## Auditoria célula 25/06 (v1.5.165)

| Aba | Resultado | Detalhe P2 |
|-----|-----------|------------|
| COLABORADORES_RH | ok | — |
| BANCO_HORAS | ok | — |
| FOLHA_PONTO | ok | L8 Milena 24/06 corrigida (`10:07`→`14:00`) via `SALVAR_PONTO_RH_ADMIN.ps1` |

Ver `PROTOCOLO_AUDITORIA_CELULA_PLANILHA.md` · `AUDITORIA_CELULA_PLANILHA.ps1`
