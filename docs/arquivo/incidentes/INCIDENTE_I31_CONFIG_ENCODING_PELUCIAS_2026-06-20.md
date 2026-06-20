# INCIDENTE I31 — Pelúcias fora de operação (encoding CONFIG)

**Data:** 20/06/2026  
**Severidade:** P0 operação (balcão)  
**Status:** ✅ **Resolvido** — CONFIG live corrigida via `salvarOperacaoConfigAdmin`  
**Camada:** Planilha CONFIG · `veiculos_validos_json`

---

## Sintoma

- Operadores não conseguiam locar **Pelúcias 01–04** na Nova locação
- Veículos apareciam no FE mas GAS rejeitava ou não reconhecia o nome
- Reporte: *"as pelucias estão fora de operação"*

---

## Causa raiz

- `veiculos_validos_json` na aba **CONFIG** (produção) continha caracteres corrompidos no nome **Pelúcia** (encoding UTF-8 quebrado após escrita via API/script)
- Validação GAS `veiculosOp_()` compara string exata — `"Pelúcia 01"` ≠ `"Pelǧcia 01"` (ou similar)

---

## Correção

1. Chamada `salvarOperacaoConfigAdmin` com JSON Unicode explícito (`\u00facia` em Pelúcia)
2. Lista canônica 10 veículos incluindo Carro 04 (sessão anterior)
3. Validar com `TESTE_OPERACAO_CONFIG_READONLY.ps1`

---

## Trava / prevenção

| Ação | Detalhe |
|------|---------|
| Sempre UTF-8 | Escrever CONFIG com escapes Unicode ou arquivo `.ps1` UTF-8 BOM |
| Teste pós-alteração | `TESTE_OPERACAO_CONFIG_READONLY.ps1` — 10 veículos, nomes exatos |
| Doc template | `CONFIG_OPERACIONAL_TEMPLATE.md` — referência Pelúcia com acento |

---

## Evidência

- Data: 20/06/2026 ~12:45
- Operação bloqueada até fix CONFIG
- FE v1.8.68+ · GAS ping v1.5.107 (veículos no código repo v1.5.111)

---

## Teste de regressão

```powershell
.\scripts\testes\TESTE_OPERACAO_CONFIG_READONLY.ps1
```

Esperado: `diag.veiculos` = 10 · Pelúcia 01–04 na lista retornada por `carregarOperacaoConfig`.
