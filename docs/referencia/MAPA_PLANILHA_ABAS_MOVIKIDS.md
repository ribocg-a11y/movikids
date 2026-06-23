# Mapa canônico — Planilha MOVI KIDS

**Atualizado:** 23/06/2026 · GAS **v1.5.138** · FE **v1.8.116**  
**Planilha:** `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618`  
**Auditoria ao vivo (admin):** `?action=diagnosticoPlanilhaCompletoAdmin&adminPin=1416`  
**Teste:** `scripts/testes/TESTE_AUDITORIA_PLANILHA_COMPLETA_READONLY.ps1`

---

## Regra de ouro — onde cada dado “mora”

| Dado | Aba canônica | Nunca confundir com |
|------|--------------|---------------------|
| Locação / timer / conta do dia | **LOCACOES** | — |
| Login balcão (PIN hash) | **OPERADORES_SISTEMA** | Ponto RH |
| Sessão “Entrou 14:30” sidebar | **Script Properties GAS** | FOLHA_PONTO |
| Cadastro RH (CPF, PIX…) | **COLABORADORES_RH** | OPERADORES_SISTEMA |
| Ponto entrada/saída | **FOLHA_PONTO** | Login balcão |
| Banco de horas saldo | **BANCO_HORAS** | Jornada calculada na API |
| Meta/bônus ao vivo | **AUDITORIA** (encerramentos) | METAS_COLABORADORES (seed) |
| Holerite mensal snapshot | **HOLERITES** | Memorial FOLHA |

---

## Todas as abas (GAS mapeadas)

### Operação e financeiro

| Aba | Grava runtime? | Colunas / notas | Páginas / APIs |
|-----|----------------|-----------------|----------------|
| **LOCACOES** | **Sim** | Header linha 9 · 28 cols · col Y=timestamp, S=conta_id | `index.html` balcão, portal, caixa, dashboard |
| **CUSTOS** | **Sim** | Header linha 9 | Caixa, dashboard |
| **CONFIG** | **Sim** (admin) | Preços, frota, JSON operacional | Sistema, nova locação |
| **DASHBOARD** | Fórmulas | KPIs mensais | Dashboard admin |
| **FOLHA** | Memorial | B7 salário, B11 VA, B28–30 provisões | Dashboard viabilidade CLT |
| **INVESTIMENTO** | Manual / repair | Payback | Dashboard payback |
| **PLANO_CONTAS** | Opcional | Mini-DRE categorias | Dashboard custos (F14) |
| **OPERADORES_SISTEMA** | **Sim** | id, nome, PIN hash, perfil | Login balcão · `loginOperador` |
| **RESPONSAVEIS** | **Sim** | CRM clientes | Relacionamento |
| **RELATORIOS** | **Sim** | Links PDF | Relatórios admin |
| **Analise** | Legado | — | — |

### Auditoria / logs

| Aba | Grava? | Uso |
|-----|--------|-----|
| **AUDITORIA** | **Sim** | Encerramentos · metas RH · histórico |
| **AUD_TURNO** | **Sim** | Login/logout operador balcão |
| **AUD_SMS** | Log | SMS pausado (QR only) |
| **AUD_WHATSAPP** | Log | WhatsApp pausado |
| **AUD_RESPONSAVEIS** | Log | Import CRM |

### Gestão Pessoas (9 abas)

| Aba | Grava? | Função GAS principal | Página |
|-----|--------|----------------------|--------|
| **COLABORADORES_RH** | **Sim** | `salvarCadastroColaborador_` | `gestao-pessoas.html` · gate balcão 428 |
| **FOLHA_PONTO** | **Sim** | `registrarPontoColaborador_` | Colaboradores → Meu ponto |
| **ESCALA_COLABORADORES** | Seed / parcial | `gpEnsureEscalaRow_` | Jornada · alertas |
| **FALTAS_AUSENCIAS** | Sync | `gpSyncFaltasFromJornada_` | Jornada |
| **HOLERITES** | Snapshot | `gpPersistHoleriteSnapshot_` | Holerite PDF |
| **METAS_COLABORADORES** | Seed | Installer | Metas vivas = AUDITORIA |
| **BANCO_HORAS** | Saída ponto + repair | `gpPersistBancoHoras_` · `repairBancoHorasAdmin` | Alertas · jornada |
| **COMUNICADOS_RH** | **Sim** (admin) | `salvarComunicadoRhAdmin_` | Hub colaborador |
| **AVALIACOES_RH** | **Sim** (admin) | `salvarAvaliacaoRhAdmin_` | Hub colaborador |

---

## COLABORADORES_RH — schema (linha 1 = header, dados desde linha 2)

| Col | Campo | Quem grava |
|-----|-------|------------|
| A | operador_id | Installer / seed |
| B | nome | `salvarCadastroColaborador_` |
| C | funcao | Seed (admin edit futuro) |
| D | cpf | Cadastro colaborador |
| E | nascimento | Cadastro |
| F | telefone | Cadastro |
| G | email | Cadastro (opcional gate) |
| H | endereco | Cadastro |
| I | emergencia | Cadastro |
| J | admissao | Cadastro (`dd/MM/yyyy`) |
| K | pix | Cadastro |
| L–Q | salário, VA, meta, turno | Seed |
| R | ativo | Seed |
| S | cadastro_pct | Atualizado no save (100) |
| T | atualizado_em | Timestamp save |

**Gate balcão:** `loginOperador_` exige 8 campos obrigatórios (sem email) via `gpCadastroOk_`.

---

## FOLHA_PONTO — schema

| Col | Campo |
|-----|-------|
| A | id |
| B | operador_id |
| C | data (`dd/MM/yyyy`) |
| D | dia_semana |
| E | entrada (`HH:mm`) |
| F | saida |
| G | horas |
| H | situacao |
| I | registrado_em |

**Só grava:** `gestao-pessoas.html` → Meu ponto → PIN do colaborador. Admin Operadores = **leitura**.

---

## Incidente I45 — cadastro “sumiu” (Raykelly)

**Causa:** dados do cadastro RH **só** persistem em `COLABORADORES_RH` via API `salvarCadastroColaborador`. Se o FE não chamou a API (sem PIN, preview ADM, modo mock) ou `instalarAbasGestaoPessoasAdmin` rodou com `clear()`, os campos voltam ao seed vazio.

**Fix v1.5.138:** installer **não apaga** abas com dados · FE v1.8.116 bloqueia “salvar falso” · API `diagnosticoPlanilhaCompletoAdmin`.

---

## Como auditar de novo

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\testes\TESTE_AUDITORIA_PLANILHA_COMPLETA_READONLY.ps1
.\scripts\testes\TESTE_GESTAO_PESSOAS_READONLY.ps1
```

OAuth célula a célula (opcional): `C:\Users\riboc\Projects\google-drive-sheets-auth\scripts\auditar-planilha-movikids.js`

---

## Deploy pendente (23/06)

1. **GAS v1.5.138** — Nova versão Web (sócio)
2. **repairBancoHorasAdmin** — zerar I44
3. **FE v1.8.116** — push Pages
4. **Raykelly** — refazer cadastro em Colaboradores (dados não estão em outra aba)
