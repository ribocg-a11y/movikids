# Deploy - v1.6.35 Operacoes Safe

Data: 31/05/2026

## Objetivo

Adicionar edicao e cancelamento seguro de locacoes sem apagar registros e sem quebrar caixa, historico, relatorios ou sincronizacao entre telas.

## Arquivos

- Frontend: `index_v1.6.35_OPERACOES_SAFE.html`
- Service worker: `sw_v1.6.35_OPERACOES_SAFE.js`
- Apps Script: `MOVIKIDS_Code_v1.5.14_OPERACOES_SAFE.gs`
- Pacote: `pacote_v1.6.35_OPERACOES_SAFE/`
- Mockup: `TEST_ENV_EDICAO_CANCELAMENTO/mockup/index.html`

## Backend

Novas rotas no Apps Script:

- `editarLocacao`
- `cancelarLocacao`

Novos comportamentos:

- edicao de responsavel, crianca, telefone, veiculo, pagamento e observacao;
- troca de plano apenas antes de iniciar contagem;
- cancelamento marca status como `Cancelada`;
- cancelamento nao apaga linha;
- auditoria em nova aba `AUDITORIA`;
- Firebase atualizado apos editar/cancelar;
- cache `carregarInicio_v2` invalidado apos alteracoes.

## Frontend

Nova versao:

- `APP_VERSION = 'v1.6.35-operacoes-safe'`

Mudancas:

- menu `...` nos cards de Home e Painel Operacao;
- modal de operacoes com formularios contextuais;
- editar dados;
- trocar pagamento;
- trocar veiculo;
- trocar plano se ainda pendente;
- adicionar observacao;
- cancelar com justificativa;
- atualizacao local do card apos salvar;
- sincronizacao por `broadcastInvalidate()` e `syncController()`.

## Testes locais

Executados:

- sintaxe do frontend: OK;
- sintaxe do service worker: OK;
- sintaxe do Apps Script: OK;
- teste estatico de operacoes seguras: PASS.

Relatorio:

- `TEST_ENV_EDICAO_CANCELAMENTO/reports/analysis-operacoes-safe.md`

## Ordem de publicacao

1. Colar `MOVIKIDS_Code_v1.5.14_OPERACOES_SAFE.gs` no Apps Script.
2. Salvar.
3. Implantar nova versao no mesmo Deploy ID.
4. Substituir `index.html` pelo arquivo do pacote `pacote_v1.6.35_OPERACOES_SAFE/index.html`.
5. Substituir `sw.js` pelo arquivo do pacote `pacote_v1.6.35_OPERACOES_SAFE/sw.js`.
6. Publicar no GitHub Pages.
7. Abrir o sistema e confirmar a versao `v1.6.35-operacoes-safe`.

## Rollback

Se algo falhar:

- voltar `index.html` e `sw.js` para v1.6.34 ou v1.6.33;
- manter Apps Script anterior, se ainda nao publicado;
- se Apps Script ja tiver sido publicado, as novas rotas nao interferem nas rotas antigas.
