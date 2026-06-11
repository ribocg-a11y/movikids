# Memorial — Mini-DRE Movi Kids (FASE 14)

**Versão doc:** 1.0 · **11/06/2026**  
**Status:** 🟡 rascunho para revisão do sócio — **não implementado em GAS/FE ainda**  
**Plano:** `docs/ativos/FASE_14_MINI_DRE.md` · `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md` § FASE 14

---

## 1. Objetivo

Passar do **P&L simplificado** atual (receita − custos − CTO) para uma **cascata de margens** acionável no Dashboard — sem ERP, sem balanço, sem ROIC.

---

## 2. Modelo atual (v1.5.81 / v1.8.15)

| Linha | Fórmula | Onde |
|-------|---------|------|
| **Faturamento** | Σ locações `Encerrada` do mês | `fatMes` · `kpiMes` |
| **Custos** | Σ aba `CUSTOS` do mês | `cusMes` |
| **CTO** | `max(ctoMinimo, fatMes × 10%)` | `ctoPagar` |
| **Lucro líquido (operacional)** | `fatMes − cusMes − ctoPagar` | `resultado` |
| **Margem %** | `resultado / fatMes × 100` | `margem` · cockpit `#mk-exec-margem` |

**Limitação:** todos os custos entram numa única linha — não distingue CMV de OPEX.

**Categorias CUSTOS hoje (FE):** Energia · Manutenção · Material · Aluguel · Outros  
**Folha CLT:** aba `FOLHA` B68 — simulada em `viabilidadeContratacao`, **não** entra em `cusMes`.

---

## 3. Mini-DRE proposta (cascata)

```
(+) Receita bruta de locações          = fatMes
(-) CMV (custo direto operação)        = cusCMV
(=) Margem bruta                        = fatMes − cusCMV
    Margem bruta %                      = margemBrutaPct

(-) OPEX (custos fixos + variáveis)    = cusOPEX
(-) CTO comissão shopping              = ctoPagar
(=) Resultado operacional               = margemOperacional  ← alias do resultado atual
    Margem operacional %                = margemOperacionalPct

(-) Folha proporcional (opcional)      = folhaProRata       ← já existe em viabilidade
(=) Lucro com folha                     = resultadoComFolha  ← já existe
```

**Depreciação** (`depreciacaoMensal_`): fase 14.5 opcional — `INVESTIMENTO / vida útil`; **não** entra na cascata principal até sócio aprovar.

**Fora de escopo (Anexo A plano 6–15):** ROIC, EVA, DFC, balanço.

---

## 4. Plano de contas — mapeamento inicial

Aba **`PLANO_CONTAS`** (nova) — colunas sugeridas:

| Col | Campo | Exemplo |
|-----|-------|---------|
| A | `codigo` | `CMV-01` |
| B | `nome` | Manutenção veículos |
| C | `grupo` | `CMV` \| `OPEX_FIXO` \| `OPEX_VAR` \| `INVESTIMENTO` |
| D | `categoriaLegacy` | `Manutenção` (match CUSTOS col E) |
| E | `entraCMV` | S/N |
| F | `ativo` | S |

### Migração categorias atuais → grupo

| Categoria CUSTOS | Grupo proposto | CMV? |
|------------------|----------------|------|
| Manutenção | CMV | Sim |
| Material | CMV | Sim |
| Energia | OPEX_FIXO | Não |
| Aluguel | OPEX_FIXO | Não |
| Outros | OPEX_VAR | Não |

**Regra:** custo sem match em `PLANO_CONTAS` → `OPEX_VAR` + alerta Dashboard até categorizar.

---

## 5. Campos GAS novos (`kpiMes` / v1.5.82)

| Campo | Cálculo |
|-------|---------|
| `cusCMV` | Σ CUSTOS mês onde grupo = CMV |
| `cusOPEX` | Σ CUSTOS mês onde grupo ∈ {OPEX_FIXO, OPEX_VAR} |
| `margemBruta` | `fatMes − cusCMV` |
| `margemBrutaPct` | `margemBruta / fatMes × 100` |
| `margemOperacional` | `margemBruta − cusOPEX − ctoPagar` (= `resultado` hoje) |
| `margemOperacionalPct` | alias `margem` |
| `miniDre` | objeto `{ fatMes, cusCMV, cusOPEX, ctoPagar, margemBruta, margemOperacional, pct... }` |

Cache: `kpiMes82_*` após implementação.

---

## 6. Impacto visual (FE v1.8.16+)

**Dashboard — Seção 1 cockpit:** substituir KPI único “Margem %” por faixa **3 degraus**:

1. Margem **bruta** % + R$
2. Margem **operacional** % + R$ (atual)
3. (Opcional) Lucro **com folha** — link para seção 2

Elemento sugerido: `#mk-dre-cascata` dentro de `#mk-chapter-panorama`.

---

## 7. Critério de pronto (FASE 14)

- [ ] Memorial aprovado pelo sócio
- [ ] Aba `PLANO_CONTAS` criada + 100% categorias legacy mapeadas
- [ ] GAS v1.5.82 em prod + ping
- [ ] FE cascata no Dashboard
- [ ] `TESTE_MINI_DRE_READONLY.ps1` (novo)
- [ ] Jun/2026: `margemOperacional` = `resultado` legado (paridade)

---

## 8. Referências

- Payback / investimento: `MEMORIAL_PAYBACK_INVESTIMENTO.md`
- Folha CLT: `FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md`
- Leading atual (`margemOperacional` nome): `buildLeadingFinanceiros_` no `.gs`
