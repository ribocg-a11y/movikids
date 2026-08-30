# I148 — Encerrar fantasma + extra Iza + Home dessincronizada

**Status:** ✅ FE **v1.9.107** Pages · GAS repo **v1.5.213** · Web ping ainda **v1.5.211**  
**Data:** 29–30/08/2026

---

## O quê

1. **Iza / Isadora #3112 (29/08):** servidor encerrou cedo (13:33, R$ 22, extra 0). Tela do tablet ficou Ativa até ~14:20 com +44 min. Segundo Encerrar → 409; extra não entrou no caixa. Extra restaurado no Caixa (admin).
2. **Card fantasma:** linha Encerrada no Sheets, card Ativa no FE (snapshot local / `carregarInicio` lento).
3. **Home 30/08 ~15:12:** “12 CONTAS” + “22 locações” com chip *local há 40 min*. Planilha tinha **18 telefones / 22 encerradas**. O 12 era cópia velha; o 22 vinha do caixa (I117 = encerradas + ativas).

## Correção FE v1.9.107

- `mkEncerrarPurgeLocal_` — 409 “já encerrada” e Encerrar OK apagam card + snapshot
- `mkSyncListarAtivasFallback_` — se `carregarInicio` atrasar, `listarAtivas` atualiza o balcão

## GAS repo (Web ainda 1.5.211)

- `minUsados` `let` (cancelar extras)
- `corrigirCanceladaParaEncerradaAdmin` (Iza row 3046, outro agente)

Nova versão Web **não** publicada (sócio).

## Homolog

Tablet `?force=1.9.107` — card some se já Encerrada; Home contas = telefones da planilha quando nuvem agora.
