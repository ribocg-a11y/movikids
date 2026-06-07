# ADM encerra sem SMS obrigatório (v1.7.5)

## Problema

Com tempo esgotado, o app exigia enviar SMS de cobrança de extra antes de encerrar. Em falha de rede/GAS (ex. incidente 04/06), o administrador ficava bloqueado.

## Correção

- **Operador:** continua obrigatório enviar SMS de extra antes de encerrar (quando tempo esgotou).
- **Administrador** (login PIN 1416 ou sessão `role: admin` / `window.isAdmin`):
  - Pode fechar o alerta sem SMS.
  - Pode abrir **Encerrar** direto no card/modal.
  - Botão **Encerrar sem SMS (ADM)** no alerta de tempo esgotado.
  - SMS de extra fica **opcional** (se falhar, aviso e ainda pode encerrar).

Auditoria GAS (opcional, após `clasp push` + Nova versão): encerramentos ADM gravam `; ADM sem SMS obrigatorio` quando `ignorarSmsObrigatorio=true`.

## Publicar

1. `git push` → GitHub Pages (frontend **1.7.5**).
2. Tablets: `https://ribocg-a11y.github.io/movikids/?force=1.7.5`
3. GAS (só auditoria): `.\scripts\deploy-gas.ps1` + Nova versão na Web `AKfycbwakQ...` — **sem** `clasp deploy`.
