# INCIDENTE I33 — Tablet lento / não carrega (PWA cache + latência boot)

**Data:** 20/06/2026  
**Severidade:** P1 operação  
**Status:** 🟡 **Mitigado** (force update FE) · latência GAS em aberto  
**Camadas:** PWA/SW · GitHub Pages · GAS `carregarInicio`

---

## Sintoma

- Tablet no balcão **demorava muito** para carregar ou **não abria** o app
- Operadores reportaram tela branca / splash eterno após deploys recentes

---

## Diagnóstico (20/06/2026)

| Check | Resultado |
|-------|-----------|
| GitHub Pages | HTTP 200 · FE online |
| GAS ping | `ok: true` · v1.5.107 |
| `carregarInicio` | ~**6,1 s** latência medida (PC) |
| PWA instalado | Cache SW + `localStorage` sessão — versão antiga possível |
| `verify-gas-deploy` | `live.anonymous` OK |

---

## Causa provável

1. **PWA stale** — ícone na tela servindo bundle antigo (I3/I19 recorrência)
2. **Latência `carregarInicio`** — boot bloqueado até API (~6 s perceptível no tablet)
3. Não confundir com GAS offline (ping OK)

---

## Mitigação aplicada

1. Force update global FE **v1.8.69 → v1.8.70 → v1.8.71** (`MK_VERSION` + `sw.js` + `?v=`)
2. SW `activate` limpa caches + `skipWaiting`
3. Procedimento tablet documentado abaixo

---

## Procedimento tablet (operador)

1. Fechar app PWA
2. Abrir no navegador: `https://ribocg-a11y.github.io/movikids/?force=VERSAO&nocache=YYYYMMDD`
3. Recarregar forçado
4. Se persistir: limpar dados do site → reinstalar PWA
5. Só então usar ícone na tela

---

## Pendências

- [ ] Reduzir peso/latência `carregarInicio` (GAS cache v2, Firebase path)
- [ ] Homologar boot no **tablet físico** após cada bump major FE
- [ ] Publicar GAS v1.5.111 (ping ainda v1.5.107 — I26)

---

## Trava existente

- I3 — alinhar `mk-version` + `sw` + `index ?v=`
- I19 — reconcile sessão fantasma
- `verify-publish-complete.ps1` pós-push
