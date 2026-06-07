# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 07/06/2026  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main`

---

## Cole isto no novo chat (primeira mensagem)

```
Continuo o projeto MOVI KIDS. Siga o handoff ativo.

Repo: C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github

Leia nesta ordem:
1. docs/ativos/HANDOFF_NOVO_CHAT.md (este arquivo)
2. docs/ativos/PLANO_PRIORIDADES_2026-06.md — checklist FASE 0 e próximo passo
3. docs/ativos/ESTADO_ATUAL.md — versões e links de produção
4. docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md — antes de publicar

Produção hoje: FE v1.7.64 · GAS v1.5.63 · Deploy AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y

Próximo passo: FASE 0.1 — tablet balcão em ?force=1.7.64 (rodapé v1.7.64 + chip Turno).

NÃO usar docs/arquivo/planos/HANDOFF_NOVO_CHAT_2026-06-05.md (defasado).
NÃO implantar arquivos em arquivo-historico/.
```

---

## Produção (verificar sempre no início)

| Camada | Versão | Verificação |
|--------|--------|-------------|
| **Frontend** | **v1.7.64** | `mk-version.js` → `window.MK_VERSION` |
| **Service Worker** | **1.7.64** | `sw.js` → `SW_VERSION` |
| **Apps Script** | **v1.5.63** | [ping](https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping) → `versao` |
| **App tablet** | v1.7.64 | https://ribocg-a11y.github.io/movikids/?force=1.7.64 |

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
| 5 | `../INDICE.md` | Mapa completo se precisar de doc específico |

### Por tarefa (consulta rápida)

| Tarefa | Ler |
|--------|-----|
| Deploy GAS | `DEPLOY_GAS_v1.5.32_AUTH.md` + deploy feature (ex. `DEPLOY_v1.5.63_PAYBACK.md`) |
| Bug / incidente | `MAPA_ERROS_FALHAS_BUGS.md` → `docs/arquivo/incidentes/` |
| QA tablet | `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md`, `CHECKLIST_PACOTE_K.md` |
| Payback | `MEMORIAL_PAYBACK_INVESTIMENTO.md` |
| Roadmap 90 dias | `PLANO_CONTINUIDADE_2026-06.md` |

---

## Próximo passo (07/06/2026)

**FASE 0 quase fechada** — falta só **0.1 Ops**:

1. Abrir tablet: `?force=1.7.64`
2. Confirmar rodapé **Online v1.7.64**
3. Confirmar chip **Turno** (operador logado)

Depois → **FASE 1 Homologação** (`HOMOLOGACAO_PRODUCAO_ASSISTIDA.md` checklist I.5 + payback no Dashboard).

Detalhe vivo: seção **Execução — status ao vivo** em `PLANO_PRIORIDADES_2026-06.md`.

---

## Arquivos canônicos (única fonte de código)

| Artefato | Caminho |
|----------|---------|
| **GAS (único na raiz)** | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` |
| GAS legado (não implantar) | `arquivo-historico/*.gs` |
| Clasp (gerado, não editar) | `gas/Code.gs` via `scripts/sync-gas-to-clasp.ps1` |
| Versão FE | `mk-version.js` + `sw.js` |
| App principal | `index.html`, `mk-auth.js`, `mk-design.css` |
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

Esperado: ping `versao: v1.5.63`, pre-push verde.

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

**Fechados:** A, B, C, D, E, F, G, H, I, J, SMS P0, K.1, K.2, fixes I16–I19, Payback M (código v1.5.60–63 + FE v1.7.63–64).

**Em andamento / próximo:**

| Item | Status |
|------|--------|
| FASE 0 tablets v1.7.64 | ⬜ Ops |
| FASE 1 homologação | ⬜ após F0 |
| Payback negócio (§10 memorial) | ⬜ FASE 2 |
| Pacote L UX polish | ⬜ FASE 3 |
| K.3–K.4 QA tablet | ⬜ checklist não assinado |

---

## Ao encerrar uma sessão (manter 100% preparado)

O assistente que **mudar versão, fase ou próximo passo** deve atualizar:

1. **Este arquivo** — tabela Produção + seção Próximo passo
2. **`PLANO_PRIORIDADES_2026-06.md`** — checklist FASE 0 (ou fase ativa)
3. **`ESTADO_ATUAL.md`** — se versões ou entregas mudaram
4. **`README.md`** — tabela Produção (se versão mudou)

Não criar novo handoff datado — manter **só este** em `docs/ativos/`.

---

*Revisão programada: ao fechar FASE 1 ou 13/06/2026.*
