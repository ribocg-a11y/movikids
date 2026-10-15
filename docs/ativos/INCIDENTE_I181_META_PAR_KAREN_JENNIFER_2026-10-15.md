# I181 — Par de meta FSS ainda era Raykelly+Julia

**Data:** 15/10/2026  
**Status:** ✅ Web **v1.5.235** · FE **v1.9.171** (memorial Q1 + tabela 100/50)  
**Família:** folha / I109 / I141

## Sintoma

Holerite Q1 10/2026 (pagamento 15/10) divergia do memorial humano:

| Pessoa | PIX app (v1.5.234) | Certo |
|--------|-------------------|-------|
| Raykelly | 848,40 (4×R$100) | **748,40** (4×R$50) |
| Karen | 648,40 (bônus 0) | **748,40** |
| Jennifer | 593,82 (meta 12/10) | **543,82** (sem meta) |

## Causa

`META_BONUS_PAR_IDS_ = { 3: 4, 4: 3 }` (Raykelly↔Julia). Julia em pausa (I152). Equipe atual: Raykelly + Karen Golden; Jennifer La Ville no início, **sem pote**. Escala da Karen vazia no RH → `juntas` nunca fechava.

## Correção

GAS **v1.5.235:** par **3↔5**; `META_SEM_BONUS_IDS_` Julia(4)+Jennifer(6); escala FSS Karen sex/sáb/dom.  
FE **v1.9.171:** memorial Q1 10/2026 + tabela dias R$100/R$50 na área da colaboradora.  
Trava: `guard.meta.par.fss` no `pre-push-check.ps1`.

## Validação live (15/10 ~13h)

Ping **v1.5.235**. `metaOperadorTurno`: Ray e Karen 03/04/10/11 · R$50 juntas; Jennifer/Julia `configurado:false`. Folha: PIX 748,40 / 748,40 / 543,82.

Memorial: `docs/ativos/MEMORIAL_HOLERITE_Q1_2026-10.md`
