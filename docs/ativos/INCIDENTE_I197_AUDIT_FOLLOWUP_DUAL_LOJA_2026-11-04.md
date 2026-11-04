# I197 — Audit follow-up dual-loja / fantasma (04/11/2026)

**Data:** 04/11/2026 · **FE:** **v1.9.191** · **GAS:** sem mudança (§7.3)

## Contexto

Após I191–I196 (fantasma João, Encerradas LV, “ninguém logado”, unidadeId auth), auditorias ponta a ponta acharam mais buracos latentes no FE — mesmo padrão: **parcial sobrescreve rico**, **campo singular vs mapa**, **fallback all→golden**, **cache/Firebase reidrata Ativa**.

## Correções FE (v1.9.191)

| Sev | Achado | Correção |
|-----|--------|----------|
| **P0** | Firebase `onValue` aplicava Ativa/Pendente stale | Só `listarAtivas` / reconcile |
| **P0** | GP badges/`presentes` só `sessaoAtiva` (null no holding) | `gpAdmLogadosBalcaoIds_` + `sessoesAtivas` |
| **P0** | `applySessaoAtivaFromApi_` não exportada (GP no-op) | `window.applySessaoAtivaFromApi_` + `mkAuthOperadorIdsLogados_` |
| **P0** | Fantasma reconcile só loja atual | Presente em **qualquer** loja do mapa = ok |
| **P0** | Cache/backoff reidratava Ativa | Strip `ativos:[]` + `mkScheduleEncHojeRepair_` |
| **P1** | IDB `snapshot_v1` global (mistura lojas) | `snapshot_v1_<uid>` |
| **P1** | `listarAtivas` restampava `unidadeId` do tablet | Preserva GAS (incl. `all`) |
| **P1** | Lock UI só `sessaoAtivaRemota` | Lê mapa da loja atual |
| **P1** | `mkOpDeslogarBalcao` all→golden | Mapa vivo; se all tenta as 2 lojas |
| **P1** | Holding refresh com STORAGE balcão apagava mapa | `mkAuthOpsListParams_` → all no holding; merge scoped |
| **P1** | Prune offline cross-loja | Escopo por `unidadeId` |
| **P1** | Auto-purge bump sem Encerradas | `mkScheduleEncHojeRepair_(400)` |
| **P1** | Safety timer + resposta tardia | `_syncGeneration` |
| **P2** | Stamp local `mkUnidadeId_` antes do veículo | Veículo `LV ` primeiro |
| **P2** | `mergeSessaoCanonica` perdia `unidadeId` local | Preserva server→local→veículo |

## Fora de escopo (GAS §7.3)

- `painelGestaoPessoasAdmin_` badges server-side
- `liberarSessaoOperador_` devolver `sessoesAtivas`
- `comandoOperacional` holding map

## Guards

`guard.i197.firebase.ativos` · `guard.i197.idb.uid` · `guard.i197.gp.sessoes` · `guard.i197.auth.export` · `guard.i197.cache.ativos`
