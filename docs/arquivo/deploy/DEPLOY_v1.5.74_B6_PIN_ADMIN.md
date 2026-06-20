# Deploy GAS v1.5.74 — B6 PIN admin só via GAS

## Regra de ouro

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\deploy-gas.ps1
```

**Nova versão Web** no Deploy ID `AKfycbwakQ...` — nunca `clasp deploy`.

| Link | URL |
|--------|------|
| **Editor** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |

## O que muda

| Item | Entrega |
|------|---------|
| **B6 GAS** | `isAdminRequest_` exige `adminPin` válido; `authRole=admin` sozinho não basta |
| **B6 GAS** | `adminPinPlain_()` lê Script Property `ADMIN_PIN` (fallback constante) |
| **B6 FE v1.7.98** | PIN validado via `loginAdmin`; sessão `mk_admin_pin_sess_v1`; sem `1416` no JS |

**FE pareado:** v1.7.98

## Teste após Nova versão Web

1. Ping → `v1.5.74`
2. `.\scripts\testes\TESTE_B6_LOGIN_ADMIN_READONLY.ps1`
3. App `?force=1.7.98` — login admin pelo gate ou overlay PIN (validação no servidor)

## Script Property opcional

Editor → Configurações do projeto → Propriedades do script → `ADMIN_PIN` = 4 dígitos (substitui default sem redeploy de código).
