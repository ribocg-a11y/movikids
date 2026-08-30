# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 30/08/2026 (FE **v1.9.107** Pages ✅ · GAS ping **v1.5.211** · repo **v1.5.213** · I149 / I148 / I147)

Use **este arquivo** para versão e ordem de publicação.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.107** | https://ribocg-a11y.github.io/movikids/?force=1.9.107 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.107** | `gestao-pessoas.html?force=1.9.107` | ✅ |
| **Portal acompanhar** | **v1.9.107** | `acompanhar.html?v=1.9.107` | ✅ |
| **Service Worker** | **1.9.107** | I148 + I149 | ✅ |
| **GAS** | **v1.5.213** (header `.gs`) | ping **v1.5.211** | ⏳ Nova versão Web |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## GAS canônico

**PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Raw (colar Editor — linha 2 = v1.5.213 no repo; ping produção ainda v1.5.211):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header repo:** v1.5.213 · I148 admin/minUsados · I147 idempotência · I143 `veiculoJaAberto_`

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
