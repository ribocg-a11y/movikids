# Deploy GAS v1.5.75 — FASE 6 Cockpit executivo

## Regra de ouro

**Arquivo canônico no PC (copiar deste arquivo — header v1.5.75):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Opção A — clasp (recomendado após alteração no repo):**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\deploy-gas.ps1
```

**Opção B — colar manualmente no editor:**

1. Explorer → cole o caminho do `.gs` na barra → Enter → duplo clique  
2. Ctrl+A → Ctrl+C  
3. [Editor Apps Script](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit) → **Código.gs** → Ctrl+A → Ctrl+V → Salvar  

**Publicar (obrigatório — senão produção continua v1.5.74):**

1. **Implantar → Gerenciar implantações**  
2. Editar implantação Web (**Deploy ID `AKfycbwakQ...`**)  
3. **Nova versão** → Implantar  
4. **Nunca** `clasp deploy` · **Nunca** criar deploy novo  

| Link | URL |
|------|-----|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping produção** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **App FE (após push Pages)** | https://ribocg-a11y.github.io/movikids/?force=1.8.0 |
| **Planilha** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |

**Deploy ID único (não trocar):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda (v1.5.75 + FE v1.8.0)

| Camada | Entrega |
|--------|---------|
| **GAS** | `kpiMes` → `narrativaExecutiva` (parágrafo executivo PT) |
| **GAS** | `ocupacaoMediaFrota` + objeto `cockpit` (delta fat %, payback %, etc.) |
| **GAS** | PDF executivo — bloco **Leitura executiva do mês** |
| **FE v1.8.0** | Dashboard — faixa `#mk-exec-cockpit` (5 KPIs + narrativa + badge) |
| **FE** | `renderDashboardCore_` — KPIs renderizam mesmo sem Chart.js |

**Versões pareadas:** GAS **v1.5.75** · FE **v1.8.0** · `sw.js` **1.8.0**

---

## Frontend (GitHub Pages)

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\pre-push-check.ps1
# commit + push main quando aprovado
```

Arquivos FE desta fase: `index.html`, `mk-admin.js`, `mk-app.css`, `mk-version.js`, `sw.js`

---

## Testes após Nova versão Web

Ping deve retornar `"versao": "v1.5.75"`.

```powershell
.\scripts\testes\TESTE_FASE6_COCKPIT_READONLY.ps1
.\scripts\testes\TESTE_KPI_MES_READONLY.ps1
```

**Validação visual (PC admin):**

1. Abrir `?force=1.8.0` → login admin (PIN)  
2. **Dashboard** → topo: **Cockpit executivo** com 5 cards + parágrafo narrativo  
3. Trocar mês no seletor → narrativa atualiza  

**Tablet balcão:** sem mudança obrigatória (FASE 6 só gestão).

---

## Critério de pronto

- [ ] `deploy-gas.ps1` executado (ou colar manual confirmado)  
- [ ] **Nova versão Web** publicada pelo humano  
- [ ] Ping → **v1.5.75**  
- [ ] `TESTE_FASE6_COCKPIT_READONLY.ps1` → ok  
- [ ] FE v1.8.0 no Pages (`?force=1.8.0`)  
- [ ] Cockpit visível no Dashboard admin  

---

## Referências

- Plano: `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md` § FASE 6  
- Deploy mestre: `DEPLOY_GAS_v1.5.32_AUTH.md`  
- Handoff: `HANDOFF_NOVO_CHAT.md`
