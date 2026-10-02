# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 02/10/2026 (FE **v1.9.158** · GAS ping **v1.5.231** = repo · La Ville multi-loja · receita dia a dia)

Use **este arquivo** para versão e ordem de publicação.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.158** | https://ribocg-a11y.github.io/movikids/?force=1.9.158 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.158** | `gestao-pessoas.html?force=1.9.158` | ✅ |
| **Portal acompanhar** | **v1.9.158** | `acompanhar.html?v=1.9.158` | ✅ |
| **Service Worker** | **1.9.158** | I165 · receita dia a dia · floresta | ✅ |
| **GAS** | **v1.5.231** (header `.gs`) | ping **v1.5.231** · multi-unidade · I160 | ✅ |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## GAS canônico

**PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Raw (colar Editor — header v1.5.231):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header repo:** v1.5.231 · I160 escala null · I159t LV · filtro `unidadeId` · I156 ritmo · I155 lookback · **I158 sem mudança GAS** (correção só FE)

---

## Validação 02/10/2026

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.231** ✅ |
| Pages `mk-version.js` | **1.9.158** ✅ |
| I158 Golden FE | ✅ fechamento set **14577** / CTO **1500** · PDF 01/10 |
| I165 chip Caixa | ✅ FE sem vazamento Golden→LV |
| Receita dia a dia | ✅ pills loja · cache local |
| La Ville QR/portal | ✅ I164 · inauguração Ops ⏳ |
| `listarAtivas` (I155) | lookback **600** |
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
