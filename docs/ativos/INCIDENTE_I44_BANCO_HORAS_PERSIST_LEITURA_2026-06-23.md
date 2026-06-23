# I44 — Banco de horas corrompido + dashboard “dados errados”

**Registrado:** 23/06/2026  
**Status:** fix repo GAS **v1.5.137** · repair `repairBancoHorasAdmin` · FE label **v1.8.115**  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` I44

## Sintoma

Centro de comando mostrava dados “impossíveis”:
- Equipe presente **0** com Milena logada na sidebar
- Banco de horas **-544h** / **-884h** (crescendo)
- Ponto pendente para quem aparece no balcão
- Faturamento **R$ 15** (parecia baixo)

## Causa raiz (banco horas — bug de código)

**v1.5.134** (`gpPersistBancoFromJornada_`) gravava na aba **BANCO_HORAS** a cada **leitura** do painel RH admin/colaborador:

`bancoProjetado = saldo_planilha + saldo_mes_jornada`

Na próxima abertura, o saldo já gravado era **somado de novo** → corrupção exponencial (-544h → -884h).

## Outros KPIs — não são bug de planilha “desatualizada”

| Widget / alerta | Fonte real | Por que parecia errado |
|-----------------|------------|------------------------|
| **Ponto RH hoje** (ex. Equipe presente) | Aba **FOLHA_PONTO** (entrada sem saída hoje) | Login balcão ≠ ponto RH |
| **Sidebar “Entrou 11:17”** | **Script Properties** sessão operador (GAS) + local admin | Outro sistema |
| **Sem operador logado** | `getSessaoOperadorAtiva_()` no momento do `comandoOperacional` | Sessão expira 1h idle; pode divergir da sidebar até refresh |
| **Ponto pendente** | **FOLHA_PONTO** vazia + escala do dia | Correto se não bater ponto em Colaboradores |
| **Faturamento hoje** | **LOCAÇÕES** encerradas hoje (`calcResumoDiaCore_`) | API confirmou **R$ 15 · 1 loc** — planilha OK |
| **Banco de horas alerta** | Aba **BANCO_HORAS** col `saldo_hhmm` | Corrompida pelo persist-on-read |

## Fix

1. **GAS v1.5.137:** remover persist em leitura; persistir só na **saída de ponto**
2. **`repairBancoHorasAdmin`:** zera aba BANCO_HORAS (admin PIN)
3. **FE v1.8.115:** label “Ponto RH hoje” + ctx balcão no comando operacional
4. **Manual imediato (antes do deploy GAS):** planilha → aba `BANCO_HORAS` → col `saldo_hhmm` = `0h00` ops 2 e 3

## Repair pós-deploy

```
GET .../exec?action=repairBancoHorasAdmin&adminPin=1416
```
