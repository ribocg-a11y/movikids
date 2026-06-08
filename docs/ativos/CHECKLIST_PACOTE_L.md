# Checklist Pacote L — UX polish + QR balcão

**Data:** 08/06/2026  
**FE alvo:** **v1.7.91** · **GAS:** v1.5.69 (sem deploy)  
**Referência:** `PACOTE_L_UX_POLISH.md` · `DECISAO_COMUNICACAO_QR_CODE_2026-06.md`

---

## Automatizado (PC)

| # | Teste | Comando | Esperado |
|---|-------|---------|----------|
| L.A1 | pre-push-check | `.\scripts\pre-push-check.ps1` | Verde |
| L.A2 | Paridade cronômetro | `.\scripts\testes\TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` | OK |

---

## Tablet — operador

| # | Passo | OK |
|---|-------|-----|
| L.T1 | Atualizar app `?force=1.7.91` | [ ] |
| L.T2 | Header/sidebar: `Online · sync há Xs` atualiza | [ ] |
| L.T3 | Home: card **Portal dos pais** (visual alinhado) | [ ] |
| L.T4 | **Cartaz QR** abre `qr-balcao-imprimir.html` | [ ] |
| L.T5 | **Abrir portal** abre `acompanhar.html` | [ ] |
| L.T6 | Nova locação: barra resumo sticky desde veículo | [ ] |
| L.T7 | Painel/Nova: tiles visualmente consistentes | [ ] |

---

## Tablet — admin

| # | Passo | OK |
|---|-------|-----|
| L.A3 | Dashboard: tile Caixa = **Conferir →** (sem R$) | [ ] |
| L.A4 | Home admin: chip **Caixa hoje: N locações** | [ ] |
| L.A5 | Hub gestão: status com idade sync | [ ] |
| L.A6 | Sistema: liberar sessão (sem ir só em Operadores) | [ ] |
| L.A7 | Sistema: link cartaz QR | [ ] |

---

## Balcão — comunicação (ops)

| # | Passo | OK |
|---|-------|-----|
| L.O1 | Imprimir cartaz A5 (Ctrl+P → PDF, gráficos de fundo) | [ ] |
| L.O2 | QR fixo na mesa ou tablet dedicado | [ ] |
| L.O3 | Operador treinado: “escaneie e digite telefone com DDD” | [ ] |

---

## Fechar Pacote L

Quando **L.T1–L.A7** e **L.O1** assinados → marcar FASE 3 fechada em `PLANO_PRIORIDADES_2026-06.md`. **FASE 4** já iniciada em paralelo (`FASE_4_CONFIG_PLANILHA.md`).
