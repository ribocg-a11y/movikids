# INCIDENTE 05/06/2026 — Lançamento quebrado (POST no browser)

> **ALERTA P0 — NÃO REPETIR**  
> **Nunca** usar `fetch` **POST JSON** para a Web App do GAS no **tablet/navegador**.  
> Escritas críticas no frontend (`salvarLocacao`, `editarLocacao`, `cancelarLocacao`, `encerrarLocacao`, `estenderLocacao`) = **sempre GET** com query string.  
> `postWriteActions` no `ping` **não autoriza** POST no FE.  
> Testes PowerShell POST **não provam** o tablet — rodar `TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1`.

---

## Resumo executivo

| O quê | Efeito no balcão |
|-------|------------------|
| Pacote E (FE **v1.7.26**–**v1.7.33**) ativou POST quando `ping.postWriteActions` existe | Botões **Nova locação** falham: *"Erro de conexão."* |
| GAS Web App responde **HTTP 302** em POST; `fetch` no browser falha (CORS / corpo perdido) | Lançamento, editar, cancelar, encerrar, estender — todos afetados |
| Testes `TESTE_REGRESSAO` / `TESTE_DRAWER_E` usam **Invoke-RestMethod POST** | Passavam **verde** enquanto o tablet estava **vermelho** |
| Tablets com `?force=1.7.31` em cache | Continuaram na versão quebrada mesmo com fix em **v1.7.34** no servidor |

**Severidade:** P0 — operação parada para novos lançamentos.  
**Correção:** FE **v1.7.34** (GET no browser) + **v1.7.35** (anti-stale cache).  
**Documento de regras:** `REGRAS_DE_PUBLICACAO_SEGURA.md` — **Regra 6**.

---

## Linha do tempo

| Horário (aprox.) | Evento |
|------------------|--------|
| Commit `e1a56db` | Pacote E: FE v1.7.26 passa a usar POST condicional em `api()` |
| GAS v1.5.44+ | `ping` retorna `postWriteActions` → FE escolhe POST |
| 05/06 operação | Tablets em cache ou com `?force=1.7.31`; usuário reporta lançamento quebrado |
| Investigação | `fetch` POST → `Failed to fetch`; GET → OK; PowerShell POST → OK (falso positivo) |
| `eb6770a` | Fix v1.7.34: remove POST do browser |
| `64b2a66` | Fix v1.7.35: anti-stale sync busca `mk-version.js` remoto |
| `53116b2` | Regra 6 + `TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` |
| Limpeza | 7 sessões de teste canceladas (`LIMPAR_SESSOES_TESTE_AGORA.ps1`) |

---

## Causa raiz (técnica)

```
Tablet:  fetch(POST + JSON) → GAS → 302 redirect → Failed to fetch
Script:  Invoke-RestMethod POST → GAS → JSON ok:true  (cliente HTTP diferente)
Tablet:  fetch(GET + query)  → GAS → JSON ok:true     (correto)
```

O Pacote E assumiu que backend pronto para POST (`doPost` + `postWriteActions`) implicava frontend seguro com POST. **Falso** para Web Apps publicadas em `script.google.com/macros/s/.../exec` acessadas via browser.

---

## Sintomas que o operador vê

- Toast **"Erro de conexão."** ao clicar **Enviar SMS e iniciar** ou **Só salvar cadastro**
- Rodapé **Online v1.7.26** – **v1.7.33** (versões afetadas)
- Home pode acumular cards **pendentes de teste** (telefones `9899999…`) se alguém testou durante o incidente

---

## Correção aplicada

| Versão | Mudança |
|--------|---------|
| **v1.7.34** | `api()` usa **somente GET** para as 5 escritas críticas; `mkRequireOperadorEscrita_()` |
| **v1.7.35** | Bloco **anti-stale** no topo do `index.html` (XHR sync em `mk-version.js` remoto) |
| Docs | Regra 6, incidente I15, teste de paridade HTTP |
| GAS (local) | `isLocacaoTeste_` ampliado (`9899999*`, `Teste*`) — publicar Nova versão quando conveniente |

**URL operação:** https://ribocg-a11y.github.io/movikids/?force=1.7.35

---

## Validação obrigatória (antes de declarar “ok”)

1. `.\TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` → status ok  
2. `.\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1 -RunWriteTests` → ok (não substitui item 3)  
3. **Tablet real:** login operador → Nova locação → **Só salvar** → card pendente na Home  
4. Rodapé: **Online v1.7.35** (não v1.7.31–v1.7.33)

---

## O que NÃO fazer de novo

| Proibido | Motivo |
|----------|--------|
| Reativar POST em `api()` no browser | Quebra lançamento no tablet |
| Considerar teste PowerShell POST como prova de tablet | Falso positivo estrutural |
| Publicar Pacote E “backend POST” sem validar tablet | Gap entre GAS e FE |
| Deixar tablet em `?force=` versão antiga | Cache preso na versão quebrada |
| Chamar regressão “completa” sem checklist tablet lançamento | Regra 6 / incidente I15 |

---

## Rollback (se necessário)

- **Não** reverter para v1.7.26–v1.7.33 (reintroduz o bug).  
- Manter **v1.7.35+**.  
- Se GET falhar por outro motivo: verificar ping GAS, login operador, `REGRAS` Regra 8 (`clasp deploy`).

---

## Referências

- `REGRAS_DE_PUBLICACAO_SEGURA.md` — Regra 6 (paridade HTTP)  
- `HANDOFF_NOVO_CHAT_2026-06-05.md` — I15  
- `TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1`  
- `LIMPAR_SESSOES_TESTE_AGORA.ps1` — limpar pendentes de teste após incidente  
- Commits: `eb6770a`, `64b2a66`, `53116b2`
