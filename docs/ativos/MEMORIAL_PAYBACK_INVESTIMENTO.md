# Memorial de cálculo — Payback do investimento (Movi Kids)

**Versão:** 1.0 · **Data:** 06/06/2026  
**Escopo:** Dashboard admin (`index.html`) + GAS `buscarKPIsAdmin_`  
**Referências:** `CONTRATO_CTO_REFERENCIA.md`, abas `LOCACOES`, `CUSTOS`, `CONFIG`

---

## 1. Objetivo

Responder, com números rastreáveis:

1. Quanto do **investimento inicial** já foi recuperado pelo negócio.
2. Em quantos **meses** o investimento se paga (real e projetado).
3. Qual a **data prevista** de payback, se a operação continuar no ritmo atual.

> Payback mede recuperação do **capital investido**, não o faturamento bruto.

---

## 2. Definições

| Termo | Significado |
|-------|-------------|
| **Investimento (I)** | CAPEX + desembolsos iniciais únicos para abrir e equipar a operação (ver §3). |
| **Faturamento (F_m)** | Soma de `valorTotal` (col. K) de locações **Encerrada** no mês *m*. |
| **Custos operacionais (C_m)** | Soma de `valor` (col. F) na aba **CUSTOS** no mês *m*. |
| **CTO (T_m)** | `max(ctoMínimo do mês contrato, 10% × F_m)` — regra Golden Shopping. |
| **Resultado líquido mensal (R_m)** | `F_m − C_m − T_m` — já exposto no Dashboard como **Resultado líquido**. |
| **Resultado acumulado (A_t)** | `Σ R_m` desde o mês de início da operação até o mês *t*. |
| **Payback** | Primeiro mês *t* em que `A_t ≥ I`. |

---

## 3. Composição do investimento (I)

**Planilha para preencher:** aba **INVESTIMENTO** em [MOVIKIDS_Planilha_Base](https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit)  
Espelho em markdown: [`INVESTIMENTO_PAYBACK_TABELA.md`](INVESTIMENTO_PAYBACK_TABELA.md)

Recriar estrutura da aba: `node scripts/criar-aba-investimento-movikids.js` (em `google-drive-sheets-auth`).

**Fórmula:**

```
I = Σ valor dos itens cadastrados em investimento_json
```

**Não entram em I** (são OPEX, já em C_m ou T_m):

- Aluguel CTO mensal  
- Salários, energia, marketing recorrente  
- Manutenção corrente  
- SMS / custos variáveis do dia a dia  

---

## 4. Mês de início da operação

| Campo | Valor sugerido | Uso |
|-------|----------------|-----|
| `data_inauguracao` (B3) | **27/05/2026** | Planilha INVESTIMENTO — aditivo (não data do contrato original) |
| `mes_inicio_payback` (B4) | **05/2026** | Primeiro mês com receita real para acumular R_m |

Regra: o acumulado **só soma meses ≥ mes_inicio_payback** com pelo menos 1 locação Encerrada (ou, alternativa conservadora, meses com `R_m` calculado, mesmo negativo).

---

## 5. Fórmulas (memorial)

### 5.1 Resultado mensal (já existente)

Para cada mês *m* (mm/aaaa):

```
F_m  = Σ valorTotal     | LOCACOES, status = Encerrada, data no mês m
C_m  = Σ valor          | CUSTOS, data no mês m
T_m  = max(ctoMinimo_(mesContrato(m)), 0,10 × F_m)
R_m  = F_m − C_m − T_m
```

> `mesContrato(m)` usa aniversário do contrato (29/04/2026), não calendário civil — igual ao bloco CTO.

### 5.2 Resultado acumulado

```
A_t = Σ R_m   para m = mes_inicio … mes_t
```

### 5.3 Percentual recuperado

```
% recuperado = min(100, A_t / I × 100)     se I > 0
```

### 5.4 Payback simples (estático)

Média dos meses já operados com `d` dias de movimento:

```
R̄ = (Σ R_m) / n_meses_operados
Payback_estático (meses) = I / R̄        se R̄ > 0
```

Exibição: *“No ritmo médio atual, payback em ~X meses”*.

### 5.5 Payback dinâmico (real)

```
paybackAtingido = (A_t ≥ I)
mesesDecorridos = n_meses desde mes_inicio até hoje
mesesRestantes_real = null se paybackAtingido; senão estimativa via §5.6
```

### 5.6 Payback projetado

Usa a **projeção do mês corrente** (`projecaoRes`) como proxy do próximo R_m:

```
R_proj = projecaoRes do mês atual (GAS v1.5.4+)
Se R̄ > 0 (média histórica):
  mesesRestantes = ceil((I − A_t) / R̄)
  dataPrevistaPayback = hoje + mesesRestantes (em meses civis)
```

Se `R_m` médio ≤ 0: exibir *“Payback indefinido no ritmo atual”*.

### 5.7 Cenário com faturamento do ano

O KPI **Faturamento do ano** (`fatAno`) **não** entra no payback — é receita bruta, sem custos nem CTO.

---

## 6. Fonte de dados no sistema

| Dado | Origem hoje | Payback |
|------|-------------|---------|
| F_m, F ano | `LOCACOES` via `buscarKPIsAdmin_` | Sim |
| C_m | `CUSTOS` via `buscarKPIsAdmin_` | Sim |
| T_m, ctoMinimo | `CONTRATO_INICIO` + regras GAS | Sim |
| R_m, resultado | Calculado no GAS | Sim |
| I, itens | **A criar** em CONFIG | Sim |
| A_t histórico | **A criar** — loop multi-mês no GAS | Sim |

---

## 7. Onde fica no Dashboard (decisão)

### Posição recomendada

**Novo painel entre o bloco CTO e “Receita por semana”.**

```
[KPIs 5 cards]
[CTO — Golden Shopping]          ← custo fixo variável do shopping
[Payback do investimento]        ← NOVO — visão estratégica do sócio
[Receita por semana]
[Projeção do mês]
…
```

**Por quê aqui:**

- Payback é decisão de **sócio/investidor**, no mesmo nível do CTO (não é KPI operacional do dia).
- Fica **abaixo do resultado líquido** (KPI) e **abaixo do CTO** (maior custo fixo), mostrando quanto sobra para devolver o capital.
- Não compete com os 5 cards do topo (já densos).
- Não mistura com “Gestão avançada” (operador, frota) — payback é financeiro estratégico.

### Conteúdo do painel (UI)

| Elemento | Exemplo |
|----------|---------|
| Título | Payback do investimento |
| Barra de progresso | 42% recuperado |
| Valores | Investimento R$ … · Acumulado R$ … · Falta R$ … |
| Leitura | Payback previsto: nov/2026 (~5 meses) |
| Status | ✅ Atingido em … / ⏳ Em andamento |
| Link | “Ver memorial” → este arquivo ou modal resumido |

### Comportamento do seletor de mês

- **Payback:** sempre **acumulado desde a inauguração até o fim do mês selecionado** (ou até hoje se mês = corrente).
- KPIs do topo continuam filtrados pelo mês escolhido.
- Subtexto: *“Acumulado até jun/2026”* para evitar confusão.

### O que não fazer

- Não colocar payback como 6º card KPI (quebra grid mobile).
- Não usar `fatAno` no numerador do payback.
- Não editar investimento no Dashboard — só em CONFIG/admin (evita alteração acidental).

---

## 8. Implementação técnica (próximo passo)

### 8.1 Aba INVESTIMENTO (planilha)

| Célula / área | Conteúdo |
|---------------|----------|
| B3 | Data de inauguração |
| B4 | Mês início payback (mm/aaaa) |
| B6 | **INVESTIMENTO TOTAL (I)** — fórmula |
| Linha 9 | Cabeçalho (#, Categoria, Item, Valor, Entra?, Observação) |
| Linha 11+ | Itens (36 linhas pré-cadastradas) |
| Abaixo dos itens | Subtotais Frota / Loja / Tecnologia / Abertura |

### 8.2 GAS — `buscarKPIsAdmin_` (campos novos)

```javascript
payback: {
  investimentoTotal,
  resultadoAcumulado,
  pctRecuperado,
  faltaRecuperar,
  paybackAtingido,
  mesesOperados,
  mediaResultadoMensal,
  mesesRestantesEstimados,
  dataPrevistaPayback,   // ISO ou dd/mm/aaaa
  acumuladoAteLabel,     // "jun/2026"
  itensInvestimento      // espelho do JSON
}
```

Função auxiliar sugerida: `calcPaybackAcumulado_(mesFim, anoFim)`.

### 8.3 Frontend — `index.html`

- Bloco `.payback-strip` espelhando `.cto-strip`
- Preencher em `renderDashboardKPIs_` / equivalente
- Modal ou `title` com fórmula resumida

---

## 9. Exemplo numérico (ilustrativo)

| Parâmetro | Valor |
|-----------|-------|
| I (investimento) | R$ 25.000 |
| Maio/2026 R_m | R$ 800 |
| Jun/2026 R_m (parcial + projeção) | R$ 1.200 |
| A_jun | R$ 2.000 |
| % recuperado | 8% |
| R̄ (2 meses) | R$ 1.000 |
| Payback estático | 25 meses |
| Falta | R$ 23.000 |

*(Substituir por valores reais quando CONFIG estiver preenchido.)*

---

## 10. Perguntas para fechar com o sócio — **RESPONDIDAS 08/06/2026**

Ver decisões completas: **`DECISAO_PAYBACK_FASE2_2026-06.md`**

1. **Valor total de I** e lista de itens → **Aba INVESTIMENTO** (planilha); total e itens linha 11+.  
2. **Capital de giro** → **Sim**, entra (coluna Entra = S).  
3. Início payback → **Planilha** — B3 `27/05/2026`, B4 `05/2026` (aditivo; não usar data do contrato original).  
4. Payback atingido → **Badge discreto** (sem confete).  
5. PDF mensal Golden → **Não** incluir Payback (só Dashboard admin).

---

## 11. Referência cruzada

- CTO: `CONTRATO_CTO_REFERENCIA.md`  
- Resultado mensal: `buscarKPIsAdmin_` → `resultado`, `margem`, `projecaoRes`  
- Custos: aba `CUSTOS`, categorias no Pacote F  
