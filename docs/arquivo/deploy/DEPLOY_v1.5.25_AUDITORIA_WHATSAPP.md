# Deploy v1.5.25 - Auditoria WhatsApp

Arquivo para colar no Apps Script:

`MOVIKIDS_Code_v1.5.25_AUDITORIA_WHATSAPP_SOBRE_v1.5.24.gs`

## O que muda

- Adiciona a action `registrarWhatsAppEvento`.
- Cria a aba `AUD_WHATSAPP` automaticamente no primeiro registro.
- Registra tentativas/acoes de WhatsApp obrigatorio: tipo, status, rowIndex, responsavel, crianca, telefone, versao do frontend e payload.

## O que nao muda

- Nao altera cadastro de locacao.
- Nao altera timer.
- Nao altera encerramento.
- Nao altera valores financeiros.
- Nao altera Firebase.
- Nao altera fluxo de caixa.

## Como implantar

1. Abrir Apps Script do MOVI KIDS.
2. Substituir somente o conteudo de `Codigo.gs` pelo arquivo acima.
3. Salvar.
4. Implantar nova versao no mesmo Deploy ID.
5. Nunca criar novo Deploy ID.

## Teste rapido apos implantar

Abrir:

`https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=ping`

Esperado:

- `ok: true`
- `versao: v1.5.25`

Teste opcional de auditoria:

`https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=registrarWhatsAppEvento&tipo=teste&status=manual&rowIndex=0&responsavel=Teste&crianca=Teste&telefone=5598999999999&versao=manual`

Esperado:

- `ok: true`
- aba `AUD_WHATSAPP` criada/preenchida.

## Rollback

Voltar para:

`MOVIKIDS_Code_v1.5.24_RESPONSAVEIS_CANONICO_SOBRE_v1.5.23.gs`

