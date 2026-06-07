# MOVI KIDS — Mapa do código e arquitetura

**Atualizado:** 07/06/2026  
**Função:** anatomia do sistema — o que é cada parte, o que liga com o quê, o que é zona sensível.  
**Complementa:** `ESTADO_ATUAL.md`, `ACESSOS_E_AUTORIZACOES.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`, `MAPA_ERROS_FALHAS_BUGS.md`

---

## 1. Analogia do corpo humano

| Parte | O que é no MOVI KIDS | Arquivos / camada |
|-------|----------------------|-------------------|
| **Cérebro** | Regras de negócio, dados, financeiro, auth servidor | `MOVIKIDS_Code_...gs` (GAS) + planilha `MOVIKIDS_Planilha_Base` |
| **Coração** | Pulso operacional — sync balcão, timer, locações ativas | `carregarInicio` (GAS) + `syncController` (index.html) + Firebase `sessoes` |
| **Sistema nervoso** | Comunicação FE ↔ GAS | `api()` em `index.html` + `doGet`/`dispatchMoviAction_` (GAS) |
| **Rosto / identidade** | Versão, URL GAS, cache | `mk-version.js`, `sw.js`, bloco anti-stale no `index.html` |
| **Imunológico** | Travas P0, CI, incidentes | `pre-push-check.ps1`, `.cursor/rules/`, `REGRAS_DE_PUBLICACAO_SEGURA.md` |
| **Mãos (braços)** | Ações do operador no balcão | Nova locação, drawer, encerrar, SMS manual — `index.html` + 5 escritas GAS |
| **Olhos (gestão)** | KPIs, payback, relatório | Dashboard, Caixa admin — `buscarKPIsAdmin` (GAS) + páginas admin no FE |
| **Pernas (canais externos)** | Portal pais, foto, cronômetro curto | `acompanhar.html`, `foto-moldura.html`, `track.html` |
| **Pele** | Visual único | `mk-design.css`, tokens em `index.html` + Pacote A DNA |
| **Porta de entrada** | Quem pode entrar | `mk-auth.js` — operador PIN, admin 1416, chip Turno |
| **Dedos finos** | Scripts pontuais, emergência, testes | `scripts/testes/`, `scripts/liberar-*.html`, `google-drive-sheets-auth` |

**Monólito consciente:** o “corpo” principal (`index.html` ~8,5k linhas) concentra UI + lógica. Braços e pernas (`mk-auth.js`, portais) foram separados onde o risco era alto (auth, I15, I19).

---

## 2. Mapa de arquivos (raiz)

```
movikids-github/
├── CÉREBRO + NERVOSO
│   └── MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs   ← único GAS canônico
├── CORAÇÃO + MÃOS (balcão)
│   ├── index.html          ← app principal (UI + api + páginas + sync)
│   ├── mk-auth.js          ← auth operadores/admin (extraído v1.7.48+)
│   ├── mk-update.js        ← reload seguro pós-update
│   ├── mk-version.js       ← versão FE + URL GAS
│   └── sw.js               ← PWA cache
├── PERNAS (outros canais)
│   ├── acompanhar.html     ← portal responsável
│   ├── foto-moldura.html
│   └── track.html          ← cronômetro curto
├── PELE
│   └── mk-design.css
├── CONFIG deploy
│   ├── gas-endpoint.json   ← override URL GAS (fallback)
│   ├── manifest.json
│   └── gas/ + .clasp.json  ← clasp push (Code.gs gerado)
├── IMUNOLÓGICO
│   └── scripts/pre-push-check.ps1
├── DEDOS (testes / ops)
│   └── scripts/testes/*.ps1
├── ARQUIVO (não implantar)
│   └── arquivo-historico/*.gs
└── DOCUMENTAÇÃO
    └── docs/ativos/        ← processos, handoff, este mapa
```

---

## 3. O que conecta com o quê

```mermaid
flowchart TB
  subgraph FE["Frontend GitHub Pages"]
    MV[mk-version.js]
    AUTH[mk-auth.js]
    IDX[index.html api sync pages]
    SW[sw.js]
    PORT[acompanhar.html]
  end
  subgraph GAS["Apps Script v1.5.63"]
    RT[dispatchMoviAction_]
    SH[(Planilha Sheets)]
    PS[PropertiesService sessão]
    SMS[SMS Gateway]
  end
  subgraph RTDB["Firebase RTDB"]
    SESS[sessoes]
  end
  MV --> IDX
  AUTH --> IDX
  IDX -->|GET ?action=| RT
  RT --> SH
  RT --> PS
  RT --> SMS
  RT --> SESS
  SESS -->|onValue| IDX
  PORT -->|GET buscarPortalResponsavel| RT
```

### Contrato FE → GAS

| Elo | Onde | Deve estar alinhado com |
|-----|------|-------------------------|
| URL exec | `mk-version.js` `MK_GAS_EXEC_URL` | `.gs` `DEPLOY_ID` / `WEBAPP_URL` |
| Versão FE | `mk-version.js` `MK_VERSION` | `sw.js` `SW_VERSION`, `?force=` tablet |
| Versão GAS | header `.gs` + `ping` | Produção após Nova versão Web |
| Escritas balcão | `api()` GET + 5 actions | `WRITE_ACTIONS_CRITICAS_` no GAS |
| Operador nas escritas | `operadorApiParams_()` | GAS valida `operador`/`operadorId` |
| Admin financeiro | `adminPin=1416` | `ADMIN_PIN_PLAIN`, `isAdminRequest_` |
| Dados mestres | `SHEET_ID` no `.gs` | Planilha `1ULMUx8AqZkZ75Ed0iRK...` |

### Sync em tempo real (3 canais)

| Canal | Função |
|-------|--------|
| **Poll** | `carregarInicio` a cada 5–15s |
| **Firebase** | `sessoes` → atualiza cards/timer sem esperar poll |
| **BroadcastChannel** | Abas do mesmo tablet sincronizadas |

---

## 4. Partições no GAS (`.gs`)

| Seção | Linhas ~ | Responsabilidade |
|-------|---------|------------------|
| Constantes | 60–125 | `SHEET_ID`, `DEPLOY_ID`, preços, veículos, PIN admin |
| Router | 252–361 | `doGet`, `doPost`, `dispatchMoviAction_` — **porta de tudo** |
| Locações | 472–948 | CRUD locação + auditoria |
| KPIs / Payback | 1011–1605 | Dashboard, investimento, Pacote F |
| Balcão sync | 1606–1817 | `carregarInicio`, timer |
| CRM / Portal | 2589–3032 | Responsáveis, portal, import K.1 |
| SMS | 3033–3660 | Gateway DJVJRL |
| Auth operadores | 3974–4560 | PIN, sessão única, APIs admin |

**Regra:** nova `action` → registrar em `dispatchMoviAction_` + documentar se é escrita crítica.

---

## 5. Partições no Frontend (`index.html`)

| Bloco | Conteúdo |
|-------|----------|
| Head anti-stale | Força `mk-version.js` fresco antes do cache |
| CSS inline | ~1.400 linhas — design embutido (Pacote A legado) |
| Firebase module | Listener `sessoes` |
| `api()` + guards | **Zona P0** — I15 |
| `syncController` | Poll + merge com Firebase |
| Páginas `#page-*` | Home, Nova, Dashboard, Caixa, Admin, … |
| Drawer Pacote D | Encerrar / estender / editar / cancelar |
| Inline boot | `mkAuthBoot()`, register SW |

**Extraídos (bem definidos):** `mk-auth.js`, `mk-version.js`, `mk-update.js`, `mk-design.css`.

**Dívida consciente:** `index.html` monolítico — aceito até equipe crescer (ver `PLANO_PRIORIDADES` §6).

---

## 6. Fluxo de processo (desenvolvimento → produção)

```
1. PLANO_PRIORIDADES     → o que fazer (fase ativa)
2. Escopo + arquivos     → REGRAS Regra 1 (o que pode / não pode mexer)
3. Código local          → agente ou você
4. pre-push-check.ps1    → versões, guards I15–I19
5. Testes .ps1           → conforme área (HTTP, portal, cronômetro)
6. git push (se pedido)  → GitHub Pages (FE)
7. clasp push (se pedido)→ código no projeto GAS
8. Nova versão Web       → SÓ VOCÊ no editor Google
9. Tablet ?force=        → SÓ VOCÊ / Ops
10. Atualizar HANDOFF    → versões + checklist
```

**Diretrizes claras:** `REGRAS_DE_PUBLICACAO_SEGURA.md` (12 regras), `.cursor/rules/`, `ACESSOS_E_AUTORIZACOES.md`.

---

## 7. Chaves mestras — mexeu, pode quebrar tudo

| # | Zona | Arquivo | Efeito se errar |
|---|------|---------|-----------------|
| **K1** | `api()` + GET guard | `index.html` | Tablet: *Erro de conexão* em lançamento (I15) |
| **K2** | `MK_GAS_EXEC_URL` / `DEPLOY_ID` | `mk-version.js`, `.gs` | 404, caixa morto (I1) |
| **K3** | `SHEET_ID` | `.gs` L61 | Dados errados ou vazios |
| **K4** | `ADMIN_PIN` 1416 | `.gs`, `mk-auth.js` | Admin e financeiro bloqueados |
| **K5** | Sessão única balcão | `.gs` PropertiesService + `mk-auth.js` | 409, trava operador (I17, I19) |
| **K6** | `mk-version` = `sw.js` | `mk-version.js`, `sw.js` | Tablet em versão fantasma |
| **K7** | `clasp deploy` | terminal | URL morta — **proibido** |
| **K8** | SMS Script Properties | GAS (não no repo) | SMS para de enviar |
| **K9** | `hashPin_` / OPERADORES | `.gs` + aba planilha | Login operador quebrado |
| **K10** | Paridade cronômetro | `timestampCanonico_` GAS + portal | Timer divergente (I16) |

---

## 8. Zonas sensíveis — exigem confirmação explícita

Antes de alterar, **declarar escopo** (Regra 1) e **pedir OK** do responsável:

| Zona | Por quê | Validar com |
|------|---------|-------------|
| `api()`, `mkGuardEscritaBrowser_` | P0 operação balcão | `TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` + **tablet** |
| `mk-auth.js` (sessão, idle, reconcile) | I17, I18, I19 | Tablet + chip Turno |
| `DEPLOY_ID` / URLs GAS | Produção inteira | ping + Regra 9 |
| `ADMIN_PIN` / APIs admin | Segurança financeira | Homologação admin |
| `encerrarLocacao` / financeiro | Caixa real | Nunca só PowerShell |
| `limparLocacoesTesteAdmin` / planilha limpa | Dados produção | Motivo + dry-run |
| `importarResponsaveisAdmin` | CRM 240 cadastros | `dryRun=1` primeiro |
| SMS gateway / credenciais | Comunicação pais | Envio teste controlado |
| Firebase config | Sync tempo real | Balcão + portal mesma locação |
| `OPERADORES_SISTEMA` na planilha | PIN hash | `resetarPinOperadorAdmin` preferível |

**Pode evoluir com mais liberdade:** textos UI, cores (DNA), KPIs só leitura admin, docs, testes readonly.

---

## 9. Mapa de métricas (Pacote I — uma métrica, um lugar)

| Métrica | Lugar canônico |
|---------|----------------|
| Faturamento **hoje** (detalhe) | **Caixa** |
| Chip “Hoje” na Home | Atalho → Caixa |
| Faturamento **mês**, CTO, payback, Pacote F | **Dashboard** |
| Contagem ativas/encerradas hoje | **Home** stats-bar |
| Diagnóstico técnico | **Sistema** |

Duplicar KPI em Home operador = **proibido** (Pacote I).

---

## 10. Resposta rápida: estamos 100% organizados no código?

| Aspecto | Status |
|---------|--------|
| Processos publicar / handoff / acessos | ✅ Documentados |
| Arquivos canônicos na raiz | ✅ Limpos (onda 2) |
| Partições GAS | ✅ Seções lógicas no `.gs` |
| Partições FE | 🟡 `mk-auth` separado; `index.html` ainda monolito |
| Mapa conexões FE↔GAS↔planilha | ✅ **este arquivo** |
| Chaves mestras + zonas sensíveis | ✅ §7 e §8 |
| Diagrama único | ✅ §3 (mermaid) |

**Honesto:** fluxo e diretrizes estão claros; anatomia agora está mapeada; a **dívida** é o monólito `index.html` — risco aceito, não é bagunça.

---

*Revisar ao extrair novo módulo do `index.html` ou ao adicionar `action` no GAS.*
