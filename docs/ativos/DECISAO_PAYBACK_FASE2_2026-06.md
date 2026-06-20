# Decisões FASE 2 — Payback e relatório Golden

**Data:** 08/06/2026  
**Referência:** `MEMORIAL_PAYBACK_INVESTIMENTO.md` §10

---

## Payback — respostas do sócio

| # | Pergunta | Decisão |
|---|----------|---------|
| 1 | Valor total de **I** e lista de itens | **Fonte canônica:** aba **INVESTIMENTO** na planilha (itens linha 11+; total ~R$ 65.410). Detalhar/ajustar itens na planilha, não no código. |
| 2 | Capital de giro entra no investimento? | **Sim** — marcar linhas com coluna **Entra = S** na aba INVESTIMENTO. |
| 3 | Payback desde maio/2026 ou abertura abr/2026? | **Datas da planilha** (aditivo alterou inauguração): **B3** = `27/05/2026` · **B4** = `05/2026`. CTO continua pelo aniversário contratual (`CONTRATO_CTO_REFERENCIA.md`). |
| 4 | Confete ou badge discreto ao atingir payback? | **Badge discreto** — já implementado (`payback-pill is-done` no Dashboard; sem confete). |
| 5 | PDF mensal com seção Payback? | **Não** — payback só no Dashboard admin interno. |

---

## Relatório mensal Golden Shopping

**GAS v1.5.68** — `_gerarHtmlRelatorio_(refDate, 'golden')` (padrão em email, PDF Drive e preview).

### Inclui (shopping)

- Faturamento bruto, locações, ticket médio
- Movimentação por tipo (Carro / Triciclo / Pelúcia) e por plano
- Extensões de tempo (receita adicional ao cliente)
- Horários de maior movimento
- **CTO** — mês de contrato, mínimo, 10%, valor a pagar, vencimento

### Não inclui (ADM / lojista)

- Custos operacionais (aba CUSTOS)
- Resultado líquido / lucro do lojista
- Pacote F (operador, cancelamentos, recorrência, custos por categoria)
- Payback / investimento

**Destinatário email:** `financeiro@goldenshoppingcalhau.com.br` (inalterado).

**Análise interna:** `criarAnalise_` (aba Análise na planilha) permanece só para admin.

---

## Deploy (regra de ouro)

**v1.5.69 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

| O quê | Link |
|--------|------|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping (v1.5.69)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |

**Status 08/06/2026:** ✅ deploy concluído — ping `v1.5.69`.

Guia: `../arquivo/deploy/DEPLOY_v1.5.69_GOLDEN_RELATORIO.md`
