# MOVI KIDS — Deploy atual (canônico)

**Atualizado:** 06/10/2026 (FE **v1.9.165** · GAS Web **v1.5.234** · **La Ville ops desde 06/10/2026**)

## Produção

| Camada | Versão | URL / evidência | Status |
|--------|--------|-----------------|--------|
| **Frontend** | **v1.9.165** | https://ribocg-a11y.github.io/movikids/?force=1.9.165 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.165** | `gestao-pessoas.html?force=1.9.165` | ✅ |
| **Portal acompanhar** | **v1.9.165** | `acompanhar.html?v=1.9.165` | ✅ |
| **Service Worker** | **1.9.165** | isolamento dual | ✅ |
| **GAS Web** | **v1.5.234** | I170–I178 isolamento | ✅ = repo |
| **La Ville** | ops **06/10/2026** | 2ª unidade em operação | ✅ D+0 |
| **GAS repo** | **v1.5.234** | raw GitHub | ✅ |
| **GAS raw** | — | https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs | |
| **Planilha** | — | `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618` | |
| **Deploy ID** | — | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

## Entregas recentes (06/10)

| I* | Camada | Nota |
|----|--------|------|
| I170–I171 | FE 1.9.164 + GAS 1.5.232 | Contas fail-closed · sessão por loja |
| I172 | GAS repo 1.5.233 | hist filtro — **Nova Web** sócio |
| I173–I178 | docs | comando/conta-mestre/leading/custos/kpiMes — abertos |
| I165–I168 | FE | caixa · folha · PDF |

## Verificação

```powershell
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

| Check | Esperado |
|-------|----------|
| Pages `mk-version.js` | **1.9.164** ✅ |
| GAS ping | **v1.5.232** Web · **v1.5.233** após Nova Web I172 |

## Publicar FE (I24)

```powershell
.\scripts\pre-push-check.ps1
git push origin main
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

## GAS (só com pedido §7.3)

`prepare-gas-push.ps1` → sócio cola raw → Editar implantação `AKfycbwakQ...` → Nova versão. **Nunca** `clasp deploy`.
