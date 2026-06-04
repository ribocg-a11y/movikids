# AUD_SMS — Melhorias v1.6.76 / GAS v1.5.32b

## Arquivos

- GAS: `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`
- Frontend: `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\index.html`
- Planilha: https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit (aba `AUD_SMS`)

## O que mudou

### P0 — Anti-duplicata (GAS)

| Tipo | Janela sem reenvio |
|------|-------------------|
| portal | 30 min / mesma locacao |
| alerta | 20 min |
| esgotado | 60 min |
| agradecimento | 12 h |
| extensao | 15 min |
| campanha | 24 h / mesmo telefone |

Resposta quando bloqueado: `{ duplicado: true, gatewayId: ... }` (nao gasta novo SMS).

### P0 — Portal duplo ao iniciar (frontend)

- **Enviar SMS e iniciar** no modal: envia portal e inicia **sem** segundo portal automatico.
- **Pular SMS e iniciar**: envia **um** portal automatico ao iniciar contagem.

### P0 — Flags entre dispositivos

`listarAtivas` envia `smsFlags` (portal/alerta/esgotado ja disparados). O merge local marca `alertFired5` / `alertFiredExp` / `extraWaSentAt` quando outro balcao ja enviou.

### P1 — Planilha mais limpa

`consultarSmsStatus` atualiza a coluna **Status** da linha de **envio** (`enviado` → `Delivered` / `Failed`) em vez de criar dezenas de linhas `tipo=status` iguais.

### P1 — Campanha

Nao reenvia campanha para telefone com **Failed** nos ultimos 7 dias.

### P1 — UX falha

Card mostra texto: confirme telefone ou QR do portal + botao WhatsApp fallback.

### P2 — Consultas

- Menos polls de status (15s, 60s, 180s).
- Ignora `gatewayId` invalido (evita linha #84 404).

## Deploy

1. Colar GAS completo e **nova versao** no mesmo deploy.
2. Publicar frontend `v1.6.76` no GitHub Pages.
3. Recarregar: https://ribocg-a11y.github.io/movikids/?force=1.6.76

## Leitura da aba AUD_SMS

- **Status = enviado**: aceito pelo gateway.
- **Status = Delivered / Failed / Sent**: ultima consulta de entrega (na mesma linha).
- Linhas antigas `tipo=status` permanecem no historico; novas consultas passam a atualizar a linha de envio.
