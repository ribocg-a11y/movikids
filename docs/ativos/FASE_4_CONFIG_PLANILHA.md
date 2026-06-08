# FASE 4 — CONFIG na planilha

**Status:** 🟡 **ativa** (08/06/2026)  
**GAS:** v1.5.69+ (lê CONFIG via `operacaoConfig_` / `cfgReadMap_`)  
**Template:** `CONFIG_OPERACIONAL_TEMPLATE.md` · **Teste:** `scripts/testes/TESTE_OPERACAO_CONFIG_READONLY.ps1`  
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
| 4.5 | Reauditar KPIs DASHBOARD pós-CONFIG | Agente | [~] KPI frota ok 08/06; reauditar após edição |
| 4.6 | Mover `scripts/liberar-*-agora.html` → `scripts/ops/` (decisão 4.3 plano) | Dev | [x] 08/06 |

### Chaves CONFIG (Pacote H)

| Chave | Conteúdo |
|-------|----------|
| `veiculos_validos_json` | Lista de veículos |
| `precos_json` | Preços por tipo/plano |
| `formas_pagamento_json` | Formas aceitas |
| `regras_operacionais_json` | Regras extras |

**Planilha:** https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit

---

## Baseline produção (08/06/2026)

`TESTE_OPERACAO_CONFIG_READONLY.ps1` → **ok**

| Campo | Valor |
|-------|-------|
| `okConfig` | `true` |
| `fonte` | `config_ou_default` |
| Veículos | 9 (Carro×3, Triciclo×2, Pelúcia×4) |
| Carro 3h / Pelúcia 3h | 130 / 150 |
| KPI `ocupacaoFrota` | 9 itens |

Itens **4.1–4.3** ainda dependem de conferência visual na planilha + sócio. **4.5** parcial (KPI OK; reauditoria completa após edição CONFIG).

---

## Teste após CONFIG

1. Tablet `?force=` versão atual → **Nova locação** mostra frota/preços da planilha  
2. **Painel** reflete mesmos veículos  
3. Ping GAS inalterado (sem Nova versão se só planilha mudou)  
4. `.\scripts\testes\TESTE_OPERACAO_CONFIG_READONLY.ps1`
