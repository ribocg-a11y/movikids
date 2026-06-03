# Analise SMS Delivery - Caso Milena - 2026-06-03

## Caso observado

SMS enviado para a locacao da Milena:

```text
gatewayId: jz4V8MMAveD4bkmjkfk-x
telefone: +5598983396917
```

Consulta posterior no SMS Gateway:

```text
state: Failed
states:
  Pending
  Processed
  Sent
  Failed
error: Delivery result from SC +550170012111: 64
```

Interpretacao:

- O Apps Script funcionou.
- O SMS Gateway Cloud aceitou a requisicao.
- O celular processou a mensagem.
- O Android entregou a mensagem ao SMSC.
- O SMSC retornou falha final de entrega.

Ou seja: nao foi falha do frontend nem do Apps Script. Foi falha de entrega na rede/destino depois do envio.

## Significado do erro 64

No contexto retornado pelo SMS Gateway (`Delivery result from SC ...: 64`), o `64` corresponde ao status Android `STATUS_FAILED`.

Ele nao informa sozinho a causa exata. Pode ser numero incorreto/inativo, aparelho sem alcance por tempo suficiente, linha bloqueada para SMS, roteamento/operadora, caixa/SIM/app de mensagens, ou falha da central SMS.

## Risco operacional

Hoje o MOVI KIDS considera sucesso quando o gateway responde `202`/accepted. Isso confirma apenas que o SMS foi aceito para envio, nao que chegou.

Precisamos separar:

- `accepted`: Apps Script enviou ao gateway.
- `sent`: Android/SMSC aceitou.
- `delivered`: entregue.
- `failed`: falhou.

## Correcao recomendada P0

1. Manter envio imediato como esta.
2. Salvar `gatewayId` em `AUD_SMS`.
3. Criar endpoint Apps Script `consultarSmsStatus`.
4. Consultar o status no gateway por `gatewayId`.
5. Atualizar `AUD_SMS` com `Delivered`, `Failed`, `Sent`, `Pending`.
6. No frontend, apos enviar SMS:
   - mostrar `SMS enviado para a fila`.
   - consultar status depois de alguns segundos.
   - se `Delivered`, mostrar sucesso.
   - se `Failed`, alertar operador para confirmar telefone e usar alternativa.
7. Para SMS critico de portal/inicio:
   - se falhar, nao bloquear locacao, mas registrar falha visivel.
   - sugerir QR Code do portal no balcao ou WhatsApp/ligacao.

## Melhorias tecnicas no payload

Adicionar explicitamente:

```json
{
  "withDeliveryReport": true,
  "ttl": 600,
  "priority": 100
}
```

Racional:

- `withDeliveryReport`: deixa explicito que queremos status de entrega.
- `ttl`: evita mensagem velha chegando tarde.
- `priority`: reduz atraso interno do gateway/app.

## Conclusao

O caso Milena precisa ser tratado como falha real de entrega, nao como bug de envio.

Proximo passo recomendado: implementar monitoramento de status SMS no Apps Script e na auditoria.

