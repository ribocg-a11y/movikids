# MOVI KIDS — Handoff para novo chat

**Data:** 05/06/2026 (atualizado fim de sessão)  
**Chat anterior:** Pacote F iniciado (v1.7.27 + GAS v1.5.46); clasp push feito; **Nova versão Web ainda pendente**  
**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` (branch `main`)

**Caminho no PC (anexar no novo chat):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\HANDOFF_NOVO_CHAT_2026-06-05.md
```

---

## Como abrir o novo chat

Cole o bloco abaixo como **primeira mensagem** no chat novo (ajuste o que quiser):

```
Continuo o projeto MOVI KIDS. Leia o handoff e siga o planejamento.

Repo: C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github

Arquivos obrigatórios:
- HANDOFF_NOVO_CHAT_2026-06-05.md (este arquivo)
- ESTADO_ATUAL.md
- PLANO_MESTRE_REORGANIZADO_2026-06.md
- DEPLOY_GAS_v1.5.32_AUTH.md
- REGRAS_DE_PUBLICACAO_SEGURA.md

Próximo passo: Nova versão Web GAS v1.5.46 no editor + push FE v1.7.27 + validar Pacote F no Dashboard.

Regra de ouro: sempre informar caminho completo do .gs + links do Apps Script quando alterar GAS.
Nunca usar clasp deploy.
```

**Lembrete imediato:** `clasp push` da **v1.5.46** já foi feito; produção ainda mostra **v1.5.44** no ping até **Nova versão** no editor:

https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit

→ **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão → Implantar**

---

## Produção alvo (verificar após cada deploy)

| Camada | Versão alvo | Link / ID |
|--------|-------------|-----------|
| **Frontend** | **v1.7.27** (local; push GitHub pendente) | https://ribocg-a11y.github.io/movikids/?force=1.7.27 |
| **Apps Script** | **v1.5.46** (clasp push feito; falta **Nova versão** Web) | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |
| **Planilha** | MOVIKIDS_Planilha_Base | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| **SMS Gateway** | DJVJRL / device `wihWegHr4wXaVJQ1R-GZR` | Script Properties no GAS |
| **URL morta** | **NÃO USAR** | `AKfycbzc...` → 404 |

**Ping em produção (05/06 tarde):** ainda `versao: v1.5.44` — confirma que Nova versão não foi aplicada.

### Links diretos GAS (regra de ouro — sempre informar ao usuário)

| O quê | Link |
|--------|------|
| **Editor Apps Script** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Web app (exec)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec |
| **Ping** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **Testar limpeza testes (v1.5.45+)** | `.../exec?action=limparLocacoesTesteAdmin&adminPin=1416&soHoje=1&motivo=Limpeza%20teste%20pos%20deploy%20v1.5.46` |

### v1.5.46 no seu PC (regra de ouro — caminho canônico)

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Deploy GAS seguro:** `.\scripts\deploy-gas.ps1` → depois **Implantar → Gerenciar implantações → Editar Web AKfycbwakQ... → Nova versão**. **Nunca** `clasp deploy`.

---

## O que os chats anteriores entregaram

| Versão | Entrega |
|--------|---------|
| **v1.7.24** | Pacote D — drawer unificado (Encerrar / Estender / Editar / Cancelar) |
| **v1.7.25** | Fix botão Buscar passo Quem; fix `incluirExtraLocalAdm` indefinido no encerramento ADM offline |
| **v1.7.26** | Pacote E — `api()` POST nas 5 escritas críticas; `postWriteActions` no ping |
| **GAS v1.5.44** | `doPost` JSON; operador obrigatório em salvar/editar/cancelar/encerrar/estender |
| **GAS v1.5.45** | `limparLocacoesTesteAdmin` — anula locações de teste (não contam no caixa) |
| **Limpeza** | 22+ registros `DRAWER_E_*` / `TESTE_CODEX` removidos do caixa do dia |
| **Scripts** | `_TestCleanup.ps1`, `LIMPAR_TESTES_MOVIKIDS.ps1`; testes com limpeza automática no `finally` |

## O que este chat entregou (continuação 05/06)

| Versão | Entrega |
|--------|---------|
| **GAS v1.5.46** | Pacote F backend — `buscarKPIsAdmin` retorna `porOperador`, `cancelamentos`, `ocupacaoFrota`; ping corrigido para v1.5.46 |
| **v1.7.27** | Pacote F frontend — Dashboard seção **Gestão avançada do mês** (operador, cancelamentos, ocupação frota); tile Caixa de hoje linka para Caixa |
| **Docs** | `ESTADO_ATUAL.md`, `DEPLOY_GAS_v1.5.32_AUTH.md` atualizados |
| **Deploy** | `.\scripts\deploy-gas.ps1` executado (`clasp push` OK) |

**Commits:** alterações locais podem não estar commitadas — verificar `git status` antes de push.

---

## Pendências imediatas (ordem)

1. **Nova versão Web GAS v1.5.46** — editor (link acima). Ping deve mostrar `versao: v1.5.46`.
2. **Push frontend v1.7.27** — GitHub Pages; tablets `?force=1.7.27`.
3. **Validar Pacote F** — login admin → Dashboard → blocos operador / cancelamentos / ocupação frota com dados reais.
4. **Commit** — se ainda não feito: GAS + FE + docs.
5. **Validação tablet** — drawer 4 abas; Milena Nunes costuma logada bloqueando teste operador.
6. **Pacote F — próximo incremento** — recorrência clientes, custos por categoria, PDF alinhado.
7. **Fases backlog** — supervisor (F9), config frota/preços (F8), WhatsApp completo (F4).

---

## Roadmap (status)

- [x] Pacotes A–C (design, hub, nova locação 3 passos)
- [x] Pacote Incidente (cache, ADM SMS, offline encerrar) v1.7.4–1.7.6
- [x] Pacote SMS P0 + gateway DJVJRL
- [x] UX auth/menu v1.7.18–1.7.23
- [x] **Pacote D** — drawer sessão v1.7.24
- [x] **Pacote E** — POST + operador obrigatório v1.7.26 + GAS v1.5.44
- [x] **Limpeza testes** — planilha + auto-cleanup nos scripts
- [x] **Pacote F (início)** — KPIs operador/cancelamentos/ocupação v1.7.27 + GAS v1.5.46
- [ ] Pacote F — incremento (recorrência, custos categoria, PDF, regressão KPIs)
- [ ] Fase 4 WhatsApp, Fase 8 config dinâmica, Fase 9 supervisor

**Plano mestre:** `PLANO_MESTRE_REORGANIZADO_2026-06.md`  
**Regra UX:** operador na Home vê **0 KPI financeiro**; detalhe em Caixa / Dashboard.

---

## Mapa de erros, bugs, falhas e aprendizados

**Canônico (atualizado 06/06/2026 10:34):** `MAPA_ERROS_FALHAS_BUGS.md` — tabela I1–I18, travas e scripts de teste.

**DNA visual (obrigatório em toda UI):** `DESIGN_DNA_MOVIKIDS.md` — portal carrossel `acompanhar.html` v1.7.47+ como referência; regra `.cursor/rules/design-visual-movikids.mdc`.

### Incidentes documentados

| Doc | O quê |
|-----|--------|
| `INCIDENTE_DEPLOY_E_EXTRAS_2026-06-04.md` | `clasp deploy` quebrou URL; extras fantasmas com GAS offline |
| **`INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md`** | **P0** POST no browser quebrou lançamento; GET obrigatório no FE |
| **`INCIDENTE_CRONOMETRO_PORTAL_AUTH_2026-06-05_06.md`** | **I16** cronômetro portal≠balcão; **I17** liberar sessão UI; **I18** idle com locação |
| `INCIDENTE_AUTH_OPERADORES_2026-06-04.md` | Sessão travada; PIN invisível; timer sem operador → extra indevido |
| `EMERGENCIA_SMS_404.md` | URL morta AKfycbzc; só Nova versão na mesma implantação resolve |
| `TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md` | Gateway produção DJVJRL |

### Tabela causa → efeito → correção

| # | Problema | Efeito | Correção | Versão |
|---|----------|--------|----------|--------|
| I1 | **`clasp deploy`** na Web App | 404 Failed to fetch; caixa quebrado | Só `clasp push` + Nova versão manual | Regra 8 |
| I2 | GAS offline + timer local negativo | `minUsados` inflado → cobrança extra | ADM `somentePlano`; offline encerrar v1.7.6 | FE 1.7.6 |
| I3 | Cache `?force=1.7.0` fixo | Tablets em JS antigo | Subir CURRENT/APP_VERSION/SW juntos | v1.7.4+ |
| I4 | `mk-login-err` duplicado | Erro PIN invisível | ID único `mk-login-pin-err` | FE 1.6.79 |
| I5 | Liberar sessão não atualizava UI | ADM acha que botão não funciona | `refreshOperadoresAdmin_` | FE 1.6.81 |
| I6 | Sessão única sem liberar | Operador 409 | `liberarSessaoOperadorAdmin` | GAS 1.5.33+ |
| I7 | Encerrada com extra errado | Caixa/histórico errado | `corrigirFinanceiroLocacaoAdmin` + `zerarExtra` | GAS 1.5.36 |
| I8 | `.btn-secondary { width:100% }` | Botão Buscar passo Quem esmagado | CSS `nova-rel-search` | v1.7.25 |
| I9 | `incluirExtraLocalAdm` indefinido | Encerramento ADM offline quebrava | `session._incluirExtraLocalAdm` | v1.7.25 |
| I10 | Testes `DRAWER_E_*` encerrados | Poluíam `statsHoje` / encHoje | `limparLocacoesTesteAdmin` + cleanup scripts | v1.5.45 |
| I11 | `cancelarLocacao` só Pendente/Ativa | Teste encerrado não some do caixa | Anular → status Cancelada + zerar valores | v1.5.45 |
| I12 | URL GAS morta em script teste | `TESTE_RELACIONAMENTO` falhava | URL `AKfycbwakQ...` | commit 1454bc8 |
| I13 | `listarAtivas` antes de encerrar | Falso negativo por concorrência | Verificar row Ativa antes de encerrar | TESTE_DRAWER_E |
| I14 | Ping desatualizado no `.gs` | Produção mostra versão antiga após push | Atualizar `ping_()` + Nova versão Web | v1.5.46 |
| I15 | **P0** Pacote E POST no FE (`v1.7.26`–`v1.7.33`) + cache `?force=1.7.31` | **Balcão parado:** Nova locação *"Erro de conexão"*; testes PS passavam | FE **v1.7.35**: GET no browser + anti-stale; Regra 6; paridade HTTP | v1.7.35 — ver `INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md` |
| I16 | Portal `startTimestamp` bruto vs balcão `timestampCanonico_` | Celular mostra minutos diferentes do tablet | GAS **v1.5.55** + `canonLoc_` em `acompanhar.html` | `TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` |
| I17 | Liberar sessão + GET em cache | Banner operador preso após ADM liberar | v1.7.45 `mkAuthSyncSessaoBalcaoUI_` + `no-store` | tablet ADM liberar |
| I18 | Idle 1h com locação Ativa/Pendente | Logout no meio da operação | v1.7.46 `mkHasLocacaoAbertaNoTablet_` | `pre-push-check` guard.idle.locacao |
| I19 | PWA sessão fantasma + turno invisível (Milena 06/06) | App aberto sem turno no GAS; Home sem nome | v1.7.48 reconcile + chip Turno | `INCIDENTE_AUTH_SESSAO_FANTASMA_PWA_2026-06-06.md` |

### Aprendizados operacionais (não repetir)

- **Nunca** `clasp deploy` — quebra a URL Web em produção.
- **Sempre** após alterar `.gs`: caminho PC + links editor/ping + lembrete Nova versão.
- **`clasp push` ≠ produção** — ping só muda após Nova versão na implantação Web existente.
- **Frontend:** `mk-version.js`, `APP_VERSION`, `SW_VERSION`, cache buster alinhados; tablets `?force=VERSAO`.
- **WhatsApp:** normalização BR (9º dígito), copiar mensagem, fallback tablet — ver Regra 3 em `REGRAS_DE_PUBLICACAO_SEGURA.md`.
- **Testes em produção:** telefone `98999999999`, prefixo `DRAWER_E_` / `TESTE_CODEX`; limpar no `finally` ou via `LIMPAR_TESTES_MOVIKIDS.ps1`.
- **ADM PIN:** `1416` — reset PIN, liberar sessão, corrigir financeiro, limpar testes.
- **Dados financeiros:** só admin vê (`carregarInicio`, KPIs filtrados GAS v1.5.43+).
- **Escritas críticas:** exigem operador logado (GAS v1.5.44+). No **browser** = **GET** apenas (incidente I15 — **nunca POST** no FE).
- **ALERTA P0:** `INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md` — regressão PowerShell POST ≠ tablet.
- **Cronômetro portal:** nunca sem `timestampCanonico_` (GAS) e `canonLoc_` (portal) — `REGRAS` Regra 10; teste `TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1`.
- **Idle + locação:** não deslogar com Ativa/Pendente — Regra 11; mapa `MAPA_ERROS_FALHAS_BUGS.md`.

---

## Regras obrigatórias para o agente

### Regra de ouro GAS (`.cursor/rules/gas-deploy-caminho-pc.mdc`)

Sempre que alterar o `.gs`, informar:

```
v{VERSÃO} no seu PC:

C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

+ links do editor e ping (tabela acima). **Não** omitir. **Não** substituir por link GitHub/raw.

### `REGRAS_DE_PUBLICACAO_SEGURA.md` (resumo)

1. Declarar escopo P0–P3 antes de mexer.
2. Checklist versão FE/SW antes de push.
3. WhatsApp = zona crítica (tablet ≠ desktop).
4. Cache: CURRENT + APP_VERSION + SW_VERSION juntos.
5. FE-only ≠ reimplantar GAS; GAS = candidato `.gs` + Nova versão.
6. Toda regressão: causa, correção, validação, rollback.
7. Resumo pós-pacote: index/sw/track/GAS/docs/commit/versão/teste/próximo passo.
8. **Proibido `clasp deploy`.**

### Arquivos canônicos (não editar cópias legadas)

| Artefato | Arquivo |
|----------|---------|
| GAS | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (header **v1.5.46**) |
| Clasp | `gas/Code.gs` (gerado por `scripts/sync-gas-to-clasp.ps1`) |
| Frontend | `index.html`, `mk-version.js`, `sw.js`, `mk-auth.js` |
| Deploy | `scripts/deploy-gas.ps1` |

---

## Scripts de teste e limpeza

**Gate antes de push:** `.\scripts\pre-push-check.ps1` (versões, guards I15–I18, paridade HTTP + portal + cronômetro).

Rodar a partir do repo:

```powershell
cd "C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github"

.\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1
.\TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1 -RunWriteTests
.\TESTE_DRAWER_E_PACOTE_E.ps1
.\TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1

.\LIMPAR_TESTES_MOVIKIDS.ps1              # limpeza manual
.\LIMPAR_TESTES_MOVIKIDS.ps1 -DryRun      # só lista
.\LIMPAR_SESSOES_TESTE_AGORA.ps1          # cancela pendentes teste (9899999*, Teste*)
.\TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1       # obrigatorio antes de publicar mudanca em api()
.\TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1  # I16 — portal x balcao (GAS >= v1.5.55)
.\scripts\pre-push-check.ps1                # Pacote J — gate completo
```

Limpeza via planilha (OAuth): `C:\Users\riboc\Projects\google-drive-sheets-auth\scripts\limpar-testes-movikids.js`

Padrões de teste reconhecidos: `DRAWER_E_*`, `TESTE_CODEX*`, responsável `TESTE`/`TESTE_EDIT`, tel `98999999999`/`98999999998`, `X`/`Y`.

---

## APIs admin úteis

| Action | Uso |
|--------|-----|
| `loginAdmin` / `loginOperador` | Auth balcão |
| `corrigirFinanceiroLocacaoAdmin` | Ajuste encerrada + `zerarExtra` |
| `limparLocacoesTesteAdmin` | Anula testes (`adminPin`, `motivo` ≥10, opcional `soHoje=1`) |
| `liberarSessaoOperadorAdmin` | ADM libera trava balcão |
| `resetarPinOperadorAdmin` | Reset PIN operador |
| `buscarKPIsAdmin` | KPIs mês — inclui `porOperador`, `cancelamentos`, `ocupacaoFrota` (v1.5.46+) |

---

## Pacote F — status e próximo incremento

### Entregue (v1.7.27 + GAS v1.5.46)

- **Horários de pico** — já existia (`horasPico` + gráfico)
- **Desempenho por operador** — AUDITORIA `encerrarLocacao`
- **Cancelamentos** — LOCACOES `Cancelada` + motivos AUDITORIA
- **Ocupação frota** — minutos/veículo vs capacidade 12h·dia
- Dashboard = fonte de gestão do mês; tile Caixa linka para conferência do dia

### Próximo incremento

- Recorrência de clientes; custos por categoria no Dashboard
- Relatório PDF alinhado aos novos KPIs
- Regressão automatizada dos campos `porOperador` / `cancelamentos` / `ocupacaoFrota`
- Critério de pronto: 8+ KPIs com dados reais; operador sem KPI na Home

---

## Documentos do repositório

| Arquivo | Papel |
|---------|--------|
| **HANDOFF_NOVO_CHAT_2026-06-05.md** | Este handoff |
| `ESTADO_ATUAL.md` | Snapshot produção (atualizar a cada deploy) |
| `PLANO_MESTRE_REORGANIZADO_2026-06.md` | Roadmap UX e pacotes |
| `DEPLOY_GAS_v1.5.32_AUTH.md` | Deploy + links + changelog GAS |
| `REGRAS_DE_PUBLICACAO_SEGURA.md` | Travas operacionais |
| `INCIDENTE_*.md` | Pós-mortems |
| `ARQUIVOS_GAS_LEGADOS.md` | Não colar `.gs` antigos no Apps Script |

---

## Contexto operacional

- Usuário: **Milena Nunes** costuma logada no **TABLET Administrador** (BALCÃO) — pode bloquear teste de operador.
- Produção real em shopping; testes poluem caixa se não limpar.
- `google-drive-sheets-auth` em `C:\Users\riboc\Projects\google-drive-sheets-auth` — OAuth para ler/escrever planilha direto.

---

*Atualizado em 05/06/2026 — continuidade Pacote F + pendência Nova versão Web v1.5.46.*
