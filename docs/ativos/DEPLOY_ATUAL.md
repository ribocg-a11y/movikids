# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 29/08/2026 (FE **v1.9.105** + GAS **v1.5.211** Web ✅ · I147 / I146 / I145 / I143)

Use **este arquivo** para versão e ordem de publicação.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.105** | https://ribocg-a11y.github.io/movikids/?force=1.9.105 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.105** | `gestao-pessoas.html?force=1.9.105` | ✅ |
| **Portal acompanhar** | **v1.9.96** | `acompanhar.html` | portal |
| **Service Worker** | **1.9.105** | `sw.js` · IDB + fila offline | ✅ |
| **GAS** | **v1.5.211** (header `.gs`) | ping **v1.5.211** | ✅ |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## GAS canônico

**PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Raw (colar Editor — linha 2 = v1.5.211):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header:** v1.5.211 · I147 idempotência offline · I143 `veiculoJaAberto_`

---

## Validação 29/08/2026

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.211** ✅ |
| Pages `mk-version.js` | **1.9.105** ✅ |
| `listarAtivas` | **0** abertas ✅ |
| Fase 2 offline | FE fila + GAS `clientRequestId` ✅ |

---

## Publicar FE

```
git commit → pre-push-check → git push origin main → verify-publish-complete → encerramento-sessao
```

```powershell
.\scripts\sync-pasta-c-pc.ps1
```

## Publicar GAS (sócio)

Editor → colar `.gs` → Implantar → **Editar** deploy atual → **Nova versão**.
