# Deploy GAS v1.5.76 — FASE 7 Leading financeiros (+ FASE 6 cockpit)

**Pacote:** GAS **v1.5.76** inclui **v1.5.75** (cockpit) se ainda não publicou.  
**FE pareado em produção:** **v1.8.2** (FASE 6–7 + hotfix **I22** Home) — ver `DEPLOY_FE_v1.8.2_HOTFIX_I22.md`.

---

## Regra de ouro

**Arquivo canônico no PC (copiar deste arquivo — header v1.5.76):**

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

**Publicar (obrigatório — senão produção continua v1.5.74 ou anterior):**

1. **Implantar → Gerenciar implantações**  
2. Editar implantação Web (**Deploy ID `AKfycbwakQ...`**)  
3. **Nova versão** → Implantar  
4. **Nunca** `clasp deploy` · **Nunca** criar deploy novo  

| Link | URL |
|------|-----|
| **Editor GAS** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Ping produção** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **App FE (produção)** | https://ribocg-a11y.github.io/movikids/?force=1.8.2 |
| **Planilha** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |

**Deploy ID único (não trocar):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## O que muda (v1.5.76 + FE v1.8.2)

| Camada | Entrega |
|--------|---------|
| **GAS v1.5.75** (incluído) | `kpiMes.narrativaExecutiva`, `ocupacaoMediaFrota`, `cockpit` |
| **GAS v1.5.76** | `kpiMes.leadingFinanceiro` (ticket, R$/h, custo/loc, break-even, sensibilidade) |
| **GAS** | `resumoDia.leadingDia` (meta break-even vs locações hoje) |
| **FE v1.8.0–1.8.1** | Dashboard cockpit + linha leading; Caixa chip break-even |
| **FE v1.8.2** | Hotfix I22 — `index.html` (remove `</div>` extra); **obrigatório no tablet** |

**Versões pareadas:** GAS **v1.5.76** · FE **v1.8.2** · `sw.js` **1.8.2**

---

## Frontend (GitHub Pages)

**Regra 14 (I22):** antes de push que altere `index.html`, rodar `.\scripts\check-operacao-livre.ps1` (0 locações Ativa/Pendente), salvo hotfix P0 aprovado.

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\check-operacao-livre.ps1
.\scripts\pre-push-check.ps1
# commit + push main quando aprovado
```

Arquivos FE FASE 6–7: `index.html`, `mk-admin.js`, `mk-app.css`, `mk-version.js`, `sw.js`  
Hotfix I22: commit `f2574da` — já em `main`.

---

## Testes após Nova versão Web

Ping deve retornar `"versao": "v1.5.76"`.

```powershell
.\scripts\testes\TESTE_FASE6_COCKPIT_READONLY.ps1
.\scripts\testes\TESTE_FASE7_LEADING_READONLY.ps1
.\scripts\testes\TESTE_KPI_MES_READONLY.ps1
```

**Validação visual (PC admin):**

1. Abrir `?force=1.8.2` → login admin (PIN)  
2. **Dashboard** → **Cockpit executivo** (5 KPIs + narrativa)  
3. **Dashboard** → linha **Leading financeiros** + sensibilidade  
4. **Caixa** → chip break-even do dia  

**Tablet balcão (obrigatório pós v1.8.2):**

1. `?force=1.8.2` ou reinstalar PWA  
2. **Home** — sessões, sync, Nova locação (F0)  
3. FASE 6–7 **não** exigem mudança de fluxo no operador — só confirmar Home ok  

---

## Critério de pronto

- [ ] `deploy-gas.ps1` executado (ou colar manual confirmado)  
- [ ] **Nova versão Web** publicada pelo humano  
- [ ] Ping → **v1.5.76**  
- [ ] `TESTE_FASE6` + `TESTE_FASE7` → ok  
- [ ] FE **v1.8.2** no Pages (`?force=1.8.2`)  
- [ ] Tablet Home ok (I22)  
- [ ] Cockpit + leading visíveis no Dashboard admin  

---

## Referências

- FASE 6 deploy: `DEPLOY_v1.5.75_FASE6_COCKPIT.md`  
- Hotfix FE: `DEPLOY_FE_v1.8.2_HOTFIX_I22.md`  
- Incidente I22: `../arquivo/incidentes/INCIDENTE_I22_HOME_FORA_DO_AR_FASE6_HTML_2026-06-09.md`  
- Plano: `PLANO_FASES_6_15_COCKPIT_EXECUTIVO_2026-06.md` § FASE 6–7  
- Deploy mestre: `DEPLOY_GAS_v1.5.32_AUTH.md`  
- Handoff: `HANDOFF_NOVO_CHAT.md`
