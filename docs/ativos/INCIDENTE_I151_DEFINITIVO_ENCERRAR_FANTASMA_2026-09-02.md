# I151 DEFINITIVO — Encerrar fantasma (travas permanentes, sem AppScript)

**Status:** ✅ FE **v1.9.111** Pages · travas **`guard.i151.*`** · teste **`TESTE_I151_ENCERRAR_FANTASMA_READONLY.ps1`**  
**Data:** 02/09/2026  
**Família:** I122 · I146 · I148 · I151 · I151b

---

## Objetivo

Impedir que o tablet mostre locação **Ativa/Pendente** quando o servidor já encerrou (`listarAtivas.total=0`), **sem depender** de Nova versão Web GAS.

---

## Regra de ouro

> Se **`listarAtivas.total === 0`**, o balcão **não exibe** Ativa/Pendente — exceto card **otimista** de salvar/▶ com menos de **90s**.

**Ordem de confiança (FE):**

1. `listarAtivas` (rápido, operacional)
2. Resposta OK de `encerrarLocacao` / purge 409
3. `carregarInicio` (completo, pode atrasar)
4. `mk_snapshot_v1` / IndexedDB (boot)
5. `mk_inicio_cache` (fallback offline — **nunca** ressuscitar fantasma)

---

## Correções FE (v1.9.110 → v1.9.111)

| Versão | Arquivo | O quê |
|--------|---------|-------|
| v1.9.107 | `mk-drawer.js` | Purge 409 (I148) |
| v1.9.110 | `mk-drawer.js`, `mk-local-snapshot.js`, `mk-sync.js` | Purge amplo + snapshot vazio (I151) |
| v1.9.111 | `mk-sync.js`, `mk-core.js` | Invalidate cache + reconcile pós-inicio + orphans (I151b) |

---

## Travas automáticas (pre-push)

| Guard | Verifica |
|-------|----------|
| `guard.i151.reconcile` | `mkReconcileFantasmasEmergencia_` + schedule |
| `guard.i151.listar.invalidate` | listarAtivas=0 → invalidate cache |
| `guard.i151.orphans` | sem grace 120s com fonte listarAtivas |
| `guard.i151.purge` | purge + invalidate no drawer |
| `guard.i151.snapshot` | parcial vazio grava snapshot |
| `guard.i151.boot` | reconcile 2s no boot |
| `teste.i151` | `TESTE_I151_ENCERRAR_FANTASMA_READONLY.ps1` |

Rodar manualmente:

```powershell
.\scripts\testes\TESTE_I151_ENCERRAR_FANTASMA_READONLY.ps1
```

---

## Operação (tablet / loja)

| Situação | Ação |
|----------|------|
| Banner “Nova versão” | Aceitar → ou abrir `?force=1.9.111` |
| Card fantasma | Aguardar 5s (reconcile automático) |
| Persiste | Admin → Diagnóstico → **Limpar cache local + sync** |
| Encerrar → 409 | Card deve sumir + toast “Já estava encerrada…” |
| Extra faltou no caixa | Corrigir no **Caixa admin** (não reencerrar) |

**Paridade diária:** `listarAtivas.total` = número de cards Pendente+Ativa no tablet.

---

## O que NÃO precisa (nesta família)

- Colar `.gs` / Nova versão Web — GAS já responde 409 e `listarAtivas=0` corretamente
- Mudar `encerrarLocacao_` no AppScript para este sintoma

---

## Checklist pós-mudança em sync/drawer/snapshot

- [ ] `pre-push-check.ps1` — todos `guard.i151.*` verdes
- [ ] `TESTE_I151_ENCERRAR_FANTASMA_READONLY.ps1` exit 0
- [ ] Tablet: servidor 0 ativas → UI 0 cards em ≤5s
- [ ] Nova locação real ainda aparece (otimista não quebrado)

Ver também: `MAPA_ERROS_FALHAS_BUGS.md` § família I148–I151b
