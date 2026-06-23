# I50 — Faltas falsas no holerite (sem ponto ≠ falta)

**Data:** 23/06/2026  
**Severidade:** P1 RH/payroll  
**Versão:** GAS **v1.5.144**

---

## Sintoma

Raykelly **sem faltas reais**, holerite mostrava **−R$ 270,15** (cód. 404).

## Causa

Pacote **I46** inferiu falta automaticamente:

1. `gpAnaliseJornadaColab_` — dia com escala e **sem ponto** → `sit: 'Falta'`
2. `gpSyncFaltasFromJornada_` — gravava em `FALTAS_AUSENCIAS` com obs `Sync jornada GP`
3. `gpFaltasDescontoMes_` — somava essas linhas no holerite

Operação nova: ponto RH ainda em adoção — **não bater ponto ≠ falta** até RH confirmar.

## Correção v1.5.144

| Mudança | Efeito |
|---------|--------|
| Jornada | `Sem ponto` em vez de `Falta` (dia passado sem registro) |
| `gpSyncFaltasFromJornada_` | Desativado (no-op) |
| `gpFaltasDescontoMes_` | Só linhas **confirmadas**; ignora `Sync jornada` |
| `gpRepairLimparFaltasSyncJornada_` | Apaga linhas sync na planilha |

## Após deploy

1. Nova versão Web **v1.5.144**
2. `repararRhPlanilhaAdmin` (PIN 1416) — limpa faltas sync
3. Recarregar holerite → faltas **R$ 0,00**
