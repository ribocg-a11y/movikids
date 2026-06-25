# Incidente I53 — CONFIG memorial, schema e repair planilha

**Data:** 24/06/2026  
**Severidade:** P1 (dados operacionais — frota/preços)  
**Versão GAS:** v1.5.150  
**Aba:** CONFIG (camada 1)

---

## Sintoma

- Aba CONFIG sem memorial padronizado (layout legado: header linha 1, dados linha 2).
- `validarSchema` não validava CONFIG (só abas com `*_HEADERS_` tabular).
- `cfgReadMap_` / `cfgSetValue_` fixos na linha 2 — incompatível com memorial I53.
- Sem API admin de repair idempotente (piloto LOCACOES I52 não replicado).

## Impacto

- Risco de edição manual sem rastro em chaves JSON críticas.
- Diagnóstico planilha com `dataRows` incorreto para CONFIG.
- Protocolo de auditoria por aba bloqueado na 2ª aba do roadmap.

## Correção (repo v1.5.150)

| Entrega | Função |
|---------|--------|
| Layout I53 | Memorial 1–3, header 4, dados 5+ |
| Migração | `repairConfigMemorialCore_` insere 3 linhas e preserva pares |
| Schema | `validarConfigSchema_` + 4 chaves + JSON válido |
| Leitura | `cfgDataStartRow_`, `cfgHeaderRow_` |
| Repair | `repararConfigPlanilhaAdmin` + `dryRun=1` |
| Audit | `auditConfigSampleCore_` |
| Diagnóstico | `configAudit` em `diagnosticoPlanilhaCompletoAdmin` |
| Script | `REPARAR_CONFIG_PLANILHA_ADMIN.ps1` |
| Guard | `guard.gas.validarSchema.config` |

## Testes

```powershell
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_PROTOCOLO_ABA_PLANILHA.ps1 -Aba CONFIG -DryRun
.\scripts\testes\REPARAR_CONFIG_PLANILHA_ADMIN.ps1
.\scripts\testes\TESTE_OPERACAO_CONFIG_READONLY.ps1
```

## Deploy

1. `.\scripts\prepare-gas-push.ps1` (agente com pedido)
2. Sócio: Editor GAS → Implantar → Editar `AKfycbwakQ...` → **Nova versão** v1.5.150
3. Rodar repair na planilha ao vivo

## Referências

- `docs/referencia/CHECKLIST_ABA_PLANILHA_CONFIG.md`
- `docs/ativos/PROTOCOLO_AUDITORIA_ABAS_PLANILHA.md` §2 CONFIG
- `MAPA_ERROS_FALHAS_BUGS.md` I53
