# Incidente I39 — VA e salário sem proporcionalidade à admissão

**Data:** 22/06/2026 (identificado em operação Raykelly)  
**Severidade:** P1 financeiro/RH (valor exibido incorreto)  
**Camadas:** GAS `gpCalcHollerite_`, `gpDiasTrabalhadosNoMes_`, `parseDataStr_`, aba `COLABORADORES_RH`  
**Versão correção:** GAS repo **v1.5.129** · ⏳ **Nova versão Web pendente** (ping ainda v1.5.107)

---

## Sintoma

Raykelly admissão **15/06/2026**. Hub/holerite mostrava VA ~**R$ 399,90** (30 × R$ 13,33) em vez de valor proporcional aos **16 dias** do mês (~**R$ 213,33** para teto R$ 400/mês).

Cadastro planilha com admissão em formato **ISO** (`2026-06-15`) ou célula Date podia ser interpretado como **dia 15 = mês inteiro** ou parsing falho → `diasTrab = diasMes`.

---

## Causa raiz

1. `parseDataStr_` não aceitava `yyyy-MM-dd` de forma confiável.
2. Admissão inválida ou ambígua caía em fallback que tratava como **mês cheio** (perigoso).
3. `gpColabRhObjFromRow_` sempre seta `vaMensal: 400` — correto no teto, mas dias trabalhados errados inflavam `vaProp`.

---

## Correção (v1.5.129)

| Função | Mudança |
|--------|---------|
| `parseDataStr_` | Aceita `yyyy-MM-dd`, `dd/MM/yyyy`, `Date` |
| `gpNormAdmissaoStr_` | Canoniza para `dd/MM/yyyy` |
| `gpRepairAdmissaoRhCell_` | Repara célula ISO na leitura |
| `gpDiasTrabalhadosNoMes_` | Admissão inválida → **0 dias** (trava, nunca mês cheio) |
| `gpCalcHollerite_` | `fatorMes = diasTrab/diasMes` em salário e VA |
| `salvarCadastroColaborador_` | Valida/normaliza admissão ao salvar |
| Seed Raykelly | `15/06/2026` |

Teste: `scripts/testes/TESTE_VA_ADMISSAO_PROPORCIONAL_READONLY.ps1`

---

## Pendente operação

1. **Sócio:** Nova versão Web GAS **v1.5.129** no deploy `AKfycbwakQ...`
2. Raykelly completar cadastro RH (estava **25%** em 22/06)
3. Validar holerite 2ª quinzena jun/2026 no tablet após Web

---

## Relacionado

- Aba **FOLHA** memorial (B11/B12) — planejamento global; holerite colaborador usa `gpCalcHollerite_`, não fórmulas FOLHA linha a linha.
- **I38** — banner preview confundiu diagnóstico (VA errado aparecia junto com faixa ADM).
