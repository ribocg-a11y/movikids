# I192 — Encerradas La Ville vazias + fantasma após listarAtivas

**Data:** 04/11/2026 (America/Fortaleza)  
**FE:** **v1.9.187** · **GAS:** **v1.5.237** (sem mudança)

## Sintomas (produção)

1. Operadora La Ville: **Encerradas / histórico do dia não aparece** (Augusto, Luisa existem no GAS).
2. Tablet: **locação fantasma** (ex. Triciclo João) continua após I191.

## Evidência API (04/11 ~19:30 Fortaleza)

| Chamada | Resultado |
|---------|-----------|
| `listarAtivas` golden/laville/all | **0** ativas |
| `carregarInicio&unidadeId=laville` | `encHoje` **2** (Augusto, Luisa) · ~5s |
| `carregarInicio&unidadeId=golden` | `encHoje` **7** · ~10s |

Servidor OK. Falha = **FE local / snapshot / ordem de sync**.

## Causa

0. **P0 parse JS (I191):** comentário com `_offline*/` dentro de `/* … */` em `mk-sync.js` e `mk-local-snapshot.js` → **SyntaxError** → sync/snapshot não carregam no tablet (fantasma + Encerradas mortas). Confirmado no Pages `1.9.186`.
1. `listarAtivas` (parcial) chama `mkSnapshotSave_` com **`encHoje: []`** → apaga Encerradas do snapshot.
2. Timeout de `carregarInicio` → fallback `listarAtivas` e **return** sem nunca carregar `encHoje`.
3. Boot aplicava **ativos** do snapshot (fantasma João) antes do reconcile.
4. Purge I191 via só `listarAtivas` deixava Encerradas vazias.

## Correção FE v1.9.187

- Snapshot parcial **preserva** `encHoje` / stats / config anteriores.
- `mkScheduleEncHojeRepair_` após listarAtivas-only / purge.
- Boot snapshot **não** reidrata Ativa/Pendente com `ri>0` (só temp offline).
- Bump força auto-purge I191 de novo (`mk_i191_fantasma_purge_ver`).

## Tablet agora

https://ribocg-a11y.github.io/movikids/?force=1.9.187  

Se fantasma: `?force=1.9.187&purgeGhosts=1`  
Conferir loja = **La Ville** no seletor do balcão.
