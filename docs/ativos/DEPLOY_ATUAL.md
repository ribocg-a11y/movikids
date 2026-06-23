# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 23/06/2026

Use **este arquivo** para versão e ordem de publicação. Docs `DEPLOY_v1.5.xx_*` em **`docs/arquivo/deploy/`** são histórico.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.8.115** | https://ribocg-a11y.github.io/movikids/?force=1.8.115 | ✅ Pages |
| **Gestão Pessoas** | **v1.8.115** | `gestao-pessoas.html?force=1.8.115` | ✅ |
| **Service Worker** | **1.8.115** | `sw.js` | ✅ |
| **GAS** | **v1.5.137** (header `.gs`) | ping **v1.5.136** | ⚠️ Nova versão Web **v1.5.137** pendente (I44) |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## GAS canônico (PC)

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

---

## Ordem de publicação (janela segura)

1. `check-operacao-livre.ps1` — sem loc Ativa/Pendente
2. **GAS editor:** `prepare-gas-push.ps1` (com pedido) → header **v1.5.137**
3. **GAS Web:** Editor → Implantar → **Editar** deploy `AKfycbwakQ...` → **Nova versão** (sócio)
4. Ping → validar `v1.5.137`
5. **`repairBancoHorasAdmin`** — `?action=repairBancoHorasAdmin&adminPin=1416` (I44)
6. **FE:** `pre-push-check.ps1` → commit → push → `verify-publish-complete.ps1`
7. Tablet: `?force=1.8.115` + homolog

**Proibido:** `clasp deploy` sem `-i` · nova implantação GAS · POST no browser (I15).

---

## Entregas recentes (repo)

| Commit / tema | Entrega |
|---------------|---------|
| `d39a7ac` | **I44** — banco horas não grava em leitura · repair admin · FE v1.8.115 |
| `ff84239` | **I43** — travas cronômetro · `TESTE_I43` |
| `ef10dfa` | **I43** hotfix — `COL_LOC_READ_` · FE v1.8.114 · GAS v1.5.136 |
| I42 | Conta do dia · `TESTE_I42_CONTA_DIA_CAIXA` 6/6 |
| F17 | Alertas inteligentes · pills · matriz permissões |

Incidentes: `MAPA_ERROS_FALHAS_BUGS.md` I42–I44.

---

## Testes pós-deploy

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\verify-gas-deploy.ps1
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_I43_CARREGAR_INICIO_READONLY.ps1
.\scripts\testes\TESTE_PROTOCOLO_DIAGNOSTICO.ps1 -SkipNetworkTests
```
