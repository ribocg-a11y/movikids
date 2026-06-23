# Arquitetura — Caixa, pagamentos e conta do dia (I42)

**Data:** 22/06/2026 · **GAS:** v1.5.131+ · **FE:** v1.8.112+

## Problema que motivou

1. **Maquininha ≠ sistema** no fechamento — rótulos `Credito`/`Crédito` e `Debito`/`Débito` duplicavam buckets; PIX+crédito+débito não batiam com o terminal.
2. **Contagem inflada** — dois brinquedos/pelúcias do mesmo pai geravam **2 locações** no caixa, mas **1 pagamento** na maquininha.
3. **Retorno no mesmo dia** — pai volta horas depois; operação quer **novo card/timer**, mas **mesma conta** para meta e fechamento.

## Regra de negócio (conta do dia)

| Conceito | Definição |
|----------|-----------|
| **Sessão** | 1 linha na aba LOCACOES (1 veículo/brinquedo, 1 timer) |
| **Conta** | 1 cobrança do responsável no dia — chave **telefone** |
| **Janela** | Mesmo dia civil, horário **10h–22h** |
| **conta_id** (col S) | ID da locação-mestre do grupo; filhas apontam para a mestre |

**Agrupa quando:** mesmo telefone, mesma data, hora de abertura dentro de 10h–22h, status ≠ Cancelada.

**Não agrupa quando:** antes das 10h, após 22h, ou dia seguinte → nova `conta_id` (= id da nova linha).

**Operação:** vários cards na Home (ocupação/tempo). **Caixa/meta:** `n` = contas únicas; `nSessoes` = linhas encerradas.

## Fluxo de pagamento

```
Nova locação (mk-nova.js)
  → salvarLocacao (GET)
  → normalizarPagamento_ (PIX | Crédito | Débito | Dinheiro)
  → findContaMestreParaNovaLoc_ (telefone + dia + janela)
  → col Q herdada da mestre se mesma conta
  → col S = conta_id

Encerrar (mk-home / mk-operacao)
  → encerrarLocacao
  → syncPagamentoContaMestre_ (filha herda pagamento da mestre)
  → valorTotal por sessão (soma no caixa)

Caixa (mk-admin.js → resumoDia)
  → calcResumoDiaCore_
  → agregarCaixaPorConta_
  → totalMaq = PIX + Crédito + Débito (por conta-mestre)
  → totalDin = Dinheiro
  → fat = soma de todas as sessões (receita real)
```

**Maquininha:** tudo que passa no terminal (PIX, crédito, débito) → `totalMaq`. **Dinheiro** à parte.

Não há integração API com a Stone/Cielo — conferência é manual: somar os 3 meios eletrônicos do sistema e comparar com o relatório da maquininha.

## Onde está no código

| Camada | Arquivo | Funções |
|--------|---------|---------|
| GAS | `MOVIKIDS_Code_v1.5.32_...gs` | `normalizarPagamento_`, `findContaMestreParaNovaLoc_`, `agregarCaixaPorConta_`, `calcResumoDiaCore_`, `buildKpiMesPayload_` |
| Planilha | LOCACOES col Q (pagamento), col S (conta_id) | |
| FE balcão | `mk-nova.js`, `mk-operacao.js` | cadastro, troca pagamento |
| FE admin | `mk-admin.js` | `renderCaixaFromResumo_`, KPI `n` contas |

## Dados legados

Linhas sem col S: `contaIdLocRow_` usa o próprio `id` → cada linha = 1 conta (comportamento antigo). Opcional: script de backfill por telefone/dia.

## Homologação

1. Mesmo telefone, 2 veículos no mesmo dia → caixa mostra **1 locação (2 sessões)**.
2. Maquininha: um pagamento PIX → `totalMaq` inclui valor das duas sessões.
3. Retorno às 15h após encerrar às 11h → novo card, **mesmo** `n` no caixa.
4. Após 22h ou dia seguinte → **nova** conta no contador.

## Deploy

- **FE:** commit + push GitHub Pages.
- **GAS:** `prepare-gas-push.ps1` (com pedido) + **Nova versão Web** no deploy `AKfycbwakQ...` (sócio).
