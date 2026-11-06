# Estudo — Outubro/2026 com tabela nova + 5 Dinos/dia

**Data do estudo:** 06/11/2026 (America/Fortaleza)  
**Loja:** Golden Shopping Calhau  
**Premissas:**
1. Mesmas locações encerradas de out/26 em **Carro / Triciclo / Pelúcia** com tabela I203  
2. **+ 5 locações de Dino por dia** × **30 dias** operando = **150** locações Dino (hipótese — out/26 não tinha Dino)

## Tabelas

| Plano | Carro/Triciclo antes → depois | Pelúcia antes → depois | **Dino (novo)** |
|-------|-------------------------------|-------------------------|-----------------|
| 10min | 12 → **15** | 15 → **15** | **20** |
| 20min | 22 → **25** | 25 → **25** | **35** |
| 30min | 30 → **35** | 35 → **35** | **50** |
| 40min | 40 → **45** | 45 → **45** | **65** |
| 60min | 55 → **65** | 65 → **65** | **90** |
| Extra/min | 1,00 → **1,50** | 1,20 → **1,50** | **2,00** |

## 1) Só brinquedos já existentes (sem Dino)

| Métrica | Out/26 real | Tabela nova | Δ |
|---------|-------------|-------------|---|
| Locações | 745 | 745 | — |
| Faturamento | **R$ 13.899,00** | **R$ 15.040,50** | **+R$ 1.141,50 (+8,2%)** |

| Tipo | N | Real | Nova | Δ |
|------|---|------|------|---|
| Carro | 274 | 4.706 | 5.619 | +913 |
| Triciclo | 70 | 1.108 | 1.329 | +221 |
| Pelúcia | 401 | 8.085 | 8.092,50 | +7,50 |

## 2) + 5 Dinos por dia

**Volume:** 5 × 30 = **150** locações Dino.

Mix de planos usado = o mesmo mix de out/26 nos brinquedos (62,6% 10min · 23,9% 20min · 13,4% 30min · 0,1% 40min) → ticket Dino médio **R$ 27,67**.

| Cenário Dino | Ticket | Fat Dino (150 loc) | Total mês (brinquedos novos + Dino) | vs real R$ 13.899 |
|--------------|--------|--------------------|--------------------------------------|-------------------|
| **Mix out/26 (base)** | R$ 27,67 | **R$ 4.150,50** | **R$ 19.191,00** | **+R$ 5.292 (+38,1%)** |
| Conservador (só 10min) | R$ 20 | R$ 3.000 | R$ 18.040,50 | +R$ 4.141,50 (+29,8%) |
| Intermediário (só 20min) | R$ 35 | R$ 5.250 | R$ 20.290,50 | +R$ 6.391,50 (+46,0%) |
| Otimista (só 30min) | R$ 50 | R$ 7.500 | R$ 22.540,50 | +R$ 8.641,50 (+62,2%) |

### Conta base (recomendada para decisão)

```
Brinquedos tabela nova ........ R$ 15.040,50
+ 5 Dinos/dia × 30 × R$ 27,67 . R$  4.150,50
= Total simulado outubro ...... R$ 19.191,00
```

Média/dia: **R$ 639,70** (real out/26: R$ 463,30).

## Leitura

1. Reajuste de preço nos brinquedos sozinho: **+R$ 1,1 mil (~8%)**.  
2. Com **5 Dinos/dia** no mix típico: **+R$ 5,3 mil (~38%)** vs outubro real.  
3. O Dino é o maior alavanca desta conta — mas é **hipótese de volume**, não histórico.  
4. Se o ritmo real de Dino for menor/maior que 5/dia, escala linear: cada locação Dino a R$ 27,67 ≈ **+R$ 28** no mês.

## Método

- Brinquedos: `listarHistorico` 01–31/10/2026 · Golden · Encerrada · preço novo por plano + extra  
- Dino: 5/dia × 30d; ticket = preços Dino × mix de planos de out/26

## Versões no momento do estudo

FE **v1.9.201** · GAS Web **v1.5.239**
