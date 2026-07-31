# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 31/07/2026 (FE **v1.9.88** + GAS **v1.5.209** Web ✅)

Use **este arquivo** para versão e ordem de publicação. Docs `DEPLOY_v1.5.xx_*` em **`docs/arquivo/deploy/`** são histórico.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.88** | https://ribocg-a11y.github.io/movikids/?force=1.9.88 | ✅ |
| **Gestão Pessoas** | **v1.9.88** | `gestao-pessoas.html?force=1.9.88` | ✅ |
| **Portal acompanhar** | **v1.9.88** | `acompanhar.html` | ✅ |
| **Service Worker** | **1.9.88** | `sw.js` | ✅ |
| **GAS** | **v1.5.209** (header `.gs`) | ping **v1.5.209** | ✅ |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**PIN admin produção:** **1421** (Script Property `ADMIN_PIN`)

**Holerites PDF (jul/2026):** https://ribocg-a11y.github.io/movikids/entregas/holerite-mes-2026-07/

---

## GAS canônico

**PC (referência interna):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Para colar no Editor (usar sempre este link — confira **linha 2** = v1.5.209):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header:** v1.5.209 · I134 abono faltas · I129 ponto/banco · I127 adiantamentoQ1 · I125d batch locações

---

## Validação 31/07/2026

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.209** ✅ |
| `validarSchema` | **schemaOk=True** ✅ |
| Pages `mk-version.js` | **1.9.88** ✅ |
| `teste-i141-bonus-resto.cjs` | I141+I142 OK (Ray 700/1652,22 · Julia 750/1702,22) |
| PDFs entregas | HTTP 200 Raykelly + Julia |

---

## Publicar FE

```
git commit → pre-push-check → git push origin main → verify-publish-complete → encerramento-sessao
```

**I24 PrePush:** ahead/Pages desalinhado = **warn** (esperado pós-commit); dirty I3 = **fail**. Sessao/PosPush ainda bloqueiam ahead.

## Publicar GAS (sócio)

Editor → colar `.gs` → Implantar → **Editar** deploy atual → **Nova versão** (nunca Nova implantação).
