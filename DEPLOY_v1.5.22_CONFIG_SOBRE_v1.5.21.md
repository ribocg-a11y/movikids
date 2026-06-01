# Deploy MOVI KIDS v1.5.22 - Configuracao diagnostica

## Objetivo

Adicionar uma camada segura de leitura e diagnostico de configuracao operacional, baseada na producao `v1.5.21`.

## Arquivo

Use:

`MOVIKIDS_Code_v1.5.22_CONFIG_SOBRE_v1.5.21.gs`

## O que mudou

- Adiciona action `carregarOperacaoConfig`.
- Adiciona action `diagnosticoConfigOperacional`.
- Le chaves opcionais da aba `CONFIG`:
  - `veiculos_validos_json`
  - `precos_json`
  - `formas_pagamento_json`
  - `regras_operacionais_json`
- Usa fallback hardcoded se a configuracao estiver vazia ou invalida.

## O que nao mudou

- Nao muda a origem real dos precos.
- Nao muda a origem real dos veiculos.
- Nao muda mensagens de WhatsApp.
- Nao muda fluxo de locacao.
- Nao muda timer.
- Nao muda Firebase.
- Nao muda colunas da planilha.

## Por que e seguro

Esta versao apenas le e diagnostica configuracao. A operacao continua usando as constantes atuais (`VEICULOS_VALIDOS`, `PRECOS`, `MSG_DEFAULTS`) como antes.

## Testes depois de reimplantar

1. `action=ping` deve retornar `v1.5.22`.
2. `action=validarSchema` deve retornar `schemaOk=true`.
3. `action=diagnosticoSistema` deve responder sem erro.
4. `action=carregarOperacaoConfig` deve responder com `config`.
5. `action=diagnosticoConfigOperacional` deve responder com `resumo`.

## Proxima etapa apos validar

Criar uma tela/admin ou rotina de preenchimento controlado da aba `CONFIG`; somente depois migrar frota/precos/mensagens para usar essa configuracao.
