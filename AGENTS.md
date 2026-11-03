# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Ciclo ativo (03/11/2026):** Sprint D · **La Ville ops desde 06/10/2026** · FE **v1.9.179** · GAS **v1.5.236** · I186 Receita filtros/Ver · I185 cache · I183b Holding · I184 ponto · I181 Ray+Karen · isolamento I170–I178 ✅

**Para retomar (agente local PC — pasta C):**

> *Continuar MOVI KIDS — La Ville ops 06/10 · FE `?force=1.9.179` · GAS **v1.5.236** · I186 Receita · I183b Holding · Q2 out/26 PIX Ray 902,22 · Karen 1.002,22 · Jennifer 632,19*

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.179** | https://ribocg-a11y.github.io/movikids/?force=1.9.179 |
| Gestão Pessoas | **v1.9.179** | `gestao-pessoas.html?force=1.9.179` |
| GAS | ping Web **v1.5.236** · repo **v1.5.236** | I182 escala |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

## Estado (03/11/2026)

- **La Ville:** ✅ **operações iniciadas em 06/10/2026**
- **Folha Q1 10/2026:** PIX Ray **748,40** · Karen **748,40** · Jennifer **543,82**
- **Folha Q2 10/2026:** PIX Ray **902,22** · Karen **1.002,22** · Jennifer **632,19** (`MEMORIAL_HOLERITE_Q2_2026-10.md`)
- **I186/I185:** Receita dia a dia filtros/Ver + cache celular · FE **v1.9.179**
- **I183/I183b/I184:** Holding dual + ponto · FE **v1.9.176+**
- **I181:** par meta **Raykelly↔Karen**; Julia pausa; Jennifer La Ville **sem meta**
- **Isolamento:** I170–I178 ✅ Web **v1.5.234+** · `TESTE_ISOLAMENTO_*` PASS
- **I158 Golden:** ✅ set fechamento **R$ 14.577** / CTO **R$ 1.500**
- **Encerrar toda resposta** com bloco **Versões (encerramento)** + Regra 16
- **§7.2:** FE pronto → push `main` **sem pedir**
- **Não repetir:** `unidadeId all` depois do auth (I183b) · forceNet só no Ver (I186) · isolamento só com Contas · `getRange` curto + match unidade (I172/I178)

Ver `docs/ativos/HANDOFF_NOVO_CHAT.md` · `docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md` · `docs/ativos/AUDITORIA_ISOLAMENTO_MULTIUNIDADE_I172_2026-10-06.md`
