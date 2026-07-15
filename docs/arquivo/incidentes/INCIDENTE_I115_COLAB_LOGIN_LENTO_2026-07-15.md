# INCIDENTE I115 — Login Colaboradores lento / trava (Raykelly)

**Data:** 15/07/2026  
**FE:** v1.9.58 · **GAS Web:** v1.5.195 ✅ · **GAS repo follow-up:** v1.5.196 (I116)  
**Severidade:** P1 operação — colaborador não entra no hub em tempo aceitável

---

## Sintoma

- Raykelly (e demais) demoram muito / travam ao entrar em **Colaboradores** (`gestao-pessoas.html`) após PIN.
- Sensação de sistema “voltou a ficar lento”.

## Evidência (prod, medição 15/07 — antes do slim)

| Action | Tempo |
|--------|------:|
| `ping` | ~2,4 s |
| `listarColaboradoresGestao` frio | ~10 s |
| `listarColaboradoresGestao` cache 60s | ~1,8 s |
| `buscarPainelColaboradorPreview` Raykelly | **~61 s** |
| mesma action Julia | ~27 s |

## Evidência pós Nova versão **v1.5.195** (15/07)

| Action | Tempo |
|--------|------:|
| Raykelly frio | **~16–29 s** (variação carga) |
| Raykelly warm | **~3,2–3,8 s** |
| Julia frio / warm | ~21–27 s / ~3,6–3,8 s |
| listar frio / warm | ~6 s / ~2 s |
| `TESTE_GESTAO_PESSOAS_READONLY` | **ok** (APIs RH) |

## Causa raiz (classe I48 / I68 / I74)

No login, um único request montava o painel com AUDITORIA ×N, **escritas** FALTAS/HOLERITES (I110 também Q1) e **2×** `gpLoadContext_`.

## Correção GAS v1.5.195 (§7.3 autorizado) — Web ✅

| Mudança | Detalhe |
|---------|---------|
| Enrich 1× | `gpEnrichContextAudit_` (op + parceiro FSS) antes de metas |
| Sem write no login | Remove `gpSyncFaltasFromJornada_` + `gpPersistHoleriteSnapshot_` do builder |
| 1× folha | `gpFolhaPontoFromCtx_` (não 2º `gpLoadContext_`) |
| Cache 90s | `gp_colab_pnl_v1_{opId}_{comp}` após PIN OK |
| Listar | Sync Julia só se RH ausente; cache listar 90s `gp_list_colab_v3` |
| Defer writes | Faltas/holerite snapshot na **saída de ponto** |

## Residual → I116

Enrich ainda expandia **todo RH** no nested loop · frio Colab incompleto · `kpiMes`/`painelGestaoPessoasAdmin` continuam lentos (app-wide).  
Ver `INCIDENTE_I116_ENRICH_RH_KPI_LENTIDAO_2026-07-15.md`.

## Mitigação FE (já em v1.9.57+)

Cache listar sessionStorage + mensagem “até 1 minuto” no PIN.

## Teste

```powershell
# Cronometrar preview Raykelly 2× (2ª = cache)
# action=buscarPainelColaboradorPreview&adminPin=1421&operadorId=3
.\scripts\testes\TESTE_GESTAO_PESSOAS_READONLY.ps1
```

Alvo pós-195: warm **&lt; 4 s**. Alvo pós-196 (I116): frio **&lt; 12 s**.

## MAPA

`MAPA_ERROS_FALHAS_BUGS.md` → **I115** · **I116**
