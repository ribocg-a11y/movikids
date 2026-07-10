# Incidente I96–I99 — Multi-veículo, lentidão e overlay travado

**Data:** 10/07/2026  
**Severidade:** P1 operação (UX + risco duplicata) · **sem perda de código** no repo  
**FE:** v1.9.27 → **v1.9.39** · **GAS repo/prod:** **v1.5.187** (ping alinhado · batch ativo)

---

## Resumo

Sessão de entrega do fluxo **multi-veículo / mesma conta (I42)** no cadastro Nova locação. Várias iterações rápidas (I96→I103) geraram **bugs de UX**, **overlay preso no tablet**, **contagem encerradas/caixa confusa** — corrigidos em **v1.9.39** + GAS **v1.5.187** Web.

**Estado seguro para operação single-veículo:** ✅ caminho `salvarLocacao` intacto (GET, I15).  
**Multi-veículo em prod:** ✅ batch `salvarLocacoesMulti` após Nova versão Web v1.5.187.

---

## Cronologia de erros (agente)

| ID | Erro | Efeito | Correção | Status |
|----|------|--------|----------|--------|
| **I96** | CTA "+ Outro carro" na **Home** após salvar | UX rejeitada pelo usuário — fluxo fora do cadastro | Removido em I97; fluxo 100% no Nova | ✅ revertido |
| **I97a** | Grade + cesta + botão add na **mesma tela** | Confusão operacional | v1.9.30 — telas `pick` vs `cesta` | ✅ |
| **I97b** | Scroll agressivo pro topo | Tablet “pula” a tela | v1.9.29 — scroll suave / removido sticky | ✅ |
| **I97c** | Overlay dentro de `#page-nova` | Sumia ao trocar página; confuso | v1.9.31 — overlay global | ✅ |
| **I98a** | N chamadas `salvarLocacao` (N×~15s) | Lentidão ~30s+ com 2 carros | GAS `salvarLocacoesMulti` + FE batch | ✅ GAS **v1.5.187** Web |
| **I98b** | UI otimista sem proteção | Cards `rowIndex=0`; ▶ perigoso | v1.9.34 — card otimista sem ▶ | ✅ |
| **I98c** | Batch GAS validava no loop com `appendRow` | Item 2 inválido → item 1 já gravado | v1.5.187 — validar tudo antes de gravar | ✅ |
| **I99a** | CSS `display:flex` no overlay ignorava `[hidden]` | Tablet WebView: overlay **nunca some** | v1.9.33 — `[hidden]{display:none!important}` | ✅ |
| **I99b** | `novaForceUnstickSave_` liberava mutex mas `await` continuava | **Duplicata** se operador salva de novo | v1.9.34 — `_novaSaveGen` invalida save stale | ✅ |
| **I99c** | Watchdog/dismiss sem cancelar fetch | Save fantasma + toast tardio | Mitigado por `_novaSaveGen` (ignora resultado) | ✅ parcial |
| **I99d** | Entregues 7 bumps FE sem homolog tablet | Regressões visíveis só na loja | Pendente smoke D4 tablet **v1.9.39** | ⏳ |
| **I101** | `MK_GAS_VERSAO_` defasado vs header | Ping mentia versão | v1.5.187 constantes alinhadas | ✅ |
| **I102** | Tile = sessões (tentativa) | Usuário rejeitou | Revertido | ✅ |
| **I103** | Encerradas mostrava todas locações | 12 linhas vs 8 contas | v1.9.39 `mkEncHojePorConta_` · Caixa `nSessoes` | ✅ |

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
| GitHub Pages | **v1.9.39** |
| GAS ping | **v1.5.187** — `salvarLocacoesMulti` ativo |
| GAS repo | **v1.5.187** — batch + validate-first + I101 |

**Nova versão Web:** ✅ publicada pelo sócio 10/07.

---

## Testes pendentes

1. Tablet: 1 veículo — salvar → ▶ → timer OK (I20)
2. Tablet: 2 veículos, planos diferentes — 2 cards, 1 conta encerradas / 2 loc caixa (I42 + I103)
3. Tablet: overlay — após save some; botão dismiss não duplica (I99)
4. PC admin: tile Contas = N únicos · Caixa = N locações (I103)
5. `TESTE_I42_CONTA_DIA_CAIXA.ps1`
6. Script sugerido: `TESTE_SALVAR_LOCACOES_MULTI_READONLY.ps1`

---

## Lições

1. **Não shippar multi-iteração UX sem tablet** na operação MOVI KIDS.
2. **Overlay modal:** sempre `[hidden] !important` + watchdog + token de geração no async.
3. **Batch GAS:** validar **antes** de qualquer escrita.
4. **FE batch:** só chamar action se `ping.postWriteActions` incluir (v1.9.33+).
5. **I103:** Encerradas = contas únicas · Caixa = todas locações — nunca inverter.

---

## Arquivos tocados (referência)

- `mk-nova.js`, `mk-home.js`, `index.html`, `mk-app.css`, `mk-boot.js`
- `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`
- `mk-api.js` (action batch)
