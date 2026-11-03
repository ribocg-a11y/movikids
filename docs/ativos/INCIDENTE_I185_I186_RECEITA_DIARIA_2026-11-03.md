# INCIDENTE I185 / I186 — Receita dia a dia (celular + filtros)

**Data:** 03/11/2026 · **FE:** v1.9.178 (I185) → **v1.9.179** (I186) · **GAS:** sem mudança (ping **v1.5.236**)

## Sintomas

| # | Relato | Onde |
|---|--------|------|
| I185 | Celular: Outubro ~5 dias / ~R$ 2 mil · PC: ~30 dias / ~R$ 17 mil | `#page-receita-diaria` |
| I186 | Filtros Todas/Golden/La Ville “não mudam” · botão **Ver** “não serve” | mesmos pills + `rd-btn-ver` |

## Causa raiz

### I185
1. Cache `localStorage` v1 incompleto no celular (array curto).
2. Mês já fechado → caminho quiet/cache **não refetchava**.
3. Render usava `diasMes = fatDia.length` → lista cortada.

### I186 (pós-I185)
1. Pills dual: clique setava filtro sem **remount** → visual preso em Todas.
2. `forceNet = forceNet===true \|\| quiet!==true` → `forceNet:false` do filtro virava rede (corrida / UX morta).
3. `rdPickCache_` caía em `kpiData`/dash **sem** checar `unidadeId` da pill.
4. Heurística `diasCom<10 && soma<5000` rejeitava mês esparso **legítimo** (La Ville).
5. Request precisava `unidadeId` **depois** do auth (família I183b).

## Correção

| Item | FE |
|------|-----|
| Cache v2 + `rdFatCompleto_` (calendário cheio) | **1.9.178** |
| Ver `forceNet` + dias do calendário | **1.9.178** |
| `rdMountPills_` · forceNet só no Ver · `rdMatchUid_` · uid pós-auth | **1.9.179** |
| Guards | `guard.i185.fe.receita-diaria` · `guard.i186.fe.receita-filtros` |

## Validação

```
?force=1.9.179 → Admin → Receita dia a dia → Outubro
→ pill Todas / Golden / La Ville (visual + totais mudam)
→ Ver (toast “Atualizando…” → total bate com PC)
```

Pages live **1.9.179** · `encerramento-sessao` OK · AppScript **não**.

## Relacionados

- MAPA: I185 · I186 · família Receita · regras 54–57
- Holding auth: I183b (mesmo padrão `unidadeId` pós-auth)
