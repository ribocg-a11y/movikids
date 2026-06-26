# CHECKLIST — Fechamento FASE 17 (Alertas + Gestor)

**Atualizado:** 23/06/2026 · FE **v1.8.121** · GAS **v1.5.165**  
**Referência:** `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md` §7 · `MATRIZ_PERMISSOES_PERFIS_2026-06.md`  
**Teste API:** `scripts/testes/TESTE_FASE17_ALERTAS_READONLY.ps1` — ✅ verde (26/06)

---

## Critérios de pronto (assinar quando todos ✅)

| # | Critério | Evidência | Status |
|---|----------|-----------|--------|
| 1 | **Gestor** loga (PIN perfil `gestor`) → vê Dashboard + Operação + Caixa + Equipe | Tablet/PC homolog 23/06 | ✅ |
| 2 | Gestor **sem** CONFIG / Sistema / diagnóstico | Homolog tablet 23/06 | ✅ |
| 3 | Dashboard exibe **≥1 pill** de alerta inteligente com destino (Caixa / Equipe / Comando) | API `comandoOperacional` n=3 intel · homolog visual ⏳ | 🟡 |
| 4 | Presença admin — badges inteligentes (banco horas / meta / ponto pendente) | `gpAdmIntelForOp_` repo · homolog visual ⏳ | 🟡 |
| 5 | Balcão inalterado — F5/F7/F10/F11 após homolog | Homolog I43/I42 23/06 | ✅ |
| 6 | `TESTE_FASE17_ALERTAS_READONLY.ps1` verde | 26/06 execução | ✅ |
| 7 | **17.5** decisão **F9 Supervisor** documentada | `MATRIZ_PERMISSOES` § Decisões pendentes | ⏳ **sócio** |

**Assinatura FASE 17:** ___/___/2026 · Responsável: ___________

---

## Decisão 17.5 — F9 Supervisor (sócio)

Escolher **uma** opção e registrar em `MATRIZ_PERMISSOES_PERFIS_2026-06.md`:

| Opção | Ação |
|-------|------|
| **A — Manter pausado** | F9 continua off · Supervisor sem PIN ativo na planilha |
| **B — Reativar** | Perfil `supervisor` em `OPERADORES_SISTEMA` · homolog caixa+histórico · ver `FASE_9` pausado |

---

## Pós-fechamento

1. Marcar FASE 17 ✅ em `PLANO_PRIORIDADES_2026-06.md` e `MAPA_FASES.md`
2. Próximo ciclo dev: **P0-5 Raykelly 100%** → **RH-G1** holerites → **FASE 10** CRM
3. Rotina: ponto RH diário + mensal `HIGIENE` / `AUDITORIA_CELULA`

---

## Comandos de validação

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\testes\TESTE_FASE17_ALERTAS_READONLY.ps1
.\scripts\testes\TESTE_CADASTRO_RH_READONLY.ps1 -OperadorId 3
```
