# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 30/08/2026 · FE **v1.9.107** Pages ✅ · GAS ping **v1.5.211** (repo header v1.5.213) · **I149** meta · **I148**  
**Ambiente do agente:** **This PC (Windows)** — pasta no **C:** · **não** Cloud Agent.  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**GitHub:** `ribocg-a11y/movikids` · branch `main` · HEAD **`f524e82`**

---

## Abrir agente no PC (C:) — ler primeiro

| Item | Valor |
|------|--------|
| **Workspace obrigatório** | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` |
| **Modo Cursor** | **Agent local / This PC** — o agente precisa rodar `.ps1`, `git`, ping GAS e OAuth no Windows |
| **Não usar** | Cloud Agent (VM Linux sem pasta C nem `clasp`/OAuth local) |
| **Confirmar no 1º turno** | `Test-Path .\scripts\relatorio-versoes.ps1` → `True` · `git rev-parse --short HEAD` → `f524e82` |

**Sincronizar pasta C antes de codar** (se veio de outro chat / Cloud):

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
.\scripts\relatorio-versoes.ps1 -Markdown
```

---

## Mensagem para colar no novo chat (PC)

> *Continuar MOVI KIDS **no PC** — workspace pasta C (`movikids-github`). Ler `HANDOFF_NOVO_CHAT.md`. FE **v1.9.107** local / Pages **1.9.106** até I22 livre · GAS **v1.5.211**. Próximo: loja vazia → push 1.9.107 · tablet `?force=1.9.107`. **Não Cloud — This PC.***

**Mensagem mínima** (também funciona):

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

---

## Evidência validada no PC (29/08/2026 ~13:03)

Comandos rodados pelo sócio na pasta C — **alinhado com produção**:

| Check | Resultado |
|-------|-----------|
| `relatorio-versoes.ps1 -Markdown` | FE **1.9.105** OK · GAS ping **v1.5.211** alinhado · Pages confirmado |
| `Invoke-RestMethod "${GAS}?action=ping"` | **v1.5.211** online |
| `Invoke-RestMethod "${GAS}?action=listarAtivas"` | **total: 0** |
| Pages `mk-version.js` | **1.9.105** |

**Armadilha PowerShell 5.1:** `"$GAS?action=ping"` quebra a URL. Usar **`"${GAS}?action=ping"`** (chaves `${}`).

```powershell
$GAS = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
Invoke-RestMethod -Uri "${GAS}?action=ping" | ConvertTo-Json
Invoke-RestMethod -Uri "${GAS}?action=listarAtivas" | ConvertTo-Json -Depth 5
```

---

## Entregas recentes (contexto)

**Fase 2 offline (29/08):** FE **v1.9.104–105** + GAS **v1.5.211** — fila offline salvar/▶ · `clientRequestId` idempotente · badge **Fila offline: N**. Doc: `INCIDENTE_I147_FASE2_OFFLINE_IDEMPOTENCIA_2026-08-29.md`

**P0 local-first Fase 1 (29/08):** FE **v1.9.101–103** — snapshot LS + **IndexedDB** · chip **local · nuvem** · boot sem `mk_sessions` cru · tela sync não trava. Doc: `INCIDENTE_I146_BOOT_MK_SESSIONS_FANTASMA_2026-08-29.md`

**I145 (13/08):** idle/tela off sem `force=1` · Doc: `INCIDENTE_I145_SYNC_FORCE_IDLE_2026-08-13.md`

**I143 (06/08):** anti-duplicata salvar/▶ · GAS `veiculoJaAberto_` · Doc: `INCIDENTE_I143_SALVAR_DUP_TIMEOUT_FORCE_2026-08-06.md`

**GAS canônico (raw):** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

---

## Modelo operacional — dois aparelhos

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor **local**) | **Sócio/dev** | Código, `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** | Locações, timer, PIN, PWA na loja |

**Tablet (Ops):** https://ribocg-a11y.github.io/movikids/?force=1.9.106

---

## Produção (29/08/2026)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.9.107** | https://ribocg-a11y.github.io/movikids/?force=1.9.107 |
| **Gestão Pessoas** | **v1.9.107** | `gestao-pessoas.html?force=1.9.107` |
| **Service Worker** | **1.9.107** | I148 unificado + I149 meta |
| **Apps Script** | repo/Web **v1.5.211** ✅ | ping alinhado · I147 · I143 |
| **Pasta C** | **`f524e82`** | validado PC 29/08 |
| **Planilha** | 23 abas | **0** Ativa/Pendente (PC + API 29/08) |
| **Homolog tablet** | ⏳ | smoke D4 + teste offline I147 |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

---

## Próximo passo (novo chat no PC)

| # | Ação | Quem | Status |
|---|------|------|--------|
| **S0–S3** | Código sinergia + I149 · FE **v1.9.107** | Agente | ✅ Pages |
| **T1** | Tablet `?force=1.9.107` | Ops | ⏳ agora |
| **T2** | Teste offline: avião → salvar → rede → planilha **+1** sem duplicata | Ops | ⏳ |
| **T3** | Smoke D4 (timer, multi-veículo, idle 10 min) | Ops | ⏳ |
| **0g** | **I147** Fase 2 offline + idempotência GAS | Agente | ✅ **29/08** |
| **0f** | **I146** P0 local-first · IndexedDB | Agente | ✅ **29/08** |
| 2 | Assinar **FASE 17** (decisão **17.5 F9**) | Sócio | ⏳ |
| 3 | Sprint E — FASE 19 | Agente | 📋 após D4 |

**Paridade diária (PC):** `listarAtivas.total` = número de cards Pendente+Ativa no tablet.

Docs: `INCIDENTE_I147_*` · `INCIDENTE_I146_*` · `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`

---

## Ordem de leitura (obrigatória)

| # | Documento | Para quê |
|---|-----------|----------|
| 1 | **Este arquivo** | Contexto, produção, pasta C |
| 2 | **`PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`** | Ciclo ativo Sprint D |
| 3 | **`DESIGN_SYSTEM_MOVIKIDS.md`** | Cartilha UI |
| 4 | `ESTADO_ATUAL.md` · `DEPLOY_ATUAL.md` | Versões |
| 5 | `MAPA_ERROS_FALHAS_BUGS.md` | I* travas |
| 6 | `ROTEIRO_AGENTE_OBRIGATORIO.md` | commit/push/encerramento |

**Fonte de verdade versão:** `mk-version.js` → ping GAS → `DEPLOY_ATUAL.md` → este handoff.

**Agente no PC:** executar `pre-push-check` · `git push` · `encerramento-sessao.ps1` sem pedir (§7.2). **Só com pedido:** `clasp push`, editar `.gs`, Nova versão Web GAS.
