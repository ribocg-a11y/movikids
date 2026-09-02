# I151 — Encerrar fantasma recorrente (card Ativa com servidor 0)

**Status:** ✅ FE **v1.9.110**  
**Data:** 02/09/2026  
**Família:** I148 / I146

---

## O quê

De novo: tablet mostra locação que **não encerra**. Ping/planilha: **`listarAtivas.total = 0`**, `carregarInicio.ativos = []`. Hoje só havia encerradas reais (ex.: Iolanda #3257, João Miguel #3258).

Mesmo padrão I148 (Iza): **card fantasma local** — servidor já Encerrada/sem linha Ativa-Pendente.

## Por que voltou

1. Purge I148 só batia regex estreita; timeout (“Erro de conexão”) **não** reconciliava.
2. `mkEncerrarPurgeLocal_` **não invalidava** `mk_inicio_cache` → sync falho recolocava o card.
3. `listarAtivas` parcial com `[]` **não gravava** snapshot (I146 pulava `parcial`) → boot/IDB rehidratava fantasmas.

## Correção FE v1.9.110

| Arquivo | Mudança |
|---------|---------|
| `mk-drawer.js` | 409 encerrada/finalizada → purge; reconcile `listarAtivas` em erro/timeout; purge invalida cache |
| `mk-local-snapshot.js` | parcial **vazio** grava snapshot (limpa fantasmas) |
| `mk-sync.js` | chama `mkSnapshotSave_` quando `ativos.length === 0` mesmo parcial |

## Evidência 02/09/2026 (~13:00 BRT)

| Check | Resultado |
|-------|-----------|
| `listarAtivas` | total **0** |
| `carregarInicio` ativos | **[]** |
| `statsHoje` | n=2 · nSessoes=2 |
| encHoje | Iolanda 12:08 · João Miguel 12:54 |

## Homolog Ops (agora)

1. Tablet: https://ribocg-a11y.github.io/movikids/?force=1.9.110  
2. Se card fantasma ainda aparecer: Encerrar de novo → deve sumir com aviso “Já estava encerrada…”  
3. Ou Diagnóstico → limpar cache / snapshot · reload `?force=1.9.110`

## Sem App Script

Só FE. GAS já respondia 409 corretamente.
