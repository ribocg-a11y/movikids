# Troca SMS Gateway — Samsung → aparelho remoto (04/06/2026)

**Status:** concluida e validada (GAS Delivered em 98981972432).

## Producao (usar estas propriedades)

| Propriedade | Valor |
|-------------|--------|
| `SMS_GATEWAY_USER` | `DJVJRL` |
| `SMS_GATEWAY_PASS` | `t4bh_q2x1favfo` |
| `SMS_GATEWAY_DEVICE_ID` | `wihWegHr4wXaVJQ1R-GZR` |

Opcional: `SMS_GATEWAY_DEVICE_ID` = `auto` → GAS nao envia deviceId (API escolhe aparelho online em 12h).

## Retirado de producao (nao usar)

| Item | Valor antigo |
|------|----------------|
| Conta Cloud | `EJQQD0` |
| Senha | `jhc1n1tnt1qog3` |
| Device ID | `nFxvrvSt_v5il_v_T1-ZW` (Samsung a04e) |

## Links

- **Editor Apps Script:** https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit
- **Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping
- **App tablet:** https://ribocg-a11y.github.io/movikids/?force=1.7.11

## Aparelho remoto (checklist)

1. App SMS Gateway instalado (`app-release.apk` em https://github.com/capcom6/android-sms-gateway/releases/latest)
2. **Cloud server** ON, status **ONLINE**
3. Credenciais Cloud = tabela acima (nao confundir com **Local server** `sms` / senha local)
4. SIM com credito; permissoes SMS

## Device ID — atencao

A fonte do app pode mostrar `wlh...` (L) enquanto a API aceita `wih...`. Se aparecer `record not found`, use o valor que a API retorna no envio ou `auto`.

Teste 04/06: `wihWegHr4wXaVJQ1R-GZR` nas Properties + GAS v1.5.40 → **Delivered**.

## Codigo

- GAS canonico: `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` header **v1.5.41**
- Deploy: `clasp push` + **Nova versao** Web `AKfycbwakQ...` (nunca `clasp deploy`)

## Nao e SMS

- `MK_SESSAO_OPERADOR_ATIVA` = operador logado no balcao (pode apagar para liberar turno)
