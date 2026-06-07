# Pacote M — Modularização do frontend

**Início:** 07/06/2026  
**Objetivo:** reduzir monólito `index.html` sem mudar comportamento — extrair CSS e JS em fatias.

---

## Status

| Fase | Entrega | Versão | Status |
|------|---------|--------|--------|
| **M.1** | CSS legado → `mk-app.css` | FE **v1.7.65** | ✅ 07/06 |
| M.2 | `mk-stale-sync.js`, `mk-cache-bust.js`, `mk-firebase.js` | v1.7.66+ | ⬜ |
| M.3 | `mk-api.js` (api + guards I15) | — | ⬜ |
| M.4 | `mk-sync.js` (sync + Firebase merge) | — | ⬜ |
| M.5+ | `mk-sessao`, `mk-nova`, `mk-admin`, … | — | ⬜ |

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

### Próximo (M.2)

Extrair anti-stale e cache bust para JS externos (ordem de carga crítica).

---

*Mapa completo: `MAPA_CODIGO_ARQUITETURA.md` §2.*
