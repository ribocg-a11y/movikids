# Checklist — Aba CONFIG (planilha MOVI KIDS) — I53

**Camada:** 1 — Operação P0 · **Protocolo:** `PROTOCOLO_AUDITORIA_ABAS_PLANILHA.md`  
**Data auditoria:** 24/06/2026 · **GAS:** v1.5.150 · **Status:** ✅ Fechada (prod)

---

## A — Descoberta

| Item | Valor |
|------|-------|
| Grava runtime? | **sim** (admin) — `salvarOperacaoConfigAdmin` |
| Layout I53 | Memorial **1–3** · header **4** · dados **5+** |
| Layout legado | Header **1** · dados **2+** (migrado no repair) |
| Colunas | **A** Chave · **B** Valor (JSON) |
| Chaves obrigatórias | `veiculos_validos_json`, `precos_json`, `formas_pagamento_json`, `regras_operacionais_json` |
| APIs que escrevem | `salvarOperacaoConfigAdmin`, `cfgSetValue_`, `repararConfigPlanilhaAdmin` |
| APIs que leem | `operacaoConfig_`, `carregarOperacaoConfig`, `diagnosticoConfigOperacional`, `salvarLocacao_` (valida frota/preço) |
| Páginas impactadas | Nova locação balcão, admin preços, KPI ocupação frota |
| Incidentes | I31 encoding pelúcias · **I53** memorial/schema/repair |

---

## B — Schema

- [x] `CONFIG_KEYS_REQUIRED_` — 4 chaves no `.gs`
- [x] `validarConfigSchema_` + entrada em `validarSchema`
- [x] `cfgDataStartRow_` / `cfgHeaderRow_` — legado vs I53
- [x] `guard.gas.validarSchema.config` no `pre-push-check`
- [x] `schemaOk=true` em produção (24/06 — repair aplicado)

---

## C — Auditoria

- [x] JSON frota válido (`validarVeiculosConfig_`)
- [x] JSON preços válido (`validarPrecosConfig_`)
- [x] 10 veículos esperados (Carro×4, Triciclo×2, Pelúcia×4)
- [x] Carro 3h=130 · Pelúcia 3h=150 (`TESTE_OPERACAO_CONFIG_READONLY`)

---

## D — Memorial

- [x] Linha 1: MOVI KIDS — CONFIG · frota e preços
- [x] Linha 2: salvarOperacaoConfigAdmin / MAPA CONFIG
- [x] Linha 3: lista das 4 chaves JSON
- [x] Header linha 4 — Chave | Valor
- [x] Congelado linha 4
- [x] Proteção linhas 1–4

---

## E — Formatação

| Col | Campo | Formato | OK |
|-----|-------|---------|-----|
| A | Chave | `@` texto | ✅ |
| B | Valor | wrap + alinhamento topo | ✅ |

---

## F — Higiene

- [x] Seed defaults se chave ausente (`OPERACAO_CONFIG_DEFAULTS`)
- [x] `invalidateInicioResumoCache_` pós-repair
- [x] Migração legado → I53 preserva pares existentes

---

## G — GAS

| Item | Valor |
|------|-------|
| API | `repararConfigPlanilhaAdmin` |
| Script | `REPARAR_CONFIG_PLANILHA_ADMIN.ps1` |
| Repair 24/06 | 57 linhas formatadas · header Chave/Valor · schemaOk=True |

---

## H — Testes

| Script | Resultado 24/06 |
|--------|-----------------|
| `REPARAR_CONFIG_PLANILHA_ADMIN` | ✅ schemaOk=True · 57 linhas |
| `TESTE_OPERACAO_CONFIG_READONLY` | ✅ 10 veículos · Carro 3h=130 |
| `validarSchema` | ✅ CONFIG ok · schemaOk global True |

---

## I — Melhorias (backlog)

| ID | Melhoria | Prioridade | Status |
|----|----------|------------|--------|
| M-CFG-1 | UI admin editar CONFIG sem planilha | P2 | Backlog |
| M-CFG-2 | OAuth auditar JSON CONFIG (encoding) | P2 | Backlog |
| M-CFG-3 | Proteger col B dados (só GAS) | P3 | Avaliar |

---

## Comandos

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\testes\TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba CONFIG -DryRun
.\scripts\testes\REPARAR_CONFIG_PLANILHA_ADMIN.ps1
.\scripts\testes\TESTE_OPERACAO_CONFIG_READONLY.ps1
```

**Deploy:** ✅ Nova versão Web v1.5.150 · repair 24/06
