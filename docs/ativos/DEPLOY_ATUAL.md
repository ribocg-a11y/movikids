# MOVI KIDS — Deploy atual (referência única)

**Atualizado:** 20/06/2026

Use **este arquivo** para versão e ordem de publicação. Docs `DEPLOY_v1.5.xx_*` e `DEPLOY_FE_v1.8.xx_*` em **`docs/arquivo/deploy/`** são histórico — não substituem este.

---

## Versões

| Camada | Repo | Produção (ping / Pages) | Alinhado? |
|--------|------|-------------------------|-----------|
| **Frontend** | **v1.8.71** | https://ribocg-a11y.github.io/movikids/?force=1.8.71 | ✅ Pages |
| **Gestão Pessoas** | **v1.8.71** | `gestao-pessoas.html?force=1.8.71` | ✅ |
| **Service Worker** | **1.8.71** | `sw.js` | ✅ |
| **GAS** | **v1.5.111** (header `.gs`) | Web **versão 165** (20/06 15:05) · ping string v1.5.107 | ✅ funcional |

**Ping:** https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping

**Deploy ID (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## GAS canônico (PC)

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

Arquivo no repo: `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (nome fixo; versão só no header).

---

## Ordem de publicação (janela segura)

**Verificado 20/06/2026:** `check-operacao-livre` → **0** loc · Nova versão Web **165** publicada 15:05 · CONFIG prod: **10 veículos incl. Carro 04**

1. `check-operacao-livre.ps1` — sem loc Ativa/Pendente ✅ **20/06**
2. **GAS editor:** `prepare-gas-push.ps1` ✅ **20/06 15:02** (3 arquivos: Code, appsscript, FinanceiroGeral)
3. **GAS Web:** Editor → Implantar → **Editar** deploy `AKfycbwakQ...` → **Nova versão** ✅ **165** (20/06 15:05)
4. Ping → string `v1.5.107` (cosmético) · validar CONFIG/RH em prod
5. **FE:** `pre-push-check.ps1` → commit → push → `verify-publish-complete.ps1` (se mudou FE)
6. Tablet: `?force=1.8.71` + homolog 1 locação se mudou caminho quente

**Proibido:** `clasp deploy` sem `-i` · nova implantação GAS · POST no browser (I15).

Detalhe mestre: `DEPLOY_GAS_v1.5.32_AUTH.md` · regras: `REGRAS_DE_PUBLICACAO_SEGURA.md` · papéis: `ACESSOS_E_AUTORIZACOES.md` §7.3.

---

## Entregas recentes (repo v1.8.71)

| Commit / tema | Entrega |
|---------------|---------|
| I32 | Dedupe nova locação + SMS off no Fechar |
| I33 | Force update PWA |
| I34 | `mk-holerite.js` — CPF, refs, VT, PDF |
| CNPJ | **66.664.255/0001-67** |
| Frota | Carro 04 · GAS v1.5.111 repo |

Incidentes: `MAPA_ERROS_FALHAS_BUGS.md` I31–I34.

---

## Testes pós-deploy (readonly se loja aberta)

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\verify-gas-deploy.ps1
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1
.\scripts\testes\TESTE_FOLHA_FORMULAS_READONLY.ps1
```

Tablet (fora do pico): `TESTE_TABLET_F5_F7_F10_F11.ps1`
