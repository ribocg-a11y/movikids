# INCIDENTE I34 — Holerite: apresentação + CNPJ fictício

**Data:** 20/06/2026  
**Severidade:** P2 RH / conformidade documental  
**Status:** ✅ **Resolvido** FE **v1.8.70–71** (commits `740d4ce`, `389552a`)  
**Arquivos:** `mk-holerite.js` · `mk-gestao-pessoas-admin.js` · `mk-gestao-pessoas-ui.js`

---

## Sintoma

- Holerite Raykelly (admissão 15/06/2026) com **valores corretos** mas apresentação abaixo de sistemas RH premium
- Referência `16/30 dias · 60%` misturava proporcional mensal e percentual quinzenal
- **CNPJ** placeholder `00.000.000/0001-00`
- VT aparecia como desconto e benefício com rótulos ambíguos
- Sem export PDF para arquivo do colaborador
- CPF no holerite **admin** dependia de GAS enviar `cpf` (repo v1.5.111 · ping v1.5.107)

---

## Auditoria matemática (Raykelly — 2ª quinzena 06/2026)

| Item | Valor |
|------|-------|
| Proporcional mês (16/30) | R$ 864,53 |
| Salário 60% | R$ 518,72 |
| Bônus | R$ 100,00 |
| INSS 7,5% | R$ 72,34 |
| VT 6% | R$ 51,87 |
| **Líquido** | **R$ 494,51** |

Conclusão: **cálculo proporcional à admissão correto** — problema era UX/documentação.

---

## Correção (FE)

| Entrega | Detalhe |
|---------|---------|
| Módulo `mk-holerite.js` | HTML compartilhado admin + colaborador |
| Referência salário | `60% da 2ª quinzena` + faixa amarela proporcional |
| Cabeçalho | CPF formatado · matrícula `MK-xxx` · CNPJ real |
| VT | `403 Desconto VT` vs `502 Concessão passes VT` |
| FGTS | Marcado informativo empregador |
| PDF | Botão `mkHolPrintPdf_()` + `@media print` |
| CNPJ real | **66.664.255/0001-67** (v1.8.71) |

---

## Pendência GAS

- `painelGestaoPessoasAdmin` passa `cpf` no colaborador — alteração no `.gs` v1.5.111
- **Nova versão Web** necessária para CPF no holerite admin

---

## Teste

- Admin: Operadores → Folha → Ver holerite → PDF
- Colaborador: `gestao-pessoas.html` → Holerite
- Conferir CNPJ **66.664.255/0001-67** no cabeçalho

---

## Design System

Superfície holerite Gestão Pessoas — checklist §9 aplicado (DNA MOVI KIDS, Fredoka/Nunito, tabela rubricas).
