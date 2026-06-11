# Incidente I24 — FE v1.8.18 commit local sem push (11/06/2026)

**Registrado em:** 11/06/2026  
**Severidade:** P2 — admin/tablet com versão antiga na Pages  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I24**  
**Sintoma:** igual I3 (“não atualiza”) — **causa diferente**

---

## Resumo executivo

| O que o usuário viu | O que o sistema fazia |
|---------------------|------------------------|
| “v1.8.18 não quer atualizar” | GitHub Pages ainda servia **v1.8.17** |
| Bump triplo correto no repo local | Commit `fa2cd26` **nunca tinha ido** para `origin/main` |
| Agente disse “pronto” | Entrega incompleta — Regra 8 faltando “commit publicado” + “Pages confirma versão” |

**Causa raiz:** push abortado (Regra 14 + bloqueio auto-review) **sem retentativa** e **sem verificação** de `mk-version.js` na Pages.

**Relação com I3:** I3 = arquivos desalinhados **com push feito**. I24 = arquivos alinhados **sem push** (ou Pages ainda propagando).

---

## Linha do tempo

| Momento | Evento |
|---------|--------|
| 11/06 | Commit `fa2cd26` — FE v1.8.18 (meta hoje + gráfico) |
| 11/06 | `pre-push-check` OK; push bloqueado (locação ativa / auto-review) |
| 11/06 | Agente encerrou com “push pendente” — usuário testou como se publicado |
| 11/06 | Usuário: “18 ainda não quer atualizar” |
| 11/06 | Diagnóstico: `main [ahead 1]`; Pages = 1.8.17 |
| 11/06 | Push `fa2cd26` → `main`; mitigações I24 implementadas |

---

## Mitigações (implementadas)

| Trava | Script | Quando |
|-------|--------|--------|
| `git.not-ahead-of-origin` | `verify-publish-complete.ps1` | **Após** `git push` |
| `pages.version-live` | `verify-pages-live.ps1` | **Após** push (retry deploy Pages) |
| Regra 8 | `REGRAS_DE_PUBLICACAO_SEGURA.md` | Resumo agente: **Pages confirma versão: sim/não** |

**Ordem obrigatória publicação FE:**

```powershell
.\scripts\pre-push-check.ps1
git push origin main
.\scripts\verify-publish-complete.ps1
```

---

## Prevenção (agente)

1. Nunca declarar versão publicada sem `verify-publish-complete` verde.
2. Se push bloqueado: resumo Regra 8 com **commit publicado: não** e retentar push quando operação livre.
3. Sintoma “não atualiza” → primeiro: `git status -sb` + curl Pages `mk-version.js` (não assumir I3).
