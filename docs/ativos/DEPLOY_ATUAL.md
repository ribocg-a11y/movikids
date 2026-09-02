# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 02/09/2026 (FE **v1.9.110** · GAS ping **v1.5.213** · repo **v1.5.215** · I151 / I150)

Use **este arquivo** para versão e ordem de publicação.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.110** | https://ribocg-a11y.github.io/movikids/?force=1.9.110 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.110** | `gestao-pessoas.html?force=1.9.110` | ✅ |
| **Portal acompanhar** | **v1.9.110** | `acompanhar.html?v=1.9.110` | ✅ |
| **Service Worker** | **1.9.110** | I151 encerrar fantasma | ✅ |
| **GAS** | **v1.5.215** (header `.gs`) | ping **v1.5.213** · `cenariosFinanceiros` live | ⏳ Nova versão Web (string ping) |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## GAS canônico

**PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Raw (colar Editor — header v1.5.215):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header repo:** v1.5.215 · I150b manutenção R$1200 · I150 cenários DRE · I148 admin

---

## Validação 01/09/2026

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.213** ✅ |
| Pages `mk-version.js` | **1.9.109** ✅ |
| `kpiMes` `cenariosFinanceiros` ago/26 | base **11047** · proj **11875** · ritmo **16140** ✅ |
| `teste-i150-cenarios-financeiros.cjs` | **ok** ✅ |
| `listarAtivas` | **0** abertas ✅ |

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
