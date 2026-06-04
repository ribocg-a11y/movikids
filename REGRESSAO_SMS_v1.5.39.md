# Regressao SMS — v1.5.39 (04/06/2026)

## O que a planilha mostrava (e voce lembra certo)

Na **AUD_SMS** aparecia `status=enviado` + `gatewayId` → o **GAS e o gateway aceitavam**. Isso nunca parou.

O que mudou foi a **entrega no celular** (estado `Failed` / `GENERIC_FAILURE`).

## Mudanca de codigo que quebrou entrega

| Versao | `enviarSmsGateway_` payload |
|--------|----------------------------|
| **v1.5.28** (funcionava) | So `phoneNumbers` + `textMessage` |
| **v1.5.29–v1.5.37** | + `withDeliveryReport: true`, `ttl: 600`, `priority: 100` |
| **v1.5.38** | + `SAIR=SAIR` em **todos** os SMS, URL curta, throttle 4,5s |

Documento interno `ANALISE_SMS_DELIVERY_MILENA_2026-06-03.md` **pediu** os campos extras em 03/06 — isso coincidiu com mais falhas na fila Android.

## Correcao v1.5.39

- Payload **igual v1.5.28** (minimo).
- Textos portal/alerta/extra/extensao **iguais v1.5.28** (link `acompanhar.html`).
- Opt-out **so** em campanha/avulso retorno.
- Throttle **desligado** (0 ms) salvo `SMS_MIN_INTERVAL_MS` na Property.
- Mantido: `rowIndex`, consulta status, dedup, AUD_SMS.

## Deploy

1. Colar `.gs` com cabecalho **v1.5.39**
2. Nova versao Web `AKfycbwakQ...`
3. Ping → `versao:v1.5.39`
4. Teste um SMS

## v1.5.40 — deviceId Cloud

Script Property opcional: `SMS_GATEWAY_DEVICE_ID` = `nFxvrvSt_v5il_v_T1-ZW` (igual tela Cloud do app).

Teste API direta (04/06 18:31) com esse deviceId para **98981972432** ainda retornou `GENERIC_FAILURE` no **Samsung a04e** — falha no chip/aparelho para esse destino, nao credencial errada.

## Nao desfeito (correto manter)

- URL GAS `AKfycbwakQ...` (nao voltar `AKfycbzc`)
- `rowIndex: newRow`
- Frontend 1.7.11 (wizard, encerrar offline)
