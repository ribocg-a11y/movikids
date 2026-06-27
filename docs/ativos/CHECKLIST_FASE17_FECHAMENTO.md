# CHECKLIST — Fechamento FASE 17 (Alertas + Gestor)

**Atualizado:** 27/06/2026 · FE **v1.9.2** · GAS **v1.5.167**  
**Referência:** `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md` §7 · `MATRIZ_PERMISSOES_PERFIS_2026-06.md` · Sprint D `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`  
**Teste API:** `scripts/testes/TESTE_FASE17_ALERTAS_READONLY.ps1` — ✅ verde (26/06)

---

## Critérios de pronto (assinar quando todos ✅)

| # | Critério | Evidência | Status |
|---|----------|-----------|--------|
| 1 | **Gestor** loga (PIN perfil `gestor`) → vê Dashboard + Operação + Caixa + Equipe | Tablet/PC homolog 23/06 | ✅ |
| 2 | Gestor **sem** CONFIG / Sistema / diagnóstico | Homolog tablet 23/06 | ✅ |
| 3 | Dashboard exibe **≥1 pill** de alerta inteligente com destino (Caixa / Equipe / Comando) | One UI v1.9.2 · homolog PC **D1** | 🟡 |
| 4 | Presença admin — badges inteligentes (banco horas / meta / ponto pendente) | One UI v1.9.2 · homolog PC **D1** | 🟡 |
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

1. Marcar FASE 16/17 ✅ em `PLANO_PRIORIDADES_2026-06.md` e `MAPA_FASES.md` (Sprint D5)
2. Próximo ciclo dev: **Sprint E** FASE 19 gamificação → **Sprint G** FASE 10 CRM
3. Paralelo: **RH-G1** holerites (Sprint F) · ponto RH diário · mensal `HIGIENE` / `AUDITORIA_CELULA`

---

## Comandos de validação

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\testes\TESTE_FASE17_ALERTAS_READONLY.ps1
.\scripts\testes\TESTE_CADASTRO_RH_READONLY.ps1 -OperadorId 3
```
