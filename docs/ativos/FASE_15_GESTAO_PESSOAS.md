# FASE 15 — Gestão de Pessoas (produção)

**Atualizado:** 20/06/2026 · GAS repo **v1.5.111** (ping **v1.5.107**) · FE **v1.8.71** · Design System v1.0

## URLs

| Página | URL |
|--------|-----|
| **Produção colaboradores** | https://ribocg-a11y.github.io/movikids/gestao-pessoas.html?force=1.8.71 |
| Hub tablet → Colaboradores | `index.html` `#mk-hub-colab` |
| Mockup (só protótipo) | https://ribocg-a11y.github.io/movikids/ponto-mockup.html?v=3.6 |

**Auth colaboradores:** cópia literal `#mk-auth-gate` → `#gp-auth-gate` (I29 · Design System §6.1)

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

**Após Nova versão Web GAS v1.5.111+** (inclui I30 getRange + Carro 04 fallback):
```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\instalar-abas-gestao-pessoas-gas.ps1
```

## APIs GAS

| action | Uso |
|--------|-----|
| `gestaoPessoasStatus` | Verifica abas |
| `listarColaboradoresGestao` | Login colaborador |
| `buscarPainelColaborador` | Painel pessoal (PIN) |
| `registrarPontoColaborador` | Entrada/saída |
| `alertasPontoGestaoAdmin` | ADM alertas |
| `instalarAbasGestaoPessoasAdmin` | Criar abas (PIN 1416) |

## Deploy checklist

1. GAS **v1.5.111** → Nova versão Web (`AKfycbwakQ...`)
2. `instalar-abas-gestao-pessoas-gas.ps1`
3. FE **v1.8.71** Pages (auth DNA + holerite `mk-holerite.js`)
4. Homolog: dropdown + 4 PIN + hub 5 portas
5. Tablet balcão: regressão F5/F7/F10/F11
6. Readonly RH: `TESTE_GESTAO_PESSOAS_READONLY.ps1`

## Incidentes

- **I29** — UI fora DNA → v1.8.49 + `DESIGN_SYSTEM_MOVIKIDS.md`
- **I30** — abas parciais → v1.5.99 getRange fix
- **I31–I34** — CONFIG Pelúcia, loc duplicada, PWA boot, holerite — ver `MAPA_ERROS_FALHAS_BUGS.md`
