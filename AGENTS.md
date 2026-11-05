# MOVI KIDS — Instruções para agentes (Cursor / Codex)

Sistema operacional de locações — balcão (tablet na loja), portal do responsável, painel admin.

**Ciclo ativo (05/11/2026):** Sprint D · **La Ville ops desde 06/10/2026** · FE **v1.9.193** I199 · GAS Web/repo **v1.5.237** · ler `APRENDIZADO_AGENTE`

**Para retomar (agente local PC — pasta C):**

> *Continuar MOVI KIDS — La Ville ops 06/10 · FE `?force=1.9.193` · GAS **v1.5.237** · I199 Folha Outubro · após P0 PROTOCOLO_ATUALIZAR_TUDO*

## Produção atual

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.193** | https://ribocg-a11y.github.io/movikids/?force=1.9.193 |
| Gestão Pessoas | **v1.9.193** | `gestao-pessoas.html?force=1.9.193` |
| GAS | ping Web **v1.5.237** · repo **v1.5.237** | Triciclo 03 |
| Design System | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |
| Aprendizado agente | **I191–I198** | `docs/ativos/APRENDIZADO_AGENTE_MOVIKIDS.md` |
| Evolução estratégica | E*/G*/P* | `docs/ativos/EVOLUCAO_ESTRATEGICA_POS_I197.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
```

## Estado (04/11/2026)

- **La Ville:** ✅ **operações iniciadas em 06/10/2026**
- **Folha Q1 10/2026:** PIX Ray **748,40** · Karen **748,40** · Jennifer **543,82**
- **Folha Q2 10/2026:** PIX Ray **902,22** · Karen **1.002,22** · Jennifer **632,19**
- **I198:** política cache-safe + audit-família · FE **v1.9.192**
- **I191–I197:** fantasma/holding/Encerradas/parse/unidadeId · FE **1.9.186–191**
- **I186/I185:** Receita dia a dia · FE **v1.9.179+**
- **Isolamento:** I170–I178 ✅
- **Encerrar toda resposta** com bloco **Versões (encerramento)** + Regra 16
- **§7.2:** FE pronto → push `main` **sem pedir**
- **Decisão sozinha:** após fechar I* / bump FE → **`PROTOCOLO_ATUALIZAR_TUDO`** sem esperar “atualize tudo”
- **Evolução:** P0 = sintoma + família + além do fix (`APRENDIZADO` §9)
- **Não repetir:** parcial apagar rico (I192) · holding só `sessaoAtiva` (I194) · `all→golden` (I195) · auth engolir `unidadeId` (I196) · entregar P0 sem sincronizar docs

Ver `docs/ativos/HANDOFF_NOVO_CHAT.md` · `docs/ativos/APRENDIZADO_AGENTE_MOVIKIDS.md` · `docs/ativos/PROTOCOLO_ATUALIZAR_TUDO.md`
