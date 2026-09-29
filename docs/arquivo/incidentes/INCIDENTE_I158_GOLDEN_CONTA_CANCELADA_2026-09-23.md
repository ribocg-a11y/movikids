# Incidente I158 — Relatório Golden contava Cancelada

**Datas:** 23–29/09/2026 · **FE:** **v1.9.120** Pages ✅ · **GAS:** v1.5.221 (sem mudança nesta correção)

## Sintoma

PDF/e-mail Golden inflava faturamento e CTO porque `_gerarHtmlRelatorio_` excluía só `Ativa` e **incluía Cancelada**. Dashboard/`kpiMes`/`resumoDia` já excluíam Cancelada (I117/I121).

| Mês | Enviado / GAS legado | Caixa (`kpiMes`) | Delta |
|-----|---------------------:|-----------------:|------:|
| Agosto/2026 | R$ 17.212 · 957 · CTO 1.721,20 | R$ 16.140 · 758 · CTO 1.614 | +1.072 fat |
| Setembro/2026 (prévia) | R$ 14.555 · 790 | R$ 14.332 · 673 · CTO 1.500 | +223 fat |

## Correção (sem AppScript)

FE gera HTML Golden a partir de **`kpiMes`**:

- `mkHtmlRelatorioGoldenFromKpi_` em `mk-admin.js`
- Preview / PDF (print) / e-mail (`mailto` + download) — **não** chamam `gerarRelatorio` / `salvarRelatorioDrive` / `buscarPreviewRelatorio`
- Guard `guard.i158.fe.golden` · `TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY.ps1`

**Publicado:** 29/09/2026 · merge PR #46 → `main` · Pages **1.9.120**

## Agosto

Valor **já enviado** ao shopping = R$ 17.212 (histórico). **Não reenviar** “corrigido” salvo pedido do Golden.

PDF dia a dia (abertura histórica):  
`entregas/MOVI-KIDS-Relatorio-Agosto-2026-Golden-diario.pdf`

## Setembro (enviar só com FE 1.9.120+)

| Campo | Valor correto |
|-------|--------------:|
| Faturamento | R$ 14.332 |
| Contas | 673 |
| Extensões | R$ 8 |
| CTO | R$ 1.500 (mínimo; 10% = 1.433,20) |

## Erros do agente na sessão (registrar)

1. Devolveu `kpiMes` quando o pedido era o relatório **igual ao enviado**.  
2. Confusão AppScript vs FE — usuário pediu link do `.gs` novo; **não havia** mudança GAS.  
3. **Atrasou push/merge FE** (I24 / §7.2) — ficou em Pages 1.9.119 até o sócio cobrar.  

**Regra:** FE pronto → `commit` → `push origin main` → `verify-publish` **na mesma sessão**, sem perguntar.

## Opcional futuro (§7.3)

Alinhar `_gerarHtmlRelatorio_` / `_calcFatMes_` no GAS com `isStatusFaturavelCaixa_` — só com pedido explícito de AppScript.
