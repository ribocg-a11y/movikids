# I200 — Folha Out/2026 “Carregando…” eterno (loop ensureFull)

**Data:** 05/11/2026 · **FE:** **v1.9.195** · **GAS:** sem mudança (v1.5.237)

## Sintoma

Sócio (print 05/11 ~16:00 Fortaleza): Operadores → Folha · competência **Out/2026** · caixa branca **“Carregando folha de Out/2026…”** sem sair · FE `force=1.9.193` (I199) · botão “Concluir atualização” ainda visível.

GAS full Outubro **ok** (~62s, folha=5) — falha era **FE**.

## Causa raiz

`gpAdmRenderFolha_` no mismatch de competência (quer Out, memória ainda Nov):

1. Pintava retry **e** chamava `gpAdmEnsureFullPanel_('folha')`
2. `ensureFull` → `gpAdmShowFolhaLoading_` **apagava** o retry
3. Se a API falhava / `!ok` / Apply rejeitava mês → `finally` → `renderFolha` → de novo `ensureFull` → **loop eterno de “Carregando…”** (sem tip ~1 min)

I199 corrigiu herança de voo; **não** cortou o auto-restart no render.

## Correção FE (v1.9.194–195)

| Item | Onde |
|------|------|
| Render **não** chama `ensureFull` | `gpAdmRenderFolha_` mismatch → só retry |
| Loading com tip + “2 min → Tentar de novo” | `gpAdmShowFolhaLoading_` |
| Watchdog 195s abandona inFlight travado | `gpAdmArmFolhaWatchdog_` |
| Aviso se sem PIN admin | `gpAdmLoadPainelBackground_` |

Carga continua só por: troca de competência, aba Folha (`setTab` → `ensureFull` **uma** vez), botão **Tentar de novo** (`force:true`).

## Como testar

1. Banner **Nova versão** / `?force=1.9.195` + **Concluir atualização**
2. Operadores → **Out/2026** → Folha
3. Esperar ~1 min **ou** ver botão retry (nunca loading infinito)
4. 2ª abertura = cache local


### Além (05/11 — mandato §9)

- Contrato paint-only + `guard.i200.folha.paint`
- Contador de segundos no loading (E5)
- A9 + §9.7 em `APRENDIZADO_AGENTE_MOVIKIDS.md`
- PROTOCOLO docs alinhados 1.9.195
