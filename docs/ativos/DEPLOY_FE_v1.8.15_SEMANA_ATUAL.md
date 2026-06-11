# Deploy FE v1.8.15 — Semana atual no Dashboard + cache-bust

**Data:** 11/06/2026  
**Pacote:** v1.8.15 (semana corrente) + hotfix cache-bust `index.html`

| Item | Valor |
|------|-------|
| Versão | **v1.8.15** (`mk-version.js` = `sw.js` = `index.html ?v=`) |
| URL produção | https://ribocg-a11y.github.io/movikids/?force=1.8.15 |
| GAS pareado | **v1.5.81** — sem mudança |
| Incidente | **I3** (recorrência) — `INCIDENTE_I3_CACHE_BUST_INDEX_2026-06-11.md` |

---

## O que mudou

### v1.8.15 — Semana em destaque = semana corrente
- **`renderSemanasChart_`:** ao abrir o Dashboard no **mês atual**, seleciona a semana cujo intervalo `diaIni`–`diaFim` contém **hoje**
- Meses passados: mantém fallback `melhorSemanaIdx` (maior receita)
- Troca de mês no seletor: recalcula (`_semanaMesKey`)

### Hotfix — `index.html` desalinhado (11/06)
- Commit `aeec240` subiu `mk-version.js`/`sw.js` para **1.8.15** mas **`index.html` ficou em `?v=1.8.14`**
- Browser servia `mk-version.js` cacheado como **1.8.14** → `mk-cache-bust.js` não redirecionava
- Usuário via rodapé **v1.8.14** e semana sempre na **Sem 01**
- Corrigido em `68c47c0` — todos os `?v=` → **1.8.15**; Pages deploy OK

---

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `mk-admin.js` | `resolverSemanaDefaultIdx_`, `_semanaMesKey` |
| `mk-version.js` / `sw.js` | **1.8.15** |
| `index.html` | **24×** `?v=1.8.15` (obrigatório em todo bump FE) |

---

## Homologação visual

1. Login admin → **Dashboard** → mês corrente (ex.: Jun/2026, dia 11)
2. Seção **5 — Tendência** → card **Sem 02 (08–14)** ativo (não Sem 01)
3. Rodapé / sidebar: **Online v1.8.15**
4. `pre-push-check.ps1` → `versao.index-cache-bust` **ok**

---

## Commits

| Commit | Descrição |
|--------|-----------|
| `aeec240` | FE v1.8.15 — semana atual em destaque (+ docs v1.5.81) |
| `68c47c0` | Fix index.html cache-bust alinhado com v1.8.15 |

---

## Lição (I3)

**Sempre** ao bumpar FE: `mk-version.js` + `sw.js` + **todos** os `?v=` em `index.html`.  
O `pre-push-check.ps1` bloqueia push se desalinhado — rodar **antes** do commit.
