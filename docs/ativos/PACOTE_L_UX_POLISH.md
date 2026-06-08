# Pacote L — UX polish + QR balcão (FASE 3)

**Início:** 08/06/2026  
**Versão alvo:** FE **v1.7.89** · GAS **v1.5.69** (sem mudança GAS)  
**Referência:** `PLANO_PRIORIDADES_2026-06.md` FASE 3 · `DECISAO_COMUNICACAO_QR_CODE_2026-06.md`

---

## Objetivo

Balcão mais rápido e menos ruído visual — **sem** mudar regras de negócio nem APIs de escrita.

---

## Entregas

| # | Item | Status | Notas |
|---|------|--------|-------|
| L.1 | Tiles veículo unificados (Home / Painel / Nova) | ✅ | `mk-tile` + radius/sombra/ícone unificados (v1.7.88–89) |
| L.2 | Barra resumo fixa na Nova locação | ✅ | Sticky + resumo desde veículo (v1.7.88) |
| L.3 | Header “Última sync · há Xs” | ✅ | Header + sidebar + hub admin (v1.7.88–89) |
| L.4 | Dashboard: atalho Caixa sem duplicar R$ | ✅ | Dashboard + chip admin Home só locações (v1.7.88–89) |
| L.5 | Sistema: diagnóstico + liberar sessão | ✅ | Botão inline em Sistema + Operadores (v1.7.88) |
| L.6 | QR portal no balcão | 🟡 | Strip Home + Sistema + cartaz A5; **imprimir físico** = ops |

---

## v1.7.89 (continuação)

- **Home:** strip “Portal dos pais” com link QR (dismissível)
- **Admin chip Home:** “Caixa hoje: N locações” (sem R$)
- **Hub gestão:** chip status com idade do sync
- **L.1:** `session-card` + `pcard` alinhados ao `--mk-radius`

---

## Homologação Pacote L

| # | Teste | Quem |
|---|-------|------|
| 1 | Header: `Online · sync há Xs` | Tablet |
| 2 | Dashboard + chip admin: sem R$ duplicado | Admin |
| 3 | Nova: barra resumo sticky | Tablet |
| 4 | Sistema: liberar sessão | Admin |
| 5 | Home → Abrir QR + Sistema → cartaz | Tablet |
| 6 | Painel/Nova tiles alinhados | Olho |
| 7 | Imprimir cartaz A5 no balcão | Ops |

---

## Fechar Pacote L

- [ ] Homologação tablet v1.7.89 (checklist acima)
- [ ] Cartaz QR impresso no balcão (`DECISAO_COMUNICACAO_QR_CODE_2026-06.md` § checklist)

**Depois:** FASE 4 — CONFIG JSON planilha
