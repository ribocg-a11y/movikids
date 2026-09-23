# Incidente I158 — Relatório Golden contava Cancelada (divergência kpiMes)

**Data:** 23/09/2026 · **GAS:** v1.5.222 (repo) · ping prod ainda v1.5.221 até Nova versão Web

## Sintoma

Relatório enviado/salvo para Golden Shopping (PDF/e-mail) mostrava **R$ 17.212 / 957** em ago/2026, enquanto Dashboard/`kpiMes` mostrava **R$ 16.140 / 758**.

## Causa

`_gerarHtmlRelatorio_` / `_calcFatMes_` excluíam **somente** status `Ativa` — incluíam **Cancelada** no faturamento e no CTO (10%).  
`kpiMes` / caixa (I117/I121) já excluíam Cancelada e contavam **contas** (`conta_id`+data), não linhas.

## Correção

- Helper `isStatusFaturavelCaixa_` — só `Encerrada` \| `Ativa` \| `Pendente`
- `aggMovimentacaoMesCaixa_(mes, ano)` — fonte única para Golden + `_calcFatMes_`
- `n` do Golden = **contas pagas** (paridade `kpiMes.nMes`)
- Guard `guard.i158.faturavel` + `TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY.ps1`

## Números canônicos ago/2026 (pós-correção)

| Campo | Valor |
|-------|------:|
| Faturamento | R$ 16.140,00 |
| Locações (contas) | 758 |
| Ticket | R$ 21,29 |
| CTO (10%) | R$ 1.614,00 |
| Extensões | R$ 105,00 |

## Deploy (sócio)

1. Colar raw: https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  
2. Editor → Implantar → **Editar** `AKfycbwakQ...` → **Nova versão** (nunca Nova implantação)  
3. Ping deve retornar `v1.5.222`  
4. Regenerar PDF Golden ago/2026 e, se necessário, reenviar e-mail
