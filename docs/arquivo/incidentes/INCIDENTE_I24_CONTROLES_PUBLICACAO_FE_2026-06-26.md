# Incidente I24 — FE local sem GitHub Pages (recorrência banner Nova versão)

**Registrado:** 26/06/2026 (controles definitivos)  
**Severidade:** P1 — operação/admin não recebe atualização; banner nunca aparece  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I24** (relacionado **I3**)

---

## Sintoma

- Agente bumpa `mk-version.js` (ex. v1.9.2) no PC
- `pre-push-check` passa
- **Sem** `git push` → GitHub Pages continua v1.8.x
- Tablet/PC: local = remoto = versão antiga → **faixa "Nova versão" não aparece**
- Usuário: "de novo isso acontecendo" (>10 vezes)

## Causa raiz

Processo: **entrega FE considerada "concluída" sem publicação**. O banner só compara `mk-version.js` **no ar** vs **carregado** — não avisa bump só no repo.

## Controles adotados (26/06/2026)

| Controle | Onde | Efeito |
|----------|------|--------|
| **`guard-i24-publicacao.ps1`** | `scripts/` | Falha se Pages ≠ local, push pendente ou I3 sujo |
| **`encerramento-sessao.ps1`** | `scripts/` | Gate fim de sessão agente — exit 1 bloqueia "concluído" |
| **`relatorio-versoes.ps1 -Strict`** | `scripts/` | Exit 1 se Pages ≠ local ou git ahead |
| **`pre-push-check`** | `versao.gestao-pessoas-cache-bust` + `guard.i24.pre-push` | I3 completo (4 arquivos) + bump commitado |
| **Regra Cursor** | `.cursor/rules/fe-i24-publicacao-obrigatoria.mdc` | Bump FE = push na mesma sessão |
| **Encerramento** | `encerramento-versoes-movikids.mdc` | Obriga `encerramento-sessao.ps1` |

## Fluxo obrigatório (agente)

```
pre-push-check.ps1
  → git commit
  → git push origin main
  → verify-publish-complete.ps1
  → encerramento-sessao.ps1   # exit 0
```

## Exceção

Usuário pede explicitamente **não commitar/pushar** → `-AllowUnpublished` em `encerramento-sessao.ps1`; avisar que banner não funcionará.

## Validação

```powershell
.\scripts\guard-i24-publicacao.ps1 -Mode Sessao   # deve fail enquanto Pages != local
.\scripts\encerramento-sessao.ps1                 # idem
curl https://ribocg-a11y.github.io/movikids/mk-version.js  # deve = mk-version.js local após push
```
