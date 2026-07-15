# INCIDENTE I116 — Enrich RH no login + lentidão residual do app

**Data:** 15/07/2026  
**FE:** v1.9.58 (sem bump) · **GAS repo:** v1.5.196 (Web até Nova versão)  
**Severidade:** P1 — login Colaboradores frio ainda pesado · Dashboard/`kpiMes` ~30s · admin GP ~45s

---

## Contexto

Após I115 (GAS **v1.5.195** Web ✅):

| Action | Antes I115 | Pós-195 (medição cloud) | Pós-195 (revalidação 15/07 ~19h) |
|--------|----------:|------------------------:|--------------------------------:|
| Raykelly painel frio | ~61 s | ~29 s | **~16 s** |
| Raykelly warm (cache 90s) | — | ~3,8 s | **~3,2 s** |
| Julia frio | ~27 s | ~22 s | **~27 s** |
| Julia warm | — | ~3,6 s | **~3,8 s** |
| listar frio / warm | ~10 / ~2 | ~5,9 / ~2,3 | **~6,3 / ~2,1** |
| `painelGestaoPessoasAdmin` | — | ~2–45 s* | **~45 s** frio |
| `kpiMes` lite | — | ~30 s | **~34 s** frio |
| `resumoDia` | — | — | **~11 s** |
| ping | — | — | **~3 s · v1.5.195** |

\* cache hit vs miss.

**Warm login Colaboradores:** resolvido (cache ScriptCache 90s).  
**Cold login:** melhorou vs 61s, mas **não era definitivo** — ainda O(AUD × todos RH).

---

## Causa residual (I115 incompleto)

Em `gpEnrichContextAudit_`, mesmo com `opsMini` (op + parceiro FSS), o código **sempre expandia** `ctx.rhRows` → todos os colaboradores RH entravam no nested loop AUD×ops.

Efeito: login de 1 pessoa pagava varredura como painel admin.

Secundário no builder: `gpEscalaColab_` / `gpBancoHoras_` reliam abas já no `ctx`.

---

## Correção GAS v1.5.196

| Mudança | Detalhe |
|---------|---------|
| `expandRh` | `gpEnrichContextAudit_(…, { expandRh: false })` no login painel |
| Admin | mantém `expandRh` default **true** (precisa de todos) |
| Escala/banco | leem de `ctx` quando passado |

**Não altera:** cronômetro P0 · `api()` GET · auth/PIN · holerite I108–I114.

---

## O que I115+I116 **não** resolvem sozinhos (lentidão app-wide)

| Hotspot | Tempo frio | Classe | Próximo passo |
|---------|----------:|--------|---------------|
| `kpiMes` lite | ~30–34 s | I23 / I73 | leitura full LOCAÇÕES; cache 90s ajuda só reentrada; precisa slim/aggregate ou tail por mês |
| `painelGestaoPessoasAdmin` | ~45 s frio | I48 / I74 | N× `gpAnaliseJornadaColab_` + enrich all ops; SWR FE já mitiga abertura |
| `resumoDia` | ~11 s | I23 | aceitável admin; não bloquear paralelo com kpiMes |
| `gpLoadContext_` AUD tail 4k | base de todo GP | — | limiar possível depois de medir linhas AUD reais |

**Conclusão honesta:** I115+I116 fecham a causa de **login Colaboradores** (writes + enrich excessivo + cache).  
A sensação de “app inteiro lento” no **Dashboard admin** continua ligada a **`kpiMes`** — registrar como backlog P1 separado (não regredir lite I73).

---

## Testes (15/07)

```powershell
.\scripts\testes\TESTE_GESTAO_PESSOAS_READONLY.ps1
# → ok_with_warnings (antes: gas.versao warn em 195 — regex ampliado)
```

Benchmark pós **Nova versão 196** (sócio):

```text
buscarPainelColaboradorPreview&operadorId=3  ×2 (frio/warm)
kpiMes&lite=1 ×2
painelGestaoPessoasAdmin ×2
```

Alvo Colaboradores: frio **&lt; 12 s** · warm **&lt; 4 s**.

---

## Sócio — publicar

1. Raw (linha 2 = **v1.5.196**):  
   https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  
2. Colar Editor → **Nova versão** (mesmo Deploy ID)  
3. Medir Raykelly/Julia frio+warm · ping = v1.5.196

## MAPA

`MAPA_ERROS_FALHAS_BUGS.md` → **I116** · atualiza **I115**
