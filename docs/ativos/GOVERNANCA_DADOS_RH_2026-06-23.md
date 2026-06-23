# Governança de dados RH — MOVI KIDS

**Data:** 23/06/2026 · **Pacote:** I46 (FE v1.8.117 · GAS v1.5.140)

## Regra de ouro

| Dado | Aba canônica | Quem grava | API |
|------|--------------|------------|-----|
| Cadastro (CPF, PIX…) | `COLABORADORES_RH` | Colaboradora + PIN **ou** admin Ficha | `salvarCadastroColaborador` / `salvarCadastroRhAdmin` |
| Ponto RH | `FOLHA_PONTO` | Colaboradora + PIN | `registrarPontoColaborador` |
| Salário, meta, turno | `COLABORADORES_RH` cols 12–16 | Admin Ficha | `salvarDadosContratuaisRhAdmin` |
| Holerite calculado | memória + snapshot `HOLERITES` | GAS (2ª quinzena) | `gpPersistHoleriteSnapshot_` |
| Faltas | `FALTAS_AUSENCIAS` | Sync jornada | `gpSyncFaltasFromJornada_` |
| Login balcão | Script Properties | Operador tablet | **não** é ponto RH |

## O que NÃO fazer

- `instalarAbasGestaoPessoasAdmin&forceReset=sim` com dados reais
- Confiar em “salvar” no admin jornada (somente leitura)
- `clasp deploy` sem acesso anônimo no Web App (I27)

## Rotina semanal (agente)

```powershell
.\scripts\testes\BACKUP_RH_PLANILHA.ps1
.\scripts\testes\TESTE_AUDITORIA_PLANILHA_COMPLETA_READONLY.ps1
.\scripts\testes\REPARAR_RH_PLANILHA_ADMIN.ps1
```

## Recuperação Raykelly (dados perdidos I45)

1. Google Sheets → aba `COLABORADORES_RH` → **Histórico de versões** (~20/06/2026)
2. Ou admin → Operadores → Ficha → **Restaurar cadastro RH** (formulário v1.8.117)
3. Ponto: colaboradora bate em `gestao-pessoas.html` → Meu ponto

## Referências

- `docs/referencia/MAPA_PLANILHA_ABAS_MOVIKIDS.md`
- `docs/ativos/AUDITORIA_RH_FOLHA_PERSISTENCIA_2026-06-22.md`
- `docs/ativos/INCIDENTE_I45_CADASTRO_RH_NAO_PERSISTIDO_2026-06-23.md`
