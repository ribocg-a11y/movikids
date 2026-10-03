# INCIDENTE I167 — Holerite Salvar/Imprimir → about:blank

**Status:** ✅ resolvido · FE **v1.9.160**  
**Data:** 02/10/2026  
**Relacionados:** I142b (print SPA) · I34 · I141

---

## Sintoma

Botão **Salvar PDF / Imprimir** no holerite (admin Folha) abria janela Chrome `about:blank` vazia — sem conteúdo para enviar à contadora.

---

## Causa

| Peça | Detalhe |
|------|---------|
| `window.open('', '_blank', 'noopener,noreferrer,…')` | Com `noopener`, o opener **não consegue** `document.write` na janela nova |
| CSS `#gp-app .mk-hol` | Mesmo com write, estilos não aplicavam na janela isolada (admin está em `#page-operadores`) |

---

## Correção

| Peça | Arquivo |
|------|---------|
| `mkHolPrintPdf_` via **Blob URL** + CSS embutido | `mk-holerite.js` |
| Fallback download `.html` se pop-up bloqueado | idem |
| Toast: Imprimir → Destino “Salvar como PDF” | idem |

**Não repetir:** `noopener` + `document.write` na mesma janela; depender de `mk-gestao-pessoas.css` relativo em `about:blank`.

---

## Evidência

- Commit `28e5e49` · Pages **1.9.160**  
- Fluxo: Folha → Ver holerite → Salvar PDF / Imprimir → janela com demonstrativo → Salvar como PDF  
