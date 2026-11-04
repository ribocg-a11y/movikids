# I198 — Política cache-safe + audit família (04/11/2026)

**Data:** 04/11/2026 · **FE:** **v1.9.192** · **GAS:** sem mudança  

## Por quê (além do I197)

I197 ainda tinha 3 cópias do `Object.assign` strip-ativos e regressão só descoberta por sintoma. Mandato do usuário: **ir além do patch** — política nomeada + trava automática + plano estratégico.

## Entrega

| Item | Onde |
|------|------|
| `mkInicioCacheSafeForApply_` | `mk-sync.js` — único caminho cache frio → UI |
| `scripts/audit-familia-dual-loja.ps1` | anti-padrões Firebase/GP/auth/IDB/custos |
| `guard.i198.*` | `pre-push-check.ps1` |
| Docs | `APRENDIZADO` §9 · `EVOLUCAO_ESTRATEGICA_POS_I197.md` |

## Próximo (E1 FE, sem pedido quando couber)

`mkMergeInicioPayload_(prev, next)` — merge por campo para parcial/rico.
