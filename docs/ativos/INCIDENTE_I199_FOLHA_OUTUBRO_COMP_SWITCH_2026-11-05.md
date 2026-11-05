# I199 — Folha Outubro “não carrega” (PC + celular)

**Data:** 05/11/2026 · **FE:** **v1.9.193** · **GAS:** sem mudança (v1.5.237)

## Sintoma

Sócio: folha de **outubro/2026** não carrega no celular **nem** no computador (Gestão Pessoas → Folha).

## Evidência live (05/11)

| Chamada | Tempo | Resultado |
|---------|------:|-----------|
| `painelGestaoPessoasAdmin` lite `10/2026` | ~48 s | ok · folha=[] |
| `painelGestaoPessoasAdmin` full `10/2026` | ~62 s | ok · **folha=5** |

Servidor **responde**. O bug era **FE**.

## Causa raiz

1. Boot carrega **11/2026**; usuário troca para **10/2026** com painel ainda em voo → `mkGpAdmLoad_` **herdava a promise** do mês errado (`gpAdmPanelInFlight_ && !force` early-return).  
2. Folha de **novembro** em memória fazia `gpAdmHasFolhaData_()` = true → **não pedia** Outubro.  
3. Hydrate/alertas em **paralelo** com full (I136) atrasava além do timeout em celular.  
4. `force: true` no `ensureFull` matava ScriptCache (família I168).

## Correção FE (v1.9.193)

| Item | Onde |
|------|------|
| Competência do voo + cancel na troca de mês | `gpAdmPanelCompInFlight_` · `switchComp` |
| Folha só conta se `competencia` = select | `gpAdmHasFolhaForComp_` |
| Ignore payload atrasado de outro mês | `gpAdmApplyPanelPayload_` |
| Folha: hydrate **depois** do full | `skipLite` serializado |
| Timeout Folha 180s · 1ª tentativa soft | `gpAdmLoadPainelBackground_` / `ensureFull` |

## Como testar

1. `gestao-pessoas.html?force=1.9.193` (ou banner Nova versão)  
2. Operadores → competência **Out/2026** → aba **Folha**  
3. Esperar ~1 min na 1ª vez → 5 linhas; 2ª abertura = cache

## Nota dados

API Outubro devolveu PIX estimados negativos para Karen/Milena neste snapshot — **fora** do “não carrega”; investigar cálculo/quinzena em seguida se o sócio confirmar valores.
