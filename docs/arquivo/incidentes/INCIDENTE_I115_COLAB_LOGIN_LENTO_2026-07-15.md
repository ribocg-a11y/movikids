# INCIDENTE I115 — Login Colaboradores lento / trava (Raykelly)

**Data:** 15/07/2026  
**FE:** v1.9.57 (mitigação UI/cache) · **GAS prod:** v1.5.194 (ainda pesado)  
**Severidade:** P1 operação — colaborador não entra no hub em tempo aceitável

---

## Sintoma

- Raykelly (e demais) demoram muito / travam ao entrar em **Colaboradores** (`gestao-pessoas.html`) após PIN.
- Sensação de sistema “voltou a ficar lento”.

## Evidência (prod, medição 15/07)

| Action | Tempo |
|--------|------:|
| `ping` | ~2,4 s |
| `listarColaboradoresGestao` frio | ~10 s |
| `listarColaboradoresGestao` cache 60s | ~1,8 s |
| `buscarPainelColaboradorPreview` Raykelly | **~61 s** |
| mesma action Julia | ~27 s |

PIN do colaborador usa o **mesmo** builder: `gpBuildPainelColaboradorPayload_`.

## Causa raiz (classe I48 / I68 / I74)

No login, um único request monta o painel completo com:

1. `gpLoadContext_` (AUDITORIA até 4k) **+**
2. `gpMetasPainel_` → muitas vezes varredura **inteira** da AUDITORIA (+ parceira I109) **+**
3. jornada mês **+**
4. **escrita** `gpSyncFaltasFromJornada_` **+**
5. **escrita** `gpPersistHoleriteSnapshot_` (pior após **I110** — também na 1ª quinzena) **+**
6. histórico 6 meses **+**
7. `gpFolhaPontoColab_` → **segundo** `gpLoadContext_()`

Regressão recente: commits holerite **I108–I112** no caminho de login (cálculo + snapshot Q1).

Histórico: I23, I48, I68 (~23s), I74 (fila GAS), I77 (admin quick+bg), I86 (duplicata sync).

## Mitigação FE (sem tocar baseline P0 / sem Nova versão Web)

- Cache `sessionStorage` 120s em `listarColaboradores` (dropdown instantâneo na reentrada).
- Mensagem clara no PIN: “Montando painel… até 1 minuto”.
- Toast com tempo se >8s.

## Correção GAS (precisa §7.3 — sócio autorizar + colar)

Espelhar **I48** no *colaborador*:

1. Reutilizar **um** `gpLoadContext_` (folha sem 2º load).
2. Enrich audit **uma** vez; não varrer planilha inteira se ctx já tem `metaByDay`.
3. **Não** escrever FALTAS/HOLERITES no login — só em fluxo de ponto / job / abrir holerite explícito (ou defer).
4. Adiar `historicoDesempenho` (lazy).
5. Cache curto ScriptCache do painel pós-PIN (ex. 60–120s).

**Não mexer:** cronômetro I20/I43 · `api()` GET I15 · auth/PIN UI · `mk-sync` / baseline P0.

## Teste

```powershell
# Cronometrar A→B frio/quente; sem Dashboard aberto em paralelo (I74)
# listarColaboradoresGestao
# buscarPainelColaborador&operadorId=3&pin=****
.\scripts\testes\TESTE_GESTAO_PESSOAS_READONLY.ps1
```

Alvo pós-GAS: login PIN **&lt; 8–12 s** warm; listar **&lt; 3 s** warm.

## MAPA

`MAPA_ERROS_FALHAS_BUGS.md` → **I115**
