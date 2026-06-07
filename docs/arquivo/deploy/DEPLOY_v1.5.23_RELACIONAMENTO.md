# MOVI KIDS - Deploy Apps Script v1.5.23

Arquivo para colar no Apps Script:

`MOVIKIDS_Code_v1.5.23_RELACIONAMENTO_SOBRE_v1.5.22.gs`

## O que muda

- Adiciona a acao `listarResponsaveis`.
- Consolida responsaveis por telefone a partir da aba `LOCACOES`.
- Retorna nome, telefone, criancas, ultima visita, total de locacoes, faturamento e historico resumido.
- Mantem `Triciclo 02`.
- Mantem diagnosticos da v1.5.22.

## O que nao muda

- Nao altera pagamentos.
- Nao altera timers.
- Nao altera encerramento.
- Nao escreve na planilha.
- Nao altera Firebase.
- Nao cria novo Deploy ID.

## Ordem correta

1. Colar este arquivo no Apps Script.
2. Salvar.
3. Implantar nova versao no mesmo Deploy ID.
4. Abrir o app e conferir a versao frontend `1.6.52`.
5. Abrir a aba `Resp.` / `Relacionamento` e testar busca por telefone ou nome.

