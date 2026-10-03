# MOVI KIDS — Deploy atual (canônico)

**Atualizado:** 03/10/2026 (FE **v1.9.161** · GAS ping **v1.5.231** = repo · I166–I168 · La Ville · Golden set)

## Produção

| Camada | Versão | URL / evidência | Status |
|--------|--------|-----------------|--------|
| **Frontend** | **v1.9.161** | https://ribocg-a11y.github.io/movikids/?force=1.9.161 | ✅ Pages |
| **Gestão Pessoas** | **v1.9.161** | `gestao-pessoas.html?force=1.9.161` | ✅ |
| **Portal acompanhar** | **v1.9.161** | `acompanhar.html?v=1.9.161` | ✅ |
| **Service Worker** | **1.9.161** | I168 folha cache · I167 PDF · I165 caixa | ✅ |
| **GAS Web** | **v1.5.231** | ping = header repo | ✅ |
| **GAS raw** | — | https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs | |
| **Planilha** | — | `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618` | |
| **Deploy ID** | — | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

## Entregas recentes (02–03/10)

| I* | FE | Nota |
|----|-----|------|
| I165 | 1.9.152+ | Chip Caixa por unidade |
| I166 | 1.9.159 | Folha/relatório (parcial — ver I168) |
| I167 | 1.9.160 | PDF holerite Blob |
| I168 | **1.9.161** | Folha cache-first (anti-travamento) |
| I158 | — | Golden set R$ 14.577 / CTO R$ 1.500 |

## Verificação

```powershell
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

| Check | Esperado |
|-------|----------|
| Pages `mk-version.js` | **1.9.161** ✅ |
| GAS ping | **v1.5.231** |

## Publicar FE (I24)

```powershell
.\scripts\pre-push-check.ps1
git push origin main
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

## GAS (só com pedido §7.3)

`prepare-gas-push.ps1` → sócio cola raw → Editar implantação `AKfycbwakQ...` → Nova versão. **Nunca** `clasp deploy`.
