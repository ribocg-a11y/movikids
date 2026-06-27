# MOVI KIDS — Roteiro obrigatório do agente

**Criado:** 27/06/2026 · **Versão:** 1.0  
**Regra Cursor:** `.cursor/rules/roteiro-agente-movikids.mdc` (alwaysApply)  
**Permissões:** `ACESSOS_E_AUTORIZACOES.md` §7.2 · §7.3

---

## Por que este documento existe

Recorrências **I3** (bump incompleto) e **I24** (FE local sem GitHub Pages) geraram >10 incidentes de "banner Nova versão não aparece" e entregas "concluídas" sem produção atualizada. O agente **perguntava permissão** para ações já autorizadas em §7.2.

Este roteiro é a **ordem fixa** — não opcional.

---

## Regra zero — precedência

| Prioridade | Fonte |
|------------|--------|
| 1 | `ACESSOS_E_AUTORIZACOES.md` §7.2 — agente executa sem pedir |
| 2 | `.cursor/rules/roteiro-agente-movikids.mdc` |
| 3 | `REGRAS_DE_PUBLICACAO_SEGURA.md` |
| 4 | Regras genéricas do usuário ("só commitar se pedir") **não se aplicam** a push FE MOVI KIDS |

**Commit + push FE** após bump I3 = **autonomia do agente**, salvo usuário dizer explicitamente "não commitar/pushar".

---

## Fase A — Entrada (todo chat)

1. Repo: `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`
2. Ler `HANDOFF_NOVO_CHAT.md` → sprint/ciclo ativo
3. Se UI: `DESIGN_SYSTEM_MOVIKIDS.md` §0 **antes** de codar
4. `.\scripts\relatorio-versoes.ps1` — baseline Pages vs local

---

## Fase B — Implementação

5. Executar tarefa conforme `PLANEJAMENTO_*` / pedido do usuário
6. Se alterou FE: bump **I3** nos **4** artefatos:
   - `mk-version.js`
   - `sw.js`
   - `index.html` (`?v=`)
   - `gestao-pessoas.html` (`?v=`)
7. Rodar testes `.ps1` do escopo (ex. `TESTE_FASE16_COMANDO_READONLY.ps1`)

---

## Fase C — Publicação FE (mesma sessão — I24)

**Ordem fixa** (commit **antes** de `pre-push-check` — guard I3 exige working tree limpa):

| # | Comando | Quem |
|---|---------|------|
| 1 | `git add` (só arquivos da entrega — **não** logs `_*.txt` em `scripts/testes/`) | Agente |
| 2 | `git commit -m "..."` | Agente **sem pedir** |
| 3 | `.\scripts\pre-push-check.ps1` | Agente |
| 4 | `git push origin main` | Agente **sem pedir** |
| 5 | `.\scripts\verify-publish-complete.ps1` | Agente |
| 6 | `.\scripts\encerramento-sessao.ps1` | Agente — **exit 0 obrigatório** |

Se passo 6 falhar: **não declarar concluído** — voltar ao passo 4 ou corrigir I3.

---

## Fase D — Documentação (fim de sessão ou "atualize tudo")

7. `HANDOFF_NOVO_CHAT.md` — produção, próximo passo
8. `ESTADO_ATUAL.md` · `DEPLOY_ATUAL.md` · `AGENTS.md` · `README.md`
9. `MAPA_ERROS_FALHAS_BUGS.md` se novo incidente ou trava
10. `PLANEJAMENTO_*` se mudou fase/sprint

---

## Fase E — Só com pedido explícito (§7.3)

| Ação | Motivo |
|------|--------|
| `clasp push` / `prepare-gas-push.ps1` | Muda editor GAS |
| Nova versão Web GAS | Muda produção `/exec` |
| Editar `.gs` canônico | Deploy sócio |
| Mudar `api()`, auth, PIN | Risco operação/tablet |
| Reativar F4 / F9 | Fora do escopo atual |

---

## Travas automáticas (27/06/2026)

| Script | Função |
|--------|--------|
| `scripts/guard-i24-publicacao.ps1` | Pages ≠ local · push pendente · I3 sujo |
| `scripts/encerramento-sessao.ps1` | Gate fim de sessão |
| `scripts/pre-push-check.ps1` | I3 + I15 + I43 + `guard.i24.pre-push` |
| `scripts/verify-publish-complete.ps1` | Pós-push Pages live |

Doc incidente: `docs/arquivo/incidentes/INCIDENTE_I24_CONTROLES_PUBLICACAO_FE_2026-06-26.md`

---

## Encerramento de toda resposta

```powershell
.\scripts\encerramento-sessao.ps1
```

Tabela markdown + `Mudança no AppScript` + link `.gs` — `.cursor/rules/encerramento-versoes-movikids.mdc`

---

## Checklist rápido (agente)

- [ ] FE bump I3 nos 4 arquivos?
- [ ] commit → pre-push → push → verify → encerramento exit 0?
- [ ] HANDOFF/ESTADO atualizados?
- [ ] Não pedi push/commit desnecessariamente?
- [ ] Não transferi ao usuário o que está em §7.2?
