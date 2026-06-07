# MOVI KIDS - Apps Script v1.5.20

## Objetivo

Criar uma camada segura de configuracao operacional, sem alterar ainda as regras criticas do caixa.

## Arquivo para publicar

`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\MOVIKIDS_Code_v1.5.20_CONFIG_OPERACIONAL_SAFE.gs`

## O que muda

Novas actions:

- `carregarOperacaoConfig`
- `diagnosticoConfigOperacional`

Essas actions leem a aba `CONFIG` e aceitam, futuramente, as chaves:

- `veiculos_validos_json`
- `precos_json`
- `formas_pagamento_json`
- `regras_operacionais_json`

## Segurança

Se a configuração estiver vazia, incompleta ou com JSON invalido, o sistema usa fallback hardcoded:

- `VEICULOS_VALIDOS`
- `PRECOS`
- formas de pagamento padrão
- regras padrão

Assim, erro na aba `CONFIG` não derruba a operação.

## O que não muda

- Não muda fluxo de cadastro.
- Não muda cálculo de preço.
- Não muda veículos válidos usados na gravação.
- Não muda frontend.
- Não muda WhatsApp.
- Não muda Firebase.
- Não muda planilha.

Esta versão apenas prepara a camada de configuração e diagnóstico. A troca real das regras para configuração dinâmica deve vir em versão posterior, após teste.

## Validacao local

`node --check gas_check_v1_5_20.js` executado com sucesso.
