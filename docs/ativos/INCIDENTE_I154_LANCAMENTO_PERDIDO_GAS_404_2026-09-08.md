# I154 — Lançamentos perdidos (Raykelly) + inconsistências 08/09/2026

## Sintoma

Raykelly fez **duas locações** e o sistema **não registrou**. Desde cedo: histórico vs home, cards, auditoria “vazia” hoje.

## Evidência (servidor 08/09 ~18:05)

| Check | Resultado |
|-------|-----------|
| `ping` | v1.5.218 |
| LOCACOES hoje | IDs 3461–3487 contínuos; **nenhuma linha órfã com nome/hora da Raykelly faltando** |
| Canceladas | `#3465` I153 · `#3478` Iae “Erro de cadastro” (operacional) |
| `listarAtivas` / `carregarInicio.ativos` | OK (chave FE = **`ativos`**, não `ativas`) |
| GAS Web | **HTML 404 intermitente** (“Sorry, unable to open the file at this time”) em `listarAtivas`/`carregarInicio` |
| `listarAuditoriaAdmin` | Só devolvia 31/08 e 31/07 — **sort string DD/MM** (`31/08` > `08/09`) |

## Por que as 2 locações não entraram

1. Tablet chamou `salvarLocacao` → Apps Script às vezes responde **HTML 404** (instabilidade Google), não JSON.
2. FE (`mk-api.js`) fazia `JSON.parse` fail → erro `Resposta invalida do GAS`.
3. Fila offline **só** aceitava `failed to fetch` / offline — **não** enfileirava HTML 404.
4. UI: toast de erro + remove otimista → **lançamento perdido** (sem linha na planilha).
5. Auditoria parecia “sem hoje” por bug de ordenação — dificultou o diagnóstico (meta Raykelly `n=0` também lê AUDITORIA).

Não foi “planilha sem ID”: **a gravação nunca chegou** na aba LOCAÇÕES.

## Correção

| Camada | Versão | Mudança |
|--------|--------|---------|
| GAS | **v1.5.219** | `listarAuditoriaAdmin`: cauda `lookback` + `auditTsSortKey_` (cronológico real) |
| FE | **v1.9.113** | HTML/404/5xx → `network-gas-unstable` → **fila offline** salvar/▶ |
| Guards | `guard.i154.*` | sort + gas-unstable |

## Deploy

1. Merge / Pages **1.9.113**
2. Colar raw **v1.5.219** → Nova versão Web  
   https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
3. Tablet `?force=1.9.113` · se fila offline cheia: Diagnóstico → sync

## Ops imediato

- Relançar as 2 locações da Raykelly no tablet (com FE novo, se GAS falhar entram na fila).
- Conferir chip/fila offline no header após salvar.

## Regra de ouro

Resposta GAS **não-JSON** / 404 HTML em escrita = **falha de rede** → enfileirar; **não** descartar o lançamento.
