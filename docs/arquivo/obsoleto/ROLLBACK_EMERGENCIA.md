# MOVI KIDS - Rollback de emergencia

Use este roteiro se a troca controlada causar impacto operacional.

## Regra

Rollback deve voltar aos arquivos de producao anterior, sem criar novo Deploy ID.

## Arquivos de volta

Frontend:

- Origem: `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\index_v1.6.31_PRODUCAO.html`
- Destino no GitHub Pages: `index.html`

Service worker:

- Origem: `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\sw_v1.6.31_PRODUCAO.js`
- Destino no GitHub Pages: `sw.js`

Apps Script:

- Origem: `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\Code_v1.5.11_PRODUCAO.gs`
- Destino no projeto Apps Script: `Code.gs`

Manifesto GAS:

- Origem: `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\appsscript_PRODUCAO.json`
- Destino no projeto Apps Script: `appsscript.json`

## Passos

1. Voltar `Code.gs` no Apps Script para a versao de rollback.
2. Criar nova versao no mesmo Deploy ID.
3. Voltar `index.html` e `sw.js` no GitHub Pages.
4. Aguardar GitHub Pages publicar.
5. Em cada dispositivo, fechar e abrir novamente o sistema.
6. Se necessario, limpar cache do site no navegador.
7. Testar:
   - `ping`
   - criar locacao
   - iniciar timer
   - encerrar locacao

## Como confirmar que voltou

No frontend, a versao deve voltar para `v1.6.31`.

No Apps Script, `ping` deve voltar para `v1.5.11`.

## Observacao importante

O rollback nao apaga dados da planilha.

Ele apenas volta o codigo publicado.

