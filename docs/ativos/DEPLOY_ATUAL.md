# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 06/08/2026 (FE **v1.9.96** + GAS **v1.5.210** Web ✅ · I143)

Use **este arquivo** para versão e ordem de publicação. Docs `DEPLOY_v1.5.xx_*` em **`docs/arquivo/deploy/`** são histórico.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.96** | https://ribocg-a11y.github.io/movikids/?force=1.9.96 | ⏳ Pages CDN (main já 1.9.96) |
| **Gestão Pessoas** | **v1.9.96** | `gestao-pessoas.html?force=1.9.96` | ⏳ |
| **Portal acompanhar** | **v1.9.96** | `acompanhar.html` | ⏳ |
| **Service Worker** | **1.9.96** | `sw.js` | ⏳ |
| **GAS** | **v1.5.210** (header `.gs`) | ping **v1.5.210** | ✅ |

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

**Para colar no Editor (usar sempre este link — confira **linha 2** = v1.5.210):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header:** v1.5.210 · I143 `veiculoJaAberto_` · I134 abono · I129 ponto/banco · I125d batch locações

---

## Validação 06/08/2026 (I143)

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.210** ✅ |
| `validarSchema` | **ok** ✅ |
| salvar mediana | **~3.9s** ✅ |
| ▶ mediana | **~3.1s** · drift **0** ✅ |
| 2º salvar mesmo veículo | **409 bloqueado** ✅ |
| limpeza TESTE_ | fantasma **0** ✅ |
| Pages `mk-version.js` | main **1.9.96** · CDN pode atrasar — usar `?force=1.9.96` |

Artefato: `/opt/cursor/artifacts/teste-i143-pos-deploy.json`

---

## Publicar FE

```
git commit → pre-push-check → git push origin main → verify-publish-complete → encerramento-sessao
```

**I24 PrePush:** ahead/Pages desalinhado = **warn** (esperado pós-commit); dirty I3 = **fail**. Sessao/PosPush ainda bloqueiam ahead.

## Publicar GAS (sócio)

Editor → colar `.gs` → Implantar → **Editar** deploy atual → **Nova versão** (nunca Nova implantação).
