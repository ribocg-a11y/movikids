# INCIDENTE I29 — Gestão Pessoas fora do DNA visual (FASE 15)

**Data:** 17–18/06/2026  
**Severidade:** P1 UX (não quebrou balcão operacional)  
**Status:** ✅ **Resolvido** repo FE **v1.8.49** + `DESIGN_SYSTEM_MOVIKIDS.md`  
**Superfície:** `gestao-pessoas.html` · hub tablet → Colaboradores

---

## Sintoma (feedback sócio)

- Tela colaboradores “feia”, não responsiva, “não é o padrão Movi Kids”
- Login com **card largo** (`mock-pick`) em vez de dropdown auth
- **PIN campo único** (`0000`) em vez de 4 caixas `mk-pin-box`
- **Passo 1 e Passo 2 visíveis juntos** na mesma dobra
- Botões cinza/planos fora do padrão admin (`mk-btn` azul)
- CSS paralelo em `mk-gestao-pessoas.css` **sobrescrevia** tokens de `mk-app.css`
- Cache Pages (`?force=1.8.45`–`1.8.47`) mantinha versões intermediárias ruins
- URL errada `ribocg.a11y` (sem hífen) servia HTML antigo

---

## Causa raiz

1. Implementação FASE 15 copiou **mockup** (`ponto-mockup.html`) em vez de **`#mk-auth-gate`** (`index.html`)
2. Agente criou estilos novos sem consultar `DESIGN_DNA_MOVIKIDS.md` nem `mk-app.css`
3. Não existia **Design System único** — tokens espalhados doc + CSS
4. `ponto_mockup?prod=1` redirecionava tarde; usuário via mock ADM em produção

---

## Correção (commits)

| Versão | Fix |
|--------|-----|
| v1.8.44 | Hub 3 portas + fluxo gestao-pessoas produção separado do mock |
| v1.8.45 | Remove `confirm()` ao sair admin (regressão UX) |
| v1.8.46–47 | Tentativa DNA mk-auth (ainda com pick cards / PIN único) |
| v1.8.48 | `#gp-auth-gate` + dropdown + passos separados |
| v1.8.49 | Auth = cópia literal `#mk-auth-gate`; CSS auth removido de gestão-pessoas.css |
| Doc | **`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`** + regra `.cursor/rules/design-system-movikids.mdc` |

---

## Travas (MAPA_ERROS)

| Guard | Onde |
|-------|------|
| `guard.ui.design-system` | Consultar `DESIGN_SYSTEM_MOVIKIDS.md` §0 antes de UI |
| `guard.ui.auth-gate` | Auth colaboradores = `#gp-auth-gate` classes `mk-auth-*` |
| `guard.ui.no-mock-pick-prod` | Proibido `mock-pick` em login produção |
| `guard.ui.pin-four-boxes` | PIN = 4× `.mk-pin-box`, nunca campo único |
| `guard.host.canonical` | `mk-canonical-host.js` → `ribocg-a11y` |

---

## Teste

1. https://ribocg-a11y.github.io/movikids/gestao-pessoas.html?force=1.8.49 + **Ctrl+Shift+R**
2. Passo 1: dropdown + Prosseguir (igual balcão)
3. Passo 2: 4 caixas PIN + botões azuis (igual admin imagem 2)
4. Hub: 5 portas `mk-hub-door` responsivo

---

## Lições

- **Mockup ≠ produção** — mock só em `ponto-mockup.html?v=3.6`
- **Nunca CSS auth paralelo** — só `#mk-auth-gate` / `#gp-auth-gate` em `mk-app.css`
- Toda UI nova: fluxo §0 do Design System
