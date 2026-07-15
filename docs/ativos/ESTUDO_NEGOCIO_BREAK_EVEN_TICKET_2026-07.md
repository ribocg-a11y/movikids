# ESTUDO DO NEGÓCIO — Break-even, custos fixos e ticket (MOVI KIDS)

**Criado:** 15/07/2026 · **Atualizado:** 15/07/2026  
**Status:** ✅ **documento vivo** (era dívida desde o início do negócio)  
**Fonte de dados:** produção GAS **v1.5.196** · `kpiMes` julho/2026 · FOLHA B68 · CTO contrato  
**Dashboard:** gráfico *Meta de locações — dia a dia* (`#chart-meta-dia`)

---

## 0. O que já existia × o que faltava

| Já no sistema / docs | Gap (esta peça) |
|----------------------|-----------------|
| FASE 9 folha + `viabilidadeContratacao` | Estudo **único** legível pelo sócio |
| Leading break-even sem/com folha (Dashboard) | Como **ler** o gráfico + calendário (jogo, dia parcial) |
| Memorial FOLHA · CTO · Payback · mini-DRE | Comparativo **sábado × dia útil** (ticket / extra / R$) |
| CUSTOS categorias (Energia, Manutenção…) | **Diagnóstico:** o que ainda **não** está lançado (contadora, etc.) |

**Conclusão inventário:** não havia um “estudo do negócio” consolidado. Havia peças. **Este arquivo é a peça central.**

---

## 1. Como ler o gráfico (Meta sem folha / Meta com folha)

### O que as linhas significam (fato do produto)

| Linha | Valor jul/2026 | Pergunta de negócio |
|-------|---------------:|---------------------|
| **Meta sem folha** (verde ~2 loc) | **2** | “Hoje cobri CUSTOS + CTO, **sem** contar salário do time?” |
| **Meta com folha** (roxa ~10 loc) | **10** | “Hoje cobri CUSTOS + CTO + **folha mensal da aba FOLHA** rateada no dia?” |

**Fórmula (GAS `buildLeadingFinanceiros_`):**

```
ticketMedio     = fatMes / nMes
custoDiaSemFolha = (cusMes + ctoPagar) / diasMes
custoDiaComFolha = (cusMes + ctoPagar + folhaMensal) / diasMes
breakEvenSem     = ceil(custoDiaSemFolha / ticket)
breakEvenComFolha= ceil(custoDiaComFolha / ticket)
```

**Julho/2026 (produção 15/07):**

| Campo | Valor |
|-------|------:|
| Faturamento mês (até 15) | **R$ 7.467,00** |
| Locações mês | **330** |
| Ticket médio | **R$ 22,63** |
| Extras mês | **R$ 375,00** (50 locs com extra · ~5% do fat) |
| CUSTOS (aba) | **R$ 100,80** (só **Energia**) |
| CTO a pagar | **R$ 1.300** (3º mês contrato · mínimo) |
| Folha B68 | **R$ 5.253,96** |
| BE sem folha | **2 loc/dia** |
| BE com folha | **10 loc/dia** |
| Resultado sem folha (até hoje) | **R$ 6.066** · margem **81%** |
| Viabilidade CLT | **verde** · 6/6 gates · proj. c/ folha ~R$ 8.534 |

### Fatos × interpretações do gráfico 01–15/07

| Dia | Loc | Fato | Interpretação correta |
|-----|----:|------|------------------------|
| **04/07** sáb | 41 | Pico | Demanda de lazer no fim de semana |
| **05/07** dom | 4 | Fechou cedo — **jogo do Brasil** | **Exceção** · não é domingo padrão |
| **11/07** sáb | 40 | 2º pico | Confirma padrão semanal |
| **12/07** dom | 33 | Domingo **forte** | Domingo sem evento pode ser ótimo |
| **15/07** qua | 5* | Print com dia **em curso** | **Não julgar** até fechar o caixa |

\* dado incompleto na medição da tarde.

---

## 2. Resposta direta — Sábado ~40 loc vs dia útil ~20 loc

### Fato (dados produção)

| Dia | Tipo | Loc | Fat (R$) | Extra (R$) | Ticket (R$/loc) | Extra % fat |
|-----|------|----:|---------:|-----------:|----------------:|------------:|
| **04/07** | **Sábado** | **41** | **806,80** | 18,80 | **19,68** | 2,3% |
| **11/07** | **Sábado** | **40** | **824,00** | 11,00 | **20,60** | 1,3% |
| **03/07** | Sexta (~20) | 20 | 423,00 | 25,00 | 21,15 | 5,9% |
| **08/07** | Quarta (~23) | 23 | 518,80 | **70,80** | **22,56** | **13,6%** |

### Agregados 01–14/07 (exclui 15 parcial)

| Grupo | Loc/dia | Fat/dia | Ticket | Extra % |
|-------|--------:|--------:|-------:|--------:|
| **Sábados** (2) | **40,5** | **R$ 815** | **R$ 20,13** | **1,8%** |
| **Dias úteis** (10) | **20,7** | **R$ 488** | **R$ 23,56** | **7,1%** |
| Quartas fechadas (2) | 21,0 | R$ 511 | **R$ 24,35** | **19,7%** |

### Diagnóstico (o que isso diz)

1. **Sábado ganha em volume e em R$ do dia** (~R$ 815 vs ~R$ 488) — ~**1,7×** faturamento.
2. **Sábado NÃO tem ticket maior** — ticket sábado (**~R$ 20**) é **menor** que dia útil (**~R$ 23,50**).
3. **Extra pesa mais no meio da semana** (quartas chegaram a **13–20%** do fat; sábados **~2%**).
4. Em uma frase: **sábado = muitas locações um pouco mais baratas; quarta = menos locações, mais tempo extra / ticket maior.**
5. Estratégia: no sábado **empurrar volume + plano**; no dia útil **oferecer / facilitar extra e planos melhores** (já acontece naturalmente).

---

## 3. Contas fixas — o que entra hoje no break-even

### Mapa obrigatório

| Conta fixa | Onde deveria viver | No sistema agora (jul/2026) | Entra no BE Dashboard? |
|------------|--------------------|-----------------------------|------------------------|
| **Aluguel shopping (CTO)** | Contrato + `ctoPagar` | ✅ **R$ 1.300** (mín. 3º mês) ou 10% fat | ✅ sim (`ctoPagar`) |
| **Salários + encargos + VA/VT** | Aba **FOLHA** B68 | ✅ **R$ 5.253,96** | ✅ só na meta **com folha** |
| **Energia** | Aba **CUSTOS** | ✅ **R$ 100,80** | ✅ sim (`cusMes`) |
| **Manutenção** | CUSTOS cat. Manutenção | ⚠️ **0 em julho** | se lançar, sim |
| **Contadora / honorários** | CUSTOS cat. Outros/Serviços | ❌ **não lançado** | **não** (meta está **otimista**) |
| **Material / insumos** | CUSTOS | ⚠️ 0 em julho | se lançar, sim |
| **SMS / sistemas** | CUSTOS (se houver) | ⚠️ não visto | se lançar, sim |

### Alerta P0 de governança financeira

> O break-even de **10 loc/dia “com folha”** usa só **FOLHA + CTO + o que está em CUSTOS**.  
> Se **contadora, manutenção recorrente e outros fixos** não estão na aba CUSTOS, a meta roxa está **subestimando** o custo real do dia.

**Ação sócio (urgente):** lançar todo mês, na aba CUSTOS:

| Descrição sugerida | Categoria | Valor (preencher) |
|--------------------|-----------|-------------------|
| Honorários contábeis | Outros | R$ ____ |
| Manutenção preventiva / corretiva | Manutenção | R$ ____ |
| Material operacional | Material | R$ ____ |
| Outros fixos | Outros | R$ ____ |

Após lançar, o Dashboard **recalcula sozinho** BE sem/com folha.

### Simulação — se entrar fixos faltantes (exemplo)

Supondo +**R$ 800/mês** (ex.: contadora 400 + manutenção 200 + outros 200), ticket 22,63, 31 dias:

| Cenário | Custo/dia | BE loc/dia |
|---------|----------:|-----------:|
| Atual (CUS 100,80 + CTO 1.300) | 45,19 | **2** |
| Atual + folha | 214,67 | **10** |
| +R$ 800 fixos (sem folha) | 71,00 | **4** |
| +R$ 800 + folha | 240,45 | **11** |

*(Substituir R$ 800 pelos valores reais da contadora/manutenção.)*

---

## 4. Diagnóstico do negócio (15/07/2026)

### O que é fato

- Operação **gera caixa**: resultado sem folha ~**R$ 6.066** em 15 dias · margem alta.
- Meta mínima (2 loc) **sempre** batida nos dias completos.
- Meta com folha (10) falhou só em casos especiais (jogo / dia parcial) — padrão saudável.
- Padrão semanal: **sábado ~40 loc / ~R$ 815**; dias úteis ~**21 loc / ~R$ 490**.
- Domingo **pode** ser forte (12/07: 33 loc / R$ 819) ou colapsar por evento (05/07).
- Payback: I **R$ 69.410** · recuperado **~24%** · previsão ~**11/2026** (ritmo atual).
- Viabilidade CLT: **verde**.

### O que o negócio “é”

> Locação infantil de shopping com **pico de fim de semana**, ticket estável (~R$ 20–24), margem operacional alta **enquanto CUSTOS estiverem incompletos**, e folha (= maior custo fixo) coberta na maioria dos dias de volume normal.

### Riscos

1. CUSTOS incompletos → sensação de lucro **maior** que a realidade.  
2. Dependência de sábado (~22% do fat dos 14 dias veio de **2 sábados**).  
3. Domingo/eventos: horário e escala precisam de playbook.  
4. Folha (R$ 5.254) >> CUSTOS lançados (R$ 101) — decisão de gente é o centro do custo.

---

## 5. Estratégias (priorizadas)

| # | Estratégia | Por quê | Como medir |
|---|------------|---------|------------|
| **1** | Completar CUSTOS fixos todo mês | BE e lucro ficam honestos | Meta com folha sobe se precisar |
| **2** | Escala e estoque mental **sábado** | 1,7× fat/dia | n e fat sábado ≥ 35 loc / R$ 700 |
| **3** | Playbook **dia útil + extra** | Ticket e %extra já são maiores | %extra dia útil ≥ 7% |
| **4** | Domingo: meta própria (não = sábado) | Evita decisão errada | Separar KPI dom no Dashboard (roadmap) |
| **5** | Eventos (jogo / feriado): fechar cedo = custo aceito | 05/07 explicado | Tag “evento” no calendário Ops |
| **6** | Não cortar time por 1 vale | Folha é fixa; volume volta | Olhar média 7 dias, não 1 ponto |
| **7** | Quinzena holerite alinhada a caixa | Já I108–I114 | Pacote Q1 com VT já pago |

---

## 6. Como atualizar este estudo

```powershell
# Produção
$base='https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec'
Invoke-RestMethod "$base?action=kpiMes&adminPin=1421&lite=1&mes=7&ano=2026"
```

No Dashboard: **KPIs → Meta dia a dia** + painel **Decisão** (sem/com folha) + **Viabilidade CLT**.

**Periodicidade:** no fechamento de cada mês (ou quinzena) — anexar tabela dia a dia e ticket sábado vs útil.

---

## 7. Referências

| Doc | Papel |
|-----|-------|
| Este arquivo | **Estudo central do negócio** |
| `FASE_9_FOLHA_VIABILIDADE_CLT.md` | Gates contratação |
| `FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md` | Memorial salários/encargos |
| `CONTRATO_CTO_REFERENCIA.md` | Aluguel shopping |
| `MEMORIAL_PAYBACK_INVESTIMENTO.md` | Recuperação CAPEX |
| `MEMORIAL_MINI_DRE.md` | Cascata P&L |
| `CHECKLIST_ABA_PLANILHA_CUSTOS.md` | Schema CUSTOS |
| Dashboard FE | Quebra-even ao vivo |

---

## 8. Tabela dia a dia (01–15/07/2026) — evidência

| Dia | Semana | Loc | Fat | Extra | Ticket | Nota |
|----:|--------|----:|----:|------:|-------:|------|
| 1 | Qua | 19 | 503,80 | 130,80 | 26,52 | Extra alto |
| 2 | Qui | 17 | 350,20 | 8,20 | 20,60 | |
| 3 | Sex | 20 | 423,00 | 25,00 | 21,15 | Dia ~20 loc |
| 4 | **Sáb** | **41** | **806,80** | 18,80 | **19,68** | Pico |
| 5 | Dom | 4 | 55,20 | 1,20 | 13,80 | **Jogo BR · fechou cedo** |
| 6 | Seg | 16 | 327,20 | 14,20 | 20,45 | |
| 7 | Ter | 28 | 530,80 | 35,80 | 18,96 | |
| 8 | Qua | 23 | 518,80 | **70,80** | **22,56** | Extra forte |
| 9 | Qui | 17 | 476,20 | 59,20 | 28,01 | Melhor ticket |
| 10 | Sex | 25 | 745,00 | 0,00 | 29,80 | Ticket alto s/ extra |
| 11 | **Sáb** | **40** | **824,00** | 11,00 | **20,60** | 2º pico |
| 12 | Dom | 33 | 819,00 | 0,00 | 24,82 | Domingo forte |
| 13 | Seg | 21 | 548,00 | 0,00 | 26,10 | |
| 14 | Ter | 21 | 453,00 | 0,00 | 21,57 | |
| 15 | Qua | 5* | 86,00* | 0* | — | **Parcial / em curso** |
