# I151b — Emergência FE: fantasma sem AppScript

**Status:** FE **v1.9.111** (PR → Pages)  
**Data:** 02/09/2026  
**Família:** I148 / I151  
**AppScript:** **não** alterado

---

## Situação

Sócio sem PC para colar `.gs` / Nova versão Web. Servidor já OK (`listarAtivas.total = 0`); tablet ainda com card Ativa / Encerrar falha.

## Causa residual (após I151)

1. `carregarInicio` pode gravar `mk_inicio_cache` com ativos velhos (ScriptCache).
2. `listarAtivas` zera a tela, mas **não invalidava** o cache → próximo falha de sync **recolocava** o fantasma.
3. Orphans de 120s + boot local (I146) mantinham card até Encerrar/timeout.

## Correção só FE v1.9.111

| Arquivo | Mudança |
|---------|---------|
| `mk-sync.js` | `listarAtivas` vazio → `mkInvalidateInicioCache_`; orphans só otimistas quando fonte=`listarAtivas`; reconcile após `carregarInicio`; `mkReconcileFantasmasEmergencia_` |
| `mk-core.js` | reconcile em **2s** no boot (além dos 12s) |

## Ops agora (sem PC)

1. Abrir: https://ribocg-a11y.github.io/movikids/?force=1.9.111  
2. Ou Admin → Diagnóstico → **Limpar cache local + sync**  
3. Encerrar de novo no fantasma → card some  

## Contorno imediato (já live v1.9.110)

Enquanto o PR do 1.9.111 não estiver em Pages: `?force=1.9.110` + Limpar cache local.
