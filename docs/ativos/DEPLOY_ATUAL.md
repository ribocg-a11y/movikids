# MOVI KIDS — Deploy atual (canônico)

**Atualizado:** 05/11/2026 (FE **v1.9.195** · GAS Web/repo **v1.5.237** · I200 folha paint-only · I199/I198 · **La Ville ops desde 06/10/2026**)

## Produção

| Camada | Versão | URL / evidência | Status |
|--------|--------|-----------------|--------|
| **Frontend** | **v1.9.195** | https://ribocg-a11y.github.io/movikids/?force=1.9.195 | Pages ✅ |
| **Gestão Pessoas** | **v1.9.195** | `gestao-pessoas.html?force=1.9.195` | I200 Folha paint |
| **Portal acompanhar** | cache `?v=` | `acompanhar.html` | DNA floresta |
| **Service Worker** | **1.9.195** | I200 | após push |
| **GAS Web** | **v1.5.237** | ping alinhado repo | ✅ |
| **La Ville** | ops **06/10/2026** | 2ª unidade em operação | ✅ |
| **GAS repo** | **v1.5.237** | Triciclo 03 | raw |
| **GAS raw** | — | https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs | |
| **Planilha** | — | `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618` | |
| **Deploy ID** | — | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` | |

## Entregas recentes (05/11)

| I* | Camada | Nota |
|----|--------|------|
| **I200** | FE 1.9.194–195 | Folha: paint-only + watchdog + elapsed + `guard.i200` |
| **I199** | FE 1.9.193 | Folha Outubro: switch competência + match mês + timeout 180s |
| **I198** | FE 1.9.192 | `mkInicioCacheSafeForApply_` + `audit-familia-dual-loja.ps1` · Evolução estratégica |
| **I197** | FE 1.9.191 | Firebase/GP/fantasma map-wide/IDB por loja |
| **I196** | FE 1.9.190 | unidadeId depois do auth (custos/rel/hist) |
| **I195–I191** | FE 1.9.186–189 | holding/deslogar/Encerradas/parse/fantasma João |
| **I186** | FE 1.9.179 | Receita filtros/pills/Ver · cache por loja |
| Q2 out/26 | memorial | PIX Ray **902,22** · Karen **1.002,22** · Jennifer **632,19** |
| I182 | GAS 1.5.236+ | Escala Golden Ray 10–16 / Karen 16–22 |
| **I181** | GAS 1.5.235+ | Par FSS Ray↔Karen; Jennifer sem meta |
| I170–I178 | FE+GAS | Isolamento dual ✅ |

## Verificação

```powershell
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\audit-familia-dual-loja.ps1
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

| Check | Esperado |
|-------|----------|
| Pages `mk-version.js` | **1.9.195** ✅ |
| GAS ping | **v1.5.237** ✅ |
| audit-familia | status ok |

## Publicar FE (I24)

```powershell
.\scripts\pre-push-check.ps1
git push origin main
.\scripts\verify-publish-complete.ps1
.\scripts\encerramento-sessao.ps1
```

**Evidência 04/11:** `EVOLUCAO_ESTRATEGICA_POS_I197.md` · `APRENDIZADO_AGENTE_MOVIKIDS.md` · Pages **1.9.192**  
**Evidência 03/11:** `INCIDENTE_I185_I186_RECEITA_DIARIA_2026-11-03.md`  
**Evidência 28/10:** `entregas/VALIDACAO_I183_I184_2026-10-28.json`
