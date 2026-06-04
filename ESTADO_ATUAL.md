# MOVI KIDS — Estado atual (04/06/2026)

Referencia unica para alinhamento local x producao.  
**Incidente auth 04/06:** `INCIDENTE_AUTH_OPERADORES_2026-06-04.md`  
**Roadmap mestre:** `PLANO_MESTRE_REORGANIZADO_2026-06.md`

## Producao (verificar apos cada deploy)

| Camada | Versao alvo | URL / ID |
|--------|-------------|----------|
| Apps Script | **v1.5.37** (impl. **v78**) | Deploy `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |
| Frontend | **v1.7.3** | https://ribocg-a11y.github.io/movikids/?force=1.7.3 |
| Planilha | MOVIKIDS_Planilha_Base | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| Apps Script editor | Planilha → Extensões → Apps Script | ver `DEPLOY_GAS_v1.5.32_AUTH.md` |

Teste rapido GAS:  
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

## Arquivos canonicos

- **GAS:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (header v1.5.37 — extras/dia, histórico cache, mês contrato)
- **Login:** `mk-auth.js` + gate em `index.html`
- **Deploy / links:** `DEPLOY_GAS_v1.5.32_AUTH.md`
- **Emergencia:** `scripts/liberar-eduarda-agora.html`, `scripts/corrigir-locacao-206.html`

## Auth operadores — capacidades ADM (GAS 1.5.35+)

| Acao | API |
|------|-----|
| Resetar PIN qualquer operador | `resetarPinOperadorAdmin` + `adminPin=1416` |
| Liberar balcao (qualquer um logado) | `liberarSessaoOperadorAdmin` |
| Deslogar operador especifico | `liberarSessaoOperador` + `operadorId` + `adminPin` |
| Corrigir locacao encerrada (caixa) | `corrigirFinanceiroLocacaoAdmin` (v1.5.36) |

UI: Administracao → Operadores (app v1.6.81).

## Roadmap UX (plano mestre)

- [x] Pacote A — design system v1.7.0
- [x] Financeiro extras + histórico — v1.7.1 + GAS v1.5.37
- [x] Pacote B — Hub admin — v1.7.2 (publicar `git push` + `?force=1.7.2`)
- [ ] Pacote C — Nova locação 3 passos — v1.7.3
- [ ] Pacote D — Drawer sessão

## Validacao

- `listarOperadoresLogin`: Eduarda `hasPin: false`, `sessaoAtiva: null` (apos reset)
- Regressao prod safe: OK (04/06) — estender com cenarios do incidente doc
