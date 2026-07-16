# Mockup — gráfico Base × Ritmo × Real

**Data:** 16/07/2026 · **Status:** ✅ implementado FE **v1.9.65** (I123)  
**Artefato visual:** `/opt/cursor/artifacts/assets/mockup-base-ritmo-real-chart.png`

---

## Regra de produto

| Linha | Nome | Como calcula | Muda no mês? |
|-------|------|----------------|--------------|
| **A** | Base sustentação | Âncora mês cheio (`mediaHist`) ou `metaProjecaoMes/diasMes` — trava FE `localStorage` `mk_proj_base_AAAA_M` | **Não** |
| **B** | Ritmo alcançável | `fatMes / diasOperando` → `projecaoFat` | **Sim** |
| **C** | Real acumulado | Soma dia a dia do faturamento | **Sim** |

O **real** navega entre A e B:
- acima da base = negócio sustentando / batendo piso  
- perto do ritmo = mês caminhando para o teto do ritmo atual  
- abaixo da base = alerta (ponto âmbar)

---

## UI (DNA MOVI)

| Elemento | Cor / estilo |
|----------|----------------|
| Real | `#1565C0` sólido + fill suave |
| Base | `#E65100` tracejado longo |
| Ritmo | `#29B6F6` tracejado curto |
| Pontos ≥ base | `#2E7D32` |
| Pontos &lt; base | `#E65100` |

Título: **Base × ritmo × real acumulado** · card existente `#chart-receita-mes`.

Label exemplo:
```
real R$ 8.163  ·  base R$ 7.200 (R$450/dia)  ·  ritmo → R$ 15.816 (R$510/dia)
```

---

## Escopo / blast radius

1. FE: `renderReceitaMesChart_`, `mkBaseSustentacaoMes_`, `mkRitmoAlcancavelMes_` em `mk-admin.js`
2. Legend + CSS em `index.html` / `mk-app.css`
3. **Não** tocou `carregarInicio` / `mk-sync` / GAS (P0 zero)
4. Bump I3 → **v1.9.65**
