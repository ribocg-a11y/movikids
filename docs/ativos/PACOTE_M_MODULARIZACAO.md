# Pacote M — Modularização do frontend

**Início:** 07/06/2026  
**Objetivo:** reduzir monólito `index.html` sem mudar comportamento — extrair CSS e JS em fatias.

---

## Status

| Fase | Entrega | Versão | Status |
|------|---------|--------|--------|
| **M.1** | CSS legado → `mk-app.css` | FE **v1.7.65** | ✅ 07/06 |
| **M.2** | `mk-stale-sync.js`, `mk-cache-bust.js`, `mk-firebase.js` | FE **v1.7.66** | ✅ 07/06 |
| **M.3** | `mk-api.js` (api + guards I15) | FE **v1.7.67** | ✅ 07/06 |
| **M.4** | `mk-sync.js` (sync + Firebase merge) | FE **v1.7.68** | ✅ 07/06 |
| **M.5** | `mk-sessao.js` (sessão, SMS, timer) | FE **v1.7.69** | ✅ 07/06 |
| **M.6** | `mk-nova.js` (fluxo Nova locação) | FE **v1.7.70** | ✅ 07/06 |
| **M.7** | `mk-drawer.js` (drawer + encerrar) | FE **v1.7.71** | ✅ 07/06 |
| M.8+ | `mk-operacao`, admin, … | — | ⬜ |

---

## M.1 — CSS extraído (v1.7.65)

### O que mudou

| Antes | Depois |
|-------|--------|
| ~1.441 linhas `<style>` em `index.html` | `mk-app.css` (~1.443 linhas) |
| `index.html` ~8.495 linhas | **~7.054 linhas** (−17%) |

### Ordem de carregamento (inalterada na cascata)

1. `mk-design.css` — tokens Pacote A (aditivo)
2. `mk-app.css?v=1.7.65` — base legado (ex-inline)

### Arquivos tocados

- `mk-app.css` (novo)
- `index.html` — removido `<style>`, link para `mk-app.css`
- `mk-version.js`, `sw.js` → **1.7.65**
- `sw.js` — `mk-app.css` em `NETWORK_FIRST`

### Validação

```powershell
.\scripts\pre-push-check.ps1
```

Tablet: `?force=1.7.65` — Home, Nova locação, Dashboard (visual igual).

## M.2 — Bootstrap + Firebase (v1.7.66)

### O que mudou

| Antes | Depois |
|-------|--------|
| ~140 linhas inline no `<head>` | 3 arquivos JS |
| `index.html` ~7.054 linhas | **~6.915 linhas** |

### Ordem de carregamento (crítica)

1. `mk-stale-sync.js` — XHR síncrono (antes de tudo)
2. `mk-version.js`
3. `mk-design.css`
4. `mk-cache-bust.js`
5. Chart.js CDN
6. `mk-app.css`
7. `mk-firebase.js` (`type="module"`)

### Arquivos

- `mk-stale-sync.js`, `mk-cache-bust.js`, `mk-firebase.js` (novos)
- `sw.js` — NETWORK_FIRST nos 3 arquivos

## M.3 — API + guards I15 (v1.7.67)

### O que mudou

| Antes | Depois |
|-------|--------|
| ~130 linhas `api()` inline | `mk-api.js` (~95 linhas) |
| `index.html` ~6.398 linhas | **~6.268 linhas** |

### Ordem de carregamento

1. `mk-stale-sync.js`
2. `mk-version.js`
3. **`mk-api.js`** ← após versão/URL GAS
4. `mk-design.css` … (resto inalterado)

### Arquivos

- `mk-api.js` (novo) — `api()`, `resolveGasUrl_`, `mkGuardEscritaBrowser_`, `mkRequireOperadorEscrita_`
- `sw.js` — NETWORK_FIRST em `mk-api.js`
- `pre-push-check.ps1` — guard I15 em `mk-api.js`

### Validação

```powershell
.\scripts\pre-push-check.ps1
```

Tablet: `?force=1.7.67` — **Nova locação** (zona P0 I15).

## M.4 — Sync + merge Firebase (v1.7.68)

### O que mudou

| Antes | Depois |
|-------|--------|
| ~380 linhas sync inline | `mk-sync.js` (~290 linhas) |
| `index.html` ~6.268 linhas | **~5.968 linhas** |

### Ordem de carregamento

1. Script inline principal (sessions, UI, páginas)
2. **`mk-sync.js`** — após inline, antes de `mk-update` / `mk-auth`
3. `mk-firebase.js` (module, head) chama `aplicarDadosInicio` em runtime

### Arquivos

- `mk-sync.js` (novo) — `syncController`, `sincronizarServidor`, `aplicarDadosInicio`, `mergeSessaoCanonica`, `mkSyncWireEvents_`
- `sw.js` — NETWORK_FIRST em `mk-sync.js`

### Validação

Tablet: `?force=1.7.68` — cards sync multi-dispositivo + status Online/Offline.

## M.5 — Sessão + SMS + timer (v1.7.69)

### O que mudou

| Antes | Depois |
|-------|--------|
| ~310 linhas sessão/SMS/timer inline | `mk-sessao.js` (~300 linhas) |
| `index.html` ~5.968 linhas | **~5.680 linhas** |

### Ordem de carregamento

1. Script inline principal
2. **`mk-sessao.js`** — antes de `mk-sync` (merge usa `calcStartTimestamp`, `higienizarSmsStatusSessao_`)
3. `mk-sync.js` → `mk-update.js` → `mk-auth.js`

### Arquivos

- `mk-sessao.js` — `saveSessions`, SMS status, `startTimerLoop`, `calcRemaining`

### Validação

Tablet: `?force=1.7.69` — cards com timer, alertas 5min/expirado, badges SMS.

## M.6 — Nova locação (v1.7.70)

### O que mudou

| Antes | Depois |
|-------|--------|
| ~670 linhas Nova inline | `mk-nova.js` (~685 linhas) |
| `index.html` ~5.680 linhas | **~5.053 linhas** |

### Ordem de carregamento

1. Script inline → `mk-sessao.js` → `mk-sync.js` → **`mk-nova.js`** → `mk-update` → `mk-auth`

### Arquivos

- `mk-nova.js` — draft, steps, `confirmarLocacao`, `atualizarVeiculoGrid`, busca CRM

### Validação

```powershell
.\scripts\pre-push-check.ps1
```

Tablet: `?force=1.7.70` — **Nova locação completa** (zona P0 I15).

## M.7 — Drawer + encerrar (v1.7.71)

### O que mudou

| Antes | Depois |
|-------|--------|
| ~346 linhas drawer/encerrar inline | `mk-drawer.js` (~360 linhas) |
| `index.html` ~5.070 linhas | **~4.735 linhas** |

### Arquivos

- `mk-drawer.js` — `abrirSessaoDrawer`, `confirmarEncerrar`, `resolverMinUsadosEncerrar_`

### Validação

Tablet: `?force=1.7.71` — drawer Encerrar + confirmar (zona P0 caixa).

### Próximo (M.8)

Alertas, iniciar contagem, editar/cancelar/estender → `mk-operacao.js`.

---

*Mapa completo: `MAPA_CODIGO_ARQUITETURA.md` §2.*
