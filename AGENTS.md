# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Ciclo ativo (29/08/2026):** Sprint D · FE **v1.9.105** · GAS **v1.5.211** · **I147** / **I146** / **I145** / **I143**

**Repo neste PC:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`

**Para retomar (agente local PC — pasta C):**

> *Continuar MOVI KIDS **no PC** — workspace `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`. Ler HANDOFF_NOVO_CHAT.md. FE v1.9.105 / GAS v1.5.211 ✅. Planilha 0 abertas. Próximo: smoke tablet D4 + teste offline. **Não Cloud.***

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.105** | https://ribocg-a11y.github.io/movikids/?force=1.9.105 |
| Gestão Pessoas | **v1.9.105** | `gestao-pessoas.html?force=1.9.105` |
| GAS | **v1.5.211** Web ✅ | ping · I147 idempotência offline |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

## Estado (29/08/2026)

- **Fase 1 local-first:** ✅ IndexedDB + snapshot (**I146**)
- **Fase 2 offline:** ✅ fila FE + idempotência GAS (**I147**)
- **Próximo (Ops):** tablet smoke D4 · teste offline · assinar FASE 17
- **Encerrar toda resposta** com bloco **Versões (encerramento)** + Regra 16

Ver `docs/ativos/HANDOFF_NOVO_CHAT.md` · `docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md`
