# Memorial holerite — 2ª quinzena 08/2026 (pagamento 31/08)

**Status:** cálculo para pagar hoje · **não** usar bônus 50% do GAS  
**Fonte:** GAS ping **v1.5.211** `gpCalcHollerite_` (salário/INSS/VA) · `metaOperadorTurno` 31/08 ~17h · memorial Q1 15/08 (`canvases/holerite-q1-2026-08.canvas.tsx`)

## Regras (não negociar na 2ª)

| ID | Regra |
|----|--------|
| **I141** | Bônus Q2 = ganho no **mês** − o que **já saiu no PIX da 1ª**. Nunca 50% do mês final. |
| **I109** | Sex/sáb/dom com Raykelly+Julia no turno: pote R$ 100 → **R$ 50 cada** se a meta fecha. |
| **I138** | **VT semanal já pago** — R$ 0,00 no PIX das duas quinzenas. |
| **I127** | 2ª = salário do mês − adiantamento 40% − INSS − desc. VT 6%. |

## Pagar agora — Raykelly e Julia (iguais)

| | Raykelly | Julia | Soma |
|--|----------|-------|------|
| **PIX 31/08** | **R$ 1.252,22** | **R$ 1.252,22** | **R$ 2.504,44** |
| VA cartão PAT | R$ 200,00 | R$ 200,00 | R$ 400,00 |
| VT no PIX | R$ 0,00 | R$ 0,00 | R$ 0,00 |
| Pacote (PIX+VA) | R$ 1.452,22 | R$ 1.452,22 | R$ 2.904,44 |

31/08: Raykelly 2 contas (sem bônus extra) · Julia folga.

## Já pago na 1ª (15/08)

Memorial da manhã de 15/08 — **6 dias** FSS até 14/08 (R$ 300 ganho → 50% = **R$ 150**). O sábado 15/08 ainda estava 0 naquele snapshot; fechou depois → vai para o resto da 2ª.

| Linha | Raykelly | Julia |
|-------|----------|-------|
| Adiantamento 40% | 648,40 | 648,40 |
| Bônus | 150,00 | 150,00 |
| **PIX 15/08** | **798,40** | **798,40** |
| VA cartão | 200,00 | 200,00 |
| Pacote 1ª | 998,40 | 998,40 |
| VT semanal (fora) | 96,80 | 96,80 |

## Linha a linha — 2ª (cada uma)

| Cód | Linha | Fórmula | Venc. | Desc. |
|-----|-------|---------|-------|-------|
| 101 | Salário 60% | 1.621 × 0,60 | 972,60 | |
| 410 | Adiantamento 1ª | já pago 15/08 | | 648,40 |
| 378 | INSS | 1.518×7,5% + 103×9% | | 123,12 |
| 403 | Desc. VT 6% | 1.621 × 6% (folha, não o passe) | | 97,26 |
| | IRRF | isento | | 0,00 |
| | Faltas | | | 0,00 |
| | Líquido salário | 972,60 − 123,12 − 97,26 | **752,22** | |
| | Bônus resto | 650 − 150 | **500,00** | |
| 502 | VT passes | já semanal | **0,00** | |
| | **PIX hoje** | 752,22 + 500 | **1.252,22** | |
| VA | Vale-alimentação | 400 × 50% | 200,00 | |

FGTS 8% = R$ 129,68 (empresa, não PIX).

## Bônus do mês — 13 × R$ 50 = R$ 650

Todas FSS, juntas na escala. Meta do dia fecha (eu **ou** parceira **ou** soma > 20).

| Data | Dia | Loc Ray | Loc Julia | Cada | Onde |
|------|-----|---------|-----------|------|------|
| 01/08 | Sáb | 25 | 26 | 50 | 1ª (metade paga) |
| 02/08 | Dom | 29 | 21 | 50 | 1ª |
| 07/08 | Sex | 26 | 0 | 50 | 1ª |
| 08/08 | Sáb | 22 | 53 | 50 | 1ª |
| 09/08 | Dom | 0 | 41 | 50 | 1ª |
| 14/08 | Sex | 0 | 21 | 50 | 1ª |
| 15/08 | Sáb | 32 | 23 | 50 | **2ª** (depois do PIX da 1ª) |
| 16/08 | Dom | 0 | 23 | 50 | 2ª |
| 21/08 | Sex | 0 | 26 | 50 | 2ª |
| 22/08 | Sáb | 35 | 0 | 50 | 2ª |
| 23/08 | Dom | 0 | 31 | 50 | 2ª |
| 29/08 | Sáb | 44 | 0 | 50 | 2ª |
| 30/08 | Dom | 51 | 0 | 50 | 2ª |
| **Total** | **13** | 331 | 367 | **650** | Q1 150 + Q2 500 |

Resto 500 = metade não paga dos 6 dias (150) + 15/08 inteiro (50) + 6 dias 16–30 (300).

## Conferência mês (uma pessoa)

| Rubrica | Q1 | Q2 | Soma |
|---------|-----|-----|------|
| Salário no PIX | 648,40 | 752,22 | 1.400,62 |
| VA | 200,00 | 200,00 | 400,00 |
| VT* fora | 96,80 | 96,80 | 193,60 |
| Bônus | 150,00 | 500,00 | 650,00 |
| PIX | 798,40 | 1.252,22 | 2.050,62 |
| Pacote | 998,40 | 1.452,22 | 2.450,62 |

## O que o GAS mostra (errado na 2ª)

`bonus` 325 (50% de 650) · `pixQuinzena` 1.077,22 · `pacoteQuinzena` 1.374,02 (inclui VT 96,80). **Ignorar.** I141 no FE só corrige se o memorial 08/2026 estiver em `mk-holerite.js` (`MK_HOL_Q1_PAGO_MEMORIAL_`).

## Milena Nunes (id 2)

Painel: bônus 0 · **faltas R$ 1.045,80** · líquido **−293,58**. Não pagar. São ~20 dias sem ponto no tablet, não faltas CLT. Ela **não** entrou no PIX de 15/08. Só pague salário/VA depois de conferir o ponto real.

## I141 para gravar no app (depois)

```
'08/2026': {
  3: { adianta: 648.4, bonus: 150, va: 200, pacote: 998.4 },
  4: { adianta: 648.4, bonus: 150, va: 200, pacote: 998.4 }
}
```
