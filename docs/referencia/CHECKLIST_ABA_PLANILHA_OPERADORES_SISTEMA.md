# Checklist — Aba OPERADORES_SISTEMA (planilha MOVI KIDS) — I54

**Camada:** 1 — Operação P0 · **Protocolo:** `PROTOCOLO_AUDITORIA_ABAS_PLANILHA.md`  
**Data auditoria:** 24/06/2026 · **GAS:** v1.5.151 · **Status:** ✅ Fechada (prod)

---

## A — Descoberta

| Item | Valor |
|------|-------|
| Grava runtime? | **sim** — login, PIN, perfil |
| Layout I54 | Memorial **1–3** · header **4** · dados **5+** |
| Layout legado | Header **1** · dados **2** (migrado no repair) |
| Colunas | **8** — `OPS_HEADERS_` |
| Operadores padrao | Eduarda · Milena Nunes |
| APIs que escrevem | `loginOperador_`, `definirPinOperador_`, `resetarPinOperadorAdmin`, `definirPerfilOperadorAdmin` |
| APIs que leem | `listarOperadoresLogin`, `operadorRowById_`, auth sessao |
| Páginas impactadas | `index.html` login balcão, hub tablet, admin operadores |
| Incidentes | **I54** memorial/schema · auth I21/I47 |

**Schema canônico (GAS):**

| Col | Campo |
|-----|-------|
| A | id |
| B | criadoEm |
| C | nome |
| D | pinHash |
| E | pinSalt |
| F | ativo (SIM/NAO) |
| G | ultimoLogin |
| H | perfil (operador/gestor/supervisor) |

---

## B — Schema

- [x] `OPS_HEADERS_` — 8 cols no `.gs`
- [x] `validarOpsSchema_` + entrada em `validarSchema`
- [x] `opsDataStartRow_` / `opsHeaderRow_`
- [x] `guard.gas.validarSchema.ops` no `pre-push-check`
- [x] `schemaOk` OPERADORES em produção (24/06 — repair aplicado)

---

## D — Memorial

- [x] Linha 1: MOVI KIDS — OPERADORES_SISTEMA · login PIN
- [x] Linha 2: loginOperador / MAPA
- [x] Linha 3: pinHash/pinSalt · ativo · perfil
- [x] Header linha 4 — 8 titulos
- [x] Congelado + protecao linhas 1–4

---

## E — Formatação

| Col | Campo | Formato | OK |
|-----|-------|---------|-----|
| A | id | numero | sim |
| B,G | datas | texto @ | sim |
| D,E | PIN hash/salt | @ | sim |
| F | ativo | SIM/NAO dropdown | sim |
| H | perfil | operador/gestor/supervisor | sim |

---

## G — GAS

| Item | Valor |
|------|-------|
| API | `repararOperadoresSistemaPlanilhaAdmin` |
| Script | `REPARAR_OPERADORES_SISTEMA_PLANILHA_ADMIN.ps1` |
| Repair 24/06 | 3 linhas migradas I54 · Eduarda/Milena/Raykelly · todosComPin=True |

---

## H — Testes

| Script | Resultado 24/06 |
|--------|-----------------|
| `REPARAR_OPERADORES_SISTEMA_PLANILHA_ADMIN` | ✅ migrado I54 · schemaOk=True |
| `TESTE_SESSAO_LIBERAR_READONLY` | ✅ OK |
| `validarSchema` | ✅ OPS header linha 4 |

---

## Comandos

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\testes\TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba OPERADORES_SISTEMA
```

**Deploy:** ✅ Nova versão Web v1.5.151 · repair 24/06
