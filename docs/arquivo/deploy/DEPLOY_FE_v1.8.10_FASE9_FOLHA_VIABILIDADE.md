# Deploy FE v1.8.10 — FASE 9 Painel viabilidade CLT

**GAS pareado:** **v1.5.80** — ver `DEPLOY_v1.5.80_FASE9_FOLHA_VIABILIDADE.md`

---

## Regra de ouro — FE

| Item | Valor |
|------|-------|
| Versão | **v1.8.10** (`mk-version.js` = `sw.js`) |
| URL teste | https://ribocg-a11y.github.io/movikids/?force=1.8.10 |
| Cache bust | `index.html` — todos os `?v=1.8.10` |

**Regra 14:** `.\scripts\check-operacao-livre.ps1` antes de push.

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\check-operacao-livre.ps1
.\scripts\pre-push-check.ps1
git push origin main
```

**Ordem:** GAS v1.5.80 publicado (ping ok) **antes** de homologar FE em produção.

---

## Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `index.html` | `#mk-contratacao-panel` no Dashboard · `?v=1.8.10` |
| `mk-admin.js` | `renderContratacaoPanel_` + gates checklist |
| `mk-app.css` | Estilos semáforo contratação |
| `mk-version.js` / `sw.js` | **1.8.10** |

**Não alterou:** balcão, `mk-home.js`, `mk-api.js`, Home operador.

---

## Comportamento

- Painel **Só admin** · página Dashboard  
- Lê `kpiMes.viabilidadeContratacao` + `kpiMes.folhaPlanejamento` (GAS v1.5.80)  
- Semáforo verde/amarelo/vermelho + checklist 6 gates  
- Alertas FASE 8: `CONTRATACAO_VIAVEL` · `CONTRATACAO_AGUARDAR` · `CONTRATACAO_NAO_VIAVEL`

---

## Homologação

| # | Check |
|---|-------|
| 1 | Ping GAS → `"versao": "v1.5.80"` |
| 2 | `kpiMes` JSON contém `viabilidadeContratacao.ok` |
| 3 | Dashboard admin — painel folha + alerta `CONTRATACAO_*` |
| 4 | Leading sens — break-even com folha |
| 5 | Tablet Home F0 ok (smoke) |

---

## Referências

- GAS: `DEPLOY_v1.5.80_FASE9_FOLHA_VIABILIDADE.md`  
- FASE 8 alertas: `DEPLOY_FE_v1.8.9_FASE8_ALERTAS.md`
