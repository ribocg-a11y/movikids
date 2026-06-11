# Incidente I3 (recorrência) — FE v1.8.15 não carregava (11/06/2026)

**Registrado em:** 11/06/2026  
**Severidade:** P2 — gestão/admin com versão errada; balcão não afetado  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I3**  
**Correção:** FE **v1.8.15** commit `68c47c0`  
**Deploy:** `DEPLOY_FE_v1.8.15_SEMANA_ATUAL.md`

---

## Resumo executivo

| O que o usuário viu | O que o sistema fazia |
|---------------------|------------------------|
| Rodapé **Online v1.8.14** com `?force=1.8.14` ou `1.8.15` | `index.html` ainda referenciava scripts com `?v=1.8.14` |
| Semana do Dashboard sempre **Sem 01** | Fix de semana estava em `mk-admin.js` v1.8.15, mas JS antigo cacheado |
| “Não quer atualizar para versão 15” | GitHub Pages servia `mk-version.js` cacheado como 1.8.14 |

**Causa raiz:** bump de versão incompleto — `mk-version.js` e `sw.js` atualizados, **`index.html` não**.

---

## Linha do tempo

| Momento | Evento |
|---------|--------|
| 11/06 | Commit `aeec240` — `mk-admin.js` semana atual + `MK_VERSION=1.8.15` |
| 11/06 | Push sem alinhar `index.html` (`?v=1.8.14`) |
| 11/06 | Usuário abre Dashboard — continua v1.8.14 e Sem 01 |
| 11/06 | Commit `68c47c0` — 24 tags `?v=1.8.15` em `index.html` |
| 11/06 | GitHub Pages build/deploy OK — produção confirma `MK_VERSION = '1.8.15'` |

---

## Mecanismo técnico

1. `index.html` carrega `mk-version.js?v=1.8.14` **antes** de `mk-cache-bust.js`
2. Browser entrega **cópia cacheada** do `mk-version.js` (conteúdo 1.8.14)
3. `mk-cache-bust.js` lê `MK_VERSION = '1.8.14'` → não redireciona para `?force=1.8.15`
4. `mk-admin.js?v=1.8.14` também cacheado → sem `resolverSemanaDefaultIdx_`

---

## Travas existentes (já no repo)

| Trava | Onde |
|-------|------|
| `versao.index-cache-bust` | `scripts/pre-push-check.ps1` |
| Regra 9 / I3 | `MAPA_ERROS` — bump triplo obrigatório |
| `versao.mk-vs-sw` | `mk-version.js` = `sw.js` |

**Falha de processo:** `pre-push-check` não foi executado antes do commit `aeec240`.

---

## Prevenção

1. Rodar `.\scripts\pre-push-check.ps1` antes de **todo** push FE
2. Checklist agente: `mk-version.js` + `sw.js` + **`index.html ?v=`** na mesma sessão
3. Após push: curl ou browser em `mk-version.js?v=VERSAO` e `index.html` na Pages

---

## Commits

| Hash | Conteúdo |
|------|----------|
| `aeec240` | v1.8.15 feature (incompleto — faltou index) |
| `68c47c0` | Fix cache-bust index.html |
