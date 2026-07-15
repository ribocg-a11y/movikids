# INCIDENTE I115 — Login Colaboradores lento / trava (Raykelly)

**Data:** 15/07/2026  
**FE:** v1.9.58 · **GAS repo:** v1.5.195 (Web até Nova versão)  
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

## Causa raiz (classe I48 / I68 / I74)

No login, um único request montava o painel com AUDITORIA ×N, **escritas** FALTAS/HOLERITES (I110 também Q1) e **2×** `gpLoadContext_`.

## Correção GAS v1.5.195 (§7.3 autorizado)

| Mudança | Detalhe |
|---------|---------|
| Enrich 1× | `gpEnrichContextAudit_` (op + parceiro FSS) antes de metas |
| Sem write no login | Remove `gpSyncFaltasFromJornada_` + `gpPersistHoleriteSnapshot_` do builder |
| 1× folha | `gpFolhaPontoFromCtx_` (não 2º `gpLoadContext_`) |
| Cache 90s | `gp_colab_pnl_v1_{opId}_{comp}` após PIN OK |
| Listar | Sync Julia só se RH ausente; cache listar 90s `gp_list_colab_v3` |
| Defer writes | Faltas/holerite snapshot na **saída de ponto** |

## Mitigação FE (já em v1.9.57+)

Cache listar sessionStorage + mensagem “até 1 minuto” no PIN.

## Sócio — publicar

1. Raw (confira **linha 2 = v1.5.195**):  
   https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  
2. Colar Editor → **Nova versão** (mesmo Deploy ID)  
3. App: `?force=1.9.58` · medir login Raykelly  

## Teste

```powershell
# Cronometrar preview Raykelly 2× (2ª = cache)
# action=buscarPainelColaboradorPreview&adminPin=1421&operadorId=3
.\scripts\testes\TESTE_GESTAO_PESSOAS_READONLY.ps1
```

Alvo: frio **&lt; 15–20 s** · warm cache **&lt; 3 s**.

## MAPA

`MAPA_ERROS_FALHAS_BUGS.md` → **I115**
