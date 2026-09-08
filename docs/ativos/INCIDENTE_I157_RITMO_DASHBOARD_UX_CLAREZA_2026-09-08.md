# I157 — Dashboard: ritmo no meio das linhas confundia leitura

## Sintoma
Sócio via Real entre Base e Ritmo e texto “58% abaixo da base DRE” — contradizia o gráfico (real acima da laranja).

## Por quê
1. **Texto** comparava real com piso do **mês inteiro** (R$ 11k); **gráfico** mostra base **pro-rata até hoje**.
2. **Ritmo** não é meta: é “se todo dia fosse igual aos últimos 3 dias”. Acima do real = dias recentes quentes; abaixo do real no começo do mês é normal.
3. Linha de ritmo misturava ritmos históricos por dia (ainda mais confuso).

## Correção FE **v1.9.116**
- Hint + legendas claras
- Ritmo = reta do ritmo **atual** × dia
- Insight: primeiro “até hoje vs base pro-rata”, depois piso do mês / projetado
- Tooltip: “não é meta — é termômetro”

## Leitura correta (08/09 exemplo)
- Real R$ 4.624 **acima** da base pro-rata (~R$ 2.946) → bom ritmo vs piso
- Ritmo 3d (~R$ 782/dia) **acima** do real → últimos dias mais fortes que a média do mês
- Ainda falta caminho até o piso do **mês** (R$ 11.047) — outra pergunta

## I157b — balão do gráfico (08/09)

Tooltip empilhava 3 séries (~9 linhas). Agora **3 linhas**: Real · Base+Δ · Ritmo.
Números do print 8/09 conferidos: base 368×8=2944 · ritmo 786×8=6288 · Δ base +1690 · Δ ritmo −1649.

## I157c — tentativa triângulo (revertida)

Triângulo só em “hoje” confunde. Sócio pediu de volta **três linhas**.

## I157d — Base × Real × Ritmo (08/09)

Gráfico de novo com **3 linhas** (mockup I123 / I157):
- Real acumulado (azul)
- Base DRE pro-rata (laranja tracejada)
- Ritmo 3d = `ritmoDiaria × dia` (ciano tracejado) — termômetro, não meta

Tooltip compacto (3 linhas). FE **v1.9.119**.
