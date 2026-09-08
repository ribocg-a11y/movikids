# I155 — Causa raiz dos 404/timeouts em `listarAtivas` / `carregarInicio`

## Sintoma

Bateria pós-I154 (08/09): `listarAtivas` ~**37% HTML 404**; latências 6–44s; ping ok na maioria. FE **v1.9.114** (retry + timeout 45s) mitiga no cliente, mas a carga no Apps Script continua.

## Causa raiz

Cada sync operacional lia a aba **LOCAÇÕES inteira** (~3397 × 28 células ≈ **95k** valores) em:

- `listarAtivas_`
- `carregarInicio_`

Sob concorrência (tablet + admin + retries): quota / “unable to open the file” / timeout → FE via HTML 404.

Ativa/Pendente e Encerradas do dia ficam no **fim** da planilha (append). Ler o histórico antigo a cada poll é desnecessário.

## Correção (GAS **v1.5.220**)

| Peça | O quê |
|------|--------|
| `locSheetTail_(sheet, lookback, forceFull)` | Lê só a cauda (`COL_LOC_LOOKBACK_=600`) |
| `listarAtivas_` | Tail + cache ScriptCache **8s** (`listar_ativas_v2`) · AUD_SMS cauda 400 |
| `carregarInicio_` | Mesmo lookback LOCAÇÕES · CUSTOS cauda `COL_CUS_LOOKBACK_=200` |
| `invalidateInicioResumoCache_` | Também remove cache de ativas (escritas) |
| `forceFull=1` | Escape hatch diagnóstico / scan completo |

Payload inclui `lookback` / `forceFull` / `locLastRow` para validar.

**I43 preservado:** `getRange` continua com `COL_LOC_READ_=28` (cols Y/Z).

## O que NÃO é

- Não substitui I154 (fila offline em 404) nem I154b (retry FE).
- Não muda FE versão — só GAS.

## Deploy

1. Merge / push `main` com header **v1.5.220**
2. Sócio: colar raw → Editor → **Editar** implantacão `AKfycbwakQ…` → **Nova versão**  
   https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
3. `ping` → **v1.5.220**
4. `listarAtivas` → `lookback: 600` · latência bem menor · 404 rarefeito
5. Paridade: `carregarInicio.ativos` ≡ `listarAtivas.locacoes`

## Guards

`guard.i155.locSheetTail` · `lookback` · `cache.ativas` · `invalidate` · `inicio.tail`

## Regra

Sync operacional = **cauda**, não planilha inteira. Full scan só com `forceFull=1` ou relatórios/admin que já têm lookback próprio.
