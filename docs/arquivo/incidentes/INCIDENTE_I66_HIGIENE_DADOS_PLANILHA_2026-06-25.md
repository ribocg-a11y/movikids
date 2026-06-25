# I66 — Pacote higiene de dados planilha (25/06/2026)

## Executado

Script: `scripts/testes/HIGIENE_DADOS_PLANILHA.ps1`

| Passo | Resultado |
|-------|-----------|
| `limparLocacoesTesteAdmin` | 0 pendentes |
| `repararRhPlanilhaAdmin` | Banco **0h00** Milena/Raykelly; **17** faltas sync removidas |
| `restaurarPontoRaykellyJun2026Admin` | **6** batidas jun/2026 |
| RH cadastro | Milena + Raykelly **100%** |
| `repararLocacoesPlanilhaAdmin` + `limparTeste` | Ver log repair (histórico TESTE_*) |

## GAS v1.5.165 (repo)

- `repairBancoHorasAdmin` — dedup `operador_id` duplicado (Eduarda id 1)
- `guard.gas.ping.versao` no pre-push

## Rotina

```powershell
.\scripts\testes\HIGIENE_DADOS_PLANILHA.ps1
.\scripts\testes\BACKUP_RH_PLANILHA.ps1   # semanal
```

## Pendente opcional

- Arquivar aba `Analise` (legado)
- Nova versão Web **v1.5.165** para dedup banco em produção
