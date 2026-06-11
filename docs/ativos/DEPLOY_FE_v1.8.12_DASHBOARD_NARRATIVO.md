# Deploy FE v1.8.12 — Dashboard narrativo (capítulos 1–5)

**Data:** 10/06/2026  
**Pacote:** v1.8.11 (reorganização) + v1.8.12 (legibilidade) + v1.8.13 (narrativa CLT)

| Item | Valor |
|------|-------|
| Versão | **v1.8.14** (`mk-version.js` = `sw.js`) |
| URL teste | https://ribocg-a11y.github.io/movikids/?force=1.8.14 |
| GAS pareado | **v1.5.81** — `DEPLOY_v1.5.81_FOLHA_PROPORCIONAL.md` |
| Cache bust | `index.html` — todos os `?v=1.8.12` |

---

## O que mudou

### v1.8.11 — Narrativa Dashboard
- Seções **1→5** com ordem de leitura (panorama → lucro/meta → alertas → detalhe → tendência)
- Painel **`#mk-dash-decisao`**: lucro e break-even **sem vs com folha**
- Break-even com folha promovido a KPI (`#mk-lead-be-folha`)
- Label **“Lucro líquido · sem folha”** no cockpit

### v1.8.12 — Legibilidade
- CSS `header` global limitado a **`#app > header`** (não pinta capítulos de azul)
- Capítulos: fundo branco, texto escuro, faixa azul à esquerda
- **Média loc/dia** corrigida (usa `nMes/diasOperando`, não `mediaDiaria` que é R$/dia)

### v1.8.13 — Narrativa
- Remove bloco CLT duplicado do texto amarelo do cockpit (já está na seção 2)

---

## Mapa KPI (resposta rápida)

| Pergunta | Seção | Elemento |
|----------|-------|----------|
| Lucro **sem folha** | 1 | Cockpit “Lucro líquido · sem folha” |
| Lucro **com folha** | 2 | Coluna direita “Lucro líquido c/ folha” |
| Meta loc/dia **sem folha** | 2 | Coluna esquerda “Meta locações/dia” |
| Meta loc/dia **com folha** | 2 | Coluna direita “Meta locações/dia c/ folha” |
| Contratar CLT? | 2 | Painel “Checklist — posso contratar CLT?” |

---

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `index.html` | `#mk-dash-narrative`, `#mk-dash-decisao`, capítulos 1–5 |
| `mk-admin.js` | `renderDecisaoPanel_`, ordem render, narrativa CLT |
| `mk-app.css` | `.mk-dash-chapter-*`, `#app > header` |
| `mk-version.js` / `sw.js` | **1.8.12** |

---

## Homologação visual

1. Login admin → **Dashboard** → Junho/2026
2. Seção 1: títulos **legíveis** (fundo branco, não faixa azul escura)
3. Seção 2: comparativo sem/com folha + média **~27 loc/dia** (não 559)
4. Texto amarelo cockpit **sem** parágrafo CLT duplicado (v1.8.13)
5. Sidebar: **FE 1.8.12** ou **1.8.13**

---

## Commits

| Commit | Descrição |
|--------|-----------|
| `31b311f` | v1.8.11 — capítulos narrativos |
| `45c1f72` | v1.8.12 — legibilidade + média loc/dia |
