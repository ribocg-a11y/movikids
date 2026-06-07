# MOVI KIDS - Comparativo antigo x novo

## Producao atual

- Frontend: `v1.6.31`
- Service worker: `movikids-v1.6.31`
- Apps Script: `v1.5.11`

## Release candidate

- Frontend: `v1.6.33-sync-safe`
- Service worker: `movikids-v1.6.33-sync-safe`
- Apps Script: `v1.5.13_SAFE`

## Mudancas no frontend

Arquivo novo:

`RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\frontend\index.html`

Mudancas principais:

- Atualiza versao visivel e interna para `v1.6.33-sync-safe`.
- Atualiza cache atual para `movikids-v1.6.33-sync-safe`.
- Faz o listener Firebase enviar dados para `aplicarDadosInicio` como fonte canonica.
- Adiciona `mergeSessaoCanonica(serverSession, localSession)`.
- `aplicarDadosInicio` passa a montar `sessions` usando dados do servidor/Firebase como fonte principal.
- Estado local preserva apenas flags visuais, como alertas ja disparados.

Impacto esperado:

- Reduz telas divergentes.
- Evita que localStorage velho sobrescreva timer/status/extensao.
- Mantem o sistema atual, sem redesenhar tela ou fluxo operacional.

## Mudancas no service worker

Arquivo novo:

`RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\frontend\sw.js`

Mudancas principais:

- Cache alterado de `movikids-v1.6.31` para `movikids-v1.6.33-sync-safe`.

Impacto esperado:

- Forca navegadores a pegarem a nova versao do frontend.
- Evita mistura de JS antigo com HTML novo.

## Mudancas no Apps Script

Arquivo novo:

`RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\gas\Code.gs`

Mudancas principais:

- Versao `v1.5.13_SAFE`.
- Define explicitamente `FB_URL`.
- Adiciona endpoint somente leitura `diagnosticoSistema`.
- Adiciona endpoint somente leitura `validarSchema`.
- Mantem sincronizacao Firebase em salvar, iniciar e encerrar.
- Adiciona sincronizacao Firebase depois de `estenderLocacao_`.

Impacto esperado:

- Extensoes passam a atualizar o canal vivo.
- Operador consegue diagnosticar schema sem mexer em dados.
- Frontend recebe estado mais confiavel.

## O que nao foi mudado nesta fase

- Nao foi alterado Deploy ID.
- Nao foi alterada estrutura da planilha.
- Nao foi removido Apps Script.
- Nao foi removido Firebase.
- Nao foi criada autenticacao nova.
- Nao foi reescrito o monolito.
- Nao foi alterada tabela de precos.

## Riscos herdados que continuam

- Escrita via `GET`.
- Webapp anonimo.
- Uso alto de `innerHTML`.
- Muitos `onclick` inline.
- Frontend monolitico.

Esses pontos pertencem a fase 2 de seguranca e modernizacao.


