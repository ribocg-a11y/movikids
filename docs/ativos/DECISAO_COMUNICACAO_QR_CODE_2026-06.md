# Decisão operacional — Comunicação via QR Code (jun/2026)

**Data:** 06/06/2026 · **Reforço:** 14/06/2026  
**Decisão:** **Zero SMS/WhatsApp na operação** até serviço de mensagens contratado estar pronto.  
**Canal oficial no balcão:** **QR Code** → portal `acompanhar.html`.  
**Operação detalhada:** **`OPERACAO_COMUNICACAO_QR_ONLY.md`**

---

## Modo operação (14/06/2026)

| Item | Status |
|------|--------|
| Envio SMS pelo app | ⏸ **Desligado** (`MK_COMUNICACAO_MODO = 'qr_only'`, FE v1.8.20) |
| WhatsApp (manual ou F4 auto) | ⏸ **Não usar** |
| Alertas 5 min / esgotado (beep, modal) | ✅ **Ativos** — sem obrigação de mensagem |
| QR portal | ✅ **Canal único** com responsável |

**Motivo reforço:** serviço de mensagens contratado — integração **depois**; até lá nada de envio na loja.

---

## Motivo original (06/06/2026)

| Problema | Impacto |
|----------|---------|
| Várias mensagens automáticas (WhatsApp/SMS) | Conta **bloqueada 4 dias** |
| SMS no número novo | **Não entrega** |
| Risco operacional | Pais sem aviso confiável |

---

## O que usar no balcão (agora)

### 1. QR Code do portal (único canal)

| Item | Valor |
|------|-------|
| **URL** | https://ribocg-a11y.github.io/movikids/acompanhar.html |
| **Cartaz balcão** | `assets/qr-balcao-imprimir.html` |
| **Strip Home** | `#mk-qr-balcao-strip` (fixo, v1.7.89+) |

**Fluxo:** operador mostra QR → responsável escaneia → **telefone com DDD** → timer (±2s após ▶ Iniciar).

### 2. ~~WhatsApp manual~~ — pausado na operação

Código permanece no repo para reativação futura. **Não usar no balcão.**

### 3. ~~SMS~~ — pausado na operação

Gateway DJVJRL e GAS `enviarSmsResponsavel_` permanecem — **FE não chama** em `qr_only`. Reativar com `MK_COMUNICACAO_MODO = 'full'`.

---

## O que fica pausado

| Item | Status |
|------|--------|
| F4 WhatsApp/SMS automático | ⏸ |
| Botões SMS nos cards / alertas | ⏸ ocultos (v1.8.20) |
| SMS obrigatório ao esgotar tempo | ⏸ removido |
| SMS ao estender / cadastro | ⏸ |
| Campanhas / envio em sequência | ⏸ |

**Reativar quando:** serviço contratado homologado + teste entrega + decisão explícita sócio.

---

## Checklist balcão (comunicação)

| # | Ação | OK |
|---|------|-----|
| 1 | QR impresso ou strip Home visível | [ ] |
| 2 | Operador: "escaneie e coloque DDD" | [ ] |
| 3 | **Não** depender de SMS/WhatsApp | [ ] |
| 4 | Alertas do app: avisar verbalmente + QR | [ ] |
| 5 | Portal ±2s após ▶ Iniciar | [ ] |

---

## Documentos relacionados

- **`OPERACAO_COMUNICACAO_QR_ONLY.md`** — fluxo operacional
- `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` — F2/F7 (alertas sem F4/F8 SMS)
- `PLANO_CONTINUIDADE_2026-06.md`

---

*Decisão 06/06/2026 · reforço operação zero-mensagem 14/06/2026.*
