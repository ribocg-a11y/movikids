# Diagnóstico La Ville — suite real 30/09/2026

**GAS Web:** v1.5.227 · **FE Pages:** v1.9.140 (repo)  
**Scripts:** `TESTE_LAVILLE_SUITE40_PROD.ps1` + `TESTE_LAVILLE_REMEDY_PROD.ps1`  
**Limpeza final:** abertas = **0** · `limparLocacoesTesteAdmin` OK

## Resultado consolidado

| Passada | Checks | Pass | Fail | Skip | Exit |
|---------|--------|------|------|------|------|
| Suite40 (principal) | 62 | 48 | 11 | 3 | 1 (quota + I153 harness) |
| Remedy (críticos) | 15 | **15** | **0** | 0 | **0** |

**Veredito operacional La Ville:** fluxos críticos **OK** após remediação. Falhas da suite longa foram harness/quota, não regressão de preços/timer/multi.

## O que passou (produção real)

| Área | Evidência |
|------|-----------|
| Ping / versão | v1.5.227 |
| Preços brinquedos | Carro 10=R$15 · Triciclo 20=R$25 · Pelúcia 30=R$35 · Driffyt 40=R$45 · 60min=R$65 |
| Preços Dino | 10=R$20 · 20=R$35 |
| Rejeições | Veículo Golden `Carro 01` bloqueado · plano `3h` inválido |
| Cronômetro | `iniciarTimer` ms · idempotente · `carregarInicio` Ativa com ts (I43) |
| Tempo adicional | `estenderLocacao` → totalMins=20 |
| Encerrar + extra pago | `extraPagamento=PIX/Credito` → Encerrada |
| Somente plano | `somentePlano` + `confirmarCurto` → Encerrada |
| Cancelar extras | `cancelarExtras` + justificativa → Encerrada |
| Multi-veículo | 2 locs · mesma `contaId` |
| Avulso | `salvarLancamentoAvulso` Driffyt R$45 |
| Caixa dual | `resumoDia` laville fat/n isolado · golden responde |
| Limpeza | 0 Ativa/Pendente ao fim |

## Achados (não bloqueiam homologação de locação)

1. **Equipe La Ville vazia** — `listarOperadoresLogin?unidadeId=laville` = **0**; golden = **4**. Backfill I159q marcou todos `unidade_id=golden`. Colaboradores La Ville = 0.  
   **Ação humana/sócio:** cadastrar ou editar operadores/RH com `unidade_id=laville` (ou `all`).

2. **Quota GAS sob rajada** — com ~4k linhas em LOCAÇÕES, vários `salvarLocacao`/`listar*` retornaram HTML. Remedy com cooldown + retry passou 15/15.

3. **I153 encerrar &lt;90s** — exige `confirmarCurto=1` (comportamento correto; suite longa não enviava).

4. **Campo caixa** — API usa `fat` / `n` (não `faturamento`/`nLocacoes`).

## Sheets / repair (pré-suite)

| Aba | Status |
|-----|--------|
| COLABORADORES_RH | repair OK · **20 cols** (T=`unidade_id`) · 5 registros |
| OPERADORES_SISTEMA | repair OK · **9 cols** · backfill unidade_id 5/5 · 4 ativos |
| LOCAÇÕES | escrita AC via `salvarLocacao` (LV* → laville) |

## Próximos passos sugeridos

1. Definir equipe La Ville (`unidade_id=laville`) nos operadores/RH.  
2. Tablet smoke D4 La Ville (▶ → estender → encerrar) com `?force=` FE atual.  
3. Evitar rajadas de write-test em horário de operação (quota).

JSON suite: `entregas/TESTE_LAVILLE_SUITE40_20260930_124002.json`
