# Restaurar implantação GAS após @139 errado (14/06/2026)

## O que aconteceu

Foi criada **implantação nova** (incidente **I1**):

| | ID | Versão |
|--|-----|--------|
| **Errado (arquivar)** | `AKfycbwkvWgfu2UvgzzxDXRI5_CcDdRE-b3UGzu86FjyuwiVTgQc0L9XGd4wgIZD1UWjOKA2` | @139 Movi Kids.v133 |
| **Produção (manter)** | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | @138 v1.5.92 |

O **código do repo** (tablet, Pages, `mk-api.js`) **nunca** apontou para o @139. Produção continua sendo `AKfycbwakQ...`.

## O que você faz no editor (2 minutos)

1. [Editor Apps Script](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit)
2. **Implantar → Gerenciar implantações**
3. Selecione **Movi Kids.v133** (@139) → menu **⋮** → **Arquivar implantação**
4. Confirme que **v1.5.92** (`AKfycbwakQ...`) continua **Ativa**
5. Se o app ainda der Failed to fetch: **Editar** (lápis) em **v1.5.92** → Quem tem acesso = **Qualquer pessoa** → Nova versão (mesmo ID)

## URL de produção (não mudar)

```
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec
```

Ping: `.../exec?action=ping` — em aba anônima deve retornar JSON sem login.

## Agente a partir de agora

- **Proibido:** `clasp deploy`, `deploy-gas-SOCIO.ps1`, nova implantação
- **Permitido:** `prepare-gas-push.ps1` (só código no projeto Google)

`deploy-gas.ps1` está **bloqueado** (exit 1).
