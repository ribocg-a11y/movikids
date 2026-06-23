# I48 — Admin Operadores lento de novo (escrita na leitura) — 23/06/2026

**Severidade:** P1 — gestão RH degradada  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I48**  
**Correção:** GAS **v1.5.142**  
**Relacionado:** I23 (dashboard mutex), I44 (banco na leitura), **I46** (introduziu regressão)

---

## Sintoma

- Aba **Operadores** / Gestão Pessoas admin demora para carregar (de novo).
- Sensação de app “pesado” após pacote I46 (faltas/holerite).

## Causa raiz

No pacote **I46**, `painelGestaoPessoasAdmin_` passou a chamar em **cada abertura** (cache miss):

1. `gpSyncFaltasFromJornada_` → **appendRow** em `FALTAS_AUSENCIAS`
2. `gpPersistHoleriteSnapshot_` → **setValue/appendRow** em `HOLERITES`

Isso repete o erro de **I44** (persistir em leitura), mas nas abas de faltas/holerite. Cada load admin = múltiplas escritas + leitura AUDITORIA (~2485 linhas) + jornada por colaborador.

## Correção v1.5.142

| Ação | Detalhe |
|------|---------|
| Admin folha | Só **cálculo em memória** (`gpFaltasDescontoMes_` + `gpCalcHollerite_`) |
| Escrita faltas/holerite | Mantida em `gpBuildPainelColaboradorPayload_` (login colaborador) |
| Cache painel | TTL **45s → 90s** (`gp_painel_adm_*`) |

## Teste

```powershell
.\scripts\testes\TESTE_GESTAO_PESSOAS_READONLY.ps1
# Medir: painelGestaoPessoasAdmin 2x seguidas — 2ª deve ser mais rápida (cache)
```

## Regra (não repetir)

**Nunca** `appendRow` / `setValue` dentro de `painelGestaoPessoasAdmin_` ou outras APIs de **leitura admin**.
