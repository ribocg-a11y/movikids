# Incidente I158 — Relatório Golden contava Cancelada (divergência kpiMes)

**Data:** 23/09/2026 · **Correção:** FE **v1.9.120** (sem Nova versão AppScript)

## Sintoma

PDF/e-mail Golden (ago/2026) com **R$ 17.212 / 957 / CTO R$ 1.721,20** — incluía **Cancelada**.  
Dashboard/`kpiMes` (ganho real): **R$ 16.140 / 758 / CTO R$ 1.614**.

## O que foi enviado ao Golden (manter como histórico)

Valores do preview/PDF gerado pelo GAS em produção (23/09/2026) — **não alterar o que já foi enviado**:

| Campo | Valor enviado |
|-------|--------------:|
| Faturamento bruto | R$ 17.212,00 |
| Locações | 957 |
| Ticket | R$ 17,99 |
| Carros | R$ 8.234,00 |
| Triciclos | R$ 898,00 |
| Pelúcias | R$ 8.080,00 |
| Extensões | R$ 105,00 |
| CTO a pagar | R$ 1.721,20 |

## Correção sem AppScript (setembro+)

FE gera o HTML Golden a partir de **`kpiMes`** (já exclui Cancelada):

- `mkHtmlRelatorioGoldenFromKpi_`
- Preview / Salvar PDF / E-mail **não** chamam mais `buscarPreviewRelatorio` / `gerarRelatorio` / `salvarRelatorioDrive` do GAS
- Fluxo: baixar HTML + Imprimir→PDF + `mailto:` com resumo

Guard: `guard.i158.fe.golden` · `TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY.ps1`

## Quando puder publicar GAS

Opcional alinhar `_gerarHtmlRelatorio_` no servidor (mesmo filtro). Até lá, **sempre** usar Relatório no admin FE **v1.9.120+**.
