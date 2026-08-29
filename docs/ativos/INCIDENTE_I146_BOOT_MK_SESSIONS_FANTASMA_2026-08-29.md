# I146 — Cards fantasma no boot (mk_sessions cru antes do sync)

**Status:** ✅ corrigido FE **v1.9.101–v1.9.102** · GAS inalterado **v1.5.210**  
**Data:** 29/08/2026  
**Família:** I122 / I145 (cache PWA + sync lento)

---

## Sintoma

- Tablet/PC mostrava locações **Pendente/Ativa** que **não existiam** na planilha.
- Cronômetro às vezes “sumia” ou ▶ falhava na 1ª tentativa após idle.
- Planilha com **0** abertas; fantasma vinha do **localStorage** (`mk_sessions`), não do GAS.

---

## Causa raiz

1. `mk-core.js` `init()` carregava `mk_sessions` **antes** do primeiro `carregarInicio`.
2. PWA mantém `localStorage` 24h — sessão stale sobrevivia ao sync.
3. `carregarInicio` pode levar **30–40s** sob carga → UI mostrava cache cru por longo tempo.

---

## Correção (FE only)

| Versão | Entrega |
|--------|---------|
| **v1.9.101** | Boot **sem** `mk_sessions` cru · snapshot LS `mk_snapshot_v1` · poll idle 60s · cache 1h · warm sync horário |
| **v1.9.102** | **Fase 1 IndexedDB** (`mk-idb-store.js`) · boot async IDB→LS · chip status **local · nuvem** · limpar cache async (Diagnóstico) |

Arquivos: `mk-local-snapshot.js`, `mk-idb-store.js`, `mk-core.js`, `mk-sync.js`.

---

## Validação

| Check | Resultado |
|-------|-----------|
| Planilha `listarAtivas` | **0** Pendente/Ativa (29/08) |
| Pages `mk-version.js` | **1.9.102** |
| GAS ping | **v1.5.210** |
| Tablet | `?force=1.9.102` — Ops validar chip local/nuvem |

---

## Próximo (Fase 2 — §7.3)

Fila de escritas offline + idempotência GAS — requer Nova versão Web.
