# Deploy seguro - MOVI KIDS Sync Safe

## Objetivo

Publicar a versao de sincronizacao segura sem tirar o sistema do ar.

## Ordem obrigatoria

1. Apps Script.
2. Testes de leitura.
3. Frontend.
4. Teste real com multiplas telas.

## Apps Script

Arquivo:

`RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\gas\Code.gs`

Publicar como nova versao no mesmo Deploy ID.

Nao criar novo deploy.

Testar:

- `action=ping`
- `action=diagnosticoSistema`
- `action=validarSchema`

## Frontend

Arquivos:

- `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\frontend\index.html`
- `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\frontend\sw.js`

Substituir no GitHub Pages:

- `index.html`
- `sw.js`

## Depois de publicar

Abrir tres telas:

- caixa/operador;
- admin;
- outro celular/computador.

Executar:

1. criar locacao;
2. iniciar timer;
3. estender +10min;
4. encerrar;
5. recarregar as tres telas;
6. confirmar que todas mostram o mesmo estado.

## Se falhar

Executar `ROLLBACK_EMERGENCIA.md`.


