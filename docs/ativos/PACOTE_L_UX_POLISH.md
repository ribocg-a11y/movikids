# Pacote L — UX polish + QR balcão (FASE 3)

**Início:** 08/06/2026  
**Versão alvo:** FE **v1.7.88** · GAS **v1.5.69** (sem mudança GAS)  
**Referência:** `PLANO_PRIORIDADES_2026-06.md` FASE 3 · `DECISAO_COMUNICACAO_QR_CODE_2026-06.md`

---

## Objetivo

Balcão mais rápido e menos ruído visual — **sem** mudar regras de negócio nem APIs de escrita.

---

## Entregas

| # | Item | Status | Notas |
|---|------|--------|-------|
| L.1 | Tiles veículo unificados (Home / Painel / Nova) | 🟡 | CSS `MKTile` + classe `mk-tile` em `vc-card` e `pcard` (v1.7.88) |
| L.2 | Barra resumo fixa na Nova locação | ✅ | Sticky + resumo desde veículo (v1.7.88) |
| L.3 | Header “Última sync · há Xs” | ✅ | `mk-sync.js` + sidebar (v1.7.88) |
| L.4 | Dashboard: atalho Caixa sem duplicar R$ | ✅ | “Conferir →” + contagem locações (v1.7.88) |
| L.5 | Sistema: diagnóstico + liberar sessão | ✅ | Botão inline em Sistema + Operadores (v1.7.88) |
| L.6 | QR portal no balcão | 🟡 | Link Sistema → `assets/qr-balcao-imprimir.html`; **imprimir no balcão** = ops |

---

## FASE 2 — fechada

- INVESTIMENTO validado (B3=`27/05/2026`, B4=`05/2026`, capital giro Entra=S) — 08/06/2026  
- Relatório Golden GAS **v1.5.69** em prod  

---

## Homologação Pacote L

| # | Teste | Quem |
|---|-------|------|
| 1 | Header mobile/sidebar: `Online · sync há Xs` atualiza a cada 5s | Tablet |
| 2 | Dashboard: tile Caixa sem R$; abre Caixa com valor correto | Admin |
| 3 | Nova locação: barra resumo sticky desde passo 1 | Tablet |
| 4 | Sistema: liberar sessão funciona (mesmo fluxo Operadores) | Admin + tablet |
| 5 | Sistema → QR abre cartaz A5 | Qualquer |
| 6 | Painel/Nova tiles visualmente alinhados (mk-tile) | Olho |

---

## Próximo após L

- Fechar L.1 (refino visual Painel/Nova)  
- FASE 4 — CONFIG JSON planilha  
- Imprimir QR no balcão (checklist `DECISAO_COMUNICACAO_QR_CODE_2026-06.md`)
