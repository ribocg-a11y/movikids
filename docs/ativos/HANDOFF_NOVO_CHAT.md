# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 08/06/2026 (FASE 1 homologação **fechada** → FASE 2 payback)  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main`

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
- Informar: FE **v1.7.87**, GAS **v1.5.66+** — **FASE 1 fechada**; **Pacote K homologado**; próximo **FASE 2 payback** (+ Pacote L na sequência)
- Deixar claro: **agente** código, testes e **planilha (OAuth)**; **você** Nova versão GAS Web e tablet

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

---

## Produção (verificar sempre no início)

| Camada | Versão | Verificação |
|--------|--------|-------------|
| **Frontend** | **v1.7.87** | `mk-version.js` → `window.MK_VERSION` |
| **Service Worker** | **1.7.87** | `sw.js` → `SW_VERSION` |
| **Apps Script** | **v1.5.66+** | [ping](https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping) → `versao` |
| **App tablet** | v1.7.87 | https://ribocg-a11y.github.io/movikids/?force=1.7.87 |

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
| Deploy GAS | `DEPLOY_GAS_v1.5.32_AUTH.md` + deploy feature (ex. `DEPLOY_v1.5.63_PAYBACK.md`) |
| Bug / incidente | `MAPA_ERROS_FALHAS_BUGS.md` → `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md` (I20) → `docs/arquivo/incidentes/` |
| QA tablet | **`PROTOCOLO_DIAGNOSTICO_E_TESTES.md`** → `TESTE_PROTOCOLO_DIAGNOSTICO.ps1` · homologação F5–F11: `TESTE_TABLET_F5_F7_F10_F11.ps1` |
| Homologação | `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md`, `CHECKLIST_PACOTE_K.md` |
| Payback | `MEMORIAL_PAYBACK_INVESTIMENTO.md` |
| Roadmap 90 dias | `PLANO_CONTINUIDADE_2026-06.md` |

---

## Próximo passo (08/06/2026)

**FASE 1 homologação:** ✅ **FECHADA** 08/06/2026 — I.5 assinado · K.3–K.4 tablet · checklist A–F · payback Dashboard · tablet **v1.7.87**.

**FASE 2 (ativa):** §10 payback **respondido** (`DECISAO_PAYBACK_FASE2_2026-06.md`) · INVESTIMENTO B3=`27/05/2026` B4=`05/2026` · GAS **v1.5.69** em prod (relatório Golden sem custos ADM).

**FASE 3 (próxima feature):** **Pacote L** — UX polish + QR balcão (`DECISAO_COMUNICACAO_QR_CODE_2026-06.md`).

**I20 / Pacote M:** continuam fechados — não regredir timer sem `TESTE_I20_COMPLETO_PROD.ps1` + tablet.

**Últimos commits:** ver `git log -5` (docs FASE 1 + homologação).

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

Esperado: ping `versao: v1.5.66+` (08/06: v1.5.67), pre-push verde, FE `1.7.87`.

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

**Fechados:** A–J, SMS P0, K.1–K.2, fixes I16–I20, Payback (código), **Pacote M modularização M.1–M.17** (FE v1.7.87).

**Em andamento / próximo:**

| Item | Status |
|------|--------|
| **FASE 1 homologação** | ✅ fechada 08/06/2026 |
| **K.3–K.4** CRM tablet | ✅ homologado 08/06 |
| **FASE 2** payback negócio (§10 memorial) | 🟡 **ativa** |
| **Pacote L** UX polish + QR balcão | ⬜ FASE 3 (após 2) |
| GAS ping produção | v1.5.67 — **não criar novo Deploy** |

---

## Ao encerrar uma sessão (manter 100% preparado)

O assistente que **mudar versão, fase ou próximo passo** deve atualizar:

1. **Este arquivo** — tabela Produção + seção Próximo passo
2. **`PLANO_PRIORIDADES_2026-06.md`** — checklist FASE 0 (ou fase ativa)
3. **`ESTADO_ATUAL.md`** — se versões ou entregas mudaram
4. **`README.md`** — tabela Produção (se versão mudou)

Não criar novo handoff datado — manter **só este** em `docs/ativos/`.

---

*Revisão programada: ao fechar FASE 2 ou 13/06/2026.*
