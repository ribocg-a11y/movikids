# Deploy v1.5.26 - Operador em Auditoria

Arquivo para colar no Apps Script:

`MOVIKIDS_Code_v1.5.26_OPERADOR_AUDITORIA_SOBRE_v1.5.25.gs`

## O que muda

- Mantem toda a base da `v1.5.25`.
- Adiciona identificacao de operador nas auditorias da aba `AUDITORIA`.
- Usa o parametro `operador` enviado pelo frontend.
- Se o frontend nao enviar operador, preserva o fallback antigo: email da conta/script ou `operador`.

## Acoes cobertas

- `salvarLocacao`
- `iniciarTimer`
- `editarLocacao`
- `cancelarLocacao`
- `estenderLocacao`
- `encerrarLocacao`

## O que nao muda

- Nao altera calculo financeiro.
- Nao altera timer.
- Nao altera status.
- Nao altera Firebase.
- Nao altera WhatsApp.
- Nao bloqueia operacao sem operador definido.

## Teste rapido apos implantar

Abrir:

`https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=ping`

Esperado:

- `ok: true`
- `versao: v1.5.26`

## Rollback

Voltar para:

`MOVIKIDS_Code_v1.5.25_AUDITORIA_WHATSAPP_SOBRE_v1.5.24.gs`

