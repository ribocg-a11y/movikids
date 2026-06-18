# FASE 15 — Gestão de Pessoas (produção)

**Atualizado:** 18/06/2026 · GAS **v1.5.98** · FE **v1.8.39**

## URLs

| Página | URL |
|--------|-----|
| **Produção** | https://ribocg-a11y.github.io/movikids/gestao-pessoas.html |
| Mockup | https://ribocg-a11y.github.io/movikids/ponto-mockup.html?v=3.6 |

## Abas planilha (7)

| Aba | Função |
|-----|--------|
| `COLABORADORES_RH` | Cadastro RH + salário/VA/meta |
| `FOLHA_PONTO` | Entrada/saída |
| `ESCALA_COLABORADORES` | Turnos por competência |
| `FALTAS_AUSENCIAS` | Faltas e descontos |
| `HOLERITES` | Snapshots mensais |
| `METAS_COLABORADORES` | Meta loc/dia + bônus |
| `BANCO_HORAS` | Saldo acumulado |

## Instalar abas

**Opção A — GAS (após Nova versão Web v1.5.98):**
```powershell
.\scripts\instalar-abas-gestao-pessoas-gas.ps1
```

**Opção B — OAuth planilha:**
```powershell
cd C:\Users\riboc\Projects\google-drive-sheets-auth
npm run auth
cd movikids-github
.\scripts\criar-abas-gestao-pessoas.ps1
```

**Opção C — Editor planilha:** colar `scripts/planilha/instalarAbasGestaoPessoas.gs` e rodar `instalarAbasGestaoPessoas()`.

## APIs GAS

| action | Uso |
|--------|-----|
| `gestaoPessoasStatus` | Verifica abas |
| `listarColaboradoresGestao` | Login colaborador |
| `buscarPainelColaborador` | Painel pessoal (PIN) |
| `registrarPontoColaborador` | Entrada/saída |
| `alertasPontoGestaoAdmin` | ADM alertas |
| `instalarAbasGestaoPessoasAdmin` | Criar abas (PIN 1416) |

## Deploy

1. `prepare-gas-push.ps1` → Editor GAS → **Nova versão Web**
2. `instalar-abas-gestao-pessoas-gas.ps1`
3. FE já em Pages: `gestao-pessoas.html?prod=1`
