# Incidente I96–I99 — Multi-veículo, lentidão e overlay travado

**Data:** 10/07/2026  
**Severidade:** P1 operação (UX + risco duplicata) · **sem perda de código** no repo  
**FE:** v1.9.27 → v1.9.34 · **GAS repo:** v1.5.186 → v1.5.187 · **GAS prod:** v1.5.182 (ping)

---

## Resumo

Sessão de entrega do fluxo **multi-veículo / mesma conta (I42)** no cadastro Nova locação. Várias iterações rápidas (I96→I99) geraram **bugs de UX**, **overlay preso no tablet** e **riscos de duplicata** corrigidos parcialmente em v1.9.34.

**Estado seguro para operação single-veículo:** ✅ caminho `salvarLocacao` intacto (GET, I15).  
**Multi-veículo em prod hoje:** ⚠️ sequencial lento (~15s × N); batch só após Nova versão GAS v1.5.187.

---

## Cronologia de erros (agente)

| ID | Erro | Efeito | Correção | Status |
|----|------|--------|----------|--------|
| **I96** | CTA "+ Outro carro" na **Home** após salvar | UX rejeitada pelo usuário — fluxo fora do cadastro | Removido em I97; fluxo 100% no Nova | ✅ revertido |
| **I97a** | Grade + cesta + botão add na **mesma tela** | Confusão operacional | v1.9.30 — telas `pick` vs `cesta` | ✅ |
| **I97b** | Scroll agressivo pro topo | Tablet “pula” a tela | v1.9.29 — scroll suave / removido sticky | ✅ |
| **I97c** | Overlay dentro de `#page-nova` | Sumia ao trocar página; confuso | v1.9.31 — overlay global | ✅ |
| **I98a** | N chamadas `salvarLocacao` (N×~15s) | Lentidão ~30s+ com 2 carros | GAS `salvarLocacoesMulti` + FE batch | ⚠️ GAS **não publicado** |
| **I98b** | UI otimista sem proteção | Cards `rowIndex=0`; ▶ perigoso | v1.9.34 — card otimista sem ▶ | ✅ |
| **I98c** | Batch GAS validava no loop com `appendRow` | Item 2 inválido → item 1 já gravado | v1.5.187 — validar tudo antes de gravar | ✅ repo |
| **I99a** | CSS `display:flex` no overlay ignorava `[hidden]` | Tablet WebView: overlay **nunca some** | v1.9.33 — `[hidden]{display:none!important}` | ✅ |
| **I99b** | `novaForceUnstickSave_` liberava mutex mas `await` continuava | **Duplicata** se operador salva de novo | v1.9.34 — `_novaSaveGen` invalida save stale | ✅ |
| **I99c** | Watchdog/dismiss sem cancelar fetch | Save fantasma + toast tardio | Mitigado por `_novaSaveGen` (ignora resultado) | ✅ parcial |
| **I99d** | Entregues 7 bumps FE sem homolog tablet | Regressões visíveis só na loja | Pendente smoke D4 tablet v1.9.34 | ⏳ |

---

## Perdas — avaliação

| Camada | Perda? | Notas |
|--------|--------|-------|
| **Git / código** | ❌ Não | I96 removido limpo; histórico preservado (commits 62a3aaf→e5568fe) |
| **Cronômetro I16/I20/I43** | ❌ Não tocado | `carregarInicio_`, `mk-sync`, `mk-sessao` intactos |
| **API browser I15** | ❌ Não | `salvarLocacoesMulti` em GET via `mk-api.js` |
| **Planilha** | ⚠️ Verificar | Overlay travado ≠ save falhou; loc pode ter sido gravada. Conferir LOCAÇÕES do dia |
| **Caixa I42** | ⚠️ Se duplicata | Re-save após dismiss antes de v1.9.34 podia duplicar Pendente |

---

## Produção atual (10/07/2026)

| Artefato | Versão |
|----------|--------|
| GitHub Pages | **v1.9.34** (após fix auditoria) |
| GAS ping | **v1.5.182** — sem `salvarLocacoesMulti` |
| GAS repo | **v1.5.187** — batch + validate-first |

**Ação sócio:** Nova versão Web no Deploy ID `AKfycbwakQ...` com `.gs` v1.5.187.

---

## Testes pendentes

1. Tablet: 1 veículo — salvar → ▶ → timer OK (I20)
2. Tablet: 2 veículos, planos diferentes — 2 cards, 1 conta caixa (I42)
3. Tablet: overlay — após save some; botão dismiss não duplica (I99)
4. `TESTE_I42_CONTA_DIA_CAIXA.ps1` após GAS novo
5. Script novo sugerido: `TESTE_SALVAR_LOCACOES_MULTI_READONLY.ps1`

---

## Lições

1. **Não shippar multi-iteração UX sem tablet** na operação MOVI KIDS.
2. **Overlay modal:** sempre `[hidden] !important` + watchdog + token de geração no async.
3. **Batch GAS:** validar **antes** de qualquer escrita.
4. **FE batch:** só chamar action se `ping.postWriteActions` incluir (v1.9.33+).
5. **GAS repo ≠ prod** — comunicar latência real até Nova versão Web.

---

## Arquivos tocados (referência)

- `mk-nova.js`, `mk-home.js`, `index.html`, `mk-app.css`, `mk-boot.js`
- `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`
- `mk-api.js` (action batch)
