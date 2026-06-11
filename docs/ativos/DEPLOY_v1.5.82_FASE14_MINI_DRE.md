# Deploy GAS v1.5.82 + FE v1.8.16 — FASE 14 mini-DRE

**Data:** 11/06/2026

| Camada | Versão |
|--------|--------|
| GAS | **v1.5.82** |
| FE | **v1.8.16** |
| URL | https://ribocg-a11y.github.io/movikids/?force=1.8.16 |

## GAS

- `lerPlanoContas_` + `buildMiniDre_` em `kpiMes`
- Campos: `miniDre`, `margemBruta`, `margemBrutaPct`, `margemOperacional`, `margemOperacionalPct`
- Cache: `kpiMes82_*`
- Fallback: mapeamento padrão se aba PLANO_CONTAS ausente

## FE

- `#mk-dre-cascata` no cockpit (seção 1 Dashboard)
- `renderMiniDreCascade_` em `mk-admin.js`

## Planilha (opcional)

1. Editor GAS planilha → colar `scripts/planilha/instalarAbaPlanoContas.gs`
2. Executar `instalarAbaPlanoContas()`

## Deploy

1. `.\scripts\deploy-gas.ps1`
2. **Nova versão Web** (Deploy ID existente)
3. Push FE (automático)
4. `.\scripts\testes\TESTE_MINI_DRE_READONLY.ps1`

## Homologação

Dashboard → seção 1 → faixa **Mini-DRE · cascata de margens**  
Resultado oper. = Lucro líquido sem folha (paridade)
