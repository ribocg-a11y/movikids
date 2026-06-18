# INCIDENTE I30 — Abas Gestão Pessoas parciais (getRange numRows)

**Data:** 17/06/2026  
**Severidade:** P1 dados RH  
**Status:** ✅ **Resolvido** GAS **v1.5.99**  
**Função:** `instalarAbasGestaoPessoas` / `instalarAbasGestaoPessoasAdmin`

---

## Sintoma

- Script `instalar-abas-gestao-pessoas-gas.ps1` reportava sucesso parcial
- Abas RH criadas **incompletas** (só cabeçalho ou poucas linhas seed)
- `gestaoPessoasStatus` inconsistente

---

## Causa raiz

```javascript
// ERRADO (v1.5.98)
sheet.getRange(2, 1, 1 + seeds.length, cols).setValues(seeds);

// getRange(row, col, numRows, numCols) — terceiro arg era numRows=1 → 1 linha só
```

---

## Correção

**GAS v1.5.99:** terceiro parâmetro = `seeds.length` (não `1 + seeds.length` como numRows).

Reinstalar abas após Nova versão Web v1.5.99:
```powershell
.\scripts\instalar-abas-gestao-pessoas-gas.ps1
```

---

## Trava

| Guard | Regra |
|-------|--------|
| `guard.gas.getRange.numRows` | `getRange(startRow, startCol, **numRows**, numCols)` — revisar ao usar seeds |

---

## Teste

- `gestaoPessoasStatus` → 7 abas OK
- `listarColaboradoresGestao` → Raykelly + demais seeds
