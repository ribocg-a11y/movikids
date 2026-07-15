# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 15/07/2026 (FE **v1.9.52** + GAS **v1.5.192** I110 holerite Q1)

Use **este arquivo** para versão e ordem de publicação. Docs `DEPLOY_v1.5.xx_*` em **`docs/arquivo/deploy/`** são histórico.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.52** | https://ribocg-a11y.github.io/movikids/?force=1.9.52 | Pages após push |
| **Gestão Pessoas** | **v1.9.52** | `gestao-pessoas.html?force=1.9.52` | |
| **Portal acompanhar** | **v1.9.52** | `acompanhar.html` | |
| **Service Worker** | **1.9.52** | `sw.js` | |
| **GAS** | **v1.5.192** (header `.gs`) | ping até **Nova versão** I110 | ⚠️ colar + implantar |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**PIN admin produção:** **1421** (Script Property `ADMIN_PIN`)

---

## GAS canônico

**PC (referência interna):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Para colar no Editor (usar sempre este link — confira **linha 2** = v1.5.192):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header:** v1.5.192 · I110 Q1 sem faltas · I109b pot FSS · I108 quinzena 50% benefícios

---

## Publicar FE

```
git commit → pre-push-check → git push origin main → verify-publish-complete → encerramento-sessao
```

## Publicar GAS (sócio)

Editor → colar `.gs` → Implantar → **Editar** deploy atual → **Nova versão** (nunca Nova implantação).
