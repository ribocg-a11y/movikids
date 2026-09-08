# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 08/09/2026 · FE **v1.9.114** Pages ✅ · GAS ping **v1.5.220** (= repo) · **I155** ✅ · **I154** ✅ · **I153** ✅

## Ops RH (04/09)

| Pessoa | Status |
|--------|--------|
| **Karen** id5 | Operadora ativa · **Sem PIN** (1º acesso cria) · RH stub · modo **Freelancer** |
| **Julia** id4 | **Pausa** — fora do login balcão (ativo=NAO) · saída 01/09 |

**Ambiente do agente:** Cloud Agent OK para FE/docs · pasta C / AppScript = sócio no PC.  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**GitHub:** `ribocg-a11y/movikids` · branch `main` · FE Pages **v1.9.114**

## Travas confiabilidade (08/09)

| Família | Travas |
|---------|--------|
| **I151** encerrar fantasma | `guard.i151.*` · `TESTE_I151_ENCERRAR_FANTASMA_READONLY.ps1` · `INCIDENTE_I151_DEFINITIVO_*` |
| **I153** duplicata / encerrar curto | `guard.i153.*` · anular Encerrada admin · FE confirm &lt;90s |
| **I154** lançamento perdido 404 | `guard.i154.*` · FE `gas-unstable` + retry · audit sort |
| **I155** full-sheet 404 | `guard.i155.*` · `locSheetTail_` lookback 600 · cache ativas 8s |

**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` · **Estabilidade:** `EVIDENCIA_ESTABILIDADE_POS_I155_2026-09-08.md` (0 HTML 404)

---

## Abrir agente no PC (C:) — ler primeiro

| Item | Valor |
|------|--------|
| **Workspace obrigatório** | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` |
| **Modo Cursor** | **Agent local / This PC** — `.ps1`, `git`, ping GAS e OAuth no Windows |
| **Não usar** | Cloud Agent (VM Linux sem pasta C nem `clasp`/OAuth local) |
| **Confirmar no 1º turno** | `Test-Path .\scripts\relatorio-versoes.ps1` → `True` · Pages **1.9.114** · ping **v1.5.220** |

**Sincronizar pasta C antes de codar:**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
.\scripts\relatorio-versoes.ps1 -Markdown
```

---

## Mensagem para colar no novo chat (PC)

> *Continuar MOVI KIDS **no PC** — workspace pasta C (`movikids-github`). Ler `HANDOFF_NOVO_CHAT.md`. FE **v1.9.114** Pages · GAS ping **v1.5.220**. Cadeia I153–I155 confiabilidade ✅. Tablet `?force=1.9.114`. **Não Cloud — This PC.***

**Mensagem mínima:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

---

## Evidência validada (08/09/2026 — estabilidade pós-I155)

| Check | Resultado |
|-------|-----------|
| Pages `mk-version.js` | **1.9.114** ✅ |
| `ping` GAS | **v1.5.220** online ✅ |
| `listarAtivas` | lookback **600** · **10/10** · **0 HTML 404** (antes ~37%) |
| Cache ativas | frio ~12–16s → warm **~1,5s** |
| Paridade `ativos` ≡ `listarAtivas` | ✅ · I43 startTimestamp OK |
| `resumoDia` (admin) | n=29 · nSessoes=37 · fat=781 |
| Auditoria | top **08/09** (I154 sort) |
| Smoke salvar→▶→sync | ✅ |

```powershell
$GAS = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
Invoke-RestMethod -Uri "${GAS}?action=ping" | ConvertTo-Json
node scripts\testes\teste-estabilidade-pos-i155.cjs
.\scripts\encerramento-sessao.ps1
```

**Armadilha PowerShell 5.1:** `"$GAS?action=ping"` quebra — usar **`"${GAS}?action=ping"`**.

---

## Entregas recentes (contexto)

**I155 (08/09) ✅ live:** Causa raiz 404 — lookback 600 + cache 8s · GAS **v1.5.220**. Doc: `INCIDENTE_I155_*` · evidência estabilidade.

**I154 / I154b (08/09) ✅:** Lançamento perdido HTML 404 → fila + retry · FE **v1.9.113–114** · GAS **v1.5.219**. Doc: `INCIDENTE_I154_*`

**I153 (08/09) ✅:** Histórico contas≠sessões · anular `#3465` · trava &lt;90s · FE **v1.9.112** · GAS **v1.5.218**. Doc: `INCIDENTE_I153_*`

**I152 (04/09):** Karen Freelancer + Julia pausa · GAS **v1.5.216–217**

**I151b (02/09):** Encerrar fantasma só FE · **v1.9.111**

**I150 (01/09):** Cenários DRE · FE **v1.9.109** · GAS **v1.5.214–215**

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

---

## Modelo operacional — dois aparelhos

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor **local**) | **Sócio/dev** | Código, `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** | Locações, timer, PIN, PWA na loja |

**Tablet (Ops):** https://ribocg-a11y.github.io/movikids/?force=1.9.114

---

## Produção (08/09/2026)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.9.114** | https://ribocg-a11y.github.io/movikids/?force=1.9.114 |
| **Gestão Pessoas** | **v1.9.114** | `gestao-pessoas.html?force=1.9.114` |
| **Service Worker** | **1.9.114** | I154b retry + timeout 45s |
| **GAS** | ping **v1.5.220** = repo | I155 lookback + cache ativas |
| **I155 estabilidade** | ✅ | 0 HTML 404 · lookback 600 |
| **Pasta C** | este repo | `movikids-github` no C: |
| **Planilha** | 23 abas | operação viva 08/09 |
| **Homolog tablet** | ⏳ | smoke D4 · `?force=1.9.114` |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

---

## Próximo passo (novo chat no PC)

| # | Ação | Quem | Status |
|---|------|------|--------|
| **I155** | Lookback GAS anti-404 | Agente+sócio | ✅ live ping 220 |
| **I154** | Fila/retry HTML 404 | Agente | ✅ FE 1.9.114 |
| **T1** | Tablet `?force=1.9.114` · paridade cards | Ops | ⏳ |
| **T2** | Dashboard admin labels I150 | Sócio PC | ⏳ |
| **T3** | Smoke D4 (timer, multi-veículo, idle) | Ops | ⏳ |
| **P3** | TTL cache ativas 8→15s (opcional) | Agente | 📋 se frio incomodar |
| 2 | Assinar **FASE 17** (decisão **17.5 F9**) | Sócio | ⏳ |
| 3 | Sprint E — FASE 19 | Agente | 📋 após D4 |

**Paridade diária (PC):** `listarAtivas.total` = cards Pendente+Ativa no tablet.

## Cadeia 29/08–08/09

I146 boot IDB → I147 offline → I148–I151b fantasma → I150 DRE → **I153** duplicata → **I154** 404 fila → **I155** lookback causa raiz ✅

---

## Comandos úteis (PC)

```powershell
.\scripts\encerramento-sessao.ps1
.\scripts\pre-push-check.ps1
node scripts\testes\teste-estabilidade-pos-i155.cjs
.\scripts\testes\TESTE_I151_ENCERRAR_FANTASMA_READONLY.ps1
node scripts\testes\teste-i150-cenarios-financeiros.cjs
```

Ver também: `ROTEIRO_AGENTE_OBRIGATORIO.md` · `PROTOCOLO_ATUALIZAR_TUDO.md` · `ESTADO_ATUAL.md`
