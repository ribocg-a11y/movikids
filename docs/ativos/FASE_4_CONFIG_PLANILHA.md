# FASE 4 — CONFIG na planilha

**Status:** ⬜ próxima (após homologação Pacote L)  
**GAS:** v1.5.69+ (já lê CONFIG via `lerOperacaoConfig_`)  
**Referência:** `AUDITORIA_PLANILHA_BASE_2026-06-06.md` · `PLANO_PRIORIDADES_2026-06.md` § FASE 4

---

## Objetivo

Admin altera **frota e preços** na aba CONFIG sem redeploy GAS. Hoje o fallback são constantes no `.gs`.

---

## Checklist

| # | Ação | Quem | OK |
|---|------|------|-----|
| 4.1 | Validar chaves JSON na aba **CONFIG** | Sócio + agente OAuth | [ ] |
| 4.2 | Conferir frota (carros, triciclos, pelúcias) = operação real | Sócio | [ ] |
| 4.3 | Conferir preços 3h Carro/Pelúcia **130/150** e triciclo | Sócio | [ ] |
| 4.4 | Salvar no app: **Sistema → Editar frota e preços** (espelho CONFIG) | Admin tablet | [ ] |
| 4.5 | Reauditar KPIs DASHBOARD pós-CONFIG | Agente | [ ] |
| 4.6 | Mover `scripts/liberar-*-agora.html` → `scripts/ops/` (decisão 4.3 plano) | Dev | [ ] |

### Chaves CONFIG (Pacote H)

| Chave | Conteúdo |
|-------|----------|
| `veiculos_validos_json` | Lista de veículos |
| `precos_json` | Preços por tipo/plano |
| `formas_pagamento_json` | Formas aceitas |
| `regras_operacionais_json` | Regras extras |

**Planilha:** https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit

---

## Teste após CONFIG

1. Tablet `?force=` versão atual → **Nova locação** mostra frota/preços da planilha  
2. **Painel** reflete mesmos veículos  
3. Ping GAS inalterado (sem Nova versão se só planilha mudou)
