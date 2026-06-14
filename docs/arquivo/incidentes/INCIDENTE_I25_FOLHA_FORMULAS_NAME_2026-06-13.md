# INCIDENTE I25 — Aba FOLHA `#NAME?` (setValue vs USER_ENTERED)

**Data:** 13/06/2026  
**Resolvido:** 13/06/2026 · **Fechado:** 14/06/2026 (testes readonly re-validados)  
**Severidade:** P1 — Dashboard folha CLT lia fallback (`fonte: default`) em vez da aba FOLHA  
**IDs:** **I25**

---

## Sintoma

- Aba **FOLHA**: colunas A–F com `#NAME?` (ex.: D36 `=SE(A36="SIM";B$10;"")`)
- `kpiMes.folhaPlanejamento.ok: false`, `fonte: default`, `custoMensal: 4926` (fallback)
- `repairFolhaAdmin` retornava `b25: #NAME?`, `b68: #NAME?`

---

## Cronologia

| Versão | Tentativa | Resultado |
|--------|-----------|-----------|
| v1.5.86 | `repairFolhaFormulasCore_` + `setFormula` | `#NAME?` memorial |
| v1.5.89 | `setFormula` nomes EN (`IF`, vírgulas) | `#ERROR!` na UI pt_BR |
| v1.5.90 | `folhaSetPt_` → `setValue('=SE(...)')` | Barra mostra SE; célula `#NAME?` |
| **v1.5.91** | `folhaFlushFormulasUser_` → **Sheets API `USER_ENTERED`** | **OK** |

---

## Causa raiz

**Apps Script `SpreadsheetApp.setValue()` / `setFormula()` não grava fórmulas localizadas como entrada manual** na planilha pt_BR. O texto `=SE(...)` aparece na barra, mas o motor não reconhece → `#NAME?`.

**Solução:** `Sheets.Spreadsheets.Values.batchUpdate` com `valueInputOption: 'USER_ENTERED'` (Advanced Service Sheets v4), equivalente a digitar na célula.

Ref.: [Stack Overflow — formulas different language via AppScript](https://stackoverflow.com/questions/79033170/)

---

## Correção (v1.5.91)

| Função | Papel |
|--------|-------|
| `folhaFlushFormulasUser_` | Batch USER_ENTERED de todas as fórmulas PT |
| `folhaToEnFormula_` | Fallback `setFormula` EN se Sheets API falhar |
| `repairFolhaFormulasCore_` | Enfileira fórmulas → flush único |
| `repairFolhaAdmin` / `repairFolhaFormulasRemote` | Expõe repair + diagnóstico D36 |

**`gas/appsscript.json`:** `enabledAdvancedServices` → Sheets v4.

---

## Validação pós-fix (13/06/2026 16:44)

| Check | Valor |
|-------|-------|
| ping | v1.5.91 |
| B25 | 15,38 |
| B68 | 5269,96 |
| D36 | 24 |
| folhaPlanejamento.fonte | FOLHA |
| viabilidade | verde · 6/6 gates |

## Re-validação (14/06/2026 08:23)

| Teste | Status | Detalhe |
|-------|--------|---------|
| `TESTE_FOLHA_FORMULAS_READONLY` | **ok** | 12/12 checks |
| `TESTE_FASE9_FOLHA_READONLY` | **ok** | `CONTRATACAO_VIAVEL` · margem proj. 41,8% · be=14 loc/dia |

**Comandos (caminho absoluto):**

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\scripts\testes\TESTE_FOLHA_FORMULAS_READONLY.ps1"
powershell -ExecutionPolicy Bypass -File "C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\scripts\testes\TESTE_FASE9_FOLHA_READONLY.ps1"
```

---

## Travas

| Trava | Onde |
|-------|------|
| Nunca `setValue('=SE...')` para fórmulas FOLHA | `repairFolhaFormulasCore_` |
| Repair pós-deploy FOLHA | `TESTE_FOLHA_FORMULAS_READONLY.ps1` |
| Ping ≥ v1.5.91 após deploy GAS FOLHA | `deploy-gas.ps1` mensagem |

---

## Lições

1. **Planilha quebrada ≠ código no editor** — clasp push atualiza editor; Web App exige **Nova versão** no Deploy ID `AKfycbwakQ...`.
2. **`TESTE_FASE9` passava com `fonte: default`** — não detectava aba FOLHA quebrada; criado **`TESTE_FOLHA_FORMULAS_READONLY.ps1`**.
3. **PowerShell:** URL completa com `Invoke-RestMethod`; scripts de teste exigem **`cd` no repo** ou caminho absoluto.
4. **"Atualize tudo":** registrar re-validações em incidente + `PROTOCOLO_ATUALIZAR_TUDO.md`.

---

## Docs relacionados

- `DEPLOY_v1.5.91_FOLHA_REPAIR_USER_ENTERED.md`
- `../referencia/FOLHA_PAGAMENTO_MEMORIAL_E_PLANILHA.md` §9
- `MAPA_ERROS_FALHAS_BUGS.md` — linha I25
