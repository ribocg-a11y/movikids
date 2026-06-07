# MOVI KIDS — Acessos e autorizações

**Atualizado:** 07/06/2026  
**Função:** mapa único de **quem pode o quê** — app, infraestrutura e agente Cursor.  
**Complementa:** `ESTADO_ATUAL.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`, `DEPLOY_GAS_v1.5.32_AUTH.md`

---

## 1. Papéis no aplicativo (produção)

| Papel | Como entra | O que pode | O que não pode |
|-------|------------|------------|----------------|
| **Operador** | Nome + PIN na tela de login | Nova locação, encerrar, estender, editar, cancelar, drawer, SMS manual | KPIs financeiros do mês, Dashboard admin, custos, config frota, import CRM |
| **Administrador** | PIN **1416** (gate ou cadeado na sidebar) | Tudo do operador + Dashboard, Caixa detalhado, KPIs, payback, reset PIN, liberar sessão, corrigir financeiro, limpar testes, import RESPONSAVEIS | — |
| **Supervisor** | Perfil em `OPERADORES_SISTEMA` col. `perfil` | Código existe (v1.5.50) | **F9 PAUSADA** — em produção operadores têm autonomia total (v1.5.52 reverteu restrições) |
| **Portal responsável** | Telefone em `acompanhar.html` | Ver cronômetro, foto moldura | Sem PIN; sem dados de outros responsáveis |

**Sessão balcão:** uma sessão ativa por vez no GAS. Outro operador → 409 até ADM liberar (`liberarSessaoOperadorAdmin`).

**Chip Turno:** prova visual de operador logado — Home sozinha não basta (I19).

---

## 2. Dados financeiros e gestão (GAS v1.5.43+)

Exigem `adminPin=1416` ou `authRole=admin` no request:

| API / área | Restrição |
|------------|-----------|
| `buscarKPIsAdmin` | Só admin — payback, Pacote F, fatAno |
| `listarCustos` / custos | Só admin |
| `criarAnalise` / relatório PDF | Só admin |
| `salvarOperacaoConfigAdmin` | Só admin |
| `importarResponsaveisAdmin` | Só admin |
| Home operador | **Sem** grid KPI mensal (Pacote I) — só chip “Hoje → Caixa” |

Operador nas 5 escritas críticas: deve enviar `operador` / `operadorId` (GET no browser — I15).

---

## 3. APIs administrativas (PIN 1416)

| Ação | API GAS | Parâmetros chave |
|------|---------|------------------|
| Resetar PIN operador | `resetarPinOperadorAdmin` | `adminPin`, `operadorId` |
| Liberar sessão balcão | `liberarSessaoOperadorAdmin` | `adminPin` |
| Deslogar operador específico | `liberarSessaoOperador` | `adminPin`, `operadorId` |
| Corrigir locação encerrada | `corrigirFinanceiroLocacaoAdmin` | `adminPin`, `zerarExtra` opcional |
| Limpar locações de teste | `limparLocacoesTesteAdmin` | `adminPin`, `motivo` ≥10 chars, `soHoje` opcional |
| Import CRM (K.1) | `importarResponsaveisAdmin` | `adminPin`, `dryRun` |

**No app:** menu Administrador (PIN 1416) → Operadores → reset / liberar sessão.

**Emergência (browser local):** `scripts/liberar-eduarda-agora.html`, `scripts/liberar-milena-agora.html` — adaptar `operadorId`.

**Incidente completo:** `docs/arquivo/incidentes/INCIDENTE_AUTH_OPERADORES_2026-06-04.md`

---

## 4. Infraestrutura — quem executa cada ação

| Ação | Quem executa | Agente Cursor pode? | Notas |
|------|--------------|---------------------|-------|
| `git push` (FE → GitHub Pages) | Dev / agente | ✅ Sim | Após `pre-push-check.ps1` |
| Editar código local | Dev / agente | ✅ Sim | `.gs` canônico na raiz |
| `clasp push` | Dev / agente | ✅ Sim | Via `scripts/deploy-gas.ps1` |
| **Nova versão Web GAS** | **Só humano** | ❌ Não | Editor Google → mesmo Deploy ID `AKfycbwakQ...` |
| `clasp deploy` | **Proibido** | ❌ Nunca | Quebrou produção 04/06 (I1) |
| Atualizar tablet `?force=` | **Ops balcão** | ❌ Não | Físico no shopping |
| Editar planilha base | Dono conta Google | ⚠️ Agente orienta | Link em `ESTADO_ATUAL.md` |
| Script Properties SMS | Dono projeto GAS | ⚠️ Agente orienta | Valores em `ESTADO_ATUAL.md` § Script Properties |
| Gateway SMS envio | Ops manual / GAS | Parcial | F4 auto **pausado** — QR portal é canal oficial |
| Commit com segredos | — | ❌ Nunca | Sem `.env`, tokens, senhas novas no git |

---

## 5. Contas e URLs (sem senhas neste doc)

| Recurso | Onde está |
|---------|-----------|
| **GitHub** | `ribocg-a11y/movikids` · branch `main` · Pages automático no push |
| **Repo local** | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` |
| **Apps Script** | Projeto `19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8` — link em `DEPLOY_GAS_v1.5.32_AUTH.md` |
| **Web App exec** | Deploy `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |
| **Planilha** | `MOVIKIDS_Planilha_Base` — link em `ESTADO_ATUAL.md` |
| **SMS gateway** | DJVJRL — credenciais nas **Script Properties** do GAS (ver `ESTADO_ATUAL.md`) |
| **URL morta** | `AKfycbzc...` — **não usar** (404) |

**Conta Google:** o humano dono do projeto GAS e da planilha é quem autoriza deploy Web e compartilhamento. O agente **não tem** login Google — só prepara código e instrui.

---

## 6. Portal do responsável

| Item | Regra |
|------|-------|
| Autenticação | Telefone cadastrado — sem PIN |
| Rate limit GAS | 20 req/min por telefone, 150/min global (v1.5.54) |
| Dados expostos | Só locações daquele telefone |
| QR balcão | Canal oficial (F4 WhatsApp auto pausado) |

---

## 7. Agente Cursor vs você — matriz completa

Esta seção responde: **o que o agente faz sozinho, o que valida, o que publica e o que só você faz.**

### 7.1 O que configuramos para o agente (acessos no seu PC)

| Acesso / ferramenta | Onde está | Para quê |
|---------------------|-----------|----------|
| **Pasta do repo** | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` | Ler e editar todo o código e docs |
| **Terminal (PowerShell)** | Cursor integrado | `git`, `.\scripts\pre-push-check.ps1`, testes `scripts/testes/`, ping GAS |
| **Regras Cursor** | `.cursor/rules/*.mdc` | Handoff, GAS caminho PC, proibir POST browser, design DNA |
| **Git local + remote** | `.git` → `ribocg-a11y/movikids` | `status`, `diff`, `commit`, `push` (push pode pedir sua aprovação no Cursor) |
| **Clasp** | `.clasp.json` → projeto `19SIhkX9...` | `clasp push` via `scripts/deploy-gas.ps1` — **se** `clasp login` já estiver feito no PC |
| **GitHub CLI (`gh`)** | Instalado no PC (se configurado) | PRs, issues, checks — quando você pedir tarefa GitHub |
| **HTTP público GAS** | URL `exec?action=...` | Ping, testes readonly nos `.ps1` — **sem login Google** |
| **Browser MCP** | Cursor | Abrir GitHub Pages, URLs públicas — **não** loga na sua conta Google |
| **AGENTS.md + HANDOFF** | Raiz e `docs/ativos/` | Entrada automática em todo chat novo na pasta |

**O agente NÃO tem:** login Google, editor Apps Script, planilha Sheets, tablet do balcão, conta WhatsApp/SMS.

---

### 7.2 EU (agente) — faço sozinho

Sem precisar que você cole caminhos, versões ou docs:

| Ação | Como |
|------|------|
| Ler handoff, prioridades, estado, regras, este arquivo | Abrir `docs/ativos/` |
| Explorar e editar código | `index.html`, `.gs`, `mk-*.js`, `sw.js`, docs |
| Rodar validação local | `.\scripts\pre-push-check.ps1` |
| Rodar testes HTTP readonly | `scripts/testes/TESTE_*.ps1` |
| Validar versão no código | `mk-version.js`, header `.gs`, `sw.js` |
| Validar GAS no ar (leitura) | `Invoke-RestMethod` no `?action=ping` |
| Preparar deploy GAS | `.\scripts\deploy-gas.ps1` → `clasp push` (código no Google, **não** publica Web) |
| Informar caminho do `.gs` no PC | Regra `gas-deploy-caminho-pc.mdc` |
| Criar branch, `git add`, `git commit` | Quando você pedir commit |
| Abrir app público no browser MCP | `ribocg-a11y.github.io/movikids/?force=...` |

---

### 7.3 EU (agente) — faço só se você pedir explicitamente

| Ação | Por quê pedir |
|------|----------------|
| `git push` para `main` | Publica FE no GitHub Pages — impacto produção |
| `git commit` | Sua regra: commit só quando você pede |
| `clasp push` | Envia código ao Google — você confirma que quer |
| Mudar `api()`, auth, PIN, perfis | Zona crítica (I15, I17–I19) |
| Limpar locações / corrigir financeiro em prod | APIs com `adminPin=1416` — impacto real |
| Criar PR (`gh pr create`) | Publicação no GitHub |
| Reativar F4 ou F9 | Explicitamente pausados |

O Cursor pode **pedir sua aprovação** num card antes de `push` na `main` — isso é normal.

---

### 7.4 EU (agente) — valido vs não valido

| Posso validar sozinho | Não substitui você |
|----------------------|-------------------|
| Ping GAS (`versao`, `ok`) | **Nova versão Web** no editor — ping só muda depois disso |
| `pre-push-check.ps1` verde | Tablet físico no balcão |
| Testes `.ps1` (HTTP servidor) | Nova locação real no tablet (I15) |
| Versões alinhadas no repo | Cache PWA / ícone instalado no tablet |
| App no browser MCP (desktop) | Chip Turno, operador logado no tablet |
| Sintaxe / lints nos arquivos editados | Planilha INVESTIMENTO / CONFIG preenchida corretamente |

**Regra:** teste PowerShell POST/GET **não prova** o tablet — checklist manual continua obrigatório.

---

### 7.5 EU (agente) — publico vs preparo

| Etapa | Quem publica de fato |
|-------|----------------------|
| **Frontend** (GitHub Pages) | Agente faz `git push` **se você pediu** → Pages atualiza sozinho |
| **GAS código** no projeto Google | Agente pode `clasp push` **se você pediu** |
| **GAS Web App em produção** | **Só você** — Editor → Implantar → Nova versão → mesmo Deploy ID |
| **Tablet na versão nova** | **Só você / Ops** — `?force=versão` ou reinstalar PWA |

Fluxo típico: **agente prepara** → **você publica GAS** (1 clique Nova versão) → **você confirma tablet**.

---

### 7.6 VOCÊ — sempre seu (agente não substitui)

| Ação | Onde |
|------|------|
| **Nova versão Web GAS** | [Editor Apps Script](https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit) → Implantar → `AKfycbwakQ...` |
| **Colar `.gs` manualmente** | Alternativa ao clasp — Ctrl+A no arquivo do PC → Código.gs |
| **Tablet balcão** | Abrir `?force=1.7.64`, chip Turno, teste lançamento |
| **Planilha** | MOVIKIDS_Planilha_Base — INVESTIMENTO, OPERADORES, CONFIG |
| **Script Properties SMS** | Projeto GAS → Configurações → Propriedades |
| **Aprovar push / comandos sensíveis** | Card de aprovação do Cursor quando aparecer |
| **`clasp login`** (se expirar) | Terminal no seu PC — uma vez |

---

### 7.7 NUNCA (nem agente nem você)

| Proibido | Motivo |
|----------|--------|
| `clasp deploy` | I1 — quebrou URL / caixa |
| Novo Deploy ID GAS | Regra 8 — usar só `AKfycbwakQ...` |
| POST JSON no `api()` do browser | I15 — quebra tablet |
| Commitar senhas / tokens novos | Segurança |

---

## 8. Resumo em uma frase (novo chat)

**Agente:** código, docs, testes, ping, preparar push/clasp — **você:** Nova versão GAS, tablet, planilha, OK de publicação.

---

## 9. Checklist rápido para novo chat

1. **Operação balcão** = operador + PIN; **gestão** = admin 1416.
2. **Publicar FE** = agente com seu pedido; **publicar GAS Web** = você no editor.
3. **Tablet** = você/Ops; agente documenta e valida ping/repo.
4. **Supervisor e WhatsApp auto** = pausados.
5. **Matriz completa** = seção 7 deste arquivo.

---

*Revisar ao mudar auth, deploy, clasp ou ferramentas do Cursor.*
