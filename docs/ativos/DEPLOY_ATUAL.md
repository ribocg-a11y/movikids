# MOVI KIDS — Deploy atual (canônico)

**Atualizado:** 16/10/2026 (FE **v1.9.172** · GAS repo **v1.5.236** I182 · Web **v1.5.235** até Nova versão · **La Ville ops desde 06/10/2026**)

## Produção

| Camada | Versão | URL / evidência | Status |
|--------|--------|-----------------|--------|
| **Frontend** | **v1.9.172** | https://ribocg-a11y.github.io/movikids/?force=1.9.172 | Pages após push |
| **Gestão Pessoas** | **v1.9.172** | `gestao-pessoas.html?force=1.9.172` | I182 escala |
| **Portal acompanhar** | **v1.9.158** cache `?v=` | `acompanhar.html` | ✅ (DNA floresta) |
| **Service Worker** | **1.9.172** | I182 escala Golden dois turnos | após push |
| **GAS Web** | **v1.5.235** | I181 par Ray+Karen | ⏳ Nova versão **v1.5.236** |
| **La Ville** | ops **06/10/2026** | 2ª unidade em operação | ✅ |
| **GAS repo** | **v1.5.236** | I182 escala | raw após push |
| **GAS raw** | — | https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs | |
| **Planilha** | — | `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618` | |
| **Deploy ID** | — | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

## Entregas recentes (15/10)

| I* | Camada | Nota |
|----|--------|------|
| **I181** | GAS 1.5.235 + FE 1.9.171 | Par FSS Ray↔Karen; Jennifer sem meta; Q1 PIX 748,40/748,40/543,82 |
| I180/I180b | FE 1.9.170 | locar/encerrar na loja aberta · 409 → Home |
| I170–I178 | FE+GAS | Isolamento dual ✅ |
| I165–I168 | FE | caixa · folha · PDF |

## Verificação

```powershell
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

| Check | Esperado |
|-------|----------|
| Pages `mk-version.js` | **1.9.171** ✅ |
| GAS ping | **v1.5.235** |

## Publicar FE (I24)

```powershell
.\scripts\pre-push-check.ps1
git push origin main
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

## GAS (só com pedido §7.3)

`prepare-gas-push.ps1` → sócio cola raw → Editar implantação `AKfycbwakQ...` → Nova versão. **Nunca** `clasp deploy`.
