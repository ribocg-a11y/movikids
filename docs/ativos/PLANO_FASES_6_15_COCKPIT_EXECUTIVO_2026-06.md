# MOVI KIDS — Plano FASES 6–15 (Cockpit executivo, UX gestão e inteligência financeira)

**Data:** 09/06/2026  
**Origem:** benchmark MOVI KIDS × mercado moderno + framework KPIs rentabilidade (DRE, leading/lagging, ROIC, perguntas-chave)  
**Status:** **🟢 ATIVO** — próximo ciclo de evolução pós-FASE 0–5 e P2/P3  
**Documentos irmãos:** `PLANEJAMENTO_ATUAL_2026-06.md` · `PLANO_PRIORIDADES_2026-06.md` · `DESIGN_DNA_MOVIKIDS.md` · `MEMORIAL_PAYBACK_INVESTIMENTO.md`

---

## 1. Resumo — o que este plano resolve

| Lacuna do benchmark | Fase(s) que resolve |
|---------------------|---------------------|
| Dashboard denso, sem narrativa executiva | **FASE 6**, **FASE 9** |
| KPIs leading financeiros não explícitos (ticket médio, R$/hora) | **FASE 7** |
| Leading não ligado à margem (causalidade) | **FASE 7**, **FASE 12** |
| Sem alertas proativos / semáforos | **FASE 8** |
| Admin visualmente atrás do portal (DNA) | **FASE 9** |
| CRM subaproveitado (LTV, cohort) | **FASE 10** |
| FinanceiroGeral isolado do app balcão | **FASE 11** |
| Sem drill-down gráfico → transação | **FASE 12** |
| Firebase não usado para BI live | **FASE 13** |
| CUSTOS sem plano de contas / mini-DRE incompleta | **FASE 14** |
| Portal sem métricas de uso; CONFIG só dev | **FASE 15** |
| ROIC / EVA / balanço / ERP / multi-loja | **Anexo A** (futuro, não agora) |

---

## 2. Visão geral das fases

| Fase | Nome | Prioridade | Duração est. | FE alvo | GAS alvo | Homologação |
|------|------|------------|--------------|---------|----------|-------------|
| **6** | Cockpit executivo — síntese e narrativa | **P1** | 5–7 dias | v1.8.0 | v1.5.75 | ✅ repo |
| **7** | KPIs leading financeiros + causalidade | **P1** | 5–7 dias | v1.8.1 | v1.5.76 | ✅ repo |
| **8** | Alertas proativos e semáforos | **P1** | 5–7 dias | v1.8.3 | v1.5.77 | PC admin |
| **9** | DNA visual na gestão (hierarquia 3 níveis) | **P1** | 10–14 dias | v1.8.5 | — | PC + tablet sidebar |
| **10** | CRM inteligente — LTV, cohort, segmentos | **P2** | 7–10 dias | v1.8.6 | v1.5.78 | PC admin + ops treino |
| **11** | Holding unificada (Movi + ZapClin) | **P2** | 5–7 dias | v1.8.7 | v1.5.79 | PC sócio |
| **12** | Drill-down e simulação de margem | **P2** | 7–10 dias | v1.8.8 | v1.5.80 | PC admin |
| **13** | Live BI — ocupação tempo real (Firebase) | **P2** | 5–7 dias | v1.8.9 | v1.5.81 | PC admin |
| **14** | Governança dados — plano de contas + mini-DRE | **P2** | 10–14 dias | v1.8.10 | v1.5.82 | PC + planilha |
| **15** | Métricas portal + CONFIG self-service | **P3** | 7–10 dias | v1.8.11 | v1.5.83 | PC + tablet admin |

**Duração total estimada:** ~10–14 semanas (jun–set 2026), fases 6–9 em sequência obrigatória; 10–15 podem paralelizar parcialmente após FASE 9.

---

## 3. Ordem de execução

```
FASE 0–5 + P2/P3     [✅ fechadas 07–09/06/2026]
        ↓
FASE 6  Cockpit síntese (5 KPIs + narrativa)     ← INÍCIO OBRIGATÓRIO
        ↓
FASE 7  Leading financeiros + impacto estimado
        ↓
FASE 8  Alertas / semáforos (reusa finSinalEmpresa_)
        ↓
FASE 9  DNA visual admin (hero + blocos colapsáveis)
        ↓
┌───────┴───────┬───────────────┬──────────────┐
FASE 10      FASE 11         FASE 13          FASE 15
CRM LTV      Holding         Live BI          Portal metrics
        ↓
FASE 12  Drill-down + simulação margem
        ↓
FASE 14  Plano contas + mini-DRE (depende FASE 7/12)
        ↓
Anexo A  ROIC/ERP/multi-loja — só com decisão sócio
```

**Não interromper:** balcão (tablet) permanece estável; fases 6–14 são **admin/gestão** — deploy FE com `?force=` no PC primeiro.

---

## 4. Matriz página × impacto acumulado (visão final pós-FASE 15)

| Página / sessão | Fase 6 | Fase 7 | Fase 8 | Fase 9 | Fase 10 | Fase 11 | Fase 12 | Fase 13 | Fase 14 | Fase 15 |
|-----------------|--------|--------|--------|--------|---------|---------|---------|---------|---------|---------|
| **Dashboard** — topo | Faixa executiva 5 KPIs | + ticket médio, R$/h | + pills alerta | Hero DNA + glass | — | Link holding | Clique gráfico→lista | Widget live frota | Faixa margem bruta/op | — |
| **Dashboard** — payback strip | Narrativa integrada | + sensibilidade | Semáforo payback | Visual premium | — | — | Simulador cenários | — | Depreciação opcional | — |
| **Dashboard** — Pacote F | — | Insights “→ R$” | Alertas ocupação/cancel | Cards colapsáveis | — | — | Drill operador/dia | Live ocupação | Custo/locação | — |
| **Dashboard** — gráficos | — | Títulos com insight | Borda alerta | Estilo portal | — | — | **Drill-down** | Overlay live | — | — |
| **Caixa** | Atalho cockpit | + break-even dia | Alerta meta dia | Header DNA | — | — | Drill dia | — | — | — |
| **Home balcão** | — | — | — | Sync header L.3+ | — | — | — | — | — | — |
| **CRM / Relacionamento** | — | — | — | Lista DNA | **LTV, cohort, tags** | — | Drill cliente | — | — | Campanha recorrente |
| **Custos** | — | — | — | Form DNA | — | — | — | — | **Plano contas** | Admin edita cat. |
| **Histórico** | — | Export síntese | — | — | Filtro segmento | — | Drill período | — | — | — |
| **Sistema** | Link doc fases | — | Log alertas | Diagnóstico DNA | — | — | — | Firebase health | Auditoria contas | **CONFIG UI** |
| **Sidebar admin** | Entrada “Cockpit” | — | Badge alertas | Ícones/refino | — | **Holding** | — | — | — | — |
| **Portal** (`acompanhar.html`) | — | — | — | — | — | — | — | — | — | **Analytics uso** |
| **Financeiro Geral** (externo) | — | — | — | — | — | **Embed / SSO GAS** | — | — | Consolida DRE | — |
| **PDF executivo** (P3 B5) | Síntese nova | Leading incluídos | Alertas mês | Layout premium | LTV resumo | Consolidado holding | Cenários | — | Mini-DRE | — |

---

# FASE 6 — Cockpit executivo: síntese e narrativa

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Condensar Dashboard para **5 KPIs síntese + 1 parágrafo narrativo** — provar rentabilidade em 10 segundos |
| **Prioridade** | P1 |
| **Esforço** | 5–7 dias |
| **Versão** | FE **v1.8.0** · GAS **v1.5.75** |

### Entregas

| ID | Entrega | Camada | Arquivo / action |
|----|---------|--------|------------------|
| 6.1 | Bloco **`#mk-exec-cockpit`** no topo do Dashboard | FE | `index.html`, `mk-admin.js`, `mk-app.css` |
| 6.2 | 5 KPIs fixos: **Fat mês · Margem % · Resultado · Payback % · Ocupação média frota** | FE | render a partir de `kpiMes` existente |
| 6.3 | **`narrativaExecutiva_`** — texto gerado no GAS (3–5 frases, comparativo mês ant.) | GAS | `buildKpiMesPayload_` → campo `narrativaExecutiva` |
| 6.4 | Comparativos inline (↑↓ vs mês anterior) nos 5 KPIs | FE + GAS | reutiliza `fatMesAnt`, `margem`, payback |
| 6.5 | Teste readonly **`TESTE_FASE6_COCKPIT_READONLY.ps1`** | QA | `scripts/testes/` |
| 6.6 | Doc deploy **`DEPLOY_v1.5.75_FASE6_COCKPIT.md`** | Docs | `docs/ativos/` |

### Melhorias funcionais

| Antes | Depois |
|-------|--------|
| Sócio abre Dashboard e vê dezenas de blocos | Primeira dobra = decisão: “estamos bem ou mal?” |
| Números sem contexto | Frase: *“Junho: fat ↑12% vs maio; margem 28%; payback 34%; ocupação 41% — CTO pressionando por mínimo contratual.”* |
| PDF executivo genérico | Preview cockpit alimenta PDF B5 (mesma narrativa) |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Dashboard** | Topo (acima payback strip) | Vazio / KPIs espalhados → **faixa glass 5 cards + parágrafo narrativo** (Fredoka títulos, Nunito corpo — DNA §3) |
| **Dashboard** | Restante | Sem mudança nesta fase |
| **PDF executivo** | Capa resumo | Parágrafo narrativo incluído |

### Critério de pronto

- [ ] Admin abre Dashboard → vê cockpit sem scroll em 1920×1080  
- [ ] `kpiMes` retorna `narrativaExecutiva` (string não vazia com mês referência)  
- [ ] Teste readonly verde · `pre-push-check` verde  
- [ ] Sócio valida linguagem da narrativa (1 reunião)

### Dependências

Nenhuma — usa `kpiMes` existente.

---

# FASE 7 — KPIs leading financeiros e causalidade

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Expor **leading acionáveis** derivados dos dados atuais e estimar impacto na margem |
| **Prioridade** | P1 |
| **Esforço** | 5–7 dias |
| **Versão** | FE **v1.8.1** · GAS **v1.5.76** |

### Entregas

| ID | Entrega | Camada |
|----|---------|--------|
| 7.1 | **`ticketMedio`** = fatMes / nMes | GAS `buildKpiMesPayload_` |
| 7.2 | **`receitaPorHoraOperada`** = fatMes / (diasOperando × KPI_HORAS_OPERACAO_DIA) | GAS |
| 7.3 | **`custoPorLocacao`** = cusMes / nMes | GAS |
| 7.4 | **`breakEvenLocacoesDia`** — locações/dia para cobrir OPEX+CTO mínimo (fórmula memorial) | GAS + doc em `MEMORIAL_PAYBACK` §novo |
| 7.5 | **`sensibilidadeMargem_`** — delta margem se fat +10% ou custos +10% | GAS → objeto `sensibilidade` |
| 7.6 | **`impactoEstimado_`** — ex.: “+5 pp ocupação ≈ +R$ X/mês” (linear simplificado) | GAS |
| 7.7 | Cards leading na 2ª dobra Dashboard + insights Pacote F atualizados | FE `mk-admin.js` |
| 7.8 | Teste **`TESTE_FASE7_LEADING_READONLY.ps1`** | QA |

### Melhorias funcionais

| KPI | Passa no teste síntese? | Ação na UI |
|-----|------------------------|------------|
| Ticket médio | 🟡 | Mostrar com seta vs mês ant. |
| R$/hora operada | ✅ | Normaliza dias fracos |
| Custo/locação | ✅ | Liga eficiência OPEX |
| Break-even dia | ✅ | Meta operacional para Caixa |
| Sensibilidade | ✅ | Sócio vê risco CTO vs volume |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Dashboard** | Abaixo cockpit (FASE 6) | — → **linha 4 mini-KPIs** (ticket, R$/h, custo/loc, break-even) |
| **Dashboard** | Insights Pacote F (`nk-*-insight`) | Texto estático → **frases com R$ estimado** |
| **Caixa** | Resumo do dia | — → chip **“Meta break-even: X locações (faltam Y)”** |
| **PDF executivo** | Seção leading | Nova subseção |

### Critério de pronto

- [ ] Campos novos em `kpiMes` documentados no memorial  
- [ ] Caixa consome break-even via `resumoDia` estendido ou `kpiMes` cache  
- [ ] Nenhum KPI duplicado na Home operador (Pacote I)

---

# FASE 8 — Alertas proativos e semáforos

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Antecipar problemas antes do P&L — **semáforo verde/amarelo/vermelho** + lista de alertas |
| **Prioridade** | P1 |
| **Esforço** | 5–7 dias |
| **Versão** | FE **v1.8.3** · GAS **v1.5.77** |

### Entregas

| ID | Entrega | Camada |
|----|---------|--------|
| 8.1 | **`buildAlertasGestao_(payload)`** — regras: margem <10%, payback off-track, ocupação <25%, cancel >8%, dias sem movimento | GAS |
| 8.2 | Port **`finSinalEmpresa_`** (FinanceiroGeral) para MOVI KIDS isolado | GAS |
| 8.3 | Campo `alertas: [{ nivel, codigo, titulo, mensagem, acionavel }]` em `kpiMes` | GAS |
| 8.4 | **`#mk-alert-strip`** — faixa fixa sob cockpit (max 3 alertas + “ver todos”) | FE |
| 8.5 | Modal **Alertas do mês** com ações sugeridas | FE |
| 8.6 | Semáforo no payback strip e margem do cockpit | FE |
| 8.7 | Log alertas dismissíveis (sessionStorage) | FE |
| 8.8 | Teste **`TESTE_FASE8_ALERTAS_READONLY.ps1`** | QA |

### Regras de alerta (v1)

| Código | Condição | Nível | Acionável por |
|--------|----------|-------|---------------|
| `MARGEM_BAIXA` | margem < 10% | vermelho | Sócio — revisar custos |
| `MARGEM_ATENCAO` | margem 10–18% | amarelo | Sócio |
| `OCUPACAO_BAIXA` | ocupação média < 25% | amarelo | Ops — horário/preço |
| `CANCEL_ALTO` | taxa cancel > 8% | amarelo | Ops — treino |
| `PAYBACK_ATraso` | projeção payback > 24m | amarelo | Sócio |
| `CTO_MINIMO` | ctoPagar === ctoMinimo | info | Sócio — volume |
| `SEM_MOVIMENTO` | diasOperando < 3 e dia > 10 | vermelho | Ops |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Dashboard** | Sob cockpit | — → **faixa amarela/vermelha** estilo portal alertas (DNA §2 item 7) |
| **Dashboard** | Payback / margem pills | Neutro → **borda semáforo** |
| **Sidebar** | Ícone Dashboard | — → **badge numérico** alertas críticos |
| **Sistema** | Diagnóstico | — → histórico alertas do mês (readonly) |

### Critério de pronto

- [ ] Simular margem baixa em planilha teste → alerta aparece  
- [ ] Operador **não** vê alertas (só admin)  
- [ ] PDF executivo inclui box “Pontos de atenção”

---

# FASE 9 — DNA visual na gestão (hierarquia 3 níveis)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Admin com **mesma linguagem visual do portal** — hero, glass, colapso, sem competição de heróis |
| **Prioridade** | P1 |
| **Esforço** | 10–14 dias |
| **Versão** | FE **v1.8.5** (sem GAS obrigatório) |

### Entregas

| ID | Entrega | Página |
|----|---------|--------|
| 9.1 | Tokens DNA estendidos ao admin (`mk-design.css` § admin) | Global |
| 9.2 | **Nível 1 Hero** = cockpit FASE 6 | Dashboard |
| 9.3 | **Nível 2 Contexto** = leading FASE 7 + alertas FASE 8 | Dashboard |
| 9.4 | **Nível 3 Detalhe** = Pacote F + gráficos **colapsáveis** (accordions) | Dashboard |
| 9.5 | Payback strip redesign — glass + pill Fredoka | Dashboard |
| 9.6 | Caixa — header hero “R$ hoje” + detalhe colapsável | Caixa |
| 9.7 | CRM — cards responsável estilo portal tabs | Relacionamento |
| 9.8 | Custos — formulário limpo Nunito | Custos |
| 9.9 | Sistema — cards diagnóstico | Sistema |
| 9.10 | Sidebar — ícones + estado ativo portal-blue | Nav |
| 9.11 | Checklist **`CHECKLIST_FASE9_DNA_ADMIN.md`** | QA tablet sidebar only |

### Impacto visual (detalhado)

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Dashboard** | Global | Grid denso cinza → **fundo gradiente suave** + cards glass |
| **Dashboard** | Gráficos Chart.js | Cores default → **paleta DNA** (--blue, --gold, --pink) |
| **Dashboard** | Pacote F blocos | Sempre abertos → **accordion** “Operador · Cancel · Ocupação · Custos · Recorrência” |
| **Caixa** | Topo | Tabela plana → **hero R$ + n locações** |
| **Relacionamento** | Lista | Tabela → **cards** com badge Recorrente destacado |
| **Home balcão** | — | **Sem mudança** (operador precisa velocidade, não glass) |

### Critério de pronto

- [ ] DNA checklist ≥ 8/10 itens do `DESIGN_DNA_MOVIKIDS.md` §6 aplicados ao admin  
- [ ] Balcão Home/Nova/Drawer **inalterados** (regressão tablet A–F)  
- [ ] Lighthouse acessibilidade admin ≥ score anterior

---

# FASE 10 — CRM inteligente: LTV, cohort e segmentos

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Transformar CRM de cadastro em **motor de receita recorrente** |
| **Prioridade** | P2 |
| **Esforço** | 7–10 dias |
| **Versão** | FE **v1.8.6** · GAS **v1.5.78** |

### Entregas

| ID | Entrega | Camada |
|----|---------|--------|
| 10.1 | **`calcLtvResponsavel_(tel)`** — soma histórica fat por telefone | GAS |
| 10.2 | **`segmentoCliente_`** — Novo / Recorrente / VIP (≥5 loc ou LTV > P90) | GAS |
| 10.3 | **`cohortRetencao_`** — % que volta no mês seguinte | GAS → Dashboard widget |
| 10.4 | UI detalhe responsável: LTV, última visita, filhos, histórico | FE `mk-relacionamento.js` |
| 10.5 | Filtros lista: segmento, recorrente, inativo >60d | FE |
| 10.6 | **`listarCampanhaRecorrente_`** — export CSV inativos (readonly) | GAS |
| 10.7 | Treino ops **N1** — doc **`TREINO_CRM_FASE10.md`** | Ops |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Relacionamento** | Lista | Colunas → **avatar inicial + tags VIP/Recorrente/Novo** |
| **Relacionamento** | Drawer detalhe | Básico → **LTV R$ + timeline locações** |
| **Dashboard** | Novo widget | — → **Cohort retenção** (mini chart) |
| **CRM** | Ações | — → botão **Export inativos** |

### Critério de pronto

- [ ] LTV bate soma manual 5 clientes teste  
- [ ] Badge Recorrente (P3 N1) coerente com segmento  
- [ ] Operador treinado (checklist N1 assinado)

---

# FASE 11 — Holding unificada (Movi Kids + ZapClin)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Sócio vê **um lugar** para Movi + ZapClin — hoje `FinanceiroGeral.gs` isolado |
| **Prioridade** | P2 |
| **Esforço** | 5–7 dias |
| **Versão** | FE **v1.8.7** · GAS **v1.5.79** |

### Entregas

| ID | Entrega | Camada |
|----|---------|--------|
| 11.1 | Action **`controleFinanceiro`** exposta no dispatch MOVI (admin only) | GAS |
| 11.2 | Página **`#page-holding`** ou modal fullscreen | FE `mk-admin.js` + nav |
| 11.3 | Cards empresas + consolidado + narrativa `finNarrativa_` | FE |
| 11.4 | Link sidebar **“Holding”** (só admin PIN) | FE |
| 11.5 | Não duplicar KPIs Movi no holding — link “ver detalhe Dashboard” | FE |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Nova: Holding** | Página inteira | Não existia → **2 colunas Movi | ZapClin + barra consolidado** |
| **Sidebar** | Menu admin | — → item **Holding** |
| **Dashboard Movi** | — | Intocado — link “Ver consolidado holding” |

### Critério de pronto

- [ ] Só admin com PIN vê holding  
- [ ] Payload `controleFinanceiro` igual ao FinanceiroGeral v2  
- [ ] ZapClin planilha acessível (OAuth já existente)

---

# FASE 12 — Drill-down e simulação de margem

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Gráfico → transação; simular **e se** fat/custo/CTO mudar |
| **Prioridade** | P2 |
| **Esforço** | 7–10 dias |
| **Versão** | FE **v1.8.8** · GAS **v1.5.80** |

### Entregas

| ID | Entrega | Camada |
|----|---------|--------|
| 12.1 | **`listarLocacoesDia_(data)`** — admin, paginado | GAS |
| 12.2 | **`listarCustosDia_(data)`** | GAS |
| 12.3 | Clique barra gráfico diário → drawer lista locações | FE |
| 12.4 | Clique operador Pacote F → locações daquele operador | FE |
| 12.5 | **`simularMargem_`** — sliders fat ±%, custos ±%, mostra margem/resultado | GAS + FE modal |
| 12.6 | Simulador payback — projecaoRes editável | FE |
| 12.7 | Testes readonly FASE 12 | QA |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Dashboard** | chart-diario | Estático → **cursor pointer + drawer lateral** |
| **Dashboard** | Toolbar | — → botão **Simular margem** (modal sliders) |
| **Dashboard** | Payback | — → link **Cenários** abre simulador |

### Critério de pronto

- [ ] Clique dia 15 → lista bate planilha  
- [ ] Simulador não grava — só visualização  
- [ ] Performance: drill < 2s

---

# FASE 13 — Live BI: ocupação tempo real (Firebase)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Usar Firebase além do sync — **painel live** frota em uso agora |
| **Prioridade** | P2 |
| **Esforço** | 5–7 dias |
| **Versão** | FE **v1.8.9** · GAS **v1.5.81** (opcional enrich) |

### Entregas

| ID | Entrega | Camada |
|----|---------|--------|
| 13.1 | **`mk-live-frota.js`** — listener RTDB sessões Ativas | FE |
| 13.2 | Widget **`#mk-live-frota`** no Dashboard (9 veículos, estado cor) | FE |
| 13.3 | % ocupação live vs capacidade simultânea | FE |
| 13.4 | Fallback offline → último `carregarInicio` | FE |
| 13.5 | Não expor live para operador (admin only) | FE auth |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Dashboard** | Coluna direita sticky | — → **grid 3×3 veículos** verde/ocupado/cinza + pulso CSS |
| **Home admin** | — | Opcional atalho mini-widget |

### Critério de pronto

- [ ] Iniciar locação tablet → widget PC atualiza < 3s  
- [ ] Sem leak Firebase em sessão operador

---

# FASE 14 — Governança dados: plano de contas + mini-DRE

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Subir de P&L simplificado para **mini-DRE** acionável (sem ERP) |
| **Prioridade** | P2 |
| **Esforço** | 10–14 dias |
| **Versão** | FE **v1.8.10** · GAS **v1.5.82** · Planilha |

### Entregas

| ID | Entrega | Camada |
|----|---------|--------|
| 14.1 | Aba **`PLANO_CONTAS`** — categorias: CMV, OPEX fixo, OPEX var, investimento | Planilha |
| 14.2 | Migrar CUSTOS col cat → validação contra plano | GAS |
| 14.3 | **`margemBruta`** = fat - CMV (CMV = manutenção/peças/consumíveis) | GAS |
| 14.4 | **`margemOperacional`** = margemBruta - OPEX - CTO (alias resultado atual) | GAS |
| 14.5 | **`depreciacaoMensal_`** opcional — INVESTIMENTO / vida útil meses | GAS |
| 14.6 | Faixa Dashboard **cascata margens** (bruta → operacional → líquida operacional) | FE |
| 14.7 | Doc **`MEMORIAL_MINI_DRE.md`** | Docs |
| 14.8 | Script migração categorias **`scripts/ops/migrar-plano-contas.ps1`** | Ops |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Dashboard** | Cockpit margem | 1 número → **3 degraus** com % |
| **Custos** | Form | Cat livre → **dropdown plano contas** |
| **PDF executivo** | Financeiro | + cascata margens |
| **Holding** | Consolidado | Margem bruta/op por empresa |

### Critério de pronto

- [ ] 100% custos mês atual categorizados  
- [ ] Memorial revisado pelo sócio  
- [ ] ROIC **não** incluído (sem balanço)

---

# FASE 15 — Métricas portal + CONFIG self-service

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Fechar loop experiência cliente + autonomia admin sem dev |
| **Prioridade** | P3 |
| **Esforço** | 7–10 dias |
| **Versão** | FE **v1.8.11** · GAS **v1.5.83** |

### Entregas

| ID | Entrega | Camada |
|----|---------|--------|
| 15.1 | Log **`PORTAL_ACESSOS`** — token, timestamp (sem PII) | GAS + planilha ou Properties |
| 15.2 | Dashboard widget **Acessos portal / locações com QR** | FE |
| 15.3 | UI **CONFIG** em Sistema — editar frota/preços (FASE 4 backend) | FE + GAS existente |
| 15.4 | Validação + preview antes de salvar CONFIG | FE |
| 15.5 | **`TESTE_CONFIG_WRITE_ADMIN.ps1`** | QA |

### Impacto visual

| Página | Seção | Antes → Depois |
|--------|-------|----------------|
| **Dashboard** | Widget portal | — → **“X acessos portal este mês”** |
| **Sistema** | CONFIG | Só planilha → **form visual frota/preços** |
| **Portal** | — | Sem mudança visível (só telemetria) |

### Critério de pronto

- [ ] Admin altera preço 3h → balcão reflete após sync  
- [ ] Métricas portal batem logs amostra

---

# Anexo A — Explicitamente fora deste ciclo (futuro distante)

| Item | Por que não agora | Reavaliar quando |
|------|-------------------|------------------|
| **ROE / ROA / ROIC / EVA** | Sem balanço patrimonial no sistema | Contador integrar PL + investimentos |
| **Balanço + DFC formal** | Negócio 1 loja, caixa ≈ competência | Dívida bancária ou 2ª unidade |
| **Trocar Sheets por ERP** | Custo >> benefício atual | >2 lojas ou >500 loc/dia |
| **Multi-loja / franquia** | Modelo single-tenant | Expansão decidida |
| **F4 WhatsApp/SMS auto** | Conta bloqueada | Canal manual 90d estável |
| **F9 Supervisor** | Operadores autonomia total | Nova política gestão |
| **ML previsão demanda** | Sem dados footfall shopping | API shopping disponível |
| **Integração Conta Azul/Omie** | FASE 14 prepara categorias | Export DRE validado 3 meses |

---

# Anexo B — Mapa benchmark → fase (nada de fora)

| Recomendação do estudo | Fase |
|------------------------|------|
| Executive summary 5 KPIs + narrativa | 6 |
| Ticket médio, R$/hora, custo/locação, break-even | 7 |
| Sensibilidade margem + impacto ocupação→R$ | 7, 12 |
| Alertas proativos | 8 |
| DNA portal no admin | 9 |
| LTV, cohort, segmentação CRM | 10 |
| Unificar FinanceiroGeral | 11 |
| Drill-down gráfico → lista | 12 |
| Simulação cenários margem/payback | 12 |
| Firebase live occupancy gestão | 13 |
| Plano contas + margem bruta + mini-DRE | 14 |
| Métricas portal + CONFIG UI | 15 |
| Leading: conversão balcão, tempo ocioso | **Backlog FASE 16** (telemetria balcão) |
| Integração contábil | Anexo A |
| ROIC / EVA | Anexo A |

### FASE 16 (backlog opcional pós-15)

| ID | Entrega | Dependência |
|----|---------|-------------|
| 16.1 | Contador tentativas Nova (não convertidas) | Telemetria FE |
| 16.2 | Tempo médio entre encerrar → nova locação | AUDITORIA + timestamps |
| 16.3 | NPS pós-locação no portal | Portal + 1 pergunta |

---

# Anexo C — Perguntas-chave do framework → onde respondemos

| Pergunta | Resposta após fase |
|----------|-------------------|
| Modelo de geração de caixa? | 6 (narrativa) + 7 (R$/h) |
| Onde está a margem? | 7 (mix), 12 (simulação), 14 (cascata) |
| Custos fixos vs variáveis? | 14 (plano contas) |
| Ponto de equilíbrio? | 7 (break-even) + Caixa |
| Para quem demonstramos? | 6 Golden PDF · 11 holding · 6 cockpit sócio |
| O que move receita? | 7 leading + 10 LTV + 13 live |
| O que move margem? | 8 alertas + 12 simulador |
| Capital / payback? | 6 + 12 cenários payback |
| KPI melhora → negócio rentável? | 8 regras + teste síntese doc |

---

# Anexo D — Ritual de fechamento por fase

| Passo | Ação |
|-------|------|
| 1 | Dev completa entregas + testes readonly |
| 2 | `pre-push-check.ps1` verde |
| 3 | Push FE → validar PC `?force=` |
| 4 | Se GAS: `deploy-gas.ps1` → **Nova versão Web** (sócio) |
| 5 | Ping + teste fase |
| 6 | Atualizar `ESTADO_ATUAL.md`, checklist fase, `HANDOFF_NOVO_CHAT.md` |
| 7 | Marcar fase ✅ em `PLANO_PRIORIDADES` § Execução |
| 8 | Tablet balcão: regressão A–F **só se** mexeu Home/Nova/Drawer |

---

# Anexo E — Riscos do ciclo 6–15

| Risco | Mitigação |
|-------|-----------|
| Dashboard admin pesado no tablet PC antigo | Fases 6–9 progressivas; colapsar blocos |
| Narrativa GAS imprecisa | Revisão sócio + templates por faixa margem |
| Plano contas migração incompleta | FASE 14 dry-run + mês paralelo |
| Firebase custo/leitura | Listener só página Dashboard ativa |
| Scope creep ROIC | Anexo A trava — PR rejeita sem decisão sócio |

---

**Próximo passo imediato:** iniciar **FASE 6** — branch `feat/fase6-cockpit` · FE v1.8.0 · GAS v1.5.75.

*Revisão deste plano: ao fechar FASE 9 (meio ciclo) e FASE 15 (fim ciclo).*
