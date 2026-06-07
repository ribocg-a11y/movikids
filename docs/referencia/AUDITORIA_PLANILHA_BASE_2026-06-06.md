# Auditoria e organização — Planilha Base MOVI KIDS

**Data:** 06/06/2026  
**Planilha:** [MOVIKIDS_Planilha_Base](https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit)  
**Aba do link (gid 1931361465):** `LOCACOES`

---

## Como auditar de novo

```powershell
cd C:\Users\riboc\Projects\google-drive-sheets-auth
node scripts/auditar-planilha-movikids.js
node scripts/organizar-planilha-movikids.js --dry-run
```

GAS (readonly):

- `?action=validarSchema` — cabeçalhos LOCACOES/CUSTOS/RELATORIOS
- `?action=diagnosticoSistema` — contagem de linhas e ativas

---

## Estado antes da organização

| Item | Situação |
|------|----------|
| Schema LOCACOES/CUSTOS | OK (header linha 9, 28 colunas) |
| Locações ativas/pendentes | 0 (operacional limpo) |
| Dados operacionais | 330 locações (284 encerradas, 46 canceladas) |
| Testes DRAWER_E / TESTE_CODEX | 39 linhas já Canceladas; 1 com valor NaN residual |
| CONFIG visual | Sem triciclos; preço 3h desatualizado (165/195 vs sistema 130/150) |
| CONFIG JSON (Pacote H) | Ausente — sistema usava fallback do GAS |
| DASHBOARD | Fórmulas SUMPRODUCT com Pelúcias/Extra trocados (48 vs 1437) |
| RESPONSAVEIS | Aba ausente (opcional) |
| CUSTOS | Sem lançamentos; só template |

---

## Correções aplicadas (06/06/2026)

| # | Ação | Detalhe |
|---|------|---------|
| 1 | **LOCACOES** | Cabeçalho linha 9 congelado + negrito; 1 linha teste com NaN zerada |
| 2 | **CONFIG** | Frota triciclos; preços 3h Carro/Pelúcia 130/150; tabela Triciclo; chaves `veiculos_validos_json`, `precos_json`, `formas_pagamento_json`, `regras_operacionais_json` |
| 3 | **DASHBOARD** | SUMIFS por tipo (Carros, Pelúcias, **Triciclos**, Receita Extra J); coluna C fantasma limpa |
| 4 | **CUSTOS** | Cabeçalho linha 9 padronizado |
| 5 | **RESPONSAVEIS** | Aba criada com header (cadastro opcional) |

**Script:** `C:\Users\riboc\Projects\google-drive-sheets-auth\scripts\organizar-planilha-movikids.js`

---

## Validação pós-organização (jun/2026)

| Métrica | Valor esperado |
|---------|----------------|
| Faturamento total | R$ 2.654,40 |
| Carros | R$ 1.169,00 |
| Pelúcias | R$ 1.437,40 |
| Triciclos | R$ 48,00 |
| Receita extra (col J) | R$ 217,40 |
| Soma tipos | ≈ faturamento total |

---

## O que não foi alterado (de propósito)

- Histórico de locações reais (encerradas) — integridade financeira
- OPERADORES_SISTEMA (Eduarda, Milena — PINs intactos)
- Abas AUDITORIA, AUD_SMS, AUD_WHATSAPP, AUD_TURNO
- Linhas de teste já Canceladas (não apagadas — rastro de auditoria)

Para anular mais testes em lote: `node scripts/limpar-testes-movikids.js` ou GAS `limparLocacoesTesteAdmin`.

---

## Pendências opcionais

- [ ] Popular RESPONSAVEIS a partir de LOCACOES (importação inicial — GAS v1.5.24+)
- [ ] Criar aba AUD_RESPONSAVEIS se quiser rastreio separado
- [ ] Revisar fórmulas CTO no DASHBOARD se mês do contrato mudar (CONFIG linha 26)
- [ ] Arquivar linhas de teste muito antigas (filtro visual, sem apagar)

---

## Mapa de abas

| Aba | Função |
|-----|--------|
| **LOCACOES** | Dados operacionais (não editar manualmente) |
| CUSTOS | Custos do dia (app) |
| CONFIG | Contrato, CTO, preços visuais + JSON operacional |
| DASHBOARD | KPIs mensais (fórmulas) |
| OPERADORES_SISTEMA | Operadores e PIN |
| AUDITORIA / AUD_* | Logs |
| RELATORIOS | PDFs mensais |
| RESPONSAVEIS | Cadastro opcional clientes |
| Analise | Legado |
