# I153 — Histórico “2 vs 5” + duplicata Arthur Carro 01 (08/09/2026)

## Sintoma

Operação: “só 2 locações hoje, por que o histórico mostra 4/5?”

## Veredito (servidor 08/09/2026)

| Métrica | Valor | Significado |
|---------|-------|-------------|
| `statsHoje.n` | **2** | Contas/telefones distintos (I42/I103) — **não** é “sessões” |
| `statsHoje.nSessoes` | **5** | Linhas **Encerrada** do dia |

Sessões reais do dia:

| id | Criança | Veículo | Horário | contaId | Nota |
|----|---------|---------|---------|---------|------|
| 3461 | Maria Campelo | Pelúcia 01 | 10:06–10:25 | 3461 | OK — conta própria |
| 3462 | Gabriel E Isa | Pelúcia 01 | 11:59–12:06 | 3462 | OK — multi-veículo |
| 3463 | Gabriel E Isa | Pelúcia 02 | 12:01–12:20 | 3462 | OK — 2º veículo mesma conta |
| 3464 | Arthur | Carro 01 | 12:14–12:24 | 3462 | OK — 3º veículo mesma conta |
| **3465** | Arthur | Carro 01 | **12:31–12:31** | 3462 | **DUPLICATA** — anular |

**Não é bug de contagem:** home “2” = contas; histórico lista cada veículo/sessão. Multi-veículo no mesmo telefone é intencional.

**Único erro de dados:** `#3465` — ▶ + Encerrar no mesmo minuto, depois de `#3464` já Encerrada no mesmo Carro 01.

## Por que `#3465` nasceu

1. Operador (re)lançou Arthur / Carro 01 após a sessão legítima `#3464` já estar **Encerrada**.
2. `veiculoJaAberto_` só bloqueia veículo **Ativa/Pendente** — **não** impede novo lançamento se o anterior já fechou.
3. Encerrar com **0 min** (12:31–12:31) ainda cobra o **plano cheio** (ex.: 10 min) e entra em `encHoje` / histórico / fatura.
4. Não havia trava de “encerrar &lt;90s” nem API admin para anular Encerrada indevida (só `corrigirFinanceiro` zera valor mas mantém Encerrada → `nSessoes` continua).

Família próxima: I143 (duplicata por retry) · I148 (fantasma encerrar) — aqui a linha **existe de verdade** na planilha.

## Correção

### Dados (após Nova versão Web GAS **v1.5.218**)

```powershell
.\scripts\testes\REPARAR_I153_ANULAR_3465.ps1
# ou:
# action=anularLocacaoEncerradaAdmin&adminPin=1421&id=3465
#   &motivo=Duplicata Arthur Carro01 12:31-12:31 I153
```

Efeito: status **Cancelada**, valores **0**, obs `[ANULADO ADM I153]…` → some de `encHoje` / caixa.

### Código

| Camada | Versão | Mudança |
|--------|--------|---------|
| GAS | **v1.5.218** | `anularLocacaoEncerradaAdmin` · `encerrarLocacao` **428** se &lt;90s sem `confirmarCurto` |
| FE | **v1.9.112** | drawer: confirm + retry com `confirmarCurto=1` (ou cancela) |
| Guards | `pre-push-check` | `guard.i153.*` |

## Deploy (sócio)

1. Colar raw: https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  
2. Implantar → **Editar** deploy `AKfycbwakQ…` → **Nova versão** (nunca Nova implantação).  
3. `ping` → **v1.5.218**  
4. Rodar `REPARAR_I153_ANULAR_3465.ps1`  
5. Tablet: `?force=1.9.112`

## Checklist pós-fix

- [ ] `ping.versao` = v1.5.218  
- [ ] `carregarInicio.statsHoje` → `nSessoes=4` (sem 3465 Encerrada)  
- [ ] Histórico admin sem fatura fantasma 12:31 Arthur  
- [ ] Encerrar &lt;90s no tablet pede confirmação / sugere Cancelar  

## Regra de ouro

Encerrar com **menos de 90s** do ▶ = suspeito de lançamento por engano → **Cancelar**, não Encerrar (salvo confirmação explícita).


## Evidência pós-fix (08/09/2026 13:35)

- ping Web **v1.5.218** ✅
- `anularLocacaoEncerradaAdmin` id=3465 → Cancelada R$0 ✅
- `encHoje` sem 3465; nSessoes=5 inclui nova sessão legítima #3468 Benício (não fantasma)
- `TESTE_I151_ENCERRAR_FANTASMA_READONLY` ok · `pre-push-check -SkipNetworkTests` ok
- Pages FE **v1.9.112** ✅
