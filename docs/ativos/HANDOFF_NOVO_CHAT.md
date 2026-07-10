# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 10/07/2026 · FE **v1.9.26** · GAS repo **v1.5.185** (ping Web **v1.5.182** — Nova versão pendente) · **Ciclo:** Sprint D pós One UI · **I91** cronômetro/cache  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main`

**Mensagem mínima no novo chat:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

**Mensagem para ciclo UI (recomendada):**

> *Continuar MOVI KIDS — Sprint D: `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`*

---

## Modelo operacional — dois aparelhos (ler sempre)

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor) | **Você** (sócio/dev) | Código, testes `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** (Milena, Raykelly) | Locações, timer, PIN operador, PWA ícone na loja |

**Regras para o agente:**

1. **Você opera sempre do computador** — prints e chats costumam ser do **PC**, não do tablet do balcão.
2. O **tablet fica na operação** — homologação balcão **fechada 23/06**; re-testar se mudar `api()`, auth ou cronômetro.
3. **Sessão dual (I21):** PC com PIN admin **1421** = **TABLET: Administrador**; tablet operadores = **BALCÃO: Nome**.
4. **UI nova:** consultar **`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`** §0 **antes** de codar (I29).
5. **Push FE:** `git commit` → `pre-push-check` → `git push` → `verify-publish-complete` → `encerramento-sessao` exit 0 — **sem pedir** (§7.2 · I24)

Detalhe: `ACESSOS_E_AUTORIZACOES.md` §7 · incidentes I21 · I29.

---

## Produção (10/07/2026)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.9.26** | https://ribocg-a11y.github.io/movikids/?force=1.9.26 |
| **Gestão Pessoas** | **v1.9.26** | `gestao-pessoas.html?force=1.9.26` |
| **Service Worker** | **1.9.26** | `sw.js` |
| **Apps Script** | **v1.5.185** repo | ping Web **v1.5.182** — **Nova versão Web pendente** |
| **PIN admin** | **1421** | Script Property `ADMIN_PIN` |
| **Homolog tablet** | ✅ 23/06 | Smoke **v1.9.26** pendente Ops (I91 cache/timer) |
| **Planilha** | 23 abas | `schemaOk=True` · 4 loc teste usuário Encerrada R$0 (rows 1272–1275) |
| **Design System** | **v1.1** | `DESIGN_SYSTEM_MOVIKIDS.md` |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

**Atalhos teste:**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\relatorio-versoes.ps1 -Markdown
.\scripts\testes\TESTE_I20_COMPLETO_PROD.ps1
.\scripts\testes\TESTE_I43_CARREGAR_INICIO_READONLY.ps1
```

```bash
# Linux / cloud agent
bash scripts/testes/TESTE_VALIDACAO_COMPLETA_10.sh
ANULAR_ROWS=1272,1273,1274,1275 bash scripts/testes/TESTE_VALIDACAO_COMPLETA_10.sh  # após GAS v1.5.184+ Web
```

---

## Sessão 10/07/2026 — resumo (I87–I95)

**Sintoma:** cronômetro louco, lentidão, falhas salvar/carregar após 4 locações teste manual.

**Causas raiz (corrigidas no repo):**

| ID | Causa | Fix |
|----|-------|-----|
| I89 | Cache stale `mk_inicio_cache_v2` | Invalidate + merge anti-stale |
| I90 | `started` antes do merge | Recalc pós-merge; skipCache ops |
| I91 | UI não refrescava após salvar/▶ | `mkRefreshHomeUI_()` |
| I93 | `getRange` 19 cols em caixa/KPI | `COL_LOC_READ_=28` v1.5.185 |

**10 testes validação:** ✅ T1–T10 OK (cronômetro I20/I43 verde em prod v1.5.182).

**Pendente sócio:** Nova versão Web GAS v1.5.185 + `anularLocacoesRowAdmin` rows 1272–1275.

**Doc completo:** `docs/arquivo/incidentes/INCIDENTE_SESSAO_2026-07-10_I87_I95.md`

---

## Ordem de leitura (obrigatória)

| # | Documento | Para quê |
|---|-----------|----------|
| 1 | **Este arquivo** | Contexto, produção |
| 2 | **`PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`** | Ciclo ativo Sprint D→G |
| 3 | **`DESIGN_SYSTEM_MOVIKIDS.md`** | Cartilha UI |
| 4 | `MAPA_ERROS_FALHAS_BUGS.md` | I87–I95 travas |
| 5 | `ESTADO_ATUAL.md` · `DEPLOY_ATUAL.md` | Versões |
| 6 | `../INDICE.md` | Mapa docs |

---

## Próximo passo (novo chat)

| # | Ação | Quem | Status |
|---|------|------|--------|
| 1 | **Nova versão Web GAS v1.5.185** | Sócio | ⏳ pendente |
| 2 | **Anular rows 1272–1275** (`anularLocacoesRowAdmin`) | Agente pós-deploy | ⏳ |
| 3 | **Smoke tablet v1.9.26** — salvar → ▶ → card contando | Ops tablet | ⏳ |
| 4 | **PR #5** merge `anularLocacoesRowAdmin` + teste 10 bash | Dev | draft |
| 5 | Sprint D2–D4 assinar FASE 17 | Ops | backlog |

---

## Armadilhas ativas (não repetir)

- **I94:** `zerarExtra=1` repõe R$12 — usar `valorTotal=0` para zerar teste Encerrada.
- **I92:** nomes reais (Ana, Ann…) não entram em `limparLocacoesTesteAdmin` — usar `anularLocacoesRowAdmin`.
- **I26:** repo GAS ≠ ping Web — fixes no repo **não** chegam ao tablet até Nova versão.
- **I89–I91:** mudança timer exige FE **v1.9.26+** + testes I20/I43/validação 10.
