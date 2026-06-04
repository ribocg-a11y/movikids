# Encerrar sem extras fantasmas com GAS offline (v1.7.6)

## Problema

Com GAS fora, o cronometro local seguia contando minutos extras; ao encerrar, o caixa gravava valores inflados.

## Solucao

**Frontend:** se `_syncFailCount >= 3` (status Offline), ao encerrar:

- **Operador:** cobra apenas o **plano** (`minUsados = mins contratados`).
- **ADM:** mesmo padrao; opcional checkbox para incluir extras do cronometro (so se marcar).

Antes de gravar, tenta `ping`; se falhar, mantem somente plano.

**GAS:** `encerrarLocacao` com `somentePlano=true` força `minUsados = minContratados` no servidor.

## Publicar

1. `git push` → `?force=1.7.6`
2. Opcional GAS: `.\scripts\deploy-gas.ps1` + Nova versao Web `AKfycbwakQ...`
