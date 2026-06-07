# MOVI KIDS - Deploy Apps Script v1.5.24

Arquivo para colar no Apps Script:

`MOVIKIDS_Code_v1.5.24_RESPONSAVEIS_CANONICO_SOBRE_v1.5.23.gs`

## O que muda

- Mantem tudo da `v1.5.23`.
- Adiciona cadastro canonico opcional de responsaveis.
- Cria a aba `RESPONSAVEIS` apenas quando um cadastro for salvo.
- Cria a aba `AUD_RESPONSAVEIS` para auditoria de edicoes/criacoes.
- Adiciona a action `salvarResponsavel`.
- `listarResponsaveis` passa a mesclar dados do historico com o cadastro canonico, quando existir.

## O que nao muda

- Nao altera o fluxo normal de locacao.
- Nao torna cadastro de responsavel obrigatorio.
- Nao altera timer.
- Nao altera WhatsApp.
- Nao altera pagamento.
- Nao altera Firebase.
- Nao cria novo Deploy ID.

## Ordem correta

1. Colar o arquivo v1.5.24 no Apps Script.
2. Salvar.
3. Implantar nova versao no mesmo Deploy ID.
4. Testar `ping`.
5. Abrir `Resp.` no app v1.6.53.
6. Editar um responsavel de teste.
7. Conferir se foram criadas as abas `RESPONSAVEIS` e `AUD_RESPONSAVEIS`.

## Rollback

Se houver qualquer falha, voltar para `MOVIKIDS_Code_v1.5.23_RELACIONAMENTO_SOBRE_v1.5.22.gs`.

