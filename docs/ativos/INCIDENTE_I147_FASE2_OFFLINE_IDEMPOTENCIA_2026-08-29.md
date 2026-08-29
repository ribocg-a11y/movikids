# I147 — Fase 2 offline: idempotência GAS (clientRequestId)

**Status:** ✅ repo **v1.5.211** · deploy Web pendente sócio  
**Data:** 29/08/2026 · FE **v1.9.104+**

---

## O quê

Fila offline FE (`mk-offline-queue.js`) reenvia `salvarLocacao` / `iniciarTimer` ao voltar a rede. Sem idempotência, replay podia duplicar linha ou reiniciar timer.

## GAS v1.5.211

- `mkIdemLoad_` / `mkIdemStore_` — CacheService 6h por `clientRequestId`
- `salvarLocacao_` — replay devolve mesmo `id` / `rowIndex`
- `iniciarTimer_` — replay devolve mesmo `startTimestamp`

## Deploy (sócio — I76)

1. Editor GAS → colar raw:  
   https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
2. **Implantar → Editar** deploy `AKfycbwakQ...` → **Nova versão**
3. Ping deve retornar **v1.5.211**

## FE

Envia `clientRequestId` em salvar/▶ · fila remapeia `rowIndex` temp → real após salvar.
