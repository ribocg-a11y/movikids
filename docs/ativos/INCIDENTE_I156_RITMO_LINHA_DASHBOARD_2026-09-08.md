# I156 — Linha “Ritmo (3 dias)” sumiu no Dashboard

**Data:** 08/09/2026 · FE **v1.9.115** · GAS **v1.5.221**

## Sintoma

Chart “BASE DRE × RITMO × REAL”: legenda tem **Ritmo (3 dias)**, mas a linha não desenha.  
Insight: `Ritmo run rate: R$ 0/dia` · `(últimos 3 dias: )` vazio — com real acumulando (ex. R$ 4.624).

## Causa

`lastNBillingDaysFromFatMap_` fazia `fatMap[d]` com `d` numérico (`1`), mas `kpiMes` grava o mapa com chaves **padded** (`"01"`).

Resultado: `pos = []` → `ritmo3dDiaria = 0` → FE só plota Ritmo se `ritmoDiaria > 0`.

Live (antes do fix): `diasComMovMes=8`, `ritmo3dDiaria=0`, `ritmo3dDiasRef=[]`.

## Correção

| Camada | Mudança |
|--------|---------|
| GAS **v1.5.221** | `fatMapDiaVal_` aceita `1` / `"1"` / `"01"` · usado em `lastNBillingDaysFromFatMap_` |
| FE **v1.9.115** | `mkRitmoClientFallbackDiaria_` se GAS ainda 0 (até Nova versão) |
| Guards | `guard.i156.*` · teste I150+I156 mês corrente |

## Deploy

1. Pages **1.9.115** (fallback imediato) ✅
2. Colar raw → **Nova versão** Web → ping **v1.5.221** ✅ (08/09 ~19:43)
3. Dashboard: linha ciano Ritmo + tooltip · `ritmo3dDiaria` ≈ média dos 3 últimos dias com fat

## Validação live (08/09 ~19:43)

| Check | Resultado |
|-------|-----------|
| ping | **v1.5.221** |
| `kpiMes` set/26 `ritmo3dDiaria` | **785.67** |
| `ritmo3dDiasRef` | **[6, 7, 8]** |
| `diasComMovMes` | 8 |
| FE Pages | **1.9.115** |

Abrir Dashboard com `?force=1.9.115` — linha Ritmo deve aparecer.

## Regra

Mapas dia→valor no GAS: **sempre** ler com helper que aceita padded e numérico.
