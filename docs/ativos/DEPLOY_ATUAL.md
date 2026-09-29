# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 29/09/2026 (FE **v1.9.120** · GAS ping **v1.5.221** = repo · **I158** Golden FE live)

Use **este arquivo** para versão e ordem de publicação.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.120** | https://ribocg-a11y.github.io/movikids/?force=1.9.120 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.120** | `gestao-pessoas.html?force=1.9.120` | ✅ |
| **Portal acompanhar** | **v1.9.120** | `acompanhar.html?v=1.9.120` | ✅ |
| **Service Worker** | **1.9.120** | I158 Golden FE + I154b retry | ✅ |
| **GAS** | **v1.5.221** (header `.gs`) | ping **v1.5.221** · I156 ritmo · lookback 600 | ✅ |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## GAS canônico

**PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Raw (colar Editor — header v1.5.221):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header repo:** v1.5.221 · I156 ritmo fatMap · I155 lookback · I154 audit sort · I153 anular Encerrada · **I158 sem mudança GAS** (correção só FE)

---

## Validação 29/09/2026 (pós-I158)

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.221** ✅ |
| Pages `mk-version.js` | **1.9.120** ✅ |
| I158 Golden FE | ✅ `kpiMes` · set prévia **14332** / CTO **1500** |
| `listarAtivas` (I155) | lookback **600** · **0 HTML 404** (evidência 08/09) |
| Paridade / I43 ts | ✅ |
| Evidência I155 | `EVIDENCIA_ESTABILIDADE_POS_I155_2026-09-08.md` |
| Incidente I158 | `INCIDENTE_I158_GOLDEN_CONTA_CANCELADA_2026-09-23.md` |

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
