# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 15/07/2026 (FE **v1.9.58** + GAS **v1.5.196** I116 · Web ainda **v1.5.195** I115)

Use **este arquivo** para versão e ordem de publicação. Docs `DEPLOY_v1.5.xx_*` em **`docs/arquivo/deploy/`** são histórico.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.58** | https://ribocg-a11y.github.io/movikids/?force=1.9.58 | ✅ |
| **Gestão Pessoas** | **v1.9.58** | `gestao-pessoas.html?force=1.9.58` | ✅ |
| **Portal acompanhar** | **v1.9.58** | `acompanhar.html` | ✅ |
| **Service Worker** | **1.9.58** | `sw.js` | ✅ |
| **GAS** | **v1.5.196** (header `.gs`) | ping **v1.5.195** até Nova versão I116 | ⚠️ colar + implantar I116 |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**PIN admin produção:** **1421** (Script Property `ADMIN_PIN`)

---

## GAS canônico

**PC (referência interna):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Para colar no Editor (usar sempre este link — confira **linha 2** = v1.5.196):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header:** v1.5.196 · I116 enrich login · I115 slim · I111 VT Q1=0 · I110 · I108

---

## Publicar FE

```
git commit → pre-push-check → git push origin main → verify-publish-complete → encerramento-sessao
```

## Publicar GAS (sócio)

Editor → colar `.gs` → Implantar → **Editar** deploy atual → **Nova versão** (nunca Nova implantação).
