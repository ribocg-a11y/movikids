# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 08/09/2026 (FE **v1.9.114** · GAS ping **v1.5.220** = repo · I155 lookback live)

Use **este arquivo** para versão e ordem de publicação.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.114** | https://ribocg-a11y.github.io/movikids/?force=1.9.114 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.114** | `gestao-pessoas.html?force=1.9.114` | ✅ |
| **Portal acompanhar** | **v1.9.114** | `acompanhar.html?v=1.9.114` | ✅ |
| **Service Worker** | **1.9.114** | I154b retry + listarAtivas 45s | ✅ |
| **GAS** | **v1.5.220** (header `.gs`) | ping **v1.5.220** · lookback 600 | ✅ |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## GAS canônico

**PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Raw (colar Editor — header v1.5.220):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header repo:** v1.5.220 · I155 lookback · I154 audit sort · I153 anular Encerrada · I150 cenários DRE

---

## Validação 08/09/2026 (pós-I155)

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.220** ✅ |
| Pages `mk-version.js` | **1.9.114** ✅ |
| `listarAtivas` bateria | **10/10** · **0 HTML 404** · lookback **600** ✅ |
| Cache ativas warm | **~1,5s** ✅ |
| Paridade / I43 ts | ✅ |
| Evidência | `EVIDENCIA_ESTABILIDADE_POS_I155_2026-09-08.md` |

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
