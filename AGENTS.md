# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Ciclo ativo (02/09/2026):** Sprint D · FE **v1.9.111** Pages ✅ · GAS ping **v1.5.213** (repo **v1.5.215**) · **I151b** / **I151** / **I150**

**Para retomar (agente local PC — pasta C):**

> *Continuar MOVI KIDS — FE **v1.9.111** · I151b travas encerrar fantasma · Tablet `?force=1.9.111` · Doc `INCIDENTE_I151_DEFINITIVO_*`*

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.111** | https://ribocg-a11y.github.io/movikids/?force=1.9.111 |
| Gestão Pessoas | **v1.9.111** | `gestao-pessoas.html?force=1.9.111` |
| GAS | ping **v1.5.213** · repo **v1.5.215** | `cenariosFinanceiros` live · Nova versão Web ping ⏳ |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

## Estado (02/09/2026)

- **Fase 1 local-first:** ✅ IndexedDB + snapshot (**I146**)
- **Fase 2 offline:** ✅ fila FE + idempotência GAS (**I147**)
- **Encerrar fantasma:** ✅ travas I151b (**FE v1.9.111**, sem AppScript)
- **Dashboard cenários:** ✅ Base DRE · Projetado 3m · Ritmo 3d (**I150**)
- **Próximo (Ops):** tablet smoke D4 · validar Dashboard admin · Nova versão GAS ping · assinar FASE 17
- **Encerrar toda resposta** com bloco **Versões (encerramento)** + Regra 16

Ver `docs/ativos/HANDOFF_NOVO_CHAT.md` · `docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md`
