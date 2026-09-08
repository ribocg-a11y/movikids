# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Ciclo ativo (08/09/2026):** Sprint D · FE **v1.9.114** Pages ✅ · GAS ping **v1.5.220** (= repo) · **I155** ✅ · **I154** ✅ · **I153** ✅

**Para retomar (agente local PC — pasta C):**

> *Continuar MOVI KIDS — FE **v1.9.114** · GAS **v1.5.220** · I155 estabilidade (0 HTML 404) · Tablet `?force=1.9.114` · Doc `EVIDENCIA_ESTABILIDADE_POS_I155_*`*

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.114** | https://ribocg-a11y.github.io/movikids/?force=1.9.114 |
| Gestão Pessoas | **v1.9.114** | `gestao-pessoas.html?force=1.9.114` |
| GAS | ping **v1.5.220** = repo | I155 lookback 600 + cache ativas · anti full-sheet 404 |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

## Estado (08/09/2026)

- **Fase 1 local-first:** ✅ IndexedDB + snapshot (**I146**)
- **Fase 2 offline:** ✅ fila FE + idempotência GAS (**I147**)
- **Encerrar fantasma:** ✅ travas I151b (**FE v1.9.111+**)
- **Dashboard cenários:** ✅ Base DRE · Projetado 3m · Ritmo 3d (**I150**)
- **I153:** ✅ anular Encerrada + trava &lt;90s
- **I154:** ✅ fila/retry em GAS HTML 404 · FE **v1.9.114**
- **I155:** ✅ lookback 600 + cache · ping **v1.5.220** · **0 HTML 404** na bateria
- **Próximo (Ops):** tablet smoke D4 · `?force=1.9.114` · assinar FASE 17
- **Encerrar toda resposta** com bloco **Versões (encerramento)** + Regra 16

Ver `docs/ativos/HANDOFF_NOVO_CHAT.md` · `docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md`
