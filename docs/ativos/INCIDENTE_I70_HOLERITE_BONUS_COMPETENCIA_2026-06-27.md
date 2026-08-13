# Incidente I70 — Holerite competência passada: bônus/meta zerados ou subcontados

**Data:** 27/06/2026  
**Severidade:** P1 (folha / confiança operador)  
**Versão correção:** GAS **v1.5.168**  
**Relacionado:** filtro competência holerite FE v1.9.4–v1.9.5

---

## Sintoma

Raykelly (id 3), competência **06/2026**, holerite admin mostrava:

- **239 locações** no mês (AUDITORIA OK)
- **1 dia de bônus** (R$ 100) — operador reportou valores errados
- Proporcional **16/30 dias** (admissão 15/06/2026)

Ao consultar junho **em julho/2026**, o painel usava filtro de **mês corrente** para metas/bônus.

---

## Causa raiz

Em `gpEnrichContextAudit_` (~L10302):

```javascript
if (ts.data.slice(3) !== mesAtual) continue; // BUG: jul/2026, não 06/2026
```

- `auditLocByOpId` já filtrava por `compNorm` → **locMes=239** correto.
- `metaByDayByOpId` (dias com meta/bônus) ignorava linhas fora do **mês atual**.
- `gpMetasPainel_` caía para aba METAS (1 linha com bonus) → **bonusDias=1**.

`buildMetaOperadorPayload_` / `metaOperadorTurno` têm o mesmo padrão (`mesAtual`) — OK para “hoje”, errado para holerite histórico.

---

## Correção (v1.5.168)

1. `gpEnrichContextAudit_`: filtro `compRow === compNorm` (competência pedida).
2. Nova `gpMetasBonusFromAuditComp_`: recalcula dias > meta a partir da AUDITORIA na competência.
3. `gpMetasPainel_`: `Math.max` inclui `auditBonus.bonusDias` / `bonusTotal`.
4. `gpBuildPainelColaboradorPayload_`: chama `gpEnrichContextAudit_` antes das metas (paridade colaborador/admin).

---

## Proporcional (16/30)

Para admissão **15/06/2026**, dias 15–30 inclusive = **16 dias** em junho (30 dias).  
Salário prop. = R$ 1.621 × 16/30 = **R$ 864,53** — coerente com CLT/pro-rata calendário.  
2ª quinzena 60% = **R$ 518,72**.

Se a regra de negócio for “dias com ponto” em vez de calendário, é mudança de regra (fora I70).

---

## Validação pós-deploy

**27/06/2026 ~22:05** — `painelGestaoPessoasAdmin` competência **06/2026**, Raykelly id 3:

| Campo | Antes (bug) | Depois (I70) |
|-------|-------------|--------------|
| locMes | 239 | 239 |
| bonusDias | 1 | **5** |
| bonusTotal | R$ 100 | **R$ 500** |
| líquido holerite | R$ 440,48 | **R$ 810,48** |
| proporcional | 16/30 · R$ 864,53 | 16/30 · R$ 864,53 (OK) |

`buscarPainelColaboradorPreview` jun/2026: `bonusDias=5`, `bonusTotal=500`, `locMes=239` — paridade colaborador/admin OK.

Ping Web ainda reportava `v1.5.167` (string `ping_()` não bumpada no paste); repo alinhado para `v1.5.168`.

```powershell
.\scripts\testes\_diag-raykelly-hol-temp.ps1
# Esperado: bonusDias >> 1 (conforme AUDITORIA jun/2026 + turno Raykelly)
```

Ping GAS deve reportar **v1.5.168** após Nova versão Web (mesmo Deploy ID).

---

## Deploy

- Repo: header **v1.5.168** em `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`
- **Sócio:** Editor GAS → Implantar → Editar → Nova versão (nunca nova implantação)
- FE: sem bump (só GAS)
