# Incidente I26 — GAS editor atualizado, /exec ainda na versão antiga (14/06/2026)

## Sintoma (3 ocorrências)

- `Code.gs` no editor mostra **v1.5.92**
- `?action=ping` na Web App retorna **v1.5.91**
- Agente declara “deploy OK” após só `clasp push`

## Causa raiz

`clasp push` grava código no projeto Apps Script. A URL **`/exec`** serve a **implantação Web** (`@137`, `@138`…), não o HEAD do editor.

Documentação antiga pedia “Nova versão manual” e proibia **`clasp deploy`** sem distinguir:
- **`clasp deploy`** sem `-i` → cria URL nova (I1, 04/06) ❌
- **`clasp deploy -i AKfycbwakQ...`** → republica **mesma** URL ✅

## Correção permanente

1. **`scripts/deploy-gas.ps1`** — `clasp push` + **`clasp deploy -i $DEPLOY_ID`** + **`verify-gas-deploy.ps1`**
2. **`scripts/verify-gas-deploy.ps1`** — falha se `ping.versao` ≠ `ping_().versao` no `.gs` canônico
3. **Regra 9** atualizada em `REGRAS_DE_PUBLICACAO_SEGURA.md`

## Checklist pós-mudança GAS

```powershell
.\scripts\deploy-gas.ps1
# deve terminar com verify-gas-deploy OK
```

Ping manual:  
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

## Versão de referência

Resolvido com implantação **@138** — ping **v1.5.92** (14/06/2026 10:22).
