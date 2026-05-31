# MOVI KIDS - Homologacao em producao assistida

Data sugerida: fora do horario de pico.

Objetivo: validar a correcao de sincronizacao com o sistema online, sem troca brusca e com rollback pronto.

## Regra principal

Nao criar novo Deploy ID do Apps Script.

Atualizar sempre no mesmo deploy existente, mantendo a URL atual do sistema.

## Participantes

- 1 pessoa no caixa/operador.
- 1 pessoa olhando a tela admin.
- 1 pessoa olhando uma segunda tela operacional ou celular.

## Antes de publicar

- Confirmar que o arquivo de rollback existe:
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\index_v1.6.31_PRODUCAO.html`
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\sw_v1.6.31_PRODUCAO.js`
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\Code_v1.5.11_PRODUCAO.gs`
- Confirmar que o pacote novo existe:
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\frontend\index.html`
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\frontend\sw.js`
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\gas\Code.gs`
- Rodar validacao local:

```powershell
node TEST_ENV_MOVIKIDS_SYNC_SAFE\tests\analyze_release_candidate.js
```

Resultado esperado:

```text
Status: PASS_WITH_KNOWN_RISKS
```

## Ordem de publicacao

1. Publicar primeiro o Apps Script `v1.5.13_SAFE` no mesmo Deploy ID.
2. Testar `ping`.
3. Testar `diagnosticoSistema`.
4. Testar `validarSchema`.
5. So depois publicar frontend `v1.6.33-sync-safe` e `sw.js`.
6. Abrir o sistema em 3 telas.

## Teste real minimo

1. Em uma tela, criar uma locacao de teste.
2. Conferir se ela aparece nas outras telas.
3. Iniciar o timer.
4. Conferir se todas as telas mostram timer iniciado.
5. Estender a locacao em +10min.
6. Conferir se todas mostram a extensao e o novo total de minutos.
7. Encerrar a locacao.
8. Conferir se todas saem de ativa para encerrada.
9. Conferir historico e faturamento do dia.

## Criterios de aceite

- Todas as telas veem a mesma locacao ativa.
- Timer nao volta para estado antigo quando uma tela e recarregada.
- Extensao aparece em todas as telas.
- Encerramento aparece em todas as telas.
- Nao surgem duplicidades.
- Nao perde locacao.
- Nao muda preco esperado.
- Nao quebra historico.

## Criterios de rollback imediato

- Locacao nao salva.
- Locacao salva duplicada.
- Encerramento nao grava.
- Timer inicia em uma tela e nao aparece nas outras apos recarregar.
- Extensao altera valor errado.
- Tela principal fica inutilizavel para operacao.

Se qualquer item acima acontecer, executar `ROLLBACK_EMERGENCIA.md`.


