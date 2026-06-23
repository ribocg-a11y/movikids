# Auditoria RH / Folha / Persistência — MOVI KIDS

**Data:** 22/06/2026  
**Escopo:** GAS v1.5.129 · FE v1.8.110 (repo) · planilha `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618`  
**Método:** revisão código canônico + incidentes sessão 20–22/06  
**Complementa:** `FASE_15_GESTAO_PESSOAS.md` · `FASE_9_FOLHA_VIABILIDADE_CLT.md` · `../referencia/FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md`

---

## 1. Mapa de abas e gravação real

### 1.1 Gestão Pessoas (9 abas GP)

| Aba | Constante GAS | Grava em runtime? | Funções que escrevem | Observação |
|-----|---------------|-------------------|----------------------|------------|
| `COLABORADORES_RH` | `SH_COLAB_RH` | **Sim** | `salvarCadastroColaborador_`, `gpRepairAdmissaoRhCell_`, `gpSyncRhColaboradoresPadrao_`, installer | Cols 2,4–11,18–19 no cadastro; **salário/VA/meta/turno** só no seed — sem API de edição |
| `FOLHA_PONTO` | `SH_FOLHA_PONTO` | **Sim** | `registrarPontoColaborador_` | Entrada `appendRow`; saída `setValue` cols 6–7, 9 |
| `ESCALA_COLABORADORES` | `SH_ESCALA_COLAB` | **Parcial** | `gpEnsureEscalaRow_`, installer | Sem UI admin para editar escala |
| `COMUNICADOS_RH` | `SH_COMUNICADOS_RH` | **Sim** | `salvarComunicadoRhAdmin_` | Admin index |
| `AVALIACOES_RH` | `SH_AVALIACOES_RH` | **Sim** | `salvarAvaliacaoRhAdmin_` | Admin index |
| `BANCO_HORAS` | `SH_BANCO_HORAS` | **Só seed** | installer / `gpEnsureRowByOpId_` | `gpAnaliseJornadaColab_` calcula `bancoProjetado` — **não persiste** |
| `FALTAS_AUSENCIAS` | `SH_FALTAS` | **Não** | installer vazio | Jornada marca “Falta” só no JSON da API |
| `HOLERITES` | `SH_HOLERITES` | **Não** | installer vazio | Holerite **só em memória** (`gpCalcHollerite_`) |
| `METAS_COLABORADORES` | `SH_METAS_COLAB` | **Só seed** | installer 1 linha demo | Metas **vivas** vêm de **AUDITORIA** + `metaOperadorCfg_` |

### 1.2 Memorial / operação (contexto folha)

| Aba | Uso RH | Gravação |
|-----|--------|----------|
| `FOLHA` | Memorial planejamento (B7 salário, B11 VA/mês, B12 dias VA, provisões 13º/férias B28–30) | Repair fórmulas admin; **não** holerite individual |
| `OPERADORES_SISTEMA` | PIN balcão | `loginOperador_` lê; cadastro gate HTTP 428 |
| `AUDITORIA` | Locações encerradas → meta/bônus | Somente leitura para GP |
| `LOCACOES` | Operação balcão | Fora do escopo RH direto |

---

## 2. Fluxos de dados (onde cada coisa “mora”)

```
Balcão (locações) ──► AUDITORIA ──► gpMetasPainel_ (bônus dias)
                         │
COLABORADORES_RH ◄── salvarCadastroColaborador (PIN colab)
       │
       ├──► gpBuildPainelColaboradorPayload_ ──► buscarPainelColaborador (API)
       │              │
       │              └──► gpCalcHollerite_ (memória) ──► holerite JSON
       │
FOLHA_PONTO ◄── registrarPontoColaborador (PIN colab)

FOLHA (memorial) ──► lerFolhaPlanejamento_ ──► Dashboard viabilidade CLT (FASE 9)
HOLERITES (aba)     ──► (vazio) — arquivo oficial mensal NÃO implementado
```

---

## 3. Cálculos — GAS `gpCalcHollerite_` (fonte canônica produção)

**Arquivo:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` ~7695–7773

| Item | Regra | Quinzena |
|------|-------|----------|
| Salário | `salarioContratual` (RH col 11 ou 1621) × `fatorMes` (dias admissão) | Q1: 40% · Q2: 60% |
| VA | `vaMensal` (400) × `fatorMes`; exibido **só Q2** | Q2 |
| VT passes | `5×24×2.34` × `fatorMes` | Q2 |
| VT desconto | 6% de `salarioProp` (mês proporcional) | Q2 |
| Bônus meta | `gpMetasPainel_.bonusTotal` (AUDITORIA) | Q2 |
| INSS / IRRF | Tabela progressiva 2026 sobre `brutoMes = salarioProp + bonus` | **Q2 only** |
| FGTS | 8% de `brutoMes` | Q2 (informativo) |
| 13º / férias / multa FGTS | — | **Só aba FOLHA memorial** — não no holerite colab |
| Faltas | Parâmetro `faltas` existe | Sempre **0** nos callers |

**Admissão:** `gpDiasTrabalhadosNoMes_` · inválida → 0 dias (v1.5.129).

**Bônus meta (AUDITORIA):** dia conta se locações no turno **`> meta`** (estrito); UI “meta OK hoje” usa **`>=`** — inconsistência documentada (RH-G6).

---

## 4. Cálculos — Frontend (duplicidade)

| Superfície | Função | Alinhado com GAS? |
|------------|--------|-------------------|
| Tela holerite colab | `mkHolBuildHtml_` + `pg.holerite` da API | **Sim** (quando GAS envia holerite) |
| Hub “Meus benefícios” | `gpBeneficiosResumo_` → **`calcFolhaPagamento`** | **Não** — modelo mensal, INSS na quinzena, VT 6% em `pg.base` |
| Holerite fallback | `calcFolhaPagamento` | **Não** — sem split 40/60 |
| Admin holerite | render GAS `folha[].holerite` | **Sim** |
| Demo/mock | `PESSOAS` + `calcFolhaPagamento` | N/A |

**Incidente:** **I40** — hub benefícios diverge do holerite GAS.

---

## 5. Cadastro RH

| Campo | Onde grava | Gate |
|-------|------------|------|
| nome, cpf, nascimento, telefone, email, endereço, emergência, admissão, pix | `COLABORADORES_RH` | `salvarCadastroColaborador_` |
| `cadastro_pct`, `cadastro_ok` | cols 18–19 | Recalculado no save |
| PIN balcão | `OPERADORES_SISTEMA` | **Não** via tela colaborador |
| Bloqueio balcão | `loginOperador_` HTTP **428** se cadastro incompleto | `mk-auth.js` redirect `completeCadastro=1` |

**Incidentes:** I36 getRange (v1.5.127) · I39 admissão/VA · I38 preview confundiu UX.

**Lacuna RH-G1:** email salvo mas **não** obrigatório em `gpCadastroOk_` (8 campos).

---

## 6. Ponto e jornada

| Ação | Persiste | API |
|------|----------|-----|
| Entrada/saída colaborador | `FOLHA_PONTO` | `registrarPontoColaborador` |
| Preview admin | **Não** | flash UI only |
| Análise jornada (atraso, extra, banco projetado) | **Não** | `gpAnaliseJornadaColab_` JSON |
| Alertas ponto admin | Lê `FOLHA_PONTO` + turno | `alertasPontoGestaoAdmin` |

**Lacuna RH-G2:** `BANCO_HORAS` nunca atualizado após cálculo.

**Lacuna RH-G3:** `FALTAS_AUSENCIAS` sem writer — descontos de falta não aplicados no holerite.

---

## 7. Bônus — regras e fontes

| Camada | Fonte | Regra |
|--------|-------|-------|
| Config hardcoded | `metaOperadorCfg_` | ids 2,3,4; meta 20 loc/dia; R$100/dia bônus; janela turno |
| Ao vivo | `gpMetaPayloadFromCtx_` / AUDITORIA | Encerramentos no turno; `> meta` para dia bônus |
| Planilha | `METAS_COLABORADORES` | Seed estático; `gpMetasFromCtx_` se sem AUDITORIA |
| Holerite | `bonusTotal` merged | Só 2ª quinzena |

**Lacuna RH-G4:** novo operador sem entrada em `metaOperadorCfg_` → meta zerada até config manual.

---

## 8. Benefícios e tributos — resumo

| Benefício/tributo | Holerite colab (GAS) | Memorial FOLHA | FE hub |
|-------------------|----------------------|----------------|--------|
| VA R$400/mês | Proporcional admissão | B11/B12 | Recalcula local (I40) |
| VT | 280,80/mês prop. | B9 tarifa, B10 dias | 6% base quinzena (errado) |
| INSS | Q2, base mês prop. | Fórmulas col C memorial | Q? na quinzena |
| IRRF | Q2; dependentes **0** fixo | — | FE suporta dependentes; GAS não |
| FGTS 8% | Informativo Q2 | Provisões memorial | Fallback FE |
| 13º / férias | Não | B28–30 | Não |

---

## 9. Incidentes registrados (sessão 22/06)

| ID | Título | Status |
|----|--------|--------|
| **I38** | Banner preview com PIN colab | FE v1.8.110 repo |
| **I39** | VA/salário sem proporcional admissão | GAS v1.5.129 repo · Web pendente |
| **I40** | Hub benefícios ≠ holerite GAS | Aberto | ✅ FE v1.8.111 |
| **I41** | `ping_` v1.5.107 vs repo | Aberto (cosmético) | ✅ GAS v1.5.130 |

Ver `MAPA_ERROS_FALHAS_BUGS.md` e `../arquivo/incidentes/INCIDENTE_I38_*.md`, `I39_*.md`.

---

## 10. Lacunas arquiteturais (backlog P1–P3)

| ID | Lacuna | Prioridade | Ação sugerida |
|----|--------|------------|---------------|
| RH-G1 | `HOLERITES` nunca populada | P1 | ✅ `gpPersistHoleriteSnapshot_` (2ª quinzena) |
| RH-G2 | `BANCO_HORAS` estático | P1 | ✅ `gpPersistBancoHoras_` após jornada |
| RH-G3 | `FALTAS_AUSENCIAS` morta | P2 | ✅ `gpSyncFaltasFromJornada_` |
| RH-G4 | `METAS_COLABORADORES` desatualizada | P2 | Job sync AUDITORIA → sheet ou deprecar aba |
| RH-G5 | Sem API editar salário/VA/meta/turno | P2 | Admin RH ficha completa |
| RH-G6 | Bônus `>` vs `>=` meta | P2 | Unificar regra negócio |
| RH-G7 | `va_diario` col 12 morta (sempre 20) | P3 | Derivar de B11/B12 ou remover col |
| RH-G8 | `vaMensal` hardcoded 400 em parser RH | P3 | Ler FOLHA B11 quando col vazia |
| RH-G9 | VT hardcoded `5*24*2.34` | P2 | Ligar FOLHA B9/B10 ou config por colab |
| RH-G10 | IRRF sem dependentes no GAS | P2 | Campo RH + `gpCalcIrrf_` |
| RH-G11 | Q1 sem INSS no holerite preview | P3 | Documentar como simplificação ou corrigir |
| RH-G12 | Mock `PESSOAS` merge em prod | P3 | Não fazer merge com mock keys em `MK_GP_PROD` |
| RH-G13 | `metaOperadorCfg_` só ids fixos | P2 | Ler `COLABORADORES_RH` cols 13–14 |
| RH-G14 | Histórico desempenho usa sheet meta, não AUDITORIA | P3 | Alinhar `gpHistoricoDesempenhoColab_` |
| RH-G15 | GAS Web defasado (v1.5.107) | **P0** | Nova versão Web v1.5.129 |

---

## 11. Checklist validação pós-correção

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\testes\TESTE_GESTAO_PESSOAS_READONLY.ps1
.\scripts\testes\TESTE_VA_ADMISSAO_PROPORCIONAL_READONLY.ps1
.\verify-gas-deploy.ps1
```

**Tablet:**

- [ ] Colaboradores sem banner ADM após login PIN (I38 · v1.8.110)
- [ ] Raykelly VA hub ≈ holerite após GAS Web v1.5.129 (I39)
- [ ] Ponto entrada grava linha em `FOLHA_PONTO`
- [ ] Cadastro 100% libera balcão
- [ ] Holerite PDF 2ª quinzena com quinzena 40/60 visível

---

**Status pós-fix 22/06:** FE **v1.8.111** · GAS **v1.5.130** — I38–I41 corrigidos no repo · RH-G1/G2/G3 parcial (holerite+banco+faltas sync) · **Nova versão Web pendente (sócio)**

---

## 12. O que ficou para trás (honesto)

1. Dump **ao vivo** das abas Google — matriz validada por **código**; rodar `TESTE_GESTAO_PESSOAS_READONLY.ps1` após Web v1.5.130.
2. **Milena cadastro pedido de novo** — monitorar; hipótese cache FE ou pct planilha.
3. **IRRF dependentes** (RH-G10) — campo RH + GAS ainda não implementado.
4. **Admin editar salário/VA/turno** (RH-G5) — sem UI; só seed planilha.
5. **Provisões 13º/férias** — memorial FOLHA only; holerite colab não inclui (by design FASE 9).
6. **Publicação:** `git push` FE v1.8.111 + sócio Nova versão Web GAS v1.5.130.
