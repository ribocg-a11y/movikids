# Auditoria isolamento multi-loja (I172+) — 06/10/2026

**Motivo:** após I170/I171 o agente declarou Contas/sessão OK, mas `listarHistorico` ainda vazava Golden↔La Ville. Pedido do sócio: varrer camadas mais profundas.

**Método:** varredura estática do GAS canônico — funções que leem `SH_LOC` / `SH_CUS` com `getRange`/`getValues`, cruzadas com presença de `locRowMatchesUnidade_` / `unidadeIdFilterFrom_`. Confirmação pontual de corpos críticos.

**Produção no momento da auditoria:** FE **v1.9.164** · GAS Web **v1.5.232** · repo **v1.5.233** (I172 hist no GitHub; Nova Web pendente).

---

## 1. O que o agente deixou passar (falha de processo)

| Anti-padrão | O que aconteceu | Regra nova |
|-------------|----------------|------------|
| **Escopo estreito pós-I170** | Validou só `carregarInicio` + tile Contas + sessão | Toda trava multi-loja exige **matriz de leitores** LOCAÇÕES/CUSTOS (§2) |
| **“Filtro no FE = seguro”** | FE I170 esconde hist vazio; API ainda misturava | Isolamento = **GAS fail-closed**; FE é rede de segurança |
| **Cache com carimbo falso** | `comandoOperacional` grava `_u` + `unidadeId` mas payload é `all` | Cache key com uid **só vale** se o builder receber o mesmo uid |
| **getRange curto** | `listarHistorico` lia 18 cols; `kpiMes` ainda lê até col S (19) | Qualquer `locRowMatchesUnidade_` exige **`COL_LOC_READ_=29`** (col AC) |

---

## 2. Matriz — leitores LOCAÇÕES / CUSTOS

### ✅ Com filtro de unidade (OK / parcial)

| Função | Filtro | Nota |
|--------|--------|------|
| `carregarInicio_` | `unidadeIdFilterFrom_` + `locRowMatchesUnidade_` + `COL_LOC_READ_` | PASS audit 06/10 (G nSess≠LV) |
| `listarAtivas_` | idem + cache `_u` | OK |
| `listarHistorico_` | **I172** repo v1.5.233 | Web ainda 1.5.232 até Nova versão |
| `calcResumoDiaCore_` / `resumoDia_` | uid + match | OK quando uid passado |
| `listarCustos_` | uid col G | OK |
| `buildKpiMesPayload_` / `kpiMes_` | chama `locRowMatchesUnidade_` | **I178** — lê só `COL_CONTA_ID_=19` → match por veículo, não col AC |
| `salvarLocacao_` / `salvarLocacoesMulti_` | grava `unidadeId` | escrita OK |

### ❌ Sem filtro / filtro falso (furos abertos)

| ID | Função / superfície | Risco | Sintoma se LV crescer |
|----|---------------------|-------|------------------------|
| **I172** | `listarHistorico_` (Web &lt; 1.5.233) | **P0** | Hist/stats La Ville = Golden |
| **I173** | `comandoOperacional_` → `buildPainelComandoOperacional_()` **sem uid** | **P0** | Pill La Ville no Centro de comando mostra n/fat **holding**; lista Ativa/Pendente mistura lojas; cache `_u` mentiroso |
| **I174** | `findContaMestreParaNovaLoc_` | **P0** | Mesmo telefone Golden↔LV no mesmo dia → conta mestre compartilhada (I42) |
| **I175** | `calcLeadingDiaPatch_` (e enrich `resumoDia`) | **P1** | break-even / ticket mês = soma das duas lojas |
| **I176** | `listarCustosHistorico_` | **P1** | Relatório custos ADM sem `unidadeId`/cache por loja |
| **I177** | `gerarRelatorio_` / `_calcFatMes_` / `buscarPreviewRelatorio_` / `_gerarHtmlRelatorio_` | **P2** | Relatório GAS legado global; FE Golden mitiga via `kpiMes` (I158) |
| **I178** | `buildKpiMesPayload_` `getRange(…, COL_CONTA_ID_)` | **P1** | Se col AC ≠ prefixo veículo, KPI mente; LV* ainda “funciona” por fallback |

### ⚪ Intencional / baixo risco agora

| Função | Por quê |
|--------|---------|
| `buscarPortalResponsavel_` | Portal por telefone — responsável pode ter filhos em mais de uma loja |
| `veiculoJaAberto_` | Match por nome de veículo; frota LV é `LV*` — colisão improvável |
| Repair/backfill/audit schema | Admin global, não balcão |
| `listarAuditoriaAdmin_` | Auditoria operacional holding (revisar se pill loja exigir) |

---

## 3. FE — o que cobre e o que não cobre

| Camada FE | Estado |
|-----------|--------|
| Balcão Contas / sync / hist client filter (I170) | Fail-closed — esconde vazamento Contas |
| Login/sessão por loja (I171) | OK com GAS 1.5.232+ |
| Holding pills + `apiParamsComAuth_` unidadeId | Envia uid; **não salva** se GAS ignora (I173/I176) |
| Relatório Golden I158 | Força `unidadeId: golden` no `kpiMes` |
| `mk-custos-historico.js` | Não manda `unidadeId` → I176 |

---

## 4. Prioridade de correção (próximos GAS)

1. **Nova Web v1.5.233** — I172 hist  
2. **I173** — `buildPainelComandoOperacional_(uid)` + `calcResumoDiaCore_(data, uid)` + filtro ativas + frota por `veiculosOp_(uid)`  
3. **I174** — `findContaMestreParaNovaLoc_(…, unidadeId)`  
4. **I175 + I178** — leading e kpiMes com `COL_LOC_READ_` + uid  
5. **I176** — custos histórico como `listarCustos_`  
6. **I177** — deprecar ou filtrar relatórios GAS (FE já preferível)

**Guard proposto:** checklist estático “toda action pública que lê LOCAÇÕES/CUSTOS e aceita `unidadeId` deve chamar `unidadeIdFilterFrom_` **e** passar uid ao core”.

---

## 5. Evidência audit API (06/10/2026)

| Check | Golden | La Ville |
|-------|--------|----------|
| `carregarInicio` nSessoes | 6 | 0 |
| `listarHistorico` total/stats (Web 1.5.232) | 7 / n=6 fat=84 | **igual** (FAIL I172) |
| ping | v1.5.232 | — |

---

*Atualizar este doc ao fechar cada I17x com Nova versão Web + reteste.*
