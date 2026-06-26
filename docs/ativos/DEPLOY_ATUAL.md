# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 26/06/2026

Use **este arquivo** para versão e ordem de publicação. Docs `DEPLOY_v1.5.xx_*` em **`docs/arquivo/deploy/`** são histórico.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.8.121** | https://ribocg-a11y.github.io/movikids/?force=1.8.121 | ✅ Pages |
| **Gestão Pessoas** | **v1.8.121** | `gestao-pessoas.html?force=1.8.121` | ✅ |
| **Service Worker** | **1.8.121** | `sw.js` | ✅ |
| **GAS** | **v1.5.165** (header `.gs`) | ping **v1.5.165** | ✅ |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**PIN admin produção:** **1421** (Script Property `ADMIN_PIN`)

---

## GAS canônico (PC)

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

---

## Ordem de publicação FE (ciclo One UI)

1. `check-operacao-livre.ps1` — se mudou fluxo balcão
2. Editar FE + **`DESIGN_SYSTEM_MOVIKIDS.md` §0**
3. Bump **I3:** `mk-version.js` + `sw.js` + `?v=` em `index.html` e `gestao-pessoas.html`
4. `pre-push-check.ps1` → commit → push → `verify-publish-complete.ps1`
5. Homolog **PC admin** (PIN 1421) — tablet só se tocou balcão/auth/api

**GAS neste ciclo:** manter v1.5.165 — Nova versão Web só com pedido explícito.

**Proibido:** `clasp deploy` sem `-i` · nova implantação GAS · POST no browser (I15).

---

## Ciclo ativo

**Premium One UI** — alvo FE **v1.9.0** ao fechar Sprint A · ver `PLANEJAMENTO_ONE_UI_2026-06.md`

---

## Testes pós-deploy FE

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\verify-gas-deploy.ps1
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_FASE16_COMANDO_READONLY.ps1
.\scripts\testes\TESTE_FASE17_ALERTAS_READONLY.ps1
```

Incidentes: `MAPA_ERROS_FALHAS_BUGS.md` I42–I67.
