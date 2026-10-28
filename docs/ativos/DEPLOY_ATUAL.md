# MOVI KIDS — Deploy atual (canônico)

**Atualizado:** 28/10/2026 (FE **v1.9.175** · GAS Web/repo **v1.5.236** · I183 Holding dual + I184 ponto · **La Ville ops desde 06/10/2026**)

## Produção

| Camada | Versão | URL / evidência | Status |
|--------|--------|-----------------|--------|
| **Frontend** | **v1.9.175** | https://ribocg-a11y.github.io/movikids/?force=1.9.175 | Pages ✅ |
| **Gestão Pessoas** | **v1.9.175** | `gestao-pessoas.html?force=1.9.175` | I184 ponto |
| **Portal acompanhar** | cache `?v=` | `acompanhar.html` | DNA floresta |
| **Service Worker** | **1.9.175** | I183/I184 | após push |
| **GAS Web** | **v1.5.236** | ping alinhado repo | ✅ |
| **La Ville** | ops **06/10/2026** | 2ª unidade em operação | ✅ |
| **GAS repo** | **v1.5.236** | I182 escala | raw |
| **GAS raw** | — | https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs | |
| **Planilha** | — | `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618` | |
| **Deploy ID** | — | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

## Entregas recentes (28/10)

| I* | Camada | Nota |
|----|--------|------|
| **I183** | FE 1.9.175 | Holding Lojas hidrata dual via `resumoDia(all)` — PR #47 estava sem merge |
| **I184** | FE 1.9.175 | Ponto anti toque-duplo + CTA nova entrada · Jennifer 28/10 reparada |
| I182 | GAS 1.5.236 | Escala Golden Ray 10–16 / Karen 16–22 |
| **I181** | GAS 1.5.235+ | Par FSS Ray↔Karen; Jennifer sem meta |
| I180/I180b | FE 1.9.170+ | locar/encerrar na loja aberta |
| I170–I178 | FE+GAS | Isolamento dual ✅ |

## Verificação

```powershell
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

| Check | Esperado |
|-------|----------|
| Pages `mk-version.js` | **1.9.175** ✅ |
| GAS ping | **v1.5.236** ✅ |

## Publicar FE (I24)

```powershell
.\scripts\pre-push-check.ps1
git push origin main
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

**Evidência 28/10:** `entregas/VALIDACAO_I183_I184_2026-10-28.json` · `INCIDENTE_I183_I184_HOLDING_PONTO_2026-10-28.md`
