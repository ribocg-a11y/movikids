# I47 — PIN incorreto / várias tentativas (duplo submit) — 23/06/2026

**Severidade:** P1 — operação balcão + Colaboradores  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I47**  
**Correção:** FE **v1.8.118** · GAS **v1.5.141** (paridade hash/salt)

---

## Sintoma

Milena (e risco para Raykelly): PIN “errado” ou precisar digitar várias vezes.

## Causa

1. **Duplo envio** ao completar 4 dígitos: `setTimeout` 120–150ms + Enter + botão Entrar — sem `_authBusy` em `onLoginPin`.
2. Login balcão usava `type=password` (teclado numérico ruim no tablet).
3. `gpVerifyPinColaborador_` não removia espaços do hash/salt (divergência com `loginOperador_`).

## Correção

| Camada | Fix |
|--------|-----|
| FE `mk-auth.js` | `_authBusy`, `type=tel`, debounce 320ms, guard `_mkPinSubmitting` |
| FE `mk-gestao-pessoas-ui.js` | Mesmo padrão em `colabEntrar` |
| GAS v1.5.141 | `gpVerifyPinColaborador_` strip hash/salt |

## Teste

Tablet `?force=1.8.118` — login Milena/Raykelly com PIN real (não mock 1111/3333).
