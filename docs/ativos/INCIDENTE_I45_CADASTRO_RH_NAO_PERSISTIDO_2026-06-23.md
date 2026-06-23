# I45 — Cadastro RH Raykelly não persistido

**Registrado:** 23/06/2026  
**Status:** fix repo GAS **v1.5.138** · FE **v1.8.116**  
**Mapa:** `MAPA_PLANILHA_ABAS_MOVIKIDS.md` · `MAPA_ERROS_FALHAS_BUGS.md` I45

## Sintoma

Raykelly completou cadastro na tela, mas API mostra **25%** (só nome + admissão do seed). Milena **100%**. Ponto não grava no admin Operadores.

## Investigação (API 23/06 ~15:04)

| Colaborador | cadastroOk | Onde está |
|-------------|------------|-----------|
| Milena id 2 | **true** | `COLABORADORES_RH` cols preenchidas |
| Raykelly id 3 | **false** | Seed vazio — **não há cópia em outra aba** |

## Causa raiz

1. **Único destino** do cadastro: `COLABORADORES_RH` via `salvarCadastroColaborador_` + PIN.
2. **FE bug:** sem `gpSessionPin`, `salvarCadastro()` ia para o hub **sem chamar API** (falso sucesso).
3. **Installer perigoso:** `instalarAbasGestaoPessoasCore_` fazia `sh.clear()` em todas as abas RH — apagava cadastros.
4. **Seed enganoso:** `cadastro_pct=100` na planilha com campos vazios (pct real = cálculo GAS).

## Fix

| Camada | Versão | Mudança |
|--------|--------|---------|
| GAS | v1.5.138 | Installer preserva dados · `diagnosticoPlanilhaCompletoAdmin` · `gpSetSheetRow_` · cache invalidation |
| FE | v1.8.116 | Salvar exige PIN · alerta se API falhar · limpa `completeCadastro` URL |

## Recuperação Raykelly

**API 23/06 (diagnosticoPlanilhaCompletoAdmin):** id 3 · **25%** · CPF/telefone/PIX **vazios** na `COLABORADORES_RH`.

**Histórico:** em **20/06** (GAS v1.5.127) cadastro chegou a **100%** — nome **Raykelly Dos Santos Silva** — depois **apagado** (installer `clear()` ou re-seed).

**Milena id 2:** **100% intacta** (CPF na planilha, máscara audit `***6310`) — **não será apagada** pelos fixes.

**Recuperar PII Raykelly:** (1) Histórico de versões da aba `COLABORADORES_RH` na planilha Google · (2) após Web v1.5.139 + acesso anônimo: `buscarTextoPlanilhaAdmin&termo=Raykelly` · (3) `salvarCadastroRhAdmin` com dados recuperados.

**GAS v1.5.139:** `salvarCadastroRhAdmin` · `repararRhPlanilhaAdmin` · `exportarCadastroRhAdmin` · `buscarTextoPlanilhaAdmin`.

## Ponto

Registrar **somente** em `gestao-pessoas.html` → Meu ponto. Painel Admin → Operadores **não grava** `FOLHA_PONTO`.
