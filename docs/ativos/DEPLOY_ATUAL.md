# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 10/07/2026 (FE v1.9.26 + GAS repo v1.5.185 · ping Web v1.5.182 pendente Nova versão)

Use **este arquivo** para versão e ordem de publicação. Docs `DEPLOY_v1.5.xx_*` em **`docs/arquivo/deploy/`** são histórico.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.9.26** | https://ribocg-a11y.github.io/movikids/?force=1.9.26 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.26** | `gestao-pessoas.html?force=1.9.26` | ✅ |
| **Portal acompanhar** | **v1.9.26** | `acompanhar.html` | ✅ |
| **Service Worker** | **1.9.26** | `sw.js` | ✅ |
| **GAS** | **v1.5.185** (header `.gs`) | ping Web **v1.5.182** | ❌ Nova versão Web |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**PIN admin produção:** **1421** (Script Property `ADMIN_PIN`)

---

## GAS canônico

**PC (referência interna):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Para colar no Editor (I76 — usar sempre este link):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Header:** v1.5.185 · I93 COL_LOC_READ_ caixa/kpi · I92 anularLocacoesRowAdmin · I88 porSemana · I87 custos histórico

---

## Ordem de publicação FE (I24 — ordem fixa)

1. `check-operacao-livre.ps1` — se mudou fluxo balcão (I22)
2. Editar FE + **`DESIGN_SYSTEM_MOVIKIDS.md` §0** se UI
3. Bump **I3:** `mk-version.js` + `sw.js` + `?v=` em `index.html` e `gestao-pessoas.html`
4. **`git commit`** (arquivos da entrega)
5. **`pre-push-check.ps1`**
6. **`git push origin main`**
7. **`verify-publish-complete.ps1`**
8. **`encerramento-sessao.ps1`** — exit 0

Roteiro completo: **`ROTEIRO_AGENTE_OBRIGATORIO.md`**

**GAS:** Nova versão Web no mesmo Deploy ID — **nunca** nova implantação.

**Proibido:** `clasp deploy` sem `-i` · POST no browser (I15).

---

## Ciclo ativo

**Premium One UI** — Sprints A–C ✅ **v1.9.9** · próximo: FASE 17 assinatura + smoke tablet v1.9.9

**Sessão 09/07:** I70–I75 — ver `INCIDENTE_SESSAO_2026-07-09_I70_I75.md`

---

## FOLHA VT (I68 — 26/06)

| Parâmetro | Valor |
|-----------|-------|
| B9 tarifa ida+volta/dia | **8,80** (2× R$ 4,40) |
| B10 dias VT | **22** |
| B12 dias VA | **22** |
| B25 VA/dia | **18,18** |
| B68 custo total | **5253,96** |
| VT passes Milena | **193,60** |
| VT passes Raykelly | **103,25** (prop.) |

```powershell
.\scripts\testes\AJUSTAR_FOLHA_VT_I67.ps1
.\scripts\testes\TESTE_INVESTIGACAO_VT_COLABORADORES.ps1
```

---

## Testes pós-deploy

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\encerramento-sessao.ps1
.\scripts\verify-gas-deploy.ps1
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_FASE16_COMANDO_READONLY.ps1
.\scripts\testes\TESTE_FASE17_ALERTAS_READONLY.ps1
.\scripts\testes\TESTE_INVESTIGACAO_VT_COLABORADORES.ps1
```

Incidentes: `MAPA_ERROS_FALHAS_BUGS.md` I42–I76 · I24 travas publicação FE.
