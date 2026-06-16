# Testes e limpeza — MOVI KIDS

Scripts em `scripts/testes/`. Documentação: `docs/ativos/PROTOCOLO_DIAGNOSTICO_E_TESTES.md` · **"atualize tudo":** `PROTOCOLO_ATUALIZAR_TUDO.md`

**Repo:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` — scripts `.ps1` exigem `cd` nesta pasta **ou** caminho absoluto.

| **Protocolo mestre (varredura completa)** | **`TESTE_PROTOCOLO_MESTRE.ps1`** ou **`.\protocolo-mestre.ps1`** na raiz do repo |

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\protocolo-mestre.ps1
.\verify-gas-deploy.ps1
```

```powershell
# Orquestrador F0-F14 (subset)
.\scripts\testes\TESTE_PROTOCOLO_DIAGNOSTICO.ps1

# Sem rede (só pre-push + guards)
.\scripts\testes\TESTE_PROTOCOLO_DIAGNOSTICO.ps1 -SkipNetworkTests
```

## Somente leitura (não cria locações)

Use quando a loja está operando ou não quer poluir a planilha:

```powershell
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1
.\scripts\testes\TESTE_PORTAL_READONLY.ps1
.\scripts\testes\TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1
.\scripts\testes\TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1
.\scripts\testes\TESTE_OPERACAO_CONFIG_READONLY.ps1
.\scripts\testes\TESTE_RESUMO_DIA_READONLY.ps1
.\scripts\testes\TESTE_KPI_MES_READONLY.ps1
.\scripts\testes\TESTE_FOLHA_FORMULAS_READONLY.ps1
.\scripts\testes\TESTE_FASE9_FOLHA_READONLY.ps1
.\scripts\testes\TESTE_SESSAO_IDLE_READONLY.ps1
.\scripts\testes\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1
# sem -RunWriteTests
```

Validação estática (repo):

```powershell
Get-ChildItem mk-*.js | ForEach-Object { node --check $_.FullName }
```

## Gravam dados de teste (exigem cleanup)

| Script | O que grava |
|--------|-------------|
| `TESTE_I20_COMPLETO_PROD.ps1` | Locações `TESTE I20`, `B2_*`, etc. |
| `TESTE_4_FLUXOS_CADASTRO_I20.ps1` | Locações cadastro I20 |
| `TESTE_DRAWER_E_PACOTE_E.ps1` | Locações `DRAWER_E_*` |
| `TESTE_PACOTE_F_KPI_READONLY.ps1` | Salvar/editar/cancelar `TESTE_PACOTE_F` (nome enganoso) |
| `TESTE_B7_REGRESSAO_WRITE.ps1` | B7 FASE 5: iniciar/estender/encerrar + cleanup |

Limpeza após testes de escrita:

```powershell
.\scripts\testes\LIMPAR_TESTES_MOVIKIDS.ps1
.\scripts\testes\LIMPAR_SESSOES_TESTE_AGORA.ps1
```

## Regra PowerShell (scripts `.ps1`)

**Não usar em-dash Unicode `—` em strings** que ficam perto de `-f` ou operadores — o parser quebra (`ParserError`). Usar hífen ASCII `-` em mensagens de `Add-Check` / `throw`.

Corrigido em 07/06/2026: `TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1`.  
Corrigido em 08/06/2026: `TESTE_I20_COMPLETO_PROD.ps1` (mesmo bug T1).

## Homologação tablet (F5/F7/F10/F11)

```powershell
# GAS + API (F5, F7, F11)
.\scripts\testes\TESTE_TABLET_F5_F7_F10_F11.ps1
.\scripts\testes\TESTE_ALERTAS_TABLET.ps1 -GasOnly   # GAS + instrucao browser
.\scripts\testes\RUN_ALERTAS_TABLET_BROWSER.ps1        # Playwright: triggerAlert5 / triggerAlertExpired

# Browser CDP (modais F7, reload F10)
.\scripts\testes\RUN_TABLET_BROWSER_TEST.ps1
```

Resultado 08/06: F5/F7/F10 reload/F11 **OK**; F10 com **2 abas PWA** no tablet físico ainda manual (`CHECKLIST_TABLET_v1.7.85.md` §D).

## Pre-push

`.\scripts\pre-push-check.ps1` chama paridade HTTP, portal e cronômetro quando rede disponível.
