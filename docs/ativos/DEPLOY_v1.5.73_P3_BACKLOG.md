# Deploy GAS v1.5.73 — P3 Backlog produto

## Regra de ouro

**v1.5.73 no seu PC (copiar deste arquivo — nunca editar `gas/Code.gs` à mão):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Fluxo agente (já feito se você pediu deploy):**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\deploy-gas.ps1
```

**Fluxo humano (obrigatório para produção):**

1. [Editor Apps Script](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit)
2. **Implantar → Gerenciar implantações**
3. **Editar** a Web **`AKfycbwakQ...`** (mesmo Deploy ID — nunca criar novo)
4. **Nova versão → Implantar**

Alternativa ao clasp: Explorer → caminho acima → Ctrl+A → Ctrl+C → colar em **Código.gs** → passos 2–4.

**Nunca** `clasp deploy`.

| Link | URL |
|--------|------|
| **Editor** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |

**Deploy ID:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda (P3)

| Item | Action GAS |
|------|------------|
| **B3** | `listarAuditoriaAdmin` — AUDITORIA + AUD_TURNO, filtro operador |
| **B5/N2** | `buscarPreviewRelatorioExecutivo`, `salvarRelatorioExecutivoDrive`, audience `executivo` (Golden + payback) |
| **N1** | `listarResponsaveis` → campo `recorrente` (`encerradas >= 2`) |

**FE pareado:** **v1.7.97** (auditoria UI, PDF executivo, caixa WA/email, badge CRM).

## Teste após Nova versão Web

1. Ping → `versao: "v1.5.73"`
2. Readonly admin:
   - `.../exec?action=listarAuditoriaAdmin&adminPin=1416&limite=5`
   - `.../exec?action=buscarPreviewRelatorioExecutivo&adminPin=1416&mes=6&ano=2026`
3. App admin `?force=1.7.97` → Sistema (auditoria), Relatório (PDF executivo), CRM (badge Recorrente)
