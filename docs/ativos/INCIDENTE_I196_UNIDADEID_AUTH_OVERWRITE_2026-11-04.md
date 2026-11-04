# I196 — `unidadeId` engolido por `apiParamsComAuth_` (custos / relatório / fat / hist)

**Data:** 04/11/2026 · **FE:** **v1.9.190** · **GAS:** sem mudança  
**Fonte:** auditoria [Audit admin hist holding](bc-239b81a1-2e22-57b0-b937-610af0a4feb8)

## Padrão (I183b)

```js
api({ action: '...', unidadeId: 'golden', ...apiParamsComAuth_() })
```

O spread **depois** sobrescreve `unidadeId` com a loja da sessão (ex.: La Ville). Relatório “Golden” e custo “La Ville” gravavam/listavam a loja errada.

## Correções FE

| Área | Fix |
|------|-----|
| `mk-custos.js` | `Object.assign({}, authP, { unidadeId })` em listar/salvar |
| `mk-admin.js` relatório | `kpiMes` com `unidadeId:'golden'` **após** auth |
| `fatHojeCanonica_` | balcão fail-closed (não herda holding) |
| `carregarResumoHojeAdmin_` | cache + request por unidade |
| `mkCaixaSliceResumo_` | `leadingDia` null fora de `all` |
| `mk-custos-historico` série | `unidadeId:'all'` após auth |
| `mk-historico` | pede pill/loja (não always-all no holding) |
| `mk-sync` custos | se sem tag → `listarCustos` |

## Remanescente (GAS §7.3)

`carregarInicio_` ainda pode devolver custos sem filtrar/taguar unidade — FE evita usar esse payload se não tagueado.
