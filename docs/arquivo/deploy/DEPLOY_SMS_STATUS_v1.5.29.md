# MOVI KIDS - Status de entrega SMS v1.5.29 / frontend v1.6.68

Objetivo: mostrar no card se o SMS foi entregue ou falhou.

## Arquivos

- Apps Script: `MOVIKIDS_Code_v1.5.29_SMS_STATUS_SOBRE_v1.5.28.gs`
- Frontend: `index.html` v1.6.68
- Service Worker: `sw.js` v1.6.68

## Apps Script

Novo endpoint:

```text
action=consultarSmsStatus
gatewayId=<id_do_sms_gateway>
rowIndex=<linha_da_locacao>
origem=frontend
versao=1.6.68
```

Resposta esperada:

```json
{
  "ok": true,
  "sms": {
    "gatewayId": "...",
    "state": "Delivered",
    "error": "",
    "telefoneHash": "...",
    "code": 200
  }
}
```

Estados principais:

- `Accepted` / `Pending`: SMS entrou na fila.
- `Processed` / `Sent`: celular/SMSC processou.
- `Delivered`: entregue.
- `Failed`: falhou.

## Frontend

Depois de enviar SMS, o card mostra:

- `SMS na fila`
- `SMS enviado`
- `Entregue SMS`
- `Falha SMS`

O frontend consulta o status automaticamente apos o envio.

## Teste manual

Consultar um SMS entregue:

```text
https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=consultarSmsStatus&gatewayId=LfUmsfVfpYZUw1QZZ11sG&origem=teste_manual&versao=1.6.68
```

Consultar o SMS que falhou no caso Milena:

```text
https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=consultarSmsStatus&gatewayId=jz4V8MMAveD4bkmjkfk-x&origem=teste_manual&versao=1.6.68
```

