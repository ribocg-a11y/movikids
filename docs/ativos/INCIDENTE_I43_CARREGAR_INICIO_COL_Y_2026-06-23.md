# I43 — Cronômetro reverte após ▶ (`carregarInicio` sem col Y)

**Registrado em:** 23/06/2026  
**Status:** **RESOLVIDO** (repo + Web ping v1.5.136) · homolog tablet após FE **v1.8.114**  
**Versões fix:** FE **v1.8.114** · GAS **v1.5.136**  
**Regressão de:** **I20** / **I16** (paridade `carregarInicio` × `iniciarTimer`)  
**Introduzido em:** GAS **v1.5.131** (I42 conta do dia) — commit `718252a`  
**Mapa vivo:** `MAPA_ERROS_FALHAS_BUGS.md` (linha I43)

---

## Resumo executivo

Em operação na loja (23/06/2026 ~12h), o operador clicava **▶ INICIAR CONTAGEM**: o toast “Contagem iniciada!” aparecia, o timer começava a contar, e **segundos depois** o card voltava para **“10:00 · aguardando início”** (status Pendente visual).

**Causa raiz:** em `carregarInicio_`, o `getRange` foi reduzido para **19 colunas** (`COL_CONTA_ID_`, I42) mas o código continuou lendo **`r[24]`** (col **Y** = `startTimestamp`). Fora do range → sempre `0` → sync achava que o timer não tinha iniciado.

| Camada | Bug | Fix |
|--------|-----|-----|
| GAS | `getRange(..., COL_CONTA_ID_)` + `r[24]` | `COL_LOC_READ_` = **28** colunas |
| FE | merge aceitava `Ativa` + `startTimestamp: 0` | `mk-sync.js` preserva ts local (I43) |

**Por que as travas I20 não pegaram:** `pre-push-check` validava *existência* de `iniciarTimer`/`mergeSessaoCanonica`, mas **não** a largura do `getRange` em `carregarInicio`. `TESTE_PARIDADE_CRONOMETRO` só compara sessões já ativas em prod — passa verde sem locação de teste.

---

## Linha do tempo

| Data | Evento |
|------|--------|
| 07/06 | I20 fechado — col Y, clientTs, merge otimista |
| 23/06 | I42 — `carregarInicio` lê só col S (conta_id) |
| 23/06 ~12h | **Loja:** timer reverte após ▶ (João Leonardo / Pelúcia) |
| 23/06 | Hotfix **I43** — `ef10dfa` FE v1.8.114 + GAS v1.5.136 |
| 23/06 | Travas: `guard.gas.carregarInicio.colY`, `TESTE_I43_CARREGAR_INICIO_READONLY.ps1` |

---

## Sintoma × diagnóstico rápido

1. Tablet: ▶ → toast OK → card volta a Pendente em &lt;15 s  
2. API: `iniciarTimer` → `startTimestamp` válido  
3. API: `carregarInicio.ativos[]` → `status: Ativa`, **`startTimestamp: 0`** ← fumaça  
4. Planilha: col **O** = Ativa, col **Y** tem timestamp ms ← planilha OK, sync quebrado

---

## Travas pós-I43 (obrigatórias)

| Trava | Onde |
|-------|------|
| `COL_LOC_READ_` = 28 | `.gs` — nunca `r[24]`/`r[25]` com range &lt; 26 |
| `guard.gas.carregarInicio.colY` | `pre-push-check.ps1` |
| `guard.sync.i43` | `pre-push-check.ps1` — merge Ativa sem ts |
| `TESTE_I43_CARREGAR_INICIO_READONLY.ps1` | pre-push (rede) |
| Regra Cursor | `.cursor/rules/cronometro-i43-carregar-inicio.mdc` |

**Antes de mexer em `carregarInicio_` / `listarAtivas_`:** ler MAPA I16/I20/I43 → rodar `TESTE_I43` + `TESTE_I20_COMPLETO_PROD` → tablet ▶→10:00.

---

## Referências

- `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`
- `ARQUITETURA_CAIXA_CONTA_DIA_2026-06.md` — não reduzir leitura de sync ao adicionar colunas
