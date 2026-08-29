# I147 — Fase 2 offline: idempotência GAS (clientRequestId)

**Status:** ✅ repo **v1.5.211** · Web **v1.5.211** ✅ (ping 29/08)  
**Data:** 29/08/2026 · FE **v1.9.104–105**

---

## O quê

Fila offline FE (`mk-offline-queue.js`) reenvia `salvarLocacao` / `iniciarTimer` ao voltar a rede. Sem idempotência, replay podia duplicar linha ou reiniciar timer.

## GAS v1.5.211

- `mkIdemLoad_` / `mkIdemStore_` — CacheService 6h por `clientRequestId`
- `salvarLocacao_` — replay devolve mesmo `id` / `rowIndex`
- `iniciarTimer_` — replay devolve mesmo `startTimestamp`

## Deploy

✅ **29/08/2026** — Nova versão Web no deploy `AKfycbwakQ...` · ping **v1.5.211**

Raw (referência):  
https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

## FE

Envia `clientRequestId` em salvar/▶ · fila remapeia `rowIndex` temp → real após salvar · badge **Fila offline: N**.

## Teste Ops (pendente)

1. Tablet `?force=1.9.105`
2. Modo avião → salvar locação → restaurar rede → confirmar 1 linha na planilha
3. Repetir com ▶ offline
