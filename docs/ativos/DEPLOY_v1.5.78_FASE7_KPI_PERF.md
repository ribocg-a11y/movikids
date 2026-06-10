# Deploy GAS v1.5.78 + FE v1.8.5 — Dashboard KPI performance (pós-I23)

**Pacote:** GAS **v1.5.78** inclui **v1.5.77** (resumoDia leve) + **v1.5.76** (leading) + **v1.5.75** (cockpit) se ainda não publicou.  
**FE pareado:** **v1.8.5** — complemento I23 (Dashboard ainda lento com `"Calculando..."`).

**Incidente:** complemento **I23** — `INCIDENTE_I23_DASHBOARD_LENTO_TRAVADO_2026-06-09.md` § complemento v1.5.78.

---

## Regra de ouro

**Arquivo canônico no PC (copiar deste arquivo — header v1.5.78):**

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

**Publicar (obrigatório — senão produção continua v1.5.77 ou anterior):**

1. **Implantar → Gerenciar implantações**  
2. Editar implantação Web (**Deploy ID `AKfycbwakQ...`**)  
3. **Nova versão** → Implantar  
4. **Nunca** `clasp deploy` · **Nunca** criar deploy novo  

| Link | URL |
|------|-----|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping produção** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **App FE (produção)** | https://ribocg-a11y.github.io/movikids/?force=1.8.5 |
| **Planilha** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |

**Deploy ID único (não trocar):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda (v1.5.78 + FE v1.8.5)

### Causa raiz (GAS)

`buildKpiMesPayload_` lia LOCAÇÕES **3×** e CUSTOS **2×** por request (`calcResumoDiaCore_`, `calcPaybackAcumulado_`, loop principal).

### Correções

| Camada | Entrega |
|--------|---------|
| **GAS v1.5.78** | Leitura **única** LOCAÇÕES + CUSTOS; payback via `calcPaybackAcumuladoCore_(fatBy, cusBy)` |
| **GAS v1.5.78** | `kpiMes&lite=1` — pula scan AUDITORIA (Pacote F); flag `lite: true` na resposta |
| **GAS v1.5.78** | Cache `CacheService` 90s por mês/lite |
| **FE v1.8.5** | Cache `sessionStorage` 5 min (stale-while-revalidate) |
| **FE v1.8.5** | Fase 1 `lite=1` → KPIs/CTO/cockpit; fase 2 `kpiMes` completo → operador/cancelamentos |
| **FE v1.8.5** | `renderDashboardCore_` imediato; gráficos em `requestAnimationFrame`; timeout 45s |

**Versões pareadas:** GAS **v1.5.78** · FE **v1.8.5** · `sw.js` **1.8.5**

**Não mexeu:** balcão, `api()` escritas, auth, cronômetro, portal, Home operador.

---

## Frontend (GitHub Pages)

**Regra 14 (I22):** antes de push que altere `index.html`, rodar `.\scripts\check-operacao-livre.ps1` (0 locações Ativa/Pendente), salvo hotfix P0 aprovado.

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\check-operacao-livre.ps1
.\scripts\pre-push-check.ps1
# commit + push main quando aprovado
```

Arquivos FE: `mk-admin.js`, `mk-app.css`, `mk-version.js`, `sw.js`, `index.html` (cache-bust)  
Detalhe FE: `DEPLOY_FE_v1.8.5_DASHBOARD_PERF.md`

---

## Testes após Nova versão Web

Ping deve retornar `"versao": "v1.5.78"`.

```powershell
.\scripts\testes\TESTE_KPI_MES_READONLY.ps1
.\scripts\testes\TESTE_FASE6_COCKPIT_READONLY.ps1
.\scripts\testes\TESTE_FASE7_LEADING_READONLY.ps1
.\scripts\testes\TESTE_RESUMO_DIA_READONLY.ps1
```

**Validação visual (PC admin):**

1. Abrir `?force=1.8.5` → login admin (PIN)  
2. **Dashboard** — KPIs e CTO preenchem em **&lt;5s** (primeira vez); não ficar eterno em `"Calculando..."`  
3. Reabrir Dashboard — dados **instantâneos** (cache) + indicador “atualizando…”  
4. Após ~3–8s — blocos operador/cancelamentos completos  
5. Cockpit + leading intactos (FASE 6–7)

**Tablet balcão (smoke pós FE):**

1. `?force=1.8.5`  
2. **Home F0** — sessões, sync ok (sem regressão I22)  
3. FASE perf **não** exige mudança operador — só confirmar Home ok  

---

## Critério de pronto

- [ ] `deploy-gas.ps1` executado (ou colar manual confirmado)  
- [ ] **Nova versão Web** publicada pelo humano  
- [ ] Ping → **v1.5.78**  
- [ ] `TESTE_KPI_MES_READONLY` + FASE 6/7 → ok  
- [ ] FE **v1.8.5** no Pages (`?force=1.8.5`)  
- [ ] Dashboard admin — KPIs &lt;5s primeira carga; cache na reabertura  
- [ ] Tablet Home ok (Regra 14)  

---

## Referências

- I23: `../arquivo/incidentes/INCIDENTE_I23_DASHBOARD_LENTO_TRAVADO_2026-06-09.md`  
- Deploy anterior: `DEPLOY_v1.5.77_FASE7_PERF.md` · `DEPLOY_v1.5.76_FASE7_LEADING.md`  
- FE: `DEPLOY_FE_v1.8.5_DASHBOARD_PERF.md`  
- Arquitetura Dashboard: `MAPA_CODIGO_ARQUITETURA.md` §12  
- Regra 15 (mutex KPI): `REGRAS_DE_PUBLICACAO_SEGURA.md`  
- Deploy mestre: `DEPLOY_GAS_v1.5.32_AUTH.md`  
- Handoff: `HANDOFF_NOVO_CHAT.md`
