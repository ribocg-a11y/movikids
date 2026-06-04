# Pacote SMS P0 unificado — v1.5.38 + v1.7.11

Data: 04/06/2026 — fecha o ponto SMS (nao reabrir).  
**Troca gateway:** `TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md` (Samsung EJQQD0 → DJVJRL remoto, Delivered validado).

## Pesquisa (SMS Gateway Cloud / sms-gate.app)

- `RESULT_ERROR_GENERIC_FAILURE` = falha no **celular gateway** (Android SmsManager), nao no GAS.
- Docs: https://docs.sms-gate.app/faq/errors/
- Causas comuns: SIM/sinal, dual-SIM sem slot padrao, fila Android, SMS longo (multipart), `withDeliveryReport: true` sobrecarregando fila.
- Workarounds API: `"withDeliveryReport": false`, `"simNumber": 1` ou `2`, intervalo entre envios, texto curto GSM (ate 160 chars).

## O que quebrou depois das mudancas de 04/06

| Fator | Impacto |
|-------|---------|
| `clasp deploy` + 404 | App offline; nao e SMS direto |
| rowIndex `10+id` | SMS na linha errada da planilha |
| Textos longos com URL `acompanhar.html` | Mais segmentos; mais falha no Android |
| `withDeliveryReport: true` fixo | Docs recomendam `false` se fila falha |
| Volume de testes no mesmo numero | Anti-spam / fila Android |

**Conclusao:** codigo + operacao do celular gateway; nao foi “SMS desligado” no Movi Kids.

## Entregas v1.5.38 (GAS)

Arquivo: `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

- Textos **curtos** por tipo: portal, alerta 5min, esgotado/extra, extensao, agradecimento.
- URL SMS curta: `https://ribocg-a11y.github.io/movikids/`
- GSM-safe (sem acento), opt-out `SAIR=SAIR`.
- `withDeliveryReport` default **false** (Property `SMS_WITH_DELIVERY_REPORT=true` para ligar).
- Throttle 4,5s entre envios (`SMS_MIN_INTERVAL_MS`).
- `SMS_SIM_NUMBER` = 1 ou 2 (dual-SIM).
- `rowIndex: newRow` em `salvarLocacao`.

## Entregas v1.7.11 (frontend)

- Recheck SMS: 15s, 60s, 180s, **300s**.
- Botoes Nova locacao claros; rowIndex do servidor.
- Falha SMS + WhatsApp fallback + detalhe erro no card.

## Fluxos cobertos (padrao unico)

| Tipo | Quando | Funcao |
|------|--------|--------|
| portal | Iniciar / boas-vindas | `waBoasVindas` → `enviarSmsResponsavel` portal |
| alerta | ~5 min restantes | `waAlertaTempo` → alerta |
| esgotado | Tempo esgotado + extra | `waTempoEsgotado` |
| extensao | Novo plano contratado | `waExtensao` |
| agradecimento | Pos-locacao | `waAgradecimento` |
| retorno/campanha | CRM | `enviarSmsCampanha` / avulso |

## Script Properties (opcional)

| Property | Valor | Efeito |
|----------|-------|--------|
| SMS_GATEWAY_USER / PASS | (ja existe) | Auth |
| SMS_WITH_DELIVERY_REPORT | false | Padrao v1.5.38 |
| SMS_SIM_NUMBER | 1 ou 2 | Dual-SIM |
| SMS_MIN_INTERVAL_MS | 4500 | Intervalo min entre SMS |

## Deploy (obrigatorio)

1. Colar `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` no Apps Script.
2. **Implantar → Gerenciar → Editar Web AKfycbwakQ... → Nova versao**.
3. Ping: `versao:v1.5.38`
4. `git push` frontend → tablet `?force=1.7.11`
5. No celular **SMS Gateway**: SIM com credito, app aberto, SIM padrao para SMS definida.

## Homologacao

1. Teste SMS curto no seu numero.
2. Nova locacao → Enviar SMS e iniciar.
3. Esperar alerta 5 min (ou simular).
4. Card: Entregue ou Falha + fallback.

## Voltar ao planejamento

Pacote SMS **fechado**. Proximo: **Pacote D** (drawer sessao) no `PLANO_MESTRE_REORGANIZADO_2026-06.md`.
