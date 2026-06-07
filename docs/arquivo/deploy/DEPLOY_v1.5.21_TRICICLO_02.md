# Deploy MOVI KIDS v1.5.21 - Triciclo 02

## Objetivo

Adicionar o segundo triciclo na validacao do backend sem alterar precos, fluxo operacional, planilha ou regras financeiras.

## Arquivo

Use:

`MOVIKIDS_Code_v1.5.21_TRICICLO_02.gs`

## O que mudou

- `VEICULOS_VALIDOS` agora aceita `Triciclo 02`.
- `ping`, `diagnosticoSistema`, `validarSchema` e `carregarInicio` reportam `v1.5.21`.
- Mantem todo o comportamento de `v1.5.19`: auditoria ampliada, status `Pendente/Ativa`, guard financeiro e sincronizacao existente.

## O que nao mudou

- Precos.
- Planos.
- Colunas da planilha.
- Deploy ID.
- Firebase.
- Regras de encerramento, edicao, cancelamento e extensao.

## Ordem segura

1. Colar o conteudo do arquivo no Apps Script.
2. Salvar.
3. Implantar nova versao no mesmo Deploy ID.
4. Testar `action=ping` e confirmar `v1.5.21`.
5. Fazer uma locacao curta de teste com `Triciclo 02`.
