# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 29/09/2026 · FE **v1.9.120** Pages ✅ · GAS ping **v1.5.221** · **I158** Golden FE ✅ publicado

## Produção (agora)

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.120** | https://ribocg-a11y.github.io/movikids/?force=1.9.120 |
| Gestão Pessoas | **v1.9.120** | `gestao-pessoas.html?force=1.9.120` |
| GAS | ping **v1.5.221** = repo | **sem mudança** nesta entrega |
| Design System | v1.1 | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**GAS raw:** https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs  

**GAS canônico (PC):**  
`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

**Deploy ID:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

---

## I158 — Relatório Golden (fechado nesta sessão)

| Item | Valor |
|------|--------|
| Problema | PDF/e-mail GAS contava **Cancelada** → fat/CTO inflados |
| Correção | FE **v1.9.120** — `mkHtmlRelatorioGoldenFromKpi_` via **`kpiMes`** (sem AppScript) |
| Agosto enviado (histórico) | R$ **17.212** · 957 · CTO **R$ 1.721,20** — **não reenviar** |
| Setembro correto (prévia) | R$ **14.332** · **673** contas · extra **R$ 8** · CTO **R$ 1.500** (mínimo > 10%) |
| PDF ago dia a dia | `entregas/MOVI-KIDS-Relatorio-Agosto-2026-Golden-diario.pdf` |
| Docs | `INCIDENTE_I158_*` · `guard.i158.fe.golden` · `TESTE_I158_GOLDEN_*` |

**CTO R$ 1.500 ≠ caixa R$ 15.000:** é o **mínimo contratual** do mês; 10% de 14.332 = 1.433,20 &lt; mínimo → paga 1.500.

**Como gerar setembro:** Admin → Relatório → Setembro → Ver → conferir **14.332** → PDF / e-mail (fluxo FE; e-mail GAS legado desligado).

---

## Erros do agente nesta sessão (registrar — não repetir)

| # | Erro | Regra violada | Correção |
|---|------|---------------|----------|
| 1 | Entregou números `kpiMes` (16.140) quando o sócio pediu o relatório **igual ao enviado ao Golden** (17.212) | Ouvir pedido literal | Agosto histórico = GAS legado; set+ = caixa |
| 2 | Propôs/alterou `.gs` e depois reverteu; confusão “cadê o código AppScript?” | Usuário: sem AppScript agora | Correção I158 = **só FE** |
| 3 | **Demorou a publicar FE** (Pages ficou em 1.9.119) esperando o sócio pedir merge | **§7.2 / I24** — commit+push FE **sem pedir** | Merge+push `main` na hora; `encerramento-sessao` exit 0 |
| 4 | Respostas longas / links misturados (GAS vs FE) | Clareza operacional | Uma frase: “novo código = `mk-admin.js` no GitHub; Code.gs sem mudança” |

**Lição:** correção FE pronta → **publicar na mesma sessão**. Não transferir “merge/push” ao usuário.

---

## Ops RH

| Pessoa | Status |
|--------|--------|
| **Karen** id5 | Operadora ativa · Sem PIN (1º acesso) · Freelancer |
| **Julia** id4 | **Pausa** — fora do login balcão |

**Ambiente:** Cloud Agent OK para FE/docs · pasta C / AppScript = sócio no PC.  
**GitHub:** `ribocg-a11y/movikids` · `main`

---

## Travas confiabilidade

| Família | Travas |
|---------|--------|
| **I158** Golden | `guard.i158.fe.golden` · `TESTE_I158_*` · Relatório via kpiMes |
| **I151** fantasma | `guard.i151.*` · `TESTE_I151_*` |
| **I153–I155** | duplicata / 404 / lookback 600 |

---

## Abrir agente no PC (C:)

| Item | Valor |
|------|--------|
| Workspace | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` |
| Modo | **Agent local / This PC** |
| 1º turno | `.\scripts\relatorio-versoes.ps1 -Markdown` · Pages **1.9.120** · ping **v1.5.221** |

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
.\scripts\relatorio-versoes.ps1 -Markdown
```

---

## Mensagem para colar no novo chat (PC)

> *Continuar MOVI KIDS **no PC** — pasta C (`movikids-github`). Ler `HANDOFF_NOVO_CHAT.md`. FE **v1.9.120** Pages · GAS ping **v1.5.221**. **I158** Golden via kpiMes ✅. Setembro prévia R$ 14.332 / CTO R$ 1.500. Tablet `?force=1.9.120`. Próximo: gerar PDF Golden setembro + smoke tablet D4 / FASE 17. **This PC.***

**Mínima:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

---

## Próximo passo

| # | Ação | Quem |
|---|------|------|
| 1 | Gerar/enviar relatório Golden **setembro** (conferir 14.332) | Sócio — admin FE 1.9.120 |
| 2 | Tablet smoke D4 · `?force=1.9.120` | Ops |
| 3 | Assinar FASE 17 (decisão 17.5 F9) | Sócio |
| 4 | (Opcional) Alinhar `_gerarHtmlRelatorio_` no GAS — só com pedido §7.3 | Sócio+agente |

---

## Comandos úteis (PC)

```powershell
.\scripts\encerramento-sessao.ps1
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY.ps1
node scripts\testes\teste-estabilidade-pos-i155.cjs
```

Ver: `ROTEIRO_AGENTE_OBRIGATORIO.md` · `PROTOCOLO_ATUALIZAR_TUDO.md` · `ESTADO_ATUAL.md` · `MAPA_ERROS_FALHAS_BUGS.md`
