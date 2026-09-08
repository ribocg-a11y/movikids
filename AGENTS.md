# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Ciclo ativo (08/09/2026):** Sprint D · FE **v1.9.112** · GAS ping **v1.5.216** (repo **v1.5.218**) · **I153** · **I152** · **I151b**

**Para retomar (agente local PC — pasta C):**

> *Continuar MOVI KIDS — FE **v1.9.112** · I153 anular #3465 após Nova versão GAS 218 · Tablet `?force=1.9.112` · Doc `INCIDENTE_I153_*`*

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.112** | https://ribocg-a11y.github.io/movikids/?force=1.9.112 |
| Gestão Pessoas | **v1.9.112** | `gestao-pessoas.html?force=1.9.112` |
| GAS | ping **v1.5.216** · repo **v1.5.218** | anular Encerrada + trava &lt;90s · Nova versão Web ⏳ |
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
- **I153:** código pronto · anular `#3465` após Nova versão Web **v1.5.218**
- **Próximo (Ops):** colar GAS 218 → `REPARAR_I153_ANULAR_3465.ps1` · tablet `?force=1.9.112`
- **Encerrar toda resposta** com bloco **Versões (encerramento)** + Regra 16

Ver `docs/ativos/HANDOFF_NOVO_CHAT.md` · `docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md`
