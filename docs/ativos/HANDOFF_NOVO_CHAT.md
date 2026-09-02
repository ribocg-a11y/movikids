# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 02/09/2026 · FE **v1.9.110** Pages · GAS ping **v1.5.213** (repo header **v1.5.215**) · **I151** / **I150**  
**Ambiente do agente:** **This PC (Windows)** — pasta no **C:** · **não** Cloud Agent.  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**GitHub:** `ribocg-a11y/movikids` · branch `main` · FE Pages **v1.9.110**

---

## Abrir agente no PC (C:) — ler primeiro

| Item | Valor |
|------|--------|
| **Workspace obrigatório** | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` |
| **Modo Cursor** | **Agent local / This PC** — o agente precisa rodar `.ps1`, `git`, ping GAS e OAuth no Windows |
| **Não usar** | Cloud Agent (VM Linux sem pasta C nem `clasp`/OAuth local) |
| **Confirmar no 1º turno** | `Test-Path .\scripts\relatorio-versoes.ps1` → `True` · Pages **1.9.110** |

**Sincronizar pasta C antes de codar** (se veio de outro chat / Cloud):

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
.\scripts\relatorio-versoes.ps1 -Markdown
```

---

## Mensagem para colar no novo chat (PC)

> *Continuar MOVI KIDS **no PC** — workspace pasta C (`movikids-github`). Ler `HANDOFF_NOVO_CHAT.md`. FE **v1.9.110** Pages · GAS ping **v1.5.213** (repo v1.5.215). Cadeia I146–I151. Tablet `?force=1.9.110`. **Não Cloud — This PC.***

**Mensagem mínima** (também funciona):

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

---

## Evidência validada (01/09/2026 — Cloud + GAS live)

| Check | Resultado |
|-------|-----------|
| Pages `mk-version.js` | **1.9.109** ✅ |
| `ping` GAS | **v1.5.213** online |
| `kpiMes` ago/26 `cenariosFinanceiros` | baseDre **11047** · proj3m **11875** · ritmo **16140** · manut **1200** ✅ |
| `teste-i150-cenarios-financeiros.cjs` | **16/16 ok** |
| `listarAtivas` | **total: 0** |

**Armadilha PowerShell 5.1:** `"$GAS?action=ping"` quebra a URL. Usar **`"${GAS}?action=ping"`** (chaves `${}`).

```powershell
$GAS = "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec"
Invoke-RestMethod -Uri "${GAS}?action=ping" | ConvertTo-Json
node scripts\testes\teste-i150-cenarios-financeiros.cjs
```

---

## Entregas recentes (contexto)

**I151 (02/09):** Encerrar fantasma recorrente — purge 409 + cache/snapshot. FE **v1.9.110**. Doc: `INCIDENTE_I151_ENCERRAR_FANTASMA_RECORRENTE_2026-09-02.md`

**I150 / I150b (01/09):** Dashboard cenários financeiros — Base DRE (folha + custos + manut R$1.200 + CTO ÷ 0,72) · Projetado 3 meses · Ritmo 3 dias. FE **v1.9.108–109** · GAS **v1.5.214–215**. Doc: `INCIDENTE_I150_CENARIOS_FINANCEIROS_DRE_2026-09-01.md`

**I149 (30/08):** Meta festeja R$100 com loja inteira — FE **v1.9.107**. Doc: `INCIDENTE_I149_META_FSS_100_2026-08-30.md`

**I148 (29/08):** Encerrar fantasma — FE **v1.9.107**. Doc: `INCIDENTE_I148_ENCERRAR_FANTASMA_2026-08-29.md`

**I147 (29/08):** Fase 2 offline + idempotência — FE **v1.9.104–105** · GAS **v1.5.211**. Doc: `INCIDENTE_I147_FASE2_OFFLINE_IDEMPOTENCIA_2026-08-29.md`

**GAS canônico (raw):** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

---

## Modelo operacional — dois aparelhos

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor **local**) | **Sócio/dev** | Código, `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** | Locações, timer, PIN, PWA na loja |

**Tablet (Ops):** https://ribocg-a11y.github.io/movikids/?force=1.9.110

---

## Produção (02/09/2026)

| Camada | Versão | URL / evidência |
|--------|--------|-----------------|
| **Frontend** | **v1.9.110** | https://ribocg-a11y.github.io/movikids/?force=1.9.110 |
| **Gestão Pessoas** | **v1.9.110** | `gestao-pessoas.html?force=1.9.110` |
| **Service Worker** | **1.9.110** | I151 encerrar fantasma |
| **Apps Script** | repo **v1.5.215** · ping **v1.5.213** | `cenariosFinanceiros` live · string ping ⏳ Nova versão Web |
| **Pasta C** | este repo | `movikids-github` no C: |
| **Planilha** | 23 abas | operação viva 01/09 |
| **Homolog tablet** | ⏳ | smoke D4 + Dashboard admin browser |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

---

## Próximo passo (novo chat no PC)

| # | Ação | Quem | Status |
|---|------|------|--------|
| **I150** | Cenários financeiros Dashboard (DRE / 3m / 3d) | Agente | ✅ FE+GAS |
| **T1** | Tablet `?force=1.9.109` | Ops | ⏳ |
| **T2** | Dashboard admin — validar 3 linhas + labels I150 | Sócio PC | ⏳ |
| **T3** | Smoke D4 (timer, multi-veículo, idle 10 min) | Ops | ⏳ |
| **GAS** | Nova versão Web v1.5.215 (alinhar ping) | Sócio | ⏳ |
| 2 | Assinar **FASE 17** (decisão **17.5 F9**) | Sócio | ⏳ |
| 3 | Sprint E — FASE 19 | Agente | 📋 após D4 |

**Paridade diária (PC):** `listarAtivas.total` = número de cards Pendente+Ativa no tablet.

## Cadeia 29/08–01/09

I146 boot IDB → I147 offline → I148 encerrar fantasma → I149 meta FSS → **I150 cenários DRE**

---

## Comandos úteis (PC)

```powershell
.\scripts\encerramento-sessao.ps1
.\scripts\pre-push-check.ps1
node scripts\testes\teste-i150-cenarios-financeiros.cjs
.\scripts\testes\TESTE_DASHBOARD_READONLY.ps1
```

Ver também: `ROTEIRO_AGENTE_OBRIGATORIO.md` · `PROTOCOLO_ATUALIZAR_TUDO.md` · `ESTADO_ATUAL.md`
