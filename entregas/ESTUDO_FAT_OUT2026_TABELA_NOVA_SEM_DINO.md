# Estudo — Outubro/2026 com tabela nova (sem Dino)

**Data do estudo:** 06/11/2026 (America/Fortaleza)  
**Loja:** Golden Shopping Calhau  
**Premissa:** mesmas locações encerradas de out/26 · **sem Dino** (ainda sem histórico para projetar uso) · só Carro / Triciclo / Pelúcia.

## Tabelas usadas

| Plano | Carro/Triciclo antes → depois | Pelúcia antes → depois |
|-------|-------------------------------|-------------------------|
| 10min | 12 → **15** | 15 → **15** |
| 20min | 22 → **25** | 25 → **25** |
| 30min | 30 → **35** | 35 → **35** |
| 40min | 40 → **45** | 45 → **45** |
| 60min | 55 → **65** | 65 → **65** |
| Extra/min | 1,00 → **1,50** | 1,20 → **1,50** |

Plano 3h existia no Golden antigo; **não houve 3h nem 60min** em out/26 neste recorte.

## Resultado

| Métrica | Out/26 real | Se tabela nova | Δ |
|---------|-------------|----------------|---|
| Locações (encerradas) | 745 | 745 | — |
| Faturamento | **R$ 13.899,00** | **R$ 15.040,50** | **+R$ 1.141,50 (+8,2%)** |
| Ticket médio | R$ 18,66 | R$ 20,19 | +R$ 1,53 |
| Média / dia (30 d op.) | R$ 463,30 | R$ 501,35 | +R$ 38,05 |

## Por tipo

| Tipo | N | Fat real | Fat tabela nova | Δ |
|------|---|----------|-----------------|---|
| Carro | 274 | 4.706,00 | 5.619,00 | **+913,00** |
| Triciclo | 70 | 1.108,00 | 1.329,00 | **+221,00** |
| Pelúcia | 401 | 8.085,00 | 8.092,50 | +7,50 |
| **Total** | **745** | **13.899,00** | **15.040,50** | **+1.141,50** |

## Leitura

1. **Quem sobe o caixa:** Carro + Triciclo (~99% do ganho). Pelúcia quase não muda nos planos — só o adicional/min (1,20→1,50).
2. **Dino:** excluído de propósito. Qualquer uso real de Dino é **receita extra** em cima destes R$ 15.040.
3. **Não é previsão de demanda:** assume o **mesmo mix e volume** de out/26. Se o preço novo reduzir volume, o ganho real fica abaixo de +8,2%.
4. **Conferência:** soma dos planos × preços antigos bate o fat real (R$ 13.899) — base limpa.

## Método

- Fonte: `listarHistorico` dia a dia 01–31/10/2026 · `unidadeId=golden` · status Encerrada  
- Dino filtrado (0 ocorrências em out/26 no Golden)  
- Novo fat = `n × preço_novo(plano)` + `mins_extra × adicional_novo`

## Versões no momento do estudo

FE **v1.9.201** · GAS Web **v1.5.239**
