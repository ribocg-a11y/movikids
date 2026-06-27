# MOVI KIDS — Plano Premium + One UI (FASES 16–22)

**Data:** 20/06/2026  
**Origem:** `Manual_Plataforma_Gestao_Premium_Completo_260620_102237.pdf`  
**Status:** **🟢 ATIVO — Sprint D pós One UI** · `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`  
**Documentos irmãos:** `PLANEJAMENTO_ATUAL_2026-06.md` · `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md` · `DESIGN_SYSTEM_MOVIKIDS.md` · `DESIGN_DNA_MOVIKIDS.md`

---

## 1. Frase guia (do manual, adaptada)

> *"Um sistema que transforma dados da operação em decisões inteligentes."*

**Tradução MOVI KIDS:** cada tela deve responder em **3 segundos** — *está tudo bem? o que fazer agora? quanto vale isso?* — com **um hero**, linguagem humana e DNA portal (Fredoka + Nunito, calor + seriedade).

---

## 2. Diagnóstico — Manual × sistema atual

| § Manual | Conceito | MOVI KIDS hoje | Gap | Fase proposta |
|----------|----------|----------------|-----|---------------|
| **1** Visão produto | Centro de comando | FASE 6–9 cockpit, Dashboard, Caixa | Falta **visão unificada tempo real** (operação + pessoas + $) | **FASE 16** |
| **2** Posicionamento | Premium, confiança | Portal ✅ · Admin 🟡 · Colaboradores 🟡 | Tipografia pesada, blocos densos em RH | **FASE 16** One UI |
| **3** Arquitetura usuários | Admin / Gestor / Colaborador | Admin (PIN **1421**) · Operador · Colaborador | Perfil Gestor ✅ homolog | **FASE 17** assinar |
| **4.1** Central de gestão | Visão geral + alertas | Dashboard + sidebar alertas FASE 8 | Alertas ainda técnicos, pouco narrativos | **FASE 16** |
| **4.2** Financeiro | Fluxo, previsão, relatórios | Caixa, mini-DRE FASE 14, payback | **Previsão financeira** e comparativo 30d explícito | **FASE 18** |
| **4.3** Operação | Locações, frota, manutenção | Painel Operação, balcão, CONFIG | **Status frota/manutenção** não centralizado | **FASE 16** |
| **4.4** Gestão pessoas | RH completo | FASE 15 🟡 (ponto, escala, holerite, jornada) | Avaliações, comunicados, histórico desempenho | **FASE 15b** |
| **4.5** Performance | Metas, ranking, evolução | Metas loc + bônus colaborador | Ranking saudável, evolução visual | **FASE 19** |
| **5** Dashboards inteligentes | Número + interpretação | Narrativa FASE 6 parcial | Falta *"18% acima da média"* em KPIs | **FASE 16** |
| **6** Centro comando operacional | Tempo real | Sync balcão, sessão ativa | Uma tela só: locações + equipe + $ hoje | **FASE 16** |
| **7** Alertas inteligentes | Proativos automáticos | FASE 8 semáforos, alertas ponto | Banco horas limite, queda fat, frota parada | **FASE 17** |
| **8** Gamificação | Conquistas, reconhecimento | Bônus meta R$100/dia | Badges, ranking mês, mensagens positivas | **FASE 19** |
| **9** Permissões | 4 níveis | Admin + operador + colaborador | Matriz Gestor/Supervisor | **FASE 17** |
| **10** Mobile | Mobile-first colaborador | Tablet balcão ✅ · gestao-pessoas 🟡 | Admin acompanhamento mobile leve | **FASE 16** |
| **11** IA | Assistente gestão | — | Backlog diferencial | **FASE 22** (Anexo) |
| **12** Design premium | Espaço, hierarquia, microinterações | Design System v1.0 | One UI: cards widget, motion, foco conteúdo | **FASE 16** |

**Legenda gap:** ✅ atende · 🟡 parcial · — não existe

---

## 3. One UI adaptado ao DNA MOVI KIDS

Princípios Samsung One UI **traduzidos** — sem copiar visual Samsung; **reforçar** o que já funciona no portal.

| Princípio One UI | Aplicação MOVI KIDS | Onde | Proibido |
|------------------|---------------------|------|----------|
| **Focus on content** | Hero único por dobra; detalhe colapsável (regra 3 níveis) | Dashboard, Presença, Ponto | Parede de KPIs iguais |
| **Natural interactions** | Swipe no portal; bottom sheet no tablet para ações secundárias | Portal, balcão drawer | Modais empilhados |
| **Make it yours** | Chip turno, avatar letra, cor operador | Header mobile, RH | — |
| **Widget-style cards** | Cards arredondados 16–20px, sombra suave, **um dado + contexto** | Cockpit, Presença resumo | Fredoka em todo número |
| **Reachability** | CTAs primários na metade inferior (colaborador mobile) | gestao-pessoas.html | Botões pequenos no topo |
| **Meaningful motion** | Pop entrada, pulso alerta crítico (já no portal) | Timer, alertas ponto | Animação decorativa |
| **Adaptive layout** | 1 col mobile · 2 col tablet · grid admin PC | Todas superfícies | Tabela crua sem scroll |
| **Immediate feedback** | Flash ✓ ponto, badge sidebar, chip Turno | Ponto, auth | Loading silencioso |

**Tipografia (correção imediata — já iniciada v1.8.68):**

| Elemento | Antes (pesado) | Depois (One UI + DNA) |
|----------|----------------|------------------------|
| KPI numérico | Fredoka 32px | Nunito 800, 15–18px |
| Hero timer / marca | Fredoka One | Fredoka One (mantém) |
| Labels | ALL CAPS 9px bold | Sentence case 10px Nunito 700 |
| Tabelas RH | font-weight 800 | 600 corpo · 800 só header |

---

## 4. Visão das novas fases (16–22)

```
FASE 15 fechar (jornada + holerite + homolog)
        ↓
FASE 16  Premium One UI + Centro de Comando     ← P1 · 2–3 sem
        ↓
FASE 15b Gestão Pessoas completa (RH premium)   ← P1 · 1–2 sem
        ↓
FASE 17  Alertas inteligentes + Permissões      ← P1 · 1–2 sem
        ↓
┌───────┴────────┬──────────────┐
FASE 18       FASE 19         FASE 20
Financeiro    Performance     Portal analytics
previsão      gamificação     (métricas uso)
        ↓
FASE 21  Live BI frota (Firebase) — herda FASE 13 plano 6–15
        ↓
FASE 22  Assistente IA gestão (Anexo — decisão sócio)
```

**Duração total estimada:** 8–12 semanas (jun–ago 2026), **sem parar balcão**.

---

## 5. FASE 16 — Premium One UI + Centro de Comando Operacional

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Uma tela + refinamento visual em todo admin/RH — operação inteira em poucos segundos |
| **Prioridade** | **P1** |
| **Manual §** | 2, 4.1, 4.3, 5, 6, 10, 12 |
| **FE alvo** | v1.9.0 |
| **GAS alvo** | v1.5.115 |

### Entregas

| ID | Entrega | Camada | Detalhe |
|----|---------|--------|---------|
| 16.1 | **`#mk-command-center`** — nova página ou aba Dashboard | FE | Hero: locações ativas · presentes · fat hoje · alertas críticos |
| 16.2 | **`painelComandoOperacional_`** API | GAS | Agrega: loc abertas, operadores logados, fat dia, alertas FASE 8 + ponto |
| 16.3 | **KPI com contexto** — todo número + linha interpretativa | FE+GAS | Ex.: `R$ 1.240` + *"↑ 12% vs média 30 dias"* |
| 16.4 | **One UI tokens v2** — `--mk-widget-*`, spacing 8/12/16/24 | CSS | `mk-design.css` §3 extensão; doc Design System v1.1 |
| 16.5 | **Refino Presença + Ponto** — tipografia leve, cards widget | FE | `mk-gestao-pessoas*.css` (continua v1.8.68+) |
| 16.6 | **Sidebar mobile admin** — acompanhamento rápido (read-only) | FE | KPIs comando + link balcão; **sem** escritas críticas |
| 16.7 | **Status frota compacto** — disponível / em uso / manutenção | FE+GAS | Reusa CONFIG + locações ativas |
| 16.8 | Teste **`TESTE_FASE16_COMANDO_READONLY.ps1`** | QA | |

### Critério de pronto

- [x] Sócio abre Dashboard → bloco comando mostra locações + equipe + $ sem scroll (1920×1080)
- [x] Todo KPI cockpit tem linha de contexto (não só número)
- [x] Presença/Ponto passam checklist Design System §9 + tipografia Nunito nos dados
- [ ] Tablet balcão **inalterado** (regressão F5/F7/F10/F11) — homolog na loja pós-GAS Web
- [x] `TESTE_FASE16_COMANDO_READONLY.ps1` — FE + GAS (warn se Web antiga)

---

## 6. FASE 15b — Gestão Pessoas completa (RH premium)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Fechar lacunas do manual §4.4 para colaborador e admin |
| **Prioridade** | **P1** (paralelo final FASE 15) |
| **Manual §** | 4.4, 3 (Colaborador) |
| **FE alvo** | v1.9.1 |
| **GAS alvo** | v1.5.112 (jornada v1.5.110+) |

### Entregas

| ID | Entrega | Status base |
|----|---------|-------------|
| 15b.1 | Jornada escala × ponto + banco projetado + hero **Minha jornada hoje** | ✅ v1.5.111 / **v1.8.90** |
| 15b.2 | Holerite quinzenal admin + colaborador + pré-visualização ADM | ✅ v1.5.108 / **v1.8.92** |
| 15b.2b | Pré-visualização ADM (`admPreview=1`) somente leitura | ✅ v1.5.122 / **v1.8.92** |
| 15b.3 | **Comunicados** — faixa no hub colaborador (planilha `COMUNICADOS_RH`) | ✅ **v1.8.94** FE · GAS repo v1.5.124 |
| 15b.4 | **Histórico desempenho** — loc/mês, metas atingidas, gráfico evolução | ✅ **v1.8.95** FE · GAS v1.5.125 |
| 15b.5 | **Cadastro RH obrigatório** — gate balcão, Meus dados, ficha ADM, `salvarCadastro` | ✅ **v1.8.97+** · GAS **v1.5.127** |
| 15b.5b | **Avaliações** — registro simples admin (nota + obs por competência) | ✅ v1.8.107 · GAS repo **v1.5.128** |
| 15b.6 | **Benefícios visíveis** — VA, VT, copart no hub (não só holerite) | ✅ v1.8.106 |
| 15b.7 | Persistir **banco de horas** na aba `BANCO_HORAS` (colaborador + painel admin) | ✅ GAS **v1.5.134** |

### Sensação colaborador (manual)

> *"Eu sei o que fazer e acompanho meu crescimento."*

Hub 5 portas → hero **Minha jornada hoje** (escala + ponto + meta) antes das portas.

### 15b.3 — Comunicados RH (kickoff 21/06/2026)

**Objetivo:** colaborador vê avisos da gestão no hub, sem poluir o login.

| Camada | Entrega |
|--------|---------|
| **Planilha** | Nova aba `COMUNICADOS_RH`: `id`, `data`, `titulo`, `mensagem`, `publico` (TODOS \| operadorId), `validoAte`, `ativo` (SIM/NAO), `prioridade` (info \| urgente) |
| **GAS v1.5.124** | `listarComunicadosRh_` no painel colaborador · `salvarComunicadoRhAdmin_` (PIN 1416) · incluir em `instalarAbasGestaoPessoas` |
| **FE v1.8.94** | Faixa `#gp-comunicados` abaixo do hero jornada · máx. 2 visíveis + "Ver todos" · dismiss local (session) |
| **ADM** | Aba **Comunicados** em Operadores: formulário título + texto + público + validade |
| **Preview ADM** | Mesma faixa na pré-visualização (dados reais ou demo) |
| **QA** | `TESTE_COMUNICADOS_RH_READONLY.ps1` |

**Regras UX (Design System §8 colaborador):**

- Urgente = faixa âmbar (`--amber-lt`), info = azul claro (`--blue-lt`)
- Uma linha de título + expandir detalhe (não modal)
- Não bloquear ponto/metas — comunicado é apoio, não gate

**Critério de pronto:**

- [x] Admin publica "Reunião sábado 10h" → Raykelly vê no hub em < 3 s (cache FE 5 min) — **após Nova versão Web GAS**
- [x] Comunicado expirado não aparece — lógica GAS `gpComunicadoAtivoHoje_`
- [x] Colaborador sem PIN admin não vê tela de edição — edição só aba ADM Operadores

---

## 7. FASE 17 — Alertas inteligentes + Permissões

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Notificações automáticas + níveis de acesso Gestor/Supervisor |
| **Prioridade** | **P1** |
| **Manual §** | 7, 9 |
| **FE alvo** | v1.9.2 |
| **GAS alvo** | v1.5.118 |

### Alertas (GAS `alertasInteligentes_`)

| Alerta | Regra | Onde aparece |
|--------|-------|--------------|
| Queda faturamento | Fat 7d < média 30d −15% | Dashboard pill + comando |
| Custo elevado | Custo dia > média +20% | Caixa |
| Banco horas limite | Colaborador > ±20h acumulado | Operadores Presença |
| Frota parada | Veículo 0 locações 7d | Comando + CONFIG |
| Meta abaixo | Operador <50% meta 3 dias seguidos | Operadores Hoje |
| Ponto pendente | Escala ON sem entrada +20min | Já parcial — consolidar |

### Permissões

| Perfil | Acesso | Implementação |
|--------|--------|---------------|
| **Super Admin** | Tudo (atual PIN **1421**) | Mantém |
| **Gestor** | Operação + equipes + relatórios · sem CONFIG/SMS | Novo PIN perfil `gestor` na planilha OPERADORES |
| **Supervisor** | Painel operação + liberar sessão · sem financeiro | Reavaliar F9 pausado |
| **Colaborador** | gestao-pessoas.html only | Mantém |

---

## 8. FASE 18 — Financeiro inteligente + previsão

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Fluxo de caixa com **previsão** e comparativos premium |
| **Prioridade** | **P2** |
| **Manual §** | 4.2, 5 |
| **FE alvo** | v1.9.3 |
| **GAS alvo** | v1.5.120 |

### Entregas

- Projeção fim de mês (fat médio × dias restantes − custos fixos conhecidos)
- Gráfico entradas/saídas 30d com insight automático
- Break-even do dia no Caixa (herda FASE 7)
- Export PDF financeiro premium (layout holerite DNA)

---

## 9. FASE 19 — Performance e gamificação saudável

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Metas + ranking + reconhecimento sem competição tóxica |
| **Prioridade** | **P2** |
| **Manual §** | 4.5, 8 |
| **FE alvo** | v1.9.4 |
| **GAS alvo** | v1.5.122 |

### Entregas

| ID | Entrega |
|----|---------|
| 19.1 | **Ranking mês** — top 3 loc/mês (opt-in, sem expor salário) |
| 19.2 | **Conquistas** — badges: "Meta 5 dias", "Zero falta mês", "Melhor sábado" |
| 19.3 | Mensagem positiva no hub: *"Você está entre os melhores resultados do mês"* |
| 19.4 | Admin: painel performance equipe (gráfico evolução por operador) |

**Regra:** gamificação **privada por padrão** — ranking só se sócio habilitar na CONFIG.

---

## 10. FASE 20 — Analytics portal + CONFIG self-service

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Métricas de uso do portal QR + admin edita frota/preços |
| **Prioridade** | **P2** |
| **Manual §** | 4 (CONFIG), FASE 15 original |
| **Herda** | FASE 15 plano 6–15 |

- Acessos portal / telefones únicos / tempo médio visualização
- UI CONFIG frota e preços (sem redeploy GAS)
- Campanha recorrente CRM (N1 treino ops)

---

## 11. FASE 21 — Live BI frota (Firebase)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Ocupação tempo real no comando |
| **Prioridade** | **P2** |
| **Herda** | FASE 13 plano 6–15 |

Widget live: % frota em uso agora · overlay gráfico ocupação por horário.

---

## 12. FASE 22 — Assistente IA gestão (Anexo)

| Campo | Conteúdo |
|-------|----------|
| **Objetivo** | Diferencial futuro — perguntas em linguagem natural |
| **Prioridade** | **P3** — só após FASE 16–19 estáveis |
| **Manual §** | 11 |

**Exemplos (manual):**

- *"Analise minha operação."* → resposta com sábado pico 15h–19h + sugestão escala
- *"Por que a margem caiu?"* → leading + custos + comparativo

**Implementação mínima viável:** botão "Insights" no Dashboard → GAS monta prompt com KPIs reais → API externa (decisão sócio) ou regras locais sem LLM na v1.

**Não bloquear:** FASE 16–19 entregam 80% do valor sem IA.

---

## 13. Matriz página × fases 16–22

| Página | F16 | F15b | F17 | F18 | F19 | F20 | F21 | F22 |
|--------|-----|------|-----|-----|-----|-----|-----|-----|
| **Dashboard** | Comando + KPI contexto | — | Alertas pills | Previsão mês | Ranking equipe | — | Live frota | Botão Insights |
| **Painel Operação** | Link comando | — | Supervisor view | — | — | — | Live overlay | — |
| **Caixa** | Atalho comando | — | Alerta custo | Previsão dia | — | — | — | — |
| **Operadores** | One UI tipografia | Comunicados | Permissões | — | Performance | — | — | — |
| **gestao-pessoas** | One UI + hero jornada | Histórico + badges | Alerta banco | — | Conquistas | — | — | — |
| **Portal** | — | — | — | — | — | Analytics | — | — |
| **Sidebar** | Badge comando | — | Badge alertas | — | — | — | — | — |

---

## 14. O que NÃO muda (restrições MOVI KIDS)

| Regra | Motivo |
|-------|--------|
| Escritas GAS no browser = **GET** | I15 |
| Balcão tablet = homologação real | Modelo operacional |
| Fredoka só hero/marca/timer | DNA §3 |
| Sem POST no `api()` | Incidente 05/06 |
| F4 SMS automático pausado | QR-only |
| Deploy GAS = Nova versão Web | Regra ouro |
| FinanceiroGeral paleta isolada | Design System §2 |

---

## 15. Sequência imediata (atualizada 27/06/2026)

| # | Ação | Responsável | Status |
|---|------|-------------|--------|
| 1 | One UI Sprints A–C **v1.9.2** | Agente | ✅ 27/06 |
| 2 | Travas I24 publicação FE | Agente | ✅ 27/06 |
| 3 | **Sprint D** — homolog + assinar FASE 16/17 | Agente + Ops + sócio | ⏳ **ativo** |
| 4 | Raykelly cadastro 100% | Colaborador | ✅ 26/06 |
| 5 | Decisão **17.5 F9** + smoke tablet v1.9.2 | Sócio + Ops | ⏳ Sprint D |
| 6 | GAS ping Web **v1.5.167** | Sócio | ⏳ opcional |
| 7 | **Sprint E** FASE 19 gamificação | Agente | backlog |

---

## 16. Métricas de sucesso (premium)

| Métrica | Como medir | Meta |
|---------|------------|------|
| Tempo até decisão | Sócio abre Dashboard → entende situação | < 10 s |
| Clareza colaborador | Hub → sabe escala + ponto + meta | 3 s |
| Zero regressão balcão | TESTE_I20 + F10/F11 | 100% |
| Alertas acionáveis | Alerta → ação clara (link tela) | 100% tipos F17 |
| NPS visual interno | Feedback Milena/Raykelly | "Premium, não planilha" |

---

## 18. Progresso Premium One UI (27/06/2026)

| Fase | Peso | % fase | Notas |
|------|------|--------|-------|
| **15b** RH completo | P1 ×2 | **100%** | ✅ repo + prod |
| **16** Centro comando | P1 ×2 | **~98%** | One UI ✅ v1.9.2 · assinar D |
| **17** Alertas + Gestor | P1 ×2 | **~95%** | homolog D1 · F9 ⏳ |
| **18** Financeiro previsão | P2 | **~70%** | UI ✅ Sprint B · PDF Sprint H |
| **19** Gamificação | P2 | 0% | Sprint E |
| **20** Portal analytics | P2 | ~15% | — |
| **21** Live BI frota | P2 | ~10% | — |
| **22** Assistente IA | P3 | 0% | Anexo |

**Total plano (P1 peso 2×):** **~78% concluído · ~22% restante**  
**Próxima fase ativa dev:** **Sprint D** fechar FASE 16/17 → `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`

---

## 19. Referência cruzada planos anteriores

| Plano antigo | Destino no Premium |
|--------------|-------------------|
| FASE 10 CRM LTV | FASE 20 + F19 performance |
| FASE 11 Holding | Mantém backlog Anexo |
| FASE 12 Drill-down | FASE 18 financeiro |
| FASE 13 Live BI | **FASE 21** |
| FASE 14 mini-DRE | ✅ + FASE 18 previsão |
| FASE 15 Gestão Pessoas | **FASE 15b** + jornada |

---

*Documento vivo — revisar ao fechar FASE 16.*
