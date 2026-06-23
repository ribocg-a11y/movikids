# I49 — VA R$ 520 em vez de R$ 400 (va_diario seed planilha)

**Data:** 23/06/2026  
**Severidade:** P1 financeiro/RH  
**Versão correção:** GAS **v1.5.143**

---

## Sintoma

Holerite admin Raykelly (admissão 15/06/2026) mostrava:

- **VA:** `R$ 520/mês prop. 16/30` → **R$ 277,33**
- Esperado: **R$ 400/mês** → **R$ 213,33** (16/30 dias)

Proporcionalidade I39 **funcionava** (16/30), mas a **base mensal** estava errada.

## Causa raiz

`gpVaMensalColab_` priorizava `va_diario` da aba **COLABORADORES_RH** col M:

- Seed installer: `va_diario = **20**` (confundido com meta_loc_dia)
- Cálculo: `20 × 26 dias (B12) = **R$ 520/mês**`

I39 corrigiu dias trabalhados/admissão, mas **não** a fonte do teto mensal.

## Por que as travas não atuaram

| Trava | Falha |
|-------|--------|
| `TESTE_VA_ADMISSAO_PROPORCIONAL_READONLY.ps1` | Lia `beneficios.vaTotal` no path errado → sempre 0 → só **warn** |
| `pre-push-check` | Sem guard em `gpVaMensalColab_` |
| Memorial FOLHA B11=400 | Ignorado quando `va_diario > 0` na planilha |

## Correção v1.5.143

| Mudança | Detalhe |
|---------|---------|
| `gpVaMensalTeto_()` | Fonte única: FOLHA B11 ou R$ 400 |
| `gpVaMensalColab_()` | **Nunca** `va_diario × dias` para teto mensal |
| `gpVaDiarioCanonico_()` | Exibição = teto / dias úteis |
| `gpRepairVaDiarioRhRows_()` | Repair planilha col M → ~15,38 |
| Seed installer | `va_diario` 20 → **15,38** |
| `gpFaltasDescontoMes_` | Trava: desconto ≤ salário proporcional mês |
| Teste VA | API `pagamento.holerite.vaTotal` + fail se ≠ 400×dias/diasMes |

## Valores esperados Raykelly (jun/2026, 2ª quinzena)

| Campo | Valor |
|-------|-------|
| Salário prop. | R$ 864,53 (16/30) |
| 60% quinzena | R$ 518,72 |
| VA concedido | **R$ 213,33** |
| VT passes prop. | ~R$ 179,17 (se tarifa memorial) |

## Pendente

1. Nova versão Web **v1.5.143**
2. `repararRhPlanilhaAdmin` (opcional — corrige col M na planilha)
3. Recarregar holerite admin
