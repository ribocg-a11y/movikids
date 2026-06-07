# Testes e limpeza — MOVI KIDS

Scripts movidos da raiz em 07/06/2026 (onda 2 saneamento).

## Uso (a partir da raiz do repo)

```powershell
.\scripts\testes\TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1
.\scripts\testes\TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1
.\scripts\testes\TESTE_PORTAL_READONLY.ps1
.\scripts\testes\TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1
.\scripts\testes\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1
```

Pre-push (`.\scripts\pre-push-check.ps1`) chama paridade, portal e cronômetro automaticamente.

## Limpeza operacional

```powershell
.\scripts\testes\LIMPAR_TESTES_MOVIKIDS.ps1
.\scripts\testes\LIMPAR_SESSOES_TESTE_AGORA.ps1
```
