# Deploy GAS v1.5.72 — Sessão / idle 1h

## Regra de ouro

**v1.5.72 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Como colar:** Explorer → Ctrl+A → Ctrl+C → **Código.gs** → **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão → Implantar**. **Nunca** `clasp deploy`.

| Link | URL |
|--------|------|
| **Editor** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |

**Deploy ID:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda

| Camada | Versão | Entrega |
|--------|--------|---------|
| **GAS** | v1.5.72 | `lastActivityAt` + idle 1h no servidor; `touchSessaoOperador`; `logout_inatividade` em AUD_TURNO |
| **FE** | v1.7.94 | Idle por relógio real (admin+operador); libera balcão no GAS ao deslogar; PIN admin não apaga sessão operador local |

Inclui **v1.5.71** (kpiMes) e **v1.5.70** (resumoDia) se ainda não publicou.

## Teste após Nova versão Web

1. Ping → `v1.5.72`
2. `.\scripts\testes\TESTE_SESSAO_IDLE_READONLY.ps1`
3. Tablet `?force=1.7.94` — login → esperar 1h (ou mock `mk_auth_last_activity` no DevTools) → deve voltar ao gate e balcão livre no servidor

### Mock rápido (DevTools)

```javascript
localStorage.setItem('mk_auth_last_activity', String(Date.now() - 61*60*1000));
typeof checkAuthIdle_ === 'function' ? checkAuthIdle_() : location.reload();
```
