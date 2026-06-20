# INCIDENTE I32 — Nova locação duplicada + fluxo SMS legado

**Data:** 20/06/2026  
**Severidade:** P0 operação  
**Status:** ✅ **Resolvido** FE **v1.8.68+** (commit `4485c09`)  
**Arquivos:** `mk-nova.js` · `index.html`

---

## Sintoma

- Locações **duplicadas** no balcão (dois cards / duas linhas planilha em clique duplo ou sync)
- Fluxo Nova locação ainda exibia **"Salvar e enviar SMS"** e tentava lógica SMS
- Modo operação oficial: **QR/portal only** (`MK_COMUNICACAO_MODO = 'qr_only'`) — deveria ir direto ao cadastro + ▶ Iniciar

---

## Causa raiz

1. **`sessions.push`** sem dedupe local após `salvarLocacao` — race entre push local e `syncController`
2. **`confirmarLocacaoEEnviarSms_`** ainda chamava GAS SMS e duplicava caminho de save
3. Botões SMS visíveis no passo Fechar apesar de `mkComunicacaoQrOnly_()` no resto do app
4. Sem mutex **`_novaSavingInFlight`** — double-click gerava dois `salvarLocacao`

---

## Correção (FE)

| Mudança | Arquivo |
|---------|---------|
| `_novaSavingInFlight` + toast "já salvando" | `mk-nova.js` |
| `upsertSessaoPendenteLocal_()` por `rowIndex`/`id` | `mk-nova.js` |
| `confirmarLocacaoEEnviarSms_` → delega `confirmarLocacao()` | `mk-nova.js` |
| Ocultar botão SMS no Fechar; hint QR/portal | `index.html` + `toggleBotoesConfirmarNova_` |

---

## Trava

| Regra | Detalhe |
|-------|---------|
| qr_only | Nunca reexpor SMS no cadastro Nova locação sem revisão de produto |
| Upsert local | Após `salvarLocacao`, upsert — nunca `push` cego |
| Mutex save | `_novaSavingInFlight` até finally |
| pre-push | `guard.nova.sms.sem.autoStart` (I20) — manter verde |

---

## Teste tablet (obrigatório pós-deploy)

- [ ] Uma Nova locação → **um** card Pendente
- [ ] Double-tap em Salvar → **uma** locação na planilha
- [ ] Sem botão SMS no Fechar; hint QR/portal
- [ ] ▶ Iniciar separado (I20)

```powershell
.\scripts\testes\TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1
```

---

## Commits

- `4485c09` — fix dedupe + desativar SMS no fechamento
- Publicado FE v1.8.68 → force update v1.8.69/1.8.70
