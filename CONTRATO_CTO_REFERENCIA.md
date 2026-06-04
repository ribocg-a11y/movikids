# CTO — referência do contrato (Golden Shopping Calhau)

Fonte: Quadro Resumo do contrato de locação + aditivo (D4Sign).

## Regra

| Meses de locação | Mínimo mensal | Alternativa |
|------------------|---------------|-------------|
| 1º e 2º | R$ 1.000,00 | 10% do faturamento bruto |
| 3º e 4º | R$ 1.300,00 | 10% |
| 5º e 6º | R$ 1.500,00 | 10% |
| 7º ao 12º | R$ 3.000,00 | 10% |

**Paga o maior** entre o mínimo do mês e 10% do faturamento do mês.

## No sistema (GAS v1.5.37+)

- `CONTRATO_INICIO` = 29/04/2026 (data de assinatura no instrumento).
- `mesContrato_()` = mês de locação por **aniversário** (dia da assinatura), não por mês de calendário.
- Em **04/06/2026** → **2º mês** → mínimo **R$ 1.000** (confere com contrato).
- Dashboard exibe `mesContrato`, `ctoMinimo` e valor calculado `ctoPagar`.

## Prazo

- 12 meses a partir da assinatura; término previsto **28/04/2027**.
- Inauguração prevista **09/05/2026**.
