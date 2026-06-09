# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 09/06/2026 (FASE 5 **fechada** — FE **v1.7.96** + GAS **v1.5.72**)  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main`

---

## Modelo operacional — dois aparelhos (ler sempre)

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor) | **Você** (sócio/dev) | Código, GAS, deploy, testes `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** (Milena, Eduarda) | Locações, timer, PIN operador, PWA ícone na loja |

**Regras para o agente:**

1. **Você opera sempre do computador** — prints, chats e validações que você manda costumam ser do **PC**, não do tablet do balcão.
2. O **tablet fica na operação** — homologação real (chip Turno, Nova locação, idle, PWA) exige **alguém no balcão** ou você indo até o tablet; o agente **não** substitui isso com browser no seu PC.
3. **Sessão dual (I21):** no PC com PIN admin 1416 aparece **TABLET: Administrador**; no tablet dos operadores aparece **BALCÃO: Nome** — são camadas diferentes; idle e logout devem alinhar **GAS + aparelho do balcão**.
4. Ao pedir “testar no tablet”, assumir: **você valida no físico do balcão**; agente roda protocolo HTTP + prepara `?force=versão` para você abrir lá.

Detalhe: `ACESSOS_E_AUTORIZACOES.md` §7.0 · incidente I21.

---

## Como abrir um chat novo (você)

### Opção A — mensagem mínima (recomendada)

1. Abra o Cursor **nesta pasta** (`movikids-github`).
2. Novo chat. Digite só:

```
Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.
```

Isso basta. A regra `.cursor/rules/handoff-movikids.mdc` manda o agente ler este arquivo e o planejamento **sem pedir mais nada**.

### Opção B — mensagem explícita (opcional)

Se o chat não estiver na pasta do projeto, use:

```
Continuo o MOVI KIDS. Repo: C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
```

### O que o agente faz sozinho (não precisa repetir)

- Ler: este arquivo → `PLANO_PRIORIDADES` → `ESTADO_ATUAL` → `REGRAS` → `ACESSOS_E_AUTORIZACOES` (§7 = agente vs você)
- Ignorar handoff antigo em `docs/arquivo/planos/`
- Informar: FE **v1.7.96**, GAS **v1.5.72** — **FASE 0–5 fechadas** · operação estável · ver **`PLANEJAMENTO_ATUAL_2026-06.md`**
- Deixar claro: **agente** no **PC** (código, testes, planilha); **você** Nova versão GAS Web; **tablet no balcão** = validação operação (não confundir com seu computador)

---

## Comportamento esperado do agente (checklist)

| # | Ação |
|---|------|
| 1 | Reconhecer pedido de continuidade — **sem** pedir caminho se workspace = `movikids-github` |
| 2 | Ler os 5 docs ativos (ordem na seção abaixo) |
| 3 | Se pedir **teste/diagnóstico**: seguir **`PROTOCOLO_DIAGNOSTICO_E_TESTES.md`** + `TESTE_PROTOCOLO_DIAGNOSTICO.ps1` |
| 3b | Opcional: ping GAS + `pre-push-check.ps1` se for mexer em código |
| 4 | Responder com: versões, fase ativa, **próximo passo**, **quem faz o quê** (agente vs você — `ACESSOS` §7) |
| 5 | Ao encerrar sessão: atualizar este arquivo + checklist se algo mudou |
| 6 | **Modo máximo potencial:** fluxo F0–F14 + dois aparelhos + resumo publicação antes de push (ver § Modo agente abaixo) |

---

## Modo de operação do agente (máximo potencial)

1. **Nunca patch isolado** — mapear fluxo (`PROTOCOLO` §2) e incidentes (`MAPA_ERROS`) antes de codar.
2. **PC ≠ tablet** — homologação operação = aparelho **na loja**; agente valida HTTP/ping no PC.
3. **UI fixa no balcão** — portal dos pais, chip turno: sem ocultar sem pedido explícito.
4. **Antes de push:** `pre-push-check` + bloco: FE · GAS? · testes · checklist tablet.
5. **Proatividade:** propor teste + impacto; registrar I* se bug sistêmico; não fechar sem F0.

Regra Cursor: `.cursor/rules/handoff-movikids.mdc` § Modo de operação.

---

## Produção (verificar sempre no início)

| Camada | Versão | Verificação |
|--------|--------|-------------|
| **Frontend** | **v1.7.98** | `mk-version.js` → `window.MK_VERSION` |
| **Service Worker** | **1.7.98** | `sw.js` → `SW_VERSION` |
| **Apps Script** | **v1.5.74** | [ping](https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping) → `versao` |
| **App tablet balcão** | v1.7.98 | https://ribocg-a11y.github.io/movikids/?force=1.7.98 (**na loja**, não só no PC) |

**Deploy ID GAS (único — nunca criar outro):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**Editor GAS:** https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit

---

## Ordem de leitura (obrigatória)

| # | Documento | Para quê |
|---|-----------|----------|
| 1 | **Este arquivo** | Contexto, regras, próximo passo |
| 2 | `PLANO_PRIORIDADES_2026-06.md` | **O que fazer agora** (fases P0–P4, checklist vivo) |
| 3 | `ESTADO_ATUAL.md` | Versões, pacotes entregues, validação pós-deploy |
| 4 | `REGRAS_DE_PUBLICACAO_SEGURA.md` | Travas antes de commit/push/deploy |
| 5 | `ACESSOS_E_AUTORIZACOES.md` | Quem pode o quê — app, infra, agente vs humano |
| 6 | `MAPA_CODIGO_ARQUITETURA.md` | Anatomia código — o que liga com o quê, zonas sensíveis |
| 7 | `../INDICE.md` | Mapa completo se precisar de doc específico |

### Por tarefa (consulta rápida)

| Tarefa | Ler |
|--------|-----|
| Deploy GAS | `DEPLOY_GAS_v1.5.32_AUTH.md` + deploy feature (ex. `DEPLOY_v1.5.73_P3_BACKLOG.md`) |
| Bug / incidente | `MAPA_ERROS_FALHAS_BUGS.md` → I20/I21 → `docs/arquivo/incidentes/` (ex. `INCIDENTE_I21_SESSAO_IDLE_DUAL_2026-06-09.md`) |
| QA tablet | **`PROTOCOLO_DIAGNOSTICO_E_TESTES.md`** → `TESTE_PROTOCOLO_DIAGNOSTICO.ps1` · homologação F5–F11: `TESTE_TABLET_F5_F7_F10_F11.ps1` |
| Homologação | `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md`, `CHECKLIST_PACOTE_K.md` |
| Payback | `MEMORIAL_PAYBACK_INVESTIMENTO.md` |
| Roadmap / planejamento | **`PLANEJAMENTO_ATUAL_2026-06.md`** · `PLANO_CONTINUIDADE_2026-06.md` |

---

## Próximo passo (09/06/2026)

**FASE 1 homologação:** ✅ **FECHADA** 08/06/2026 — I.5 assinado · K.3–K.4 tablet · checklist A–F · payback Dashboard · tablet **v1.7.87**.

**FASE 2:** ✅ fechada 08/06 — INVESTIMENTO + payback + GAS **v1.5.69**.

**FASE 3–4:** ✅ fechadas 08/06 — Pacote L v1.7.91 + CONFIG planilha validados.

**FASE 5:** ✅ **FECHADA** 09/06/2026 — B1+B2+B8+B7 · tablet Milena · I21 mock **ok v1.7.96**.

**P3 backlog produto:** ✅ **FECHADO** 09/06/2026 — B3+B4+B5+N2 · GAS **v1.5.73** · FE **v1.7.97** · `TESTE_P3_READONLY.ps1` ok.

**v1.7.97 (09/06):** auditoria por operador, PDF executivo, export caixa WA/email, badge CRM recorrente.

**Próximo passo:** operação estável v1.7.98 · B7 semanal · **P2 fechado** — aguarda Nova versão GAS v1.5.74

**Últimos commits (main = origin):**

| Hash | Entrega |
|------|---------|
| `9efa30a` | **P3** — GAS v1.5.73 + FE v1.7.97 |
| `91cc08f` | **v1.7.96** — fix splash idle boot (I21) |
| `8173d10` | FASE 5 docs + mock-idle Pages |
| `0e9e47c` | v1.7.95 — portal fixo Home |
| `c3f92ac` | v1.7.94 + GAS v1.5.72 — B8 idle |

Detalhe vivo: seção **Execução — status ao vivo** em `PLANO_PRIORIDADES_2026-06.md`.

---

## Arquivos canônicos (única fonte de código)

| Artefato | Caminho |
|----------|---------|
| **GAS (único na raiz)** | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` |
| GAS legado (não implantar) | `arquivo-historico/*.gs` |
| Clasp (gerado, não editar) | `gas/Code.gs` via `scripts/sync-gas-to-clasp.ps1` |
| Versão FE | `mk-version.js` + `sw.js` |
| CSS balcão | `mk-design.css` + `mk-app.css` (Pacote M.1) |
| App principal | `index.html` (só HTML), `mk-globals.js`, `mk-core.js` … `mk-boot.js`, `mk-auth.js` |
| Portal | `acompanhar.html`, `foto-moldura.html` |
| Testes | `scripts/testes/` — ver `scripts/testes/README.md` |
| Pre-push CI | `scripts/pre-push-check.ps1` |
| Deploy GAS script | `scripts/deploy-gas.ps1` |

**Caminho PC do .gs (regra de ouro após alteração GAS):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

---

## Regras invioláveis (P0)

| Regra | Detalhe |
|-------|---------|
| **I15 — GET no browser** | Escritas críticas no `api()` = **GET** apenas. Nunca POST JSON no tablet. |
| **Deploy GAS** | Mesmo Deploy ID → **Nova versão** no editor. **Nunca** `clasp deploy`. |
| **Tablet obrigatório** | Mudança em `api()` ou auth → testar no tablet físico. |
| **Pre-push** | Rodar `.\scripts\pre-push-check.ps1` antes de `git push`. |
| **Versões alinhadas** | `mk-version.js` = `sw.js` SW_VERSION após mudança FE. |
| **F4 / F9 pausados** | WhatsApp auto e supervisor — não reativar sem decisão explícita. |

Regras Cursor automáticas: `.cursor/rules/` (GAS caminho PC, POST proibido, design DNA).

---

## Validação rápida (rodar no início de cada sessão)

```powershell
# Ping GAS
Invoke-RestMethod "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping"

# CI local
.\scripts\pre-push-check.ps1
```

Esperado: ping `versao: v1.5.72`, pre-push verde, FE **1.7.96** (Pages + `mk-version.js`).

---

## O que NÃO usar (armadilhas)

| Caminho | Motivo |
|---------|--------|
| `docs/arquivo/planos/HANDOFF_NOVO_CHAT_2026-06-05.md` | Defasado (v1.7.27) — usar **este** arquivo |
| `docs/arquivo/obsoleto/` | ROLLBACK, CHANGELOG antigos |
| `arquivo-historico/*.gs` | GAS legado — não implantar |
| Deploy ID `AKfycbzc...` | URL morta (404) |
| `docs/arquivo/deploy/` | Histórico — versões antigas |

Histórico em `docs/arquivo/` é referência de incidentes e pacotes fechados, **não** fonte de versão atual.

---

## Publicar com segurança (resumo)

1. Ler `REGRAS_DE_PUBLICACAO_SEGURA.md`
2. `.\scripts\pre-push-check.ps1`
3. `git push` → GitHub Pages (FE)
4. Se `.gs` mudou: colar no editor → **Implantar → Nova versão** (mesmo Deploy ID)
5. Ping + tablet `?force={versão}`

Guia completo: `DEPLOY_GAS_v1.5.32_AUTH.md`

---

## Pacotes fechados vs em andamento

**Fechados:** A–J, SMS P0, K.1–K.4, fixes I16–I21 (B8), Payback (código), **Pacote M** M.1–M.17 (v1.7.87), **Pacote L** (v1.7.91), **FASE 1–4**.

**Em andamento / próximo:**

| Item | Status |
|------|--------|
| **FASE 5** Confiabilidade/APIs | ✅ **fechada** | 09/06 — Milena + I21 v1.7.96 |
| **P3** Backlog produto | ✅ **fechado** | 09/06 — v1.7.97 / v1.5.73 |
| **Tablet balcão** | v1.7.97 | `?force=1.7.97` |
| GAS ping produção | **v1.5.73** — **não criar novo Deploy** |
| **B6 / Q1** | ✅ P2 fechado 09/06 — CI + PIN via GAS |

---

## Ao encerrar uma sessão (manter 100% preparado)

O assistente que **mudar versão, fase ou próximo passo** deve atualizar:

1. **Este arquivo** — tabela Produção + seção Próximo passo
2. **`PLANO_PRIORIDADES_2026-06.md`** — checklist FASE 0 (ou fase ativa)
3. **`ESTADO_ATUAL.md`** — se versões ou entregas mudaram
4. **`README.md`** — tabela Produção (se versão mudou)

Não criar novo handoff datado — manter **só este** em `docs/ativos/`.

---

## Verificação desta sessão (09/06/2026 — FASE 5 fechada)

| Check | Resultado |
|-------|-----------|
| `git status` | `main` = `origin/main` @ `91cc08f` |
| Ping GAS | **v1.5.72** ok |
| GitHub Pages | **v1.7.96** ok |
| Tablet Milena | Homologação FASE 5 assinada |
| I21 mock idle | ✅ v1.7.96 |

*Próxima revisão: **13/06/2026** — ver `PLANEJAMENTO_ATUAL_2026-06.md`.*
