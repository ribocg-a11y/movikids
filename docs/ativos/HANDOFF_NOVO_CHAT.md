# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 29/08/2026 · FE **v1.9.105** · GAS repo/Web **v1.5.211** ✅ · **I147** · **I146** · **I145** · **I143**  
**Ambiente do agente:** **This PC** (Windows) — **não** Cloud. Pasta C: `git pull` ou `.\scripts\sync-pasta-c-pc.ps1` após push.  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Fase 2 offline (29/08):** FE **v1.9.104–105** + GAS **v1.5.211** — fila offline salvar/▶ · `clientRequestId` idempotente · badge **Fila offline: N**. Tablet: `?force=1.9.105`. Doc: `INCIDENTE_I147_FASE2_OFFLINE_IDEMPOTENCIA_2026-08-29.md`

**P0 local-first Fase 1 (29/08):** FE **v1.9.101–103** — snapshot LS + **IndexedDB** · chip **local · nuvem** · boot sem `mk_sessions` cru · tela sync não trava (**v1.9.103**). Doc: `INCIDENTE_I146_BOOT_MK_SESSIONS_FANTASMA_2026-08-29.md`

**I85 encerrar extra (29/08):** FE **v1.9.98–100** — pagamento extra no alerta/drawer · justificativa · sync cards · toque.

**I145 (13/08):** idle/tela off sem `force=1` · Doc: `INCIDENTE_I145_SYNC_FORCE_IDLE_2026-08-13.md`

**I144 (12/08):** `ops-balcao.html` PIN digitado · Doc: `INCIDENTE_I144_OPS_PIN_1416_LIBERAR_BALCAO_2026-08-12.md`

**I143 (06/08):** anti-duplicata salvar/▶ · GAS `veiculoJaAberto_` · Doc: `INCIDENTE_I143_SALVAR_DUP_TIMEOUT_FORCE_2026-08-06.md`

**GAS canônico (raw):** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  
**GitHub:** `ribocg-a11y/movikids` · branch `main` · HEAD **`619b966`**

**Mensagem mínima no novo chat:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

**Mensagem para retomar deste ponto (29/08 — cole esta):**

> *Continuar MOVI KIDS no PC — HANDOFF_NOVO_CHAT.md. FE v1.9.105 / GAS v1.5.211. Tablet `?force=1.9.105`. Fase 2 offline ✅. Próximo: smoke tablet D4 · assinar FASE 17.*

---

## Modelo operacional — dois aparelhos (ler sempre)

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor) | **Você** (sócio/dev) | Código, testes `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** (Milena, Raykelly) | Locações, timer, PIN operador, PWA ícone na loja |

**Alinhar pasta C após push:**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

**Tablet (Ops):** https://ribocg-a11y.github.io/movikids/?force=1.9.105

---

## Produção (29/08/2026)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.9.105** | https://ribocg-a11y.github.io/movikids/?force=1.9.105 |
| **Gestão Pessoas** | **v1.9.105** | `gestao-pessoas.html?force=1.9.105` |
| **Service Worker** | **1.9.105** | `sw.js` · `mk-idb-store.js` · `mk-offline-queue.js` |
| **Apps Script** | repo/Web **v1.5.211** ✅ | ping alinhado · I147 · I143 |
| **Pasta C** | **`619b966`** | `sync-pasta-c-pc.ps1` |
| **Planilha** | 23 abas | **0** Ativa/Pendente (29/08) |
| **Homolog tablet** | ✅ 23/06 | smoke **v1.9.105** + Fase 2 pendente Ops (D4) |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

---

## Próximo passo (novo chat)

| # | Ação | Quem | Status |
|---|------|------|--------|
| **T** | Tablet `?force=1.9.105` — smoke idle + **teste offline** (avião → salvar → rede) | Ops | ⏳ **primeiro** |
| **0g** | **I147** Fase 2 offline + idempotência GAS | Agente | ✅ **29/08** FE **v1.9.105** · GAS **v1.5.211** |
| **0f** | **I146** P0 local-first · IndexedDB | Agente | ✅ **29/08** FE **v1.9.102–103** |
| 2 | Assinar **FASE 17** (decisão **17.5 F9**) + smoke D4 | Sócio + Ops | ⏳ |
| 3 | Sprint E — FASE 19 ranking opt-in | Agente | 📋 após D4 |

Docs: `INCIDENTE_I147_*` · `INCIDENTE_I146_*` · `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`

---

## Ordem de leitura (obrigatória)

| # | Documento | Para quê |
|---|-----------|----------|
| 1 | **Este arquivo** | Contexto, produção |
| 2 | **`PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`** | Ciclo ativo Sprint D |
| 3 | **`DESIGN_SYSTEM_MOVIKIDS.md`** | Cartilha UI |
| 4 | `ESTADO_ATUAL.md` · `DEPLOY_ATUAL.md` | Versões |
| 5 | `MAPA_ERROS_FALHAS_BUGS.md` | I* travas |

**Fonte de verdade versão:** `mk-version.js` → ping GAS → `DEPLOY_ATUAL.md` → este handoff.
