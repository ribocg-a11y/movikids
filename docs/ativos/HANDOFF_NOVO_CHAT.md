# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 29/09/2026 · FE **v1.9.122** Pages · GAS repo **v1.5.223** (ping Web ainda **v1.5.221** até Nova versão) · **I159c** La Ville no GAS · **I158** ✅

## Produção (agora)

| Camada | Versão | Link |
|--------|--------|------|
| Frontend | **v1.9.122** | https://ribocg-a11y.github.io/movikids/?force=1.9.122 |
| Gestão Pessoas | **v1.9.122** | `gestao-pessoas.html?force=1.9.122` |
| GAS | ping Web **v1.5.221** · repo **v1.5.223** | I159c no repo — **Nova versão Web** para validar LV* |
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
| Setembro prévia **29/09** (`kpiMes`) | R$ **14.371** · **675** contas · extra **R$ 8** · CTO **R$ 1.500** (10% = 1.437,10) |
| PDF setembro prévia | `entregas/MOVI-KIDS-Relatorio-Setembro-2026-Golden-previa-2026-09-29.pdf` |
| PDF ago dia a dia | `entregas/MOVI-KIDS-Relatorio-Agosto-2026-Golden-diario.pdf` |
| Docs | `INCIDENTE_I158_*` · `guard.i158.fe.golden` · `TESTE_I158_GOLDEN_*` |

**CTO R$ 1.500 ≠ caixa R$ 15.000:** é o **mínimo contratual** do mês. Em 29/09, 10% de 14.371 = **1.437,10** &lt; mínimo → paga 1.500. A projeção do `kpiMes` (~R$ 15.028) passa de R$ 15.000: se o fechamento real ultrapassar isso, o CTO vira **10%**.

**PDF prévia gerada em 29/09** (mesmo HTML do botão Salvar PDF Golden + faixa “não enviar”). **Não mandar ao shopping ainda** — falta o dia 30. Em **01/10**: Admin → Relatório → Setembro → conferir o fechamento → PDF / e-mail (fluxo FE; e-mail GAS legado desligado).

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
| 1º turno | `.\scripts\relatorio-versoes.ps1 -Markdown` · Pages **1.9.122** · ping **v1.5.221** |

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
.\scripts\relatorio-versoes.ps1 -Markdown
```

---

## Mensagem para colar no novo chat (PC)

> *Continuar MOVI KIDS **no PC** — pasta C (`movikids-github`). Ler `HANDOFF_NOVO_CHAT.md`. FE **v1.9.122** Pages · GAS ping **v1.5.221**. **I159b** preços La Ville no FE (frota provisória LV*) · **I158** ✅. Setembro prévia 29/09 R$ 14.371 / CTO R$ 1.500. Tablet `?force=1.9.122`. Próximo: frota real + §7.3 GAS La Ville · PDF 01/10. **This PC.***

**Mínima:**

> *Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.*

---

## Próximo passo

| # | Ação | Quem | Status |
|---|------|------|--------|
| 0 | **I159** hub + `unidadeId` | Agente | ✅ FE **v1.9.121** |
| 0b | **I159b** tabelas La Ville no FE | Agente | ✅ FE **v1.9.122** · frota provisória LV* |
| 0c | Confirmar **quantidade** frota + CTO e-mail La Ville | Sócio | ⏳ |
| 0d | **I159c** GAS preços/frota por `unidadeId` | Agente | ✅ repo **v1.5.223** — falta **Nova versão Web** |
| 0e | Sócio: colar raw + Nova versão Web (mesmo Deploy ID) | Sócio | ⏳ liberar lançamentos LV |
| 1 | PDF Golden setembro prévia 29/09 | Agente | ✅ em `entregas/` — **não enviar** |
| 1b | Regenerar/enviar fechamento **01/10** | Sócio | Admin FE 1.9.122 |
| 3 | Tablet smoke D4 · `?force=1.9.122` | Ops | ⏳ |
| 4 | Assinar FASE 17 (decisão 17.5 F9) | Sócio | ⏳ |

**Plano:** `docs/ativos/PLANO_MULTI_UNIDADE_GOLDEN_LAVILLE_2026-09.md`

---

## Comandos úteis (PC)

```powershell
.\scripts\encerramento-sessao.ps1
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY.ps1
node scripts\testes\teste-estabilidade-pos-i155.cjs
```

Ver: `ROTEIRO_AGENTE_OBRIGATORIO.md` · `PROTOCOLO_ATUALIZAR_TUDO.md` · `ESTADO_ATUAL.md` · `MAPA_ERROS_FALHAS_BUGS.md`
