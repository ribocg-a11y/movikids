# Deploy GAS automático (clasp) — passo a passo curto

Script ID: `19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8`  
Implantação Web (v78): `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

## Parte 1 — Instalar clasp (você está aqui)

No **PowerShell**, cole **só esta linha** e Enter:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
```

Depois:

```powershell
npm install -g @google/clasp
```

Se der certo, aparece algo como `added ...` sem erro vermelho.

**Alternativa** (se não quiser mudar política): abra **Prompt de Comando (cmd)** e rode:

```cmd
npm install -g @google/clasp
```

## Parte 2 — Login Google ✅

`clasp login` → logado como ribocg@gmail.com

## Parte 3 e 4 — Um comando só (daqui pra frente)

Na pasta do projeto:

```powershell
cd "C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github"
.\scripts\deploy-gas.ps1
```

Isso: copia o `.gs` → `clasp push` → publica na URL antiga (implantação `AKfycbzc...`).
