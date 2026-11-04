# I193 — Código base publicado com SyntaxError (comentário `*/`)

**Data:** 04/11/2026 (America/Fortaleza)  
**FE quebrado:** **v1.9.186** · **Corrigido em:** **v1.9.187** (parse) + trava `guard.i193` (este incidente)

## O que o usuário cobrou (certo)

1. Como o agente não viu o SyntaxError antes do push?
2. Por que precisou pedir check de novo?
3. **Regra de ouro:** código base validado **não** pode ser alterado/publicado com erro.

## Falha do agente

No I191, um comentário em bloco continha a sequência `_offline*/` — o `*/` **fechava o comentário cedo** e o restante do arquivo virava lixo de parse.

`node --check mk-sync.js` / `mk-local-snapshot.js` falharia na hora. O `pre-push-check.ps1` **não** tinha essa trava. O pacote foi para Pages e **parou o sync no tablet** (fantasma + Encerradas La Ville vazias).

## Correção de processo (obrigatória)

| Trava | Onde |
|-------|------|
| `.\scripts\guard-js-syntax.ps1` | `node --check` em todos `mk-*.js` + `sw.js` |
| `guard.i193.js.syntax` | dentro de `pre-push-check.ps1` — fail = **não push** |
| Regra 21 | `REGRAS_DE_PUBLICACAO_SEGURA.md` |
| Cursor rule | `.cursor/rules/fe-js-syntax-obrigatorio-i193.mdc` |

## Regra de ouro (texto curto)

> Depois de editar FE JS: parse OK → aí commit/push. Sem parse OK, o código base **não muda** em produção.
