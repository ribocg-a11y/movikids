# I191 — Locação fantasma (Triciclo João) por flags offline em ri>0

**Data:** 04/11/2026 (America/Fortaleza)  
**FE:** **v1.9.186** · **GAS:** ping **v1.5.237** (sem mudança AppScript)

## Sintoma

Tablet/PWA mostrava **Triciclo · João** Ativa/Pendente depois de já **Encerrada** no servidor. `listarAtivas` Golden só tinha **Aurora · Carro 01**.

## Causa

I187 passou a preservar orphans com `_offlinePending` / `_offlineQueued` / `_clientRequestId` **mesmo com `rowIndex > 0`**. Card encerrado no GAS, flags stale no aparelho → fantasma eterno contra `listarAtivas`.

Boot (`mkBootLocalFirstCore_`) também reidratava esses “inflight” após limpar `mk_sessions`.

## Correção (só FE)

1. Orphans offline = **somente `rowIndex < 0`** (temp da fila).
2. Otimista ▶ / `_iniciandoTimer` ≤ **90s**.
3. `mkOfflinePruneStaleQueue_` após `listarAtivas`.
4. `mkPurgeLocacoesFantasmaHard_` + botão Diagnóstico + `?purgeGhosts=1`.
5. Auto-wipe local **1× por versão** no boot (`mk_i191_fantasma_purge_ver`).

## Evidência servidor (04/11)

- `listarAtivas&unidadeId=golden` → 1 ativa: Aurora Carro 01 (row 5202). Sem João.
- La Ville: 0 ativas.

## Tablet (Karen / balcão)

Abrir: `https://ribocg-a11y.github.io/movikids/?force=1.9.186`  
(ou `?force=1.9.186&purgeGhosts=1` se ainda ver fantasma)

Não encerrar Aurora. Não precisa Nova versão Web GAS.
