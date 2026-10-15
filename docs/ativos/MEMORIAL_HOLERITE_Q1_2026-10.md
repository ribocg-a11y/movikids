# Memorial de cálculo — 1ª quinzena 10/2026 (pagamento 15/10/2026)

**Status:** a pagar hoje · **não** copiar o PIX do holerite do app (diverge no bônus)  
**Fonte:** GAS ping **v1.5.234** `painelGestaoPessoasAdmin` + `metaOperadorTurno` (15/10 ~11h) · salário/VA/INSS do `gpCalcHollerite_` · bônus **recalculado na regra humana** (I109 + Karen no FSS; Jennifer sem meta)  
**VT:** já pago por fora (semanal) — **R$ 0,00 no PIX** (I138)

Competência **10/2026**. A 2ª quinzena (salário 60% − adiantamento − encargos + resto do bônus) só fecha em **31/10**. Este memorial é o **adiantamento da 1ª**. Se o PIX da 1ª já saiu hoje, use a coluna “PIX memorial” só para conferir — **não pague de novo**.

## Quem entra neste PIX

| Pessoa | Id | Admissão | Loja / papel | Meta |
|--------|----|----------|--------------|------|
| Raykelly | 3 | 15/06/2026 | Golden · CLT · escala FSS + alguns dias de semana | Sim |
| Karen | 5 | 22/09/2026 | Golden · freelancer FSS (diária) | Sim (pote FSS com Raykelly) |
| Jennifer | 6 | **06/10/2026** | La Ville · 1º mês | **Não** (zerar bônus) |

## Regras aplicadas (desde o início)

| ID | Regra | Neste PIX |
|----|--------|-----------|
| Salário mínimo | R$ **1.621,00**/mês | Base |
| 1ª quinzena | **40%** do salário proporcional · **sem** INSS/IRRF/faltas/desc. VT 6% | I108 / I110 |
| 2ª quinzena | 60% − adiantamento 40% − INSS − desc. VT 6% | só em 31/10 |
| VA PAT | R$ **400**/mês × fator admissão × **50%** na 1ª (cartão, não PIX) | I108 |
| **I138** | Transporte **já pago na semana** | linha VT = 0 |
| **I109** | FSS com as duas no turno: pote R$ 100 → **R$ 50 cada** se a meta do dia fecha (eu **ou** a outra **ou** soma > 20) | Raykelly + **Karen** (Julia fora) |
| Sozinha | n > 20 locações no turno → R$ **100** | nenhum dia 1–14 |
| **Jennifer** | não entra no pote de meta | bônus **R$ 0** |
| **I39** | Admissão no mês: salário e VA = contratual × (dias até o fim do mês ÷ dias do mês), depois aplica 40%/50% | Jennifer 26/31 |
| **I141** | Na 2ª, bônus = ganho no **mês** − o que **saiu no PIX da 1ª** (nunca 50% do mês final) | gravar Q1 abaixo |

Motor no repo **v1.5.235 (I181):** par **Raykelly↔Karen** (3↔5); Julia pausa; Jennifer sem meta. **Web produção ainda v1.5.234** até Nova versão. Até lá o FE **v1.9.171** cobre o PIX de outubro.

## Bônus 01–14/10 — 4 dias FSS × R$ 50 = R$ 200 cada

Meta do dia: **> 20** locações no turno. Fonte: `metaOperadorTurno` Raykelly (loc do dia). Karen no FSS (sexo informado: sex–dom). Nenhuma das duas bateu meta **sozinha em dia de semana** neste recorte.

| Data | Dia | Loc Raykelly | Tipo | Cada uma |
|------|-----|--------------|------|----------|
| 03/10/2026 | sáb | 21 | juntas FSS · pote 100 | **50** |
| 04/10/2026 | dom | 23 | juntas FSS · pote 100 | **50** |
| 10/10/2026 | sáb | 21 | juntas FSS · pote 100 | **50** |
| 11/10/2026 | dom | 43 | juntas FSS · pote 100 | **50** |
| **Total 1–14** | **4 dias** | | **0 dia de R$ 100** · **4 dias de R$ 50** | **R$ 200** |

Na 1ª sai **50%** do bônus já ganho no mês (I108): **R$ 100** cada. Resto **R$ 100** + o que ainda fechar de 15–31/10 vai para a 2ª (I141).

Jennifer 12/10 teve 22 locações no GAS (R$ 100) — **não pagar**.

## Pagar agora (15/10/2026)

| | Raykelly | Karen | Jennifer |
|--|----------|-------|----------|
| Adiantamento 40% salário | 648,40 | 648,40 | **543,82** |
| Bônus 1ª (50% de 200) | **100,00** | **100,00** | **0,00** |
| **PIX hoje** | **748,40** | **748,40** | **543,82** |
| VA cartão PAT | 200,00 | 200,00 | 167,74 |
| VT no PIX | 0,00 | 0,00 | 0,00 |
| Pacote (PIX+VA) | 948,40 | 948,40 | 711,56 |

Soma PIX: **R$ 2.040,62**. Soma VA cartão: **R$ 567,74**.

### Jennifer — proporcional admissão 06/10/2026

Outubro tem 31 dias · trabalha **26/31** (06/10 a 31/10). Q1 calendar 06–14 = 9 dias, mas o fator do mês é o da admissão até o **fim do mês** (I39), depois 40%.

| Linha | Conta | Valor |
|-------|--------|-------|
| Salário contratual | 1.621,00 | |
| Fator | 26/31 = 0,8387 | |
| Salário proporcional do mês | 1.621 × 26/31 | 1.359,55 |
| Adiantamento 1ª (40%) | 1.359,55 × 0,40 | **543,82** |
| VA mês | 400 × 26/31 | 335,48 |
| VA 1ª (50%) | 335,48 × 0,50 | **167,74** |
| Bônus | regra: não ganha meta | **0,00** |
| VT | já semanal | **0,00** |
| **PIX** | só adiantamento | **543,82** |

Raykelly e Karen: mês cheio (admissão anterior a 01/10). 1.621 × 40% = **648,40**. VA 400 × 50% = **200,00**.

## Linha a linha — 1ª (o que o PIX deve ser)

| Cód | Linha | Raykelly | Karen | Jennifer |
|-----|-------|----------|-------|----------|
| 101 | Adiantamento 40% | 648,40 | 648,40 | 543,82 |
| | Bônus meta (cesta) | 100,00 | 100,00 | 0,00 |
| 502 | VT passes | 0,00 | 0,00 | 0,00 |
| | INSS / IRRF / desc. VT 6% / faltas | 0,00 | 0,00 | 0,00 |
| | **PIX 15/10** | **748,40** | **748,40** | **543,82** |
| VA | Cartão PAT | 200,00 | 200,00 | 167,74 |
| FGTS 8% | Encargo empresa (não PIX) | — na 2ª | — na 2ª | — na 2ª |

## Holerite do app × memorial (não está igual)

Snapshot GAS 15/10/2026 `folha` competência 10/2026 · quinzena **1** · pgto **15/10/2026**.

| | Holerite PIX | Memorial PIX | Diferença | Por quê |
|--|--------------|--------------|-----------|---------|
| Raykelly | 848,40 (648,40+**200**) | **748,40** | app **+100** | App: 4×R$100 = 400 × 50% = 200. Memorial: 4×R$50 = 200 × 50% = 100 |
| Karen | 648,40 (sem bônus) | **748,40** | app **−100** | Escala vazia + par Julia; app não conta o FSS com Raykelly |
| Jennifer | 593,82 (543,82+**50**) | **543,82** | app **+50** | App deu 50% de R$100 do dia 12/10; ela **não** ganha meta |

Salário, VA, VT=0 e proporcional da Jennifer **batem** com o holerite. Só o **bônus** está errado no app. Pagar pelo memorial.

## O que a 2ª vai precisar (não pagar hoje)

- Salário 60% − 40% já pago − INSS − desc. VT 6% (folha, não o passe).
- Bônus resto = (ganho no mês até 31/10) − **100** já no PIX da 1ª (Raykelly e Karen).
- Jennifer: resto do salário proporcional − 543,82 − encargos; bônus continua 0.
- VT continua **fora** do PIX.

## Já pago fora deste PIX

- Transporte (passes) de cada semana — não somar.
- 1ª e 2ª de **setembro** (pacote 09/2026 já gerado em 03/10). Este memorial é **outubro**.
