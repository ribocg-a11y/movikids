# Checklist — Aba FOLHA (planilha MOVI KIDS) — I57

**Camada:** 2 — Memorial CLT · **GAS:** v1.5.154 · **Status:** ✅ Fechada (prod)

## Chaves

| Célula | Significado |
|--------|-------------|
| B5 | N funcionários (2) |
| B11 | VA mensal teto (R$ 400) |
| B12 | Dias VA (26) |
| B25 | VA/dia calculado (15,38) |
| B68 | Custo mensal total |

## GAS

- API: `repararFolhaPlanilhaAdmin` (legado: `repairFolhaAdmin`)
- Script: `REPARAR_FOLHA_PLANILHA_ADMIN.ps1`
- Teste: `TESTE_FOLHA_FORMULAS_READONLY.ps1`

## Resultado 24/06

| Item | Valor |
|------|-------|
| Repair | memorial existente · formulas USER_ENTERED |
| B68 | **R$ 5.269,96** |
| B25 | **R$ 15,38** (400/26) |
| Audit | **0 erros** |
| validarSchema | **schemaOk=True** |
| folhaPlanejamento | **fonte=FOLHA** |
| TESTE_PROTOCOLO_ABA | **ok** (9/9) |

**Deploy:** ✅ Nova versão Web v1.5.154 · repair 24/06
