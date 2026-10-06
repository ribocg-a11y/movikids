# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Ciclo ativo (06/10/2026):** Sprint D · FE **v1.9.165** · GAS Web **v1.5.233** · repo **v1.5.234** · I170–I172 ✅ · I173–I178 no repo ⏳ Nova Web

**Para retomar (agente local PC — pasta C):**

> *Continuar MOVI KIDS — Nova Web GAS **v1.5.234** · `TESTE_ISOLAMENTO_MULTIUNIDADE_READONLY` · FE `?force=1.9.165`*

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.165** | https://ribocg-a11y.github.io/movikids/?force=1.9.165 |
| Gestão Pessoas | **v1.9.165** | `gestao-pessoas.html?force=1.9.165` |
| GAS | ping Web **v1.5.233** · repo **v1.5.234** | I173–I178 no GitHub |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

## Estado (06/10/2026)

- **Isolamento:** Contas/`carregarInicio` PASS · hist API FAIL até Nova Web **I172** · **I173–I178** documentados
- **Auditoria:** `docs/ativos/AUDITORIA_ISOLAMENTO_MULTIUNIDADE_I172_2026-10-06.md`
- **I158 Golden:** ✅ FE via `kpiMes` · set fechamento **R$ 14.577** / CTO **R$ 1.500**
- **I166–I168:** ✅ folha cache-first · PDF holerite Blob · FE **v1.9.161+**
- **La Ville:** multi-loja · Ops QR/tablet/equipe/CTO · isolamento P0 em curso
- **Encerrar toda resposta** com bloco **Versões (encerramento)** + Regra 16
- **§7.2:** FE pronto → push `main` **sem pedir**
- **Não repetir:** isolamento só com Contas · carimbar `unidadeId` sem filtrar (I173) · `getRange` curto + match unidade (I172/I178)

Ver `docs/ativos/HANDOFF_NOVO_CHAT.md` · `docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md` · `docs/ativos/AUDITORIA_ISOLAMENTO_MULTIUNIDADE_I172_2026-10-06.md`
