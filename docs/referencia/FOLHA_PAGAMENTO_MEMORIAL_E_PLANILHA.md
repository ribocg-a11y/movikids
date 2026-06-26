# Memorial de folha de pagamento — MOVI KIDS (Golden Shopping Calhau)

**Objetivo:** aba **`FOLHA`** na planilha `MOVIKIDS_Planilha_Base` — memorial de cálculo dinâmico para 2 atendentes CLT (salário mínimo + VT + VA).

**Importante:** este memorial é **ferramenta de planejamento**. A folha **oficial** deve ser fechada pelo contador + eSocial/DCTFWeb. Confirme CCT do **Maranhão** (comércio varejista) e enquadramento Simples antes de contratar.

---

## 1. Premissas legais (2026)

| Item | Referência | Valor / regra |
|------|------------|---------------|
| Salário mínimo nacional | Decreto 12.797/2025 | **R$ 1.621,00/mês** (R$ 7,37/h; R$ 54,04/dia) |
| Jornada | CF art. 7º XIII + CLT art. 58 | **44 h/semana** · máx. **8 h/dia** (extra só com acordo/banco) |
| Horas mês (padrão CLT) | 220 h/mês | Base para hora = salário ÷ 220 |
| Regime | CLT | Carteira, eSocial, FGTS Digital |
| Função | CBO **5211-40** (Atendente de lojas e similares) ou **5211-25** | Atendente de lojas |
| VT | Lei 7.418/85 | Obrigatório se declarado necessidade · desconto empregado **até 6%** do salário-base · excedente = empresa |
| VA | PAT (Lei 6.321/76) | **Cartão PAT** — não pagar em dinheiro · **sem** INSS/FGTS se dentro do PAT |
| Intervalo | CLT art. 71 | Jornada **> 6 h** → intervalo **1 h a 2 h** (não conta na jornada) |
| Interjornada | CLT art. 66 | **11 h** entre um dia e outro |
| DSR | Lei 605/49 | Reflexo em comissões/variáveis; provisões de férias/13º já consideram estrutura mensal |
| Domingo comércio | Lei 10.101/2000 + CCT | Permitido com **folga compensatória** e **1 domingo de folga/mês** (comércio) — validar CCT MA |

**Piso MA:** Maranhão segue, em regra, o **mínimo nacional** (R$ 1.621) salvo CCT específica acima — **preencher na aba após consultar sindicato patronal/empregados do comércio em SLZ**.

---

## 2. Encargos e provisões (memorial de custo)

### 2.1 Empresa no **Simples Nacional** (cenário mais provável — ME quiosque)

No Simples, **INSS patronal (20%)**, SAT, Salário-Educação e Sistema S **não são recolhidos separadamente** sobre a folha — entram no DAS (depende do **Anexo** e faixa). Na aba, use o parâmetro **Regime = Simples** para **não** somar 20% patronal em cima.

**Provisões e FGTS (sempre provisionar na planilha):**

| Componente | % sobre salário-base | Observação |
|------------|---------------------|------------|
| FGTS (depósito mensal) | **8,00%** | Depósito na conta vinculada |
| 13º salário | **8,33%** | 1/12 avos por mês |
| Férias + 1/3 | **11,11%** | 1/12 + 1/3 constitucional |
| Multa FGTS (provisão rescisória) | **4,00%** | Média estatística demissão s/ JCA |
| **Subtotal provisões + FGTS** | **~31,44%** | Referência contábil (ME Simples) |

**Benefícios (fora da base INSS/FGTS se corretos):**

| Benefício | Custo empresa típico | Desconto empregado |
|-----------|---------------------|-------------------|
| Vale-transporte | **B10 dias × B9 tarifa/dia** (B9 = 2× passagem) − desconto 6% | min(6% SM, custo VT) |
| Vale-alimentação (PAT) | Valor/mês **máx.** por funcionário | **Sem desconto** (se política da empresa) |

**Regra VA na aba:** **B11** = teto mensal (ex. R$ 400) · **B12** = dias trabalhados · **B25** = VA/dia = `B11÷B12` (nunca ultrapassa B11 no mês).

### 2.2 Empresa **Lucro Presumido / Real** (se migrar)

Somar **~38% a 68%** além do salário (INSS 20% + SAT + terceiros + FGTS + provisões). A aba tem flag **Regime Tributário** para ligar/desligar essas linhas.

### 2.3 Descontos do empregado (folha líquida)

| Desconto | Base | Faixa 2026 (SM) ~ |
|----------|------|-------------------|
| INSS | Salário contributivo | **7,5%** sobre R$ 1.621 ≈ **R$ 121,58** |
| IRRF | Após INSS | Isento no salário mínimo (sem dependentes) |
| VT | min(6% SM, custo VT) | max **R$ 97,26** (6% de 1.621) |

---

## 3. Horário do shopping × jornada proposta (2 atendentes)

**Funcionamento informado:**

| Dia | Abertura–fechamento | Horas abertas |
|-----|---------------------|---------------|
| Seg–Sáb | 10h–22h | 12 h |
| Dom | 13h–21h | 8 h |

**Cobertura mínima:** ~**80 h/semana** (1 pessoa o tempo todo).  
**Capacidade 2 × 44 h:** **88 h/semana** → **8 h** de margem (troca de turno, almoço escalonado, pico).

### 3.1 Escala recomendada — **turnos espelhados + rodízio de domingo**

| Turno | Seg–Sex | Sábado | Domingo | Total semanal |
|-------|---------|--------|---------|---------------|
| **Atendente A** | 10h–18h (8h) | 10h–14h (4h) | **Folga** | **44 h** |
| **Atendente B** | 14h–22h (8h) | 14h–22h (8h) | 13h–21h (8h) | **48 h** ⚠ |

O turno B **excede 44 h** nesse desenho — **ajustar** uma das opções:

**Opção 1 (recomendada): rodízio de domingo**

| Semana | Atendente A | Atendente B |
|--------|-------------|-------------|
| Par | Dom folga | Dom 13h–17h (4h) + compensa na semana |
| Ímpar | Dom 13h–17h (4h) | Dom folga |

Recalcular semana B para **44 h**: ex. **Seg–Qui 14h–22h (32h) + Sex 14h–20h (6h) + Sáb 14h–22h (8h) − ajuste 2h** = 44h.

**Opção 2: contratar 3º atendente meio período** nos picos sáb/dom (custo extra na planilha).

**Opção 3: acordo individual / banco de horas** (com advogado trabalhista + registro) — **não automatizar** sem validação.

### 3.2 Intervalos obrigatórios

- **Almoço:** 1 h (jornada 8 h) — escalar para **nunca ficar quiosque vazio** (overlap 14h–18h Seg–Sex ajuda).
- **Ponto:** usar REP ou app homologado — shopping exige controle.
- **Menores:** não contratar < 18 anos para este horário sem autorização.

---

## 4. Armadilhas trabalhistas (quiosque / shopping)

| Risco | Por quê | Mitigação |
|-------|---------|-----------|
| **Pejotização** | PJ no balcão = vínculo CLT | Sempre **CLT + eSocial** |
| VT em dinheiro | Vira salário (INSS+FGTS) | Cartão VT ou recarga documentada |
| VA em dinheiro | Perde PAT, vira salário | **Cartão Alelo/Swile/etc. PAT** |
| Não descontar 6% VT | VT vira verba salarial | Descontar em folha sempre |
| Jornada > 44 h sem acordo | Passivo horas extras | Ponto + escala validada |
| Domingo sem folga mensal | Infração comércio | Rodízio + registro |
| Intervalo < 1 h | Adicional + multa | Escala com cobertura |
| FGTS / eSocial atrasado | Multa + bloqueio | Contador + calendário |
| Acúmulo de funções | Gerente + caixa + limpeza | Descritivo de cargo **atendente** |
| Adicional noturno | 22h–5h (urbano) | Turno 14–22 **não** incide; se estender > 22h, calcular 20% |
| CCT MA ignorada | Piso/benefícios maiores | Preencher seção **CCT** na aba |
| Rescisão sem provisão | Falta caixa na demissão | Manter provisões 31,44% |
| Estágio no balcão operacional | Caracterização CLT | Não usar estagiário como operador fixo |

---

## 5. Checklist antes de contratar

- [ ] Confirmar **CNPJ** enquadramento Simples (**Anexo** correto com folha)
- [ ] Obter **CCT** comerciário Maranhão / São Luís
- [ ] Cadastro **eSocial** + **FGTS Digital**
- [ ] Exame **ASO** admissional
- [ ] **PCMSO/PGR** (mesmo pequeno quiosque — consultar SESMT/ contador)
- [ ] **REP** (registro de ponto)
- [ ] Contrato + descrição cargo **Atendente de loja**
- [ ] Declaração **VT** (optante sim/não)
- [ ] Adesão **PAT** (vale-alimentação)
- [ ] Seguro / exigências **Golden Shopping Calhau** (documentação lojista)
- [ ] Contador responsável pela **folha oficial**

---

## 6. Estrutura da aba `FOLHA` (Google Sheets)

A aba é dividida em **blocos verticais** (mesma aba, colunas A–H):

| Bloco | Linhas | Função |
|-------|--------|--------|
| **A — ENTRADA (você preenche)** | 1–35 | Parâmetros que alimentam tudo — **não apagar fórmulas abaixo** |
| **B — PARÂMETROS CALCULADOS** | 37–55 | Derivados (6% VT, hora, % provisões) |
| **C — FUNCIONÁRIOS (1–10 linhas)** | 57–70 | Nome, salário, dias VT, tarifa, **VA/dia calc.** (B25) — **quantidade ativa = parâmetro B4** |
| **D — MEMORIAL POR FUNCIONÁRIO** | 72–95 | Salário, descontos, líquido, custo empresa |
| **E — TOTAIS EMPRESA** | 97–115 | Soma folha + encargos + benefícios + **custo total mensal** |
| **F — PROVISÕES DETALHE** | 117–130 | FGTS, 13º, férias, multa |
| **G — ESCALA SUGERIDA** | 132–155 | Consulta visual (não entra no cálculo) |
| **H — PERGUNTAS / PENDÊNCIAS** | 157–180 | Campos livres + checklist CCT |

**Instalação (automática — recomendado):**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\criar-aba-folha.ps1
```

Script canônico: `C:\Users\riboc\Projects\google-drive-sheets-auth\scripts\criar-aba-folha-movikids.js`  
**Não depende do GAS v1.5.79** — é aba na planilha Google via API OAuth.

**Alternativa manual:** Apps Script `scripts/planilha/instalarAbaFolha.gs` no editor vinculado à planilha.  

---

## 7. Fórmulas-chave (referência)

```
Hora = Salário_Base / 220
Desconto_VT_empregado = MIN(Salário × 6%; Tarifa × Dias_VT)
Custo_VT_empresa = MAX(0; Tarifa × Dias_VT − Desconto_VT_empregado)
VA_mês = MIN(B11; Valor_VA_dia × Dias_trabalhados)   → na aba: **B11** é o teto; custo = **B11** por funcionário ativo
Valor_VA_dia = B11 / B12   (ex.: 400 / 26 ≈ 15,38)
FGTS = Salário × 8%
Provisão_13 = Salário × 8,33%
Provisão_Férias = Salário × 11,11%
Provisão_Multa_FGTS = Salário × 4%
INSS_empregado (SM) ≈ Salário × 7,5%  [tabela progressiva na aba]
Custo_empresa_mês = Salário + FGTS + Provisões + VT_empresa + VA + (INSS_patronal se não Simples)
```

---

## 8. Simulação rápida (2 × SM, jun/2026 — **exemplo**)

Premissas: SM R$ 1.621 · VT **R$ 4,40/passagem × 2/dia = R$ 8,80/dia** · **~22 dias VT/mês** (2 folgas/semana) · VA **R$ 400/mês** (≈ R$ 18,18/dia × 22) · Simples (sem 20% patronal separado).

**Fórmula VT no GAS (v1.5.166+):** `B10 × B9` — **sem** multiplicar por 2 de novo (B9 já é ida+volta).

| Item | Por funcionário | 2 funcionários |
|------|-----------------|--------------|
| Salário bruto | 1.621,00 | 3.242,00 |
| FGTS 8% | 129,68 | 259,36 |
| Provisões 23,44% | 379,96 | 759,92 |
| VT passes (22×8,80) | **193,60** | **387,20** |
| VT (empresa, após 6%) | ~96,34 | ~192,68 |
| VA PAT (teto mensal) | **400,00** | **800,00** |
| **Custo empregador ~** | **~2.635** | **~4.926/mês** |

*Valores ilustrativos — a aba recalcula ao mudar tarifa, dias e nº funcionários.*

---

## 9. Repair de fórmulas (I25 — GAS v1.5.91)

Se células da aba FOLHA exibem `#NAME?` ou `#ERROR!`, o GAS **não** consegue gravar fórmulas PT via `setFormula`/`setValue`. Use o repair oficial:

**PowerShell (Web App):**

```powershell
Invoke-RestMethod -Uri "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=repairFolhaAdmin&adminPin=1416"
```

**Validação:**

```powershell
.\scripts\testes\TESTE_FOLHA_FORMULAS_READONLY.ps1
.\scripts\testes\TESTE_FASE9_FOLHA_READONLY.ps1
```

| Métrica | Valor esperado (2 func., jun/2026) |
|---------|-------------------------------------|
| B25 (VA/dia) | ~15,38 |
| B68 (custo total) | ~5269,96 |
| D36 (dias VT) | ~22 (B10 — 2 folgas/semana) |
| B9 (tarifa ida+volta/dia) | **8,80** (2× R$ 4,40) |
| `folhaPlanejamento.fonte` | FOLHA |

**Implementação:** `folhaFlushFormulasUser_` — Sheets Advanced Service, `valueInputOption: USER_ENTERED`.  
**Docs:** `DEPLOY_v1.5.91_FOLHA_REPAIR_USER_ENTERED.md` · `INCIDENTE_I25_FOLHA_FORMULAS_NAME_2026-06-13.md`

**Regra:** após qualquer deploy GAS que altere fórmulas FOLHA, rodar repair + teste readonly.

**Validação produção 14/06/2026:** `TESTE_FOLHA_FORMULAS_READONLY` ok · B68=5269,96 · incidente **I25 fechado**.

---

## 10. Próximos passos sugeridos

1. Executar script e preencher **ENTRADA**  
2. Enviar print dos totais ao **contador**  
3. Solicitar **CCT MA** e atualizar linha “Piso CCT” na aba  
4. Validar escala com **Golden Shopping** (normas de lojista)  
5. ~~Integrar custo folha no **Dashboard**~~ → **FASE 9** ✅ prod (GAS v1.5.91 + FE v1.8.10+)

---

**Arquivos relacionados**

- Script instalação: `scripts/planilha/instalarAbaFolha.gs`  
- Repair GAS: `repairFolhaAdmin` / `repairFolhaFormulasRemote`  
- Teste: `scripts/testes/TESTE_FOLHA_FORMULAS_READONLY.ps1`  
- Planilha: `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618`
