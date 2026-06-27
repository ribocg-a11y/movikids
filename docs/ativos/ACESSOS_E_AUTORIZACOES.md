# MOVI KIDS — Acessos e autorizações

**Atualizado:** 27/06/2026 (roteiro agente I24 · FE v1.9.2)  
**Função:** mapa único de **quem pode o quê** — app, infraestrutura e agente Cursor.  
**Complementa:** `ESTADO_ATUAL.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`, `DEPLOY_GAS_v1.5.32_AUTH.md`

---

## 1. Papéis no aplicativo (produção)

| Papel | Como entra | O que pode | O que não pode |
|-------|------------|------------|----------------|
| **Operador** | Nome + PIN na tela de login | Nova locação, encerrar, estender, editar, cancelar, drawer · **comunicação: QR portal** (sem SMS/WA) | KPIs financeiros do mês, Dashboard admin, custos, config frota, import CRM |
| **Administrador** | PIN **1421** (`ADMIN_PIN` Script Property GAS) | Tudo do operador + Dashboard, Caixa detalhado, KPIs, payback, reset PIN, liberar sessão, corrigir financeiro, limpar testes, import RESPONSAVEIS | — |
| **Supervisor** | Perfil em `OPERADORES_SISTEMA` col. `perfil` | Código existe (v1.5.50) | **F9 PAUSADA** — em produção operadores têm autonomia total (v1.5.52 reverteu restrições) |
| **Portal responsável** | Telefone em `acompanhar.html` | Ver cronômetro, foto moldura | Sem PIN; sem dados de outros responsáveis |

**Sessão balcão:** uma sessão ativa por vez no GAS. Outro operador → 409 até ADM liberar (`liberarSessaoOperadorAdmin`).

**Chip Turno:** prova visual de operador logado — Home sozinha não basta (I19).

---

## 2. Dados financeiros e gestão (GAS v1.5.43+)

Exigem `adminPin` válido ou `authRole=admin` no request:

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

## 3. APIs administrativas (PIN admin)

**Valor atual (25/06/2026):** **1421** — Script Property `ADMIN_PIN` no GAS (fallback `ADMIN_PIN_PLAIN` no `.gs`).

| Ação | API GAS | Parâmetros chave |
|------|---------|------------------|
| Resetar PIN operador | `resetarPinOperadorAdmin` | `adminPin`, `operadorId` |
| Liberar sessão balcão | `liberarSessaoOperadorAdmin` | `adminPin` |
| Deslogar operador específico | `liberarSessaoOperador` | `adminPin`, `operadorId` |
| Corrigir locação encerrada | `corrigirFinanceiroLocacaoAdmin` | `adminPin`, `zerarExtra` opcional |
| Limpar locações de teste | `limparLocacoesTesteAdmin` | `adminPin`, `motivo` ≥10 chars, `soHoje` opcional |
| Import CRM (K.1) | `importarResponsaveisAdmin` | `adminPin`, `dryRun` |

**No app:** menu Administrador (PIN admin) → Operadores → reset / liberar sessão.

**Emergência (browser local):** `scripts/ops/liberar-eduarda-agora.html`, `scripts/ops/liberar-milena-agora.html` — adaptar `operadorId`.

**Incidente completo:** `docs/arquivo/incidentes/INCIDENTE_AUTH_OPERADORES_2026-06-04.md`

---

## 4. Infraestrutura — quem executa cada ação

| Ação | Quem executa | Agente Cursor pode? | Notas |
|------|--------------|---------------------|-------|
| `git commit` / `git push` (FE → GitHub Pages) | Dev / agente | ✅ Sim | Após `pre-push-check.ps1` — **sem pedir** (§7.3 lista fechada) |
| Editar FE / docs local | Dev / agente | ✅ Sim | `mk-*.js`, `index.html`, docs — exceto `api()`/auth (§7.3) |
| Editar `.gs` canônico | Dev / agente | ⚠️ Só com pedido | §7.3 item 4 |
| `clasp push` / `prepare-gas-push.ps1` | Dev / agente | ⚠️ Só com pedido | §7.3 item 1 — não publica Web App |
| **Nova versão Web GAS** | Sócio / agente **com pedido** | ⚠️ Só com pedido | Editor → Editar `AKfycbwakQ...` · §7.3 item 4 |
| `clasp deploy` **sem `-i`** | **Proibido** | ❌ Nunca | I1 — URL morta |
| Atualizar tablet `?force=` | **Ops balcão** | ❌ Não | Físico no shopping |
| Editar planilha base | Agente (OAuth) ou GAS | ✅ Sim | `google-drive-sheets-auth` — ver §7.8 |
| Script Properties SMS | Dono projeto GAS | ⚠️ Agente orienta | Valores em `ESTADO_ATUAL.md` § Script Properties |
| Gateway SMS envio | ⏸ **Fora da operação** (`qr_only`) | Código GAS mantido para reativação futura |
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

**Planilha Google:** o agente **tem acesso** via OAuth configurado no PC (§7.8).  
**Apps Script Web deploy:** Nova versão só com **pedido explícito** (§7.3) — Editor → **Editar** `AKfycbwakQ...`. Agente **nunca** `clasp deploy` sem `-i` nem nova implantação.

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

### 7.0 Modelo operacional — PC vs tablet balcão

| | **Computador (você + Cursor)** | **Tablet (balcão na loja)** |
|---|-------------------------------|----------------------------|
| **Quem usa** | Sócio/dev — gestão, deploy, código | Operadores — locação do dia a dia |
| **Onde fica** | Escritório / casa (Windows) | Fixo na operação (shopping) |
| **Sessão típica** | PIN admin **1416** → sidebar “Administrador” | PIN operador → “BALCÃO: Milena/Eduarda” |
| **O que o agente vê** | Repo, testes `.ps1`, browser MCP no **seu PC** | **Nada** — agente não tem o tablet físico |
| **Homologação** | Ping, protocolo HTTP, `pre-push-check` | Chip Turno, ▶ timer, idle, PWA ícone — **só no tablet** |

**Importante:** prints e relatos no chat vêm quase sempre do **computador**. Isso **não** substitui validação no tablet do balcão. Incidente I21 (idle) misturou sessão admin no PC com turno Milena no GAS — ver `INCIDENTE_I21_SESSAO_IDLE_DUAL_2026-06-09.md`.

### 7.1 O que configuramos para o agente (acessos no seu PC)

| Acesso / ferramenta | Onde está | Para quê |
|---------------------|-----------|----------|
| **Pasta do repo** | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` | Ler e editar todo o código e docs |
| **Terminal (PowerShell)** | Cursor integrado | `git`, `.\scripts\pre-push-check.ps1`, testes `scripts/testes/`, ping GAS |
| **Regras Cursor** | `.cursor/rules/*.mdc` | Handoff, GAS caminho PC, proibir POST browser, design DNA |
| **Git local + remote** | `.git` → `ribocg-a11y/movikids` | `status`, `diff`, `commit`, `push` (push pode pedir sua aprovação no Cursor) |
| **Clasp** | `.clasp.json` → projeto `19SIhkX9...` · `~/.clasprc.json` no PC | `clasp push` via `scripts/deploy-gas.ps1` (login clasp ativo) |
| **GitHub CLI (`gh`)** | Instalado no PC (se configurado) | PRs, issues, checks — quando você pedir tarefa GitHub |
| **HTTP público GAS** | URL `exec?action=...` | Ping, APIs admin (`adminPin=1416`), testes nos `.ps1` |
| **Google Sheets OAuth** | `C:\Users\riboc\Projects\google-drive-sheets-auth` | Ler/escrever **MOVIKIDS_Planilha_Base** via API — token em `~/.config/google-api/` |
| **Browser MCP** | Cursor | GitHub Pages, URLs públicas |
| **AGENTS.md + HANDOFF** | Raiz e `docs/ativos/` | Entrada automática em todo chat novo na pasta |

**O agente NÃO tem:** tablet físico do balcão, conta WhatsApp/SMS. **GAS Web:** republica via `deploy-gas.ps1` (clasp), não via cliques no editor.

---

### 7.2 EU (agente) — faço sozinho (sem pedir permissão)

**Regra (17/06/2026):** tudo abaixo pode ser feito **sem** sua autorização prévia. A **única** exceção é a lista fechada §7.3.

**Regra (25/06/2026):** o agente **executa** repair API, testes `.ps1`, `pre-push-check`, docs e planilha OAuth — **não** delega ao usuário. Ver `.cursor/rules/agente-autonomia-movikids.mdc` § "Não transferir". Único limite fixo além de §7.3: **não** colar/reimplantar Web GAS (Nova versão no Editor).

| Ação | Como |
|------|------|
| Ler handoff, prioridades, estado, regras, este arquivo | Abrir `docs/ativos/` |
| Explorar e editar **frontend** e docs | `index.html`, `mk-*.js` (exceto `api()`/auth), `sw.js`, CSS, docs |
| `git add`, `git commit`, `git push` | Ordem I24: **commit** → `pre-push-check` → push → `verify-publish-complete` → **`encerramento-sessao` exit 0** |
| Roteiro obrigatório | `docs/ativos/ROTEIRO_AGENTE_OBRIGATORIO.md` · `.cursor/rules/roteiro-agente-movikids.mdc` |
| Criar branch, PR (`gh pr create`) | Quando fizer sentido no pacote |
| Rodar validação e testes | `pre-push-check`, `protocolo-mestre`, `scripts/testes/TESTE_*.ps1` |
| Validar versão FE | `mk-version.js`, `sw.js`, `index.html ?v=` |
| Validar GAS no ar (**leitura**) | `Invoke-RestMethod` no `?action=ping` · `verify-gas-deploy.ps1` |
| Informar caminho do `.gs` no PC | Regra `gas-deploy-caminho-pc.mdc` |
| Abrir app público no browser MCP | `ribocg-a11y.github.io/movikids/?force=...` |
| **Ler e escrever planilha** | OAuth `google-drive-sheets-auth` · limpar testes · INVESTIMENTO · auditoria |
| Escritas via GAS (dados operacionais) | APIs `exec?action=...` com `adminPin=1416` · limpar/corrigir quando necessário |
| Atualizar documentação ativa | Handoff, estado, protocolos — inclusive comando **"atualize tudo"** |

O Cursor pode mostrar **card de aprovação** antes de `git push` — isso é mecânica do IDE, não substitui §7.3.

---

### 7.3 EU (agente) — lista fechada (só com seu pedido explícito)

**Decisão sócio 17/06/2026:** estas são as **únicas** ações que exigem sua permissão antes de executar. Nada fora desta lista pode ser bloqueado “por precaução”.

| # | Ação | Notas |
|---|------|-------|
| **1** | **`clasp push`** / **`prepare-gas-push.ps1`** | Envia código ao projeto Google; **não** publica a Web App sozinha |
| **2** | **Mudar `api()`, auth, PIN, perfis** | Zona crítica (I15, I17–I19); após mudança, checklist **tablet** obrigatório |
| **3** | **Reativar F4 (WhatsApp/SMS) ou F9 (supervisor)** | Pausados de propósito — QR only em produção |
| **4** | **Mudar código Apps Script** (`.gs` canônico) **ou reimplantar Nova versão Web** | Editor → **Editar** `AKfycbwakQ...` → Nova versão · nunca nova implantação · ping pós-deploy |

**Inclui no item 4:** editar `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`, incrementar header GAS, `deploy-gas-SOCIO.ps1`, colar manualmente no editor Google.

---

### 7.4 EU (agente) — valido vs não valido

| Posso validar sozinho | Não substitui você |
|----------------------|-------------------|
| Ping GAS (`versao`, `ok`) | Confirmar no browser se CLI bater login Google |
| `verify-gas-deploy.ps1` | Tablet físico no balcão |
| `pre-push-check.ps1` verde | Tablet físico no balcão |
| Testes `.ps1` (HTTP servidor) | Nova locação real no tablet (I15) |
| Versões alinhadas no repo | Cache PWA / ícone instalado no tablet |
| App no browser MCP (desktop) | Chip Turno, operador logado no tablet |
| Sintaxe / lints nos arquivos editados | Conferir com você se mudança na planilha afeta operação real |
| Leitura/auditoria planilha via OAuth | Validar regras de negócio (payback §10, CONFIG) com o sócio |

**Regra:** teste PowerShell POST/GET **não prova** o tablet — checklist manual continua obrigatório.

---

### 7.5 EU (agente) — publico vs preparo

| Etapa | Quem publica de fato |
|-------|----------------------|
| **Frontend** (GitHub Pages) | Agente: `pre-push-check` → commit → push **sem pedir** → Pages atualiza |
| **GAS código** no projeto Google | Agente **só com pedido** — `clasp push` / `prepare-gas-push.ps1` (§7.3.1) |
| **GAS Web App em produção** | Agente **só com pedido** — Nova versão Web mesmo Deploy ID (§7.3.4) |
| **Tablet na versão nova** | **Só você / Ops** — `?force=versão` ou reinstalar PWA (agente não tem o aparelho) |

Fluxo típico GAS: você autoriza §7.3 → agente prepara/push → **verify** + ping → você confirma tablet se mexeu em operação.

---

### 7.6 VOCÊ — agente não substitui (limite físico / conta)

Não são “pedidos de permissão” — são tarefas que o agente **não consegue** fazer no seu lugar:

| Ação | Onde |
|------|------|
| **Tablet balcão (na loja)** | Abrir `?force=` **no aparelho da operação** — homolog F5/F7/F10/F11 |
| **Script Properties SMS** | Projeto GAS → Configurações → Propriedades (fora da planilha) |
| **Re-auth OAuth** (se token expirar) | `cd google-drive-sheets-auth` → `npm run auth` — abre browser uma vez |
| **`clasp login`** (se expirar) | Terminal no seu PC — uma vez |

Republicar Web GAS: agente **pode** executar **se você pedir** (§7.3.4); no dia a dia costuma ser você no editor.

---

### 7.7 NUNCA (nem agente nem você)

| Proibido | Motivo |
|----------|--------|
| `clasp deploy` | I1 — quebrou URL / caixa |
| Novo Deploy ID GAS | Regra 8 — usar só `AKfycbwakQ...` |
| POST JSON no `api()` do browser | I15 — quebra tablet |
| Commitar senhas / tokens novos | Segurança |

---

### 7.8 Planilha Google — acesso do agente (OAuth)

**Projeto:** `C:\Users\riboc\Projects\google-drive-sheets-auth`  
**Planilha:** `MOVIKIDS_Planilha_Base` · ID `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618`  
**Credenciais:** `~/.config/google-api/client_secret.json` + `token.json` (OAuth Drive + Sheets)  
**Status no PC:** token presente — leitura verificada (`node scripts/test-movikids.js`).

| Script | Função |
|--------|--------|
| `scripts/test-movikids.js` | Smoke test — lista abas + amostra LOCACOES |
| `scripts/auditar-planilha-movikids.js` | Auditoria completa (leitura + JSON) |
| `scripts/organizar-planilha-movikids.js` | Organização de abas |
| `scripts/limpar-testes-movikids.js` | Anular locações de teste na planilha |
| `scripts/criar-aba-investimento-movikids.js` | Criar/atualizar aba INVESTIMENTO |

**Do repo movikids:** `scripts/testes/LIMPAR_TESTES_MOVIKIDS.ps1` chama `limpar-testes-movikids.js`.

**Escopo OAuth:** `drive` + `spreadsheets` — o agente pode **ler e escrever** células, abas e estrutura da planilha via terminal.

**Alternativa (sem OAuth):** APIs GAS que gravam na planilha (`salvarLocacao`, `limparLocacoesTesteAdmin`, `importarResponsaveisAdmin`, etc.) — via URL `exec`.

**Cuidado:** LOCACOES tem aviso “não editar manualmente” — preferir GAS ou scripts auditados. Escritas destrutivas **não** exigem pedido extra (fora da lista §7.3).

**Se OAuth falhar:** `cd C:\Users\riboc\Projects\google-drive-sheets-auth` → `npm run auth` (você autoriza no browser uma vez).

---

## 8. Resumo em uma frase (novo chat)

**Agente sozinho:** FE, docs, git commit/push, testes, ping, planilha OAuth, APIs admin. **Só pedir antes:** §7.3 (GAS/clasp, `api()`/auth, F4/F9). **Só você fisicamente:** tablet loja, Script Properties SMS, re-auth OAuth.

---

## 9. Checklist rápido para novo chat

1. **Operação balcão** = operador + PIN; **gestão** = PIN admin (1421).
2. **Publicar FE** = agente após `pre-push-check` (**sem pedir**).
3. **GAS** = agente só com pedido explícito — lista fechada §7.3 (4 itens).
4. **Planilha** = agente via `google-drive-sheets-auth` (OAuth no PC).
5. **Tablet** = você/Ops na loja; agente valida ping/repo/HTTP.
6. **Supervisor e WhatsApp auto** = pausados (reativar = §7.3.3).
7. **Matriz completa** = seção 7 deste arquivo.

---

*Revisar ao mudar auth, deploy, clasp ou ferramentas do Cursor.*
