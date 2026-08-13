# MOVI KIDS — Baseline código P0 (não mexer)

**Criado:** 10/07/2026 · **FE baseline:** v1.9.39 · **GAS prod (ping):** v1.5.187  
**Objetivo:** zona congelada — agente só edita o que o pedido exige; **correção cirúrgica**, não refatoração.

---

## Regra de ouro

> Se não está na lista **“Pode editar”** abaixo **e** o usuário não pediu explicitamente → **não tocar**.

Antes de editar qualquer arquivo P0: ler este doc + `MAPA_ERROS_FALHAS_BUGS.md` (I15, I16, I20, I43).

---

## Congelado — NÃO editar (salvo pedido explícito §7.3)

| Zona | Arquivos | Por quê |
|------|----------|---------|
| **Cronômetro** | `mk-sync.js` (`mergeSessaoCanonica`, `aplicarDadosInicio`), `mk-operacao.js` (`iniciarContagem`), `mk-sessao.js` (`canonSessao_`, `effectiveStartTs_`) | I16, I20, I43 |
| **API browser** | `mk-api.js` (`api`, `mkGuardEscritaBrowser_`, `MK_WRITE_ACTIONS`) | I15 — GET only |
| **Auth / PIN** | `mk-auth.js`, gates `#mk-auth-gate`, `#gp-auth-gate` | I28, I47, I64 |
| **Apps Script canônico** | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` | Só sócio + Nova versão Web · **I115/I116:** slim painel Colaboradores só com §7.3 |
| **Sync pesado** | `mk-sync.js` (controller principal), `carregarInicio` consumers | I20, I86, **I145** — exceções: `_novaSavingInFlight` em `mkSyncDeferHeavy_`; idle/visibility **sem** `force=1` |
| **Home cards ativos** | `mk-home.js` (`buildCard` timer ativo, `calcRemaining`) | I20 paridade |
| **SW GAS bypass** | `sw.js` (não interceptar script.google.com) | I35 |

---

## Editável com cuidado (só o necessário)

| Zona | Arquivo | Escopo permitido |
|------|---------|------------------|
| **Nova locação** | `mk-nova.js` | Cesta multi, `confirmarLocacao`, overlay, draft — **não** mudar contrato `salvarLocacao` |
| **Nova UI** | `index.html` `#page-nova`, `#nova-saving-overlay` | HTML do fluxo nova |
| **CSS nova** | `mk-app.css` seções `.nova-*`, `.nova-saving-*` | Visual cesta/overlay |
| **Versão FE** | `mk-version.js`, `sw.js`, `?v=` index + gestao-pessoas | I3/I24 junto |
| **Docs ativos** | `HANDOFF`, `MAPA_ERROS`, incidentes | Registro |

---

## Contratos que NÃO mudam

1. Escritas GAS no browser = **GET** (`action=salvarLocacao`, params query).
2. **1 veículo** → uma chamada `salvarLocacao` → card Pendente → ▶ inicia timer.
3. **N veículos** → batch `salvarLocacoesMulti` se `ping.postWriteActions` listar (GAS **v1.5.187** Web); senão N× `salvarLocacao` sequencial.
4. Overlay salvamento: sempre some no `finally`; watchdog + dismiss se travar.
5. `_novaSavingInFlight` + `_novaSaveGen` — mutex anti-duplicata; sync defer durante save (mk-sync).

---

## Batch GAS (prod v1.5.187+)

- Action `salvarLocacoesMulti` ativa quando `ping.postWriteActions` incluir a action.
- FE chama batch após warm no boot (`window._mkGasBatchOk`).
- GAS valida **todos** os itens antes de `appendRow` (I98c).

---

## Checklist antes de push FE

```text
[ ] Não editei mk-sync / mk-sessao / mk-operacao / mk-api / mk-auth?
[ ] confirmarLocacao 1 veículo = mesmo fluxo de antes?
[ ] Bump mk-version + sw + ?v= (I3)?
[ ] git push + Pages v1.9.x live?
```

---

## Referência commit baseline FE

Branch `main` após **I103 v1.9.39** (10/07/2026): encerradas contas únicas · caixa todas locações · multi-veículo cesta.
