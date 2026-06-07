# MOVI KIDS - Pacote SMS Operacional P0

Data: 2026-06-03

## Objetivo

Fechar o ponto SMS como canal principal antes de seguir para P1/P2.

## Entregas do pacote

- Frontend `v1.6.69`.
- Service Worker `1.6.69`, sem cache persistente.
- Apps Script local `v1.5.30` sobre `v1.5.29`.
- SMS Gateway Cloud continua como canal principal.
- WhatsApp fica como fallback manual quando o SMS falhar.

## Fluxos cobertos

- Portal/boas-vindas: envia link do Portal do Responsavel.
- Alerta de 5 minutos: SMS informa que o tempo esta perto de acabar.
- Tempo esgotado/extra: SMS obrigatorio antes de fechar alerta de extra.
- Extensao: SMS informa tempo atualizado e portal.
- Agradecimento: SMS pos-locacao.
- Retorno/campanha: SMS auditado com opt-out textual.

## Status de entrega

O card passa a reconsultar status por `gatewayId` em:

- 15 segundos
- 60 segundos
- 180 segundos
- 300 segundos

Tambem existe varredura local a cada 30 segundos para SMS ainda nao finalizados.

Estados exibidos:

- `SMS na fila`
- `SMS processando`
- `SMS enviado`
- `Entregue SMS`
- `Falha SMS`
- `SMS sem confirmacao`

Se o status for `Failed`, o card mostra acao de fallback por WhatsApp.

## Diagnostico Milena

O numero da Milena falhou repetidamente mesmo com envio aceito pelo gateway.

Padrao observado:

- Gateway aceitou.
- Android processou.
- Estado chegou em `Sent`.
- Operadora retornou `Failed`.
- Erro: `Delivery result from SC +550170012111: 64`.

Conclusao: falha de entrega da operadora/destino, nao falha do MOVI KIDS.

## Homologacao antes de publicar

1. Colar/reimplantar Apps Script `MOVIKIDS_Code_v1.5.30_SMS_OPERACIONAL_SOBRE_v1.5.29.gs` no mesmo Deploy ID.
2. Testar `ping`.
3. Testar `enviarSmsResponsavel` em uma locacao real/controlada.
4. Consultar `consultarSmsStatus` com o `gatewayId` retornado.
5. Confirmar no card:
   - fila/processando
   - entregue ou falha
   - fallback se falha
6. Publicar frontend somente depois da validacao.

## Observacoes

- Nao criar novo Deploy ID.
- Nao usar WhatsApp para burlar restricao.
- Campanhas devem manter texto curto e conter opt-out: `Para sair, responda SAIR.`
