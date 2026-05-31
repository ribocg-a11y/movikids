# MOVI KIDS - Status operacional v1.5.18 / v1.6.48

Data: 31/05/2026

## Publicado

- Apps Script: `v1.5.18`
- Frontend GitHub Pages: `v1.6.48`
- Service Worker: `v1.6.48`

## Correcao principal

O sistema agora separa corretamente:

- `Pendente`: locacao cadastrada, aguardando inicio da contagem.
- `Ativa`: locacao com cronometro iniciado.
- `Encerrada`: locacao finalizada.
- `Cancelada`: locacao cancelada com motivo/auditoria.

## Validacao executada

Teste de regressao controlado em producao:

- `ping`: ok, retornou `v1.5.18`.
- `carregarInicio`: ok.
- `listarAtivas`: ok.
- Criacao de locacao de teste: ok, nasceu `Pendente`.
- `startTimestamp`: ok, nasceu `0`.
- Edicao antes de iniciar: ok.
- Cancelamento operacional: ok.
- Limpeza final: ok, nenhuma locacao de teste ficou ativa/pendente.

## Resultado

O cronometro nao inicia sozinho apos cadastro. Ele so inicia apos o operador clicar em iniciar contagem.

## Arquivo de teste

Script:

`TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1`

Modo leitura:

```powershell
powershell -ExecutionPolicy Bypass -File .\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1
```

Modo completo com criacao/edicao/cancelamento de teste:

```powershell
powershell -ExecutionPolicy Bypass -File .\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1 -RunWriteTests
```
