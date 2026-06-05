# MOVI KIDS — Pausa do planejamento · Maturidade e saneamento

**Data:** 05/06/2026  
**Motivo da pausa:** Pacotes A–F entregues; priorizar **confiabilidade, consistência e experiência** antes de novas fases (F9 supervisor, F4 WhatsApp completo).  
**Referências:** `ESTADO_ATUAL.md`, `PLANO_MESTRE_REORGANIZADO_2026-06.md` (seção 3 redundâncias), `REGRAS_DE_PUBLICACAO_SEGURA.md`

**Produção alvo:** FE **v1.7.40** · GAS **v1.5.53**

---

## 1. Situação atual (resumo)

| Camada | Maturidade | Comentário |
|--------|------------|------------|
| Balcão (locação, timer, drawer, SMS) | Alta | Estável após incidentes P0 |
| Financeiro / caixa | Média-alta | Funciona; **métricas duplicadas** em várias telas |
| Gestão (Dashboard, PDF) | Média | Rico em KPIs; falta **enxugar e narrativa** |
| Config frota/preços (F8) | Média-baixa | Backend pronto; editor admin é JSON técnico |
| Portal responsável | Média-baixa | Funcional; visual e UX mobile básicos |
| Auth / segurança | Média | Operador ok; travas em doc, não todas automatizadas |

**Pausado explicitamente:** Fase 9 supervisor (operadores mantêm editar/cancelar/plano).

---

## 2. Princípios do novo ciclo

1. **Uma métrica → um lugar canônico** — os demais só linkam.
2. **Operador na Home = 0 KPI financeiro** — sem exceção.
3. **Travas já mapeadas viram código ou CI** — não só documento.
4. **FE-only quando possível** — GAS só se mudar regra de negócio.
5. **Tablet obrigatório** em qualquer mudança de balcão ou WhatsApp.

---

## 3. Travas de segurança (backlog)

### Já em produção

- GET no browser para escritas críticas (Regra 6 / P0)
- Nunca `clasp deploy`
- Anti-stale + auto-update FE
- Locks GAS, limite `minUsados`, operador nas escritas
- Financeiro filtrado para operador
- SMS recheck `GENERIC_FAILURE`
- Suíte `TESTE_*.ps1`

### A implementar (Pacote J e incrementos)

| ID | Trava | Pacote |
|----|-------|--------|
| T1 | Guard em `api()`: bloqueio POST browser nas 5 escritas | J |
| T2 | Script pré-push: versão FE/SW/mk-version alinhados | J |
| T3 | CI/local: `TESTE_PARIDADE` + regressão readonly obrigatórios | J |
| T4 | PIN admin só via GAS (remover hardcode FE) | J+ |
| T5 | Rate limit `buscarPortalResponsavel` | G |
| T6 | Schema validação ao salvar CONFIG frota/preços | H |

---

## 4. Novos pacotes (ordem de execução)

| Ordem | Pacote | Nome | Objetivo | Risco |
|-------|--------|------|----------|-------|
| **1** | **I** | **Sanitização gestão** | Uma verdade por métrica; Home/Caixa/Dashboard/Admin enxutos | Baixo (FE) |
| 2 | G | Portal responsável | `acompanhar.html` alinhado à marca; QR; mobile | Baixo |
| 3 | H | Config amigável | Frota/preços sem JSON; preview antes de salvar | Médio |
| 4 | J | Travas CI | Automatizar regras de publicação | Baixo |
| 5 | — | F4 WhatsApp | Fechar escopo WhatsApp (após I+G) | Alto (tablet) |
| — | F8 | Config em operação | Validar F8 após Pacote H | Médio |
| ⏸ | F9 | Supervisor | **Pausado** | — |

---

## 5. Mapa canônico de métricas (meta Pacote I)

| Métrica | Fonte canônica | Onde some / vira link |
|---------|----------------|------------------------|
| Faturamento **hoje** | **Caixa do dia** | Home: chip opcional “Hoje: R$ X → Caixa”; Dashboard tile já linka |
| Fechamento do dia (linhas, PIX, dinheiro) | **Caixa** | Admin hub: só atalhos, sem `fecha-card` duplicado |
| Faturamento **mês**, custos, resultado, margem, CTO | **Dashboard** | Home: remover `#admin-home-kpis` e ranking |
| Gestão avançada (operador, frota, cancelamentos…) | **Dashboard** (já está) | Não duplicar |
| Relatório mensal / PDF | **Relatório** | Manter; melhorar resumo executivo (fase 2) |
| Ativas / encerradas hoje (contagem) | **Home** stats-bar | Só operacional, sem R$ |
| Diagnóstico técnico | **Sistema** | Fora do hub gestão |

---

## 6. Pacote I — Sanitização gestão (PRIMEIRO)

**Versão alvo:** FE **v1.7.40** (sem GAS obrigatório)

### Problema

Admin e operação veem os mesmos números em **Home, hub admin, Dashboard e Caixa**, com risco de divergência e poluição visual no balcão.

### Escopo (entregas)

#### I.1 — Home operacional limpa

- [x] Operador: **zero** bloco financeiro (auditar `sanitizarDadosInicioOperador_` + cards).
- [x] Admin: remover `#admin-home-kpis` e `#h-ranking` da Home.
- [x] Admin: manter **uma linha** opcional “Hoje: R$ X” com link → Caixa (colapsável ou discreta).
- [x] Stats-bar: só **ativas agora** e **encerradas hoje** (contagem), sem fat.

#### I.2 — Hub admin (Centro de gestão) enxuto

- [x] Remover duplicação de KPIs mensais que já existem no Dashboard.
- [x] Manter portas: Caixa, Dashboard, Histórico, Relatório, Operadores, Sistema.
- [x] Chip “Online · vX” no hub (versão), sem bloco diagnóstico completo.

#### I.3 — Dashboard como “Gestão do mês”

- [x] Confirmar `new-kpi-row` + CTO strip **somente** no Dashboard.
- [x] Tile “Caixa de hoje” continua linkando para Caixa (já feito no F).
- [x] Remover canvas/tabelas legadas `display:none` se não forem usadas (código morto).

#### I.4 — Caixa como “Resumo do dia”

- [x] Caixa = único lugar com fechamento detalhado do dia.
- [x] Garantir que “Copiar resumo” / conferência maquininha ficam aqui, não no Sistema.

#### I.5 — Documentação e teste

- [x] Atualizar `ESTADO_ATUAL.md` com mapa canônico.
- [ ] Checklist manual tablet: operador Home sem R$; admin Dashboard vs Caixa coerentes.

### Fora do escopo (Pacote I)

- Redesign visual completo do Dashboard (abas Hoje/Mês) → incremento I.2 futuro.
- PDF resumo executivo → Pacote I-b ou relatório.
- Mudanças GAS / planilha.
- F9 supervisor, F4 WhatsApp, portal `acompanhar.html`.

### Critério de pronto

1. Login **operador** → Home sem qualquer valor em R$.
2. Login **admin** → Home sem grid KPI mensal nem ranking; no máximo chip “Hoje → Caixa”.
3. **Caixa** mostra faturamento e fechamento do dia completos.
4. **Dashboard** mostra mês + Gestão avançada (Pacote F) sem repetir fechamento linha a linha do Caixa.
5. Regressão readonly verde.

### Arquivos prováveis

- `index.html` (Home, hub admin, CSS `#admin-home-kpis`, `atualizarHubAdmin_`, `renderCharts`)
- `mk-design.css` (ajustes Home admin)
- `ESTADO_ATUAL.md`

### Rollback

- Reverter commit FE; sem reimplantar GAS.

---

## 7. Pacotes seguintes (visão)

### Pacote G — Portal responsável

- Redesign `acompanhar.html` com `mk-design.css` / tema Movi Kids.
- QR deep link, máscara telefone, mensagens de erro claras.
- `safe-area`, `theme-color`, timer com barra de progresso.
- Rate limit GAS (T5).

### Pacote H — Config amigável

- Editor visual veículos (lista) + preços (formulário por tipo/plano).
- Preview “como ficará na Nova locação” antes de salvar.
- Validação schema (T6).

### Pacote J — Travas CI

- `scripts/pre-push-check.ps1`: versões + paridade + regressão readonly.
- Guard POST no `api()` do browser.

---

## 8. O que permanece pausado

| Item | Motivo |
|------|--------|
| Fase 9 supervisor | Operadores precisam autonomia total no balcão |
| F4 WhatsApp completo | Após saneamento gestão + portal |
| Validação F8 em produção | Após Pacote H (editor amigável) |

---

## 9. Próximo passo imediato

**Pacote I concluído** (FE v1.7.40). **Iniciar Pacote G** — portal responsável:

1. Redesign `acompanhar.html` com marca Movi Kids.
2. QR deep link + mobile.
3. Checklist tablet Pacote I (operador Home sem R$).

---

*Documento vivo — atualizar ao fechar cada pacote (I → G → H → J).*
