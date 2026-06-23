# FASE 15 — Gestão de Pessoas (produção)

**Atualizado:** 22/06/2026 · GAS **v1.5.129** Web pendente · FE **v1.8.110** · **auditoria RH** 22/06

## URLs

| Página | URL |
|--------|-----|
| **Produção colaboradores** | https://ribocg-a11y.github.io/movikids/gestao-pessoas.html?force=1.8.110 |
| Hub tablet → Colaboradores | `index.html` `#mk-hub-colab` |
| Mockup (só protótipo) | https://ribocg-a11y.github.io/movikids/ponto-mockup.html?v=3.6 |

**Auth colaboradores:** cópia literal `#mk-auth-gate` → `#gp-auth-gate` (I29 · Design System §6.1)

## Abas planilha (9 GP + memorial)

| Aba | Grava runtime? | Função |
|-----|----------------|--------|
| `COLABORADORES_RH` | **Sim** (cadastro) | Cadastro RH + salário/VA/meta (seed) |
| `FOLHA_PONTO` | **Sim** | Entrada/saída |
| `ESCALA_COLABORADORES` | Parcial (seed) | Turnos por competência |
| `COMUNICADOS_RH` | **Sim** (admin) | Comunicados |
| `AVALIACOES_RH` | **Sim** (admin) | Avaliações |
| `FALTAS_AUSENCIAS` | **Não** | Schema vazio — backlog |
| `HOLERITES` | **Não** | Schema vazio — holerite só API |
| `METAS_COLABORADORES` | **Não** (seed) | Metas vivas = AUDITORIA |
| `BANCO_HORAS` | **Não** (seed) | Saldo não atualizado |

**Matriz completa:** `AUDITORIA_RH_FOLHA_PERSISTENCIA_2026-06-22.md`

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

1. GAS **v1.5.111** → Nova versão Web (`AKfycbwakQ...`) ✅ **165** (20/06)
2. `instalar-abas-gestao-pessoas-gas.ps1` ✅
3. FE **v1.8.71** Pages (auth DNA + holerite `mk-holerite.js`) ✅
4. Homolog: dropdown + 4 PIN + hub 5 portas ✅
5. Tablet balcão: regressão F5/F7/F10/F11 + 1 loc pós-I32 ✅ **20/06 loja**
6. Holerite Raykelly PDF + CNPJ admin/colaborador ✅ **20/06 loja**
7. Readonly RH: `TESTE_GESTAO_PESSOAS_READONLY.ps1` ✅

## Incidentes

- **I38** — banner preview com PIN colab → v1.8.110
- **I39** — VA proporcional admissão → v1.5.129
- **I40** — hub benefícios vs holerite GAS
- **I31–I37** — ver `MAPA_ERROS_FALHAS_BUGS.md`
