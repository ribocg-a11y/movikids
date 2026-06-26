# Incidente I68 — VT folha dobrado + dias errados (26/06/2026)

**Status:** ✅ **Fechado** — GAS **v1.5.167** · planilha ajustada · FE **v1.8.122** (timeout RH)

## Sintoma

- Hub Colaboradores mostrava **~R$ 437** VT/pessoa (Milena) em vez do esperado.
- Regra operacional: passagem **R$ 4,40** · **2/dia** (ida+volta) · **2 folgas/semana** (~22 dias/mês).
- Milena: erro **timeout-25000ms** ao entrar em Colaboradores (painel RH ~23s).

## Causa raiz

1. **GAS `gpVtPassesMes_`:** `diasVa × 2 × B9` — dobrava ida+volta quando **B9** já era tarifa diária; usava **B12** (dias VA) em vez de **B10** (dias VT).
2. **Planilha FOLHA:** B9=8,40 (meia tarifa) · B10=24 · B12=26 — desalinhado com 22 dias úteis.
3. **FE:** `gpApi()` timeout default **25s** < tempo real `buscarPainelColaborador`.

## Correção

| Camada | Versão | O quê |
|--------|--------|-------|
| GAS | **v1.5.166–167** | `gpVtPassesMes_` = `B10 × B9`; `lerFolhaPlanejamento_` lê `diasVt`; `ajustarFolhaVtAdmin` |
| Planilha | 26/06 | B9=**8,80** · B10/B12=**22** via `ajustarFolhaVtAdmin` |
| FE | **v1.8.122** | `gpApi` timeout 60s painel colaborador; mensagem timeout humanizada |

## Valores validados (API 26/06)

| Colaborador | VT passes/mês |
|-------------|----------------|
| Milena (id 2) | **R$ 193,60** (22 × 8,80) |
| Raykelly (id 3) | **R$ 103,25** (proporcional 16/30) |

`folhaPlanejamento`: `vtTarifa=8.8` · `diasVt=22` · `custoMensal=5253.96` · `vaDia=18.18`

## Testes

```powershell
.\scripts\testes\AJUSTAR_FOLHA_VT_I67.ps1
.\scripts\testes\TESTE_INVESTIGACAO_VT_COLABORADORES.ps1
```

## Não regredir

- Memorial FOLHA: **B9 = ida+volta/dia** — fórmula GAS **sem ×2**.
- Dias VT = **B10**, não B12.
- Passagem única = R$ 4,40 → B9 = **8,80**.

**GAS changelog interno:** I67 (header `.gs`) — mapa erros: **I68** (I67 já usado por RESP L233).
