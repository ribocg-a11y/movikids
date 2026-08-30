# I149 — Meta festeja R$ 100 com a loja inteira

**Status:** ✅ FE **v1.9.107** Pages  
**Data:** 30/08/2026 (domingo · Raykelly + Julia na escala)

---

## O quê

Raykelly viu “meta batida” e **R$ 100**. Servidor: **18 contas**, meta **não** batida, `bonusValorHoje = 0`. Julia **0** encerramentos no nome.

Causas no FE:

1. `mkMetaComputeLocal_` somava **todas** as locações do turno (`encHojeData`), não as contas dela na AUDITORIA.
2. A tela usava `d.bonus` (sempre 100) e ignorava I109 (`bonusValorHoje` = R$ 50 no FSS).

## Correção FE v1.9.107

- Local **não** celebra com total da loja — só reusa n do GAS
- `mkMetaBonusAlvo_` — sex/sáb/dom com as duas na escala = **R$ 50**; dia de uma = **R$ 100**

## Regra (inalterada no GAS)

Pote FSS fecha com **21+ contas** (dela + parceira). 18 + 0 = sem bônus.

## Homolog

Tablet `?force=1.9.107` logada como Raykelly: 18/20, R$ 50 no texto, sem festa.
