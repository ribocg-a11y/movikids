# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Ciclo ativo (03/10/2026):** Sprint D · FE **v1.9.161** · GAS Web **v1.5.231** · **I166–I168** folha/PDF ✅ · La Ville **I159–I165** ✅ · Golden ✅

**Para retomar (agente local PC — pasta C):**

> *Continuar MOVI KIDS — FE **v1.9.161** · GAS **v1.5.231** · La Ville ops (QR/tablet D4/equipe) · Tablet `?force=1.9.161`*

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.161** | https://ribocg-a11y.github.io/movikids/?force=1.9.161 |
| Gestão Pessoas | **v1.9.161** | `gestao-pessoas.html?force=1.9.161` |
| GAS | ping Web **v1.5.231** ✅ · repo **v1.5.231** | multi-unidade + I160 |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

## Estado (03/10/2026)

- **I158 Golden:** ✅ FE via `kpiMes` · set fechamento **R$ 14.577** / CTO **R$ 1.500** · sócio enviar PDF
- **I166–I168:** ✅ folha cache-first · PDF holerite Blob · FE **v1.9.161**
- **La Ville:** multi-loja operacional · **próximo Ops:** QR mesa · tablet D4 · 1ª equipe · CTO/e-mail
- **Receita dia a dia:** ✅ consulta admin com pills loja (sem PDF)
- **I165:** chip Caixa por unidade ✅
- **Encerrar toda resposta** com bloco **Versões (encerramento)** + Regra 16
- **§7.2:** FE pronto → push `main` **sem pedir**
- **Não repetir:** apagar cache/`force=1`/3 retries no painel RH (I168) · `noopener`+write PDF (I167)

Ver `docs/ativos/HANDOFF_NOVO_CHAT.md` · `docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md` · `docs/ativos/PLANO_MULTI_UNIDADE_GOLDEN_LAVILLE_2026-09.md`
