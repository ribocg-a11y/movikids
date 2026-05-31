# MOVI KIDS - Apps Script v1.5.19

## Objetivo

Ampliar auditoria operacional sem alterar regras financeiras nem fluxo visual.

## Arquivo para publicar

`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\MOVIKIDS_Code_v1.5.19_AUDITORIA_AMPLIADA.gs`

## O que muda

Passam a registrar antes/depois na aba `AUDITORIA`:

- `salvarLocacao`
- `iniciarTimer`
- `encerrarLocacao`
- `estenderLocacao`
- `editarLocacao` ja existia
- `cancelarLocacao` ja existia

## O que nao muda

- Nao muda `SHEET_ID`.
- Nao muda `DEPLOY_ID`.
- Nao muda precos.
- Nao muda mensagens WhatsApp.
- Nao muda frontend.
- Nao muda Service Worker.
- Nao altera contagem de tempo.
- Nao altera calculo financeiro.

## Ordem segura

1. Substituir somente `Codigo.gs` pelo conteudo da v1.5.19.
2. Salvar.
3. Implantar nova versao no mesmo Deploy ID.
4. Testar `ping`; deve retornar `v1.5.19`.
5. Rodar teste somente leitura:

```powershell
powershell -ExecutionPolicy Bypass -File .\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1
```

6. Se quiser validar escrita controlada:

```powershell
powershell -ExecutionPolicy Bypass -File .\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1 -RunWriteTests
```

## Validacao local

`node --check gas_check_v1_5_19.js` executado com sucesso.
