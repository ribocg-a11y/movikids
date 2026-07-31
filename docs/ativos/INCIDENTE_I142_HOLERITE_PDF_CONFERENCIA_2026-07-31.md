# INCIDENTE I142 / I142b — Holerite PDF conferência mês (31/07/2026)

**Status:** ✅ resolvido · FE **v1.9.87** (tabelas) · **v1.9.88** (print janela)  
**Relacionados:** I141 (bônus resto) · I138 (VT fora) · I34 (PDF holerite original)

---

## Sintoma

1. Sócio pediu tabela Salário/VA/VT/Bônus Q1·Q2·Soma + dias de bônus por colaboradora no PDF.
2. Botão «Salvar PDF / Imprimir» gerava **página em branco** (só cabeçalho do browser).

---

## Causa

| ID | Causa |
|----|--------|
| **I142** | Holerite só tinha demonstrativo da quinzena atual — sem resumo do mês nem lista de dias. |
| **I142b** | CSS `body.mk-hol-printing * { visibility: hidden }` escondia ancestrais do SPA; filho `.mk-hol-print-root { visibility: visible }` **não aparece** se o pai está hidden. |

---

## Correção

| Peça | Arquivo |
|------|---------|
| `mkHolMesResumo_` / `mkHolBuildMesResumoHtml_` | `mk-holerite.js` |
| Dias via `metaOperadorTurno` no admin | `mk-gestao-pessoas-admin.js` |
| Print em `window.open` + HTML isolado | `mkHolPrintPdf_` **v1.9.88** |
| PDFs estáticos gerados | `entregas/holerite-mes-2026-07/` · script `scripts/gerar-pdf-holerite-mes.cjs` |

**Regra I141 (inalterada):** 1ª = memorial dia 15 · 2ª = ganho mês − pago na 1ª · VT nunca no pacote.

---

## Evidência 31/07

| Pessoa | Pacote Q1 | Bônus Q2 | Pacote Q2 | Dias bônus |
|--------|-----------|----------|-----------|------------|
| Raykelly | 998,40 | 700 | 1652,22 | 13 · R$ 850 |
| Julia | 948,40 | 750 | 1702,22 | 13 · R$ 850 |

- `node scripts/testes/teste-i141-bonus-resto.cjs` → I141+I142 OK  
- Links: https://ribocg-a11y.github.io/movikids/entregas/holerite-mes-2026-07/

---

## Não repetir

- Não usar `visibility:hidden` em `*` do body para print dentro do SPA admin.
- Não recalcular bônus Q2 como 50% do mês final.
