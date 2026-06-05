# MOVI KIDS — Estado atual (03/06/2026)

Referência única para alinhamento local × produção.

**Roadmap mestre:** `PLANO_MESTRE_REORGANIZADO_2026-06.md`  
**Incidentes:** `INCIDENTE_AUTH_OPERADORES_2026-06-04.md`, `INCIDENTE_DEPLOY_E_EXTRAS_2026-06-04.md`  
**SMS gateway:** `TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md`  
**Deploy GAS:** `DEPLOY_GAS_v1.5.32_AUTH.md`

---

## Produção (verificar após cada deploy)

| Camada | Versão alvo | URL / ID |
|--------|-------------|----------|
| **Frontend** | **v1.7.23** | https://ribocg-a11y.github.io/movikids/?force=1.7.23 |
| **Apps Script** | **v1.5.43** (colar + Nova versão Web) | Deploy `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |
| SMS Gateway Cloud | **DJVJRL** / device `wihWegHr4wXaVJQ1R-GZR` | Aparelho remoto ONLINE |
| Pacote SMS P0 | **FECHADO** | `PACOTE_SMS_P0_UNIFICADO_v1.5.38_v1.7.11.md` |
| Planilha | MOVIKIDS_Planilha_Base | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| Portal responsável | acompanhar.html | mesma base GitHub Pages |
| Cronômetro curto | track.html | URL GAS alinhada (v1.7.6+) |

**Editor Apps Script:** https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit

**Teste rápido GAS (ping):**  
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping  
→ deve retornar `versao: v1.5.43`

**URL morta (não usar):** `AKfycbzc...` → 404

---

## Arquivos canônicos

| Artefato | Arquivo |
|----------|---------|
| GAS | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (header **v1.5.43**) |
| Clasp | `gas/Code.gs` (gerado por `scripts/sync-gas-to-clasp.ps1` — não editar à mão) |
| Login | `mk-auth.js` + gate em `index.html` |
| Versão FE | `mk-version.js`, `sw.js` |
| Deploy | `DEPLOY_GAS_v1.5.32_AUTH.md`, `scripts/deploy-gas.ps1` |
| Emergência | `scripts/corrigir-locacao-206.html`, `scripts/corrigir-locacoes-extras-lote.html` |

---

## Entregas recentes (v1.7.18 → v1.7.23)

| Versão | Entrega |
|--------|---------|
| **v1.7.18** + GAS **v1.5.43** | Operador sem KPIs/financeiro; gestão só ADM (API filtrada) |
| **v1.7.19** | Botão Gerenciar oculto quando ADM; Sair do admin corrigido |
| **v1.7.21** | Sidebar plana; menu mobile único; operador só na barra lateral |
| **v1.7.22** | Fix sidebar esmagada (CSS `nav` mobile vs sidebar) |
| **v1.7.23** | Inatividade **1 hora** para todos (admin saía em 60s); timer admin `60:00` |

Commits de referência: `b4cf32d` … `361eab2` (branch `main`).

---

## Proteções pós-incidente (v1.7.5+)

| Proteção | Onde |
|----------|------|
| ADM encerra sem SMS de extra | frontend v1.7.5+ |
| Sem extras fantasmas com GAS offline | frontend v1.7.6 + `somentePlano` no GAS |
| Nunca `clasp deploy` | `REGRAS_DE_PUBLICACAO_SEGURA.md` Regra 8 |
| Cache / URL GAS | `mk-version.js`, `gas-endpoint.json` |
| Dados financeiros só ADM | GAS v1.5.43 + frontend v1.7.18+ |

---

## Auth operadores — ADM (GAS 1.5.35+)

| Ação | API |
|------|-----|
| Resetar PIN | `resetarPinOperadorAdmin` + `adminPin=1416` |
| Liberar balcão | `liberarSessaoOperadorAdmin` |
| Corrigir locação encerrada | `corrigirFinanceiroLocacaoAdmin` + `zerarExtra` (v1.5.36+) |
| Logout por inatividade | 1h sem clique/toque/teclado/scroll (`mk-auth.js` + timer admin) |

---

## Roadmap UX — pacotes

- [x] Pacote A — design system v1.7.0
- [x] Financeiro extras + histórico — v1.7.1 + GAS v1.5.37
- [x] Pacote B — Hub admin — v1.7.2
- [x] Pacote Incidente — cache, ADM SMS, offline encerrar — v1.7.4–1.7.6
- [x] Pacote C — Nova locação 3 passos — v1.7.7+
- [x] Pacote SMS P0 + gateway DJVJRL — v1.5.41 + v1.7.11
- [x] UX auth/menu (pós-C) — v1.7.18–1.7.23
- [ ] **Pacote D — Drawer sessão** ← **próximo**
- [ ] Pacote E — POST + auditoria plena (GAS v1.5.34+)
- [ ] Pacote F — KPIs avançados (Fase 10)

---

## Ordem de retomada do planejamento (ativa)

| # | Frente | Status | Alvo |
|---|--------|--------|------|
| 1 | Atualizar `ESTADO_ATUAL.md` | **feito** | v1.7.23 + v1.5.43 |
| 2 | **Pacote D** — drawer encerrar/editar/estender/cancelar | **próximo** | v1.7.24+ |
| 3 | Pacote E — segurança/auditoria backend | pendente | GAS v1.5.34+ |
| 4 | Pacote F — KPIs avançados | pendente | pós Pacote E |
| 5 | Fases abertas | pendente | supervisor (F9), config frota (F8), WhatsApp (F4) |

### Pacote D — escopo resumido

- Unificar modais de sessão em **um drawer/sheet** (mobile lateral, desktop painel).
- Abas ou seções: **Encerrar | Estender | Editar | Cancelar**.
- Reaproveitar lógica SMS/offline/ADM já em v1.7.5–1.7.6.
- Critério de pronto: encerrar locação em um único fluxo, ≤ 2 toques até ação principal.

### Pacote E — escopo resumido

- POST em actions críticas; validação de status; operador em 100% das auditorias.
- Portal responsável: token/telefone.
- Regressão verde antes de deploy.

### Pacote F — escopo resumido

- KPIs Fase 10: pico, operador, cancelamentos, ocupação frota — só após hub/admin limpos.
- Dashboard como única fonte de “gestão do mês”.

### Fases abertas (paralelo / backlog)

| Fase | Tema | Pendência principal |
|------|------|---------------------|
| **4** | WhatsApp | Mensagens obrigatórias/opcionais; registro completo |
| **8** | Config dinâmica | Frota/preços em CONFIG com fallback (hoje hardcoded) |
| **9** | Auth completo | Perfil **supervisor**; operador em custos/config; POST |

---

## Validação rápida (pós-deploy)

1. Ping GAS → `ok:true`, `versao:v1.5.43`
2. Tablet → `?force=1.7.23`, rodapé **Online v1.7.23**
3. Login operador → Home **sem** KPIs financeiros
4. Login admin → KPIs visíveis; timer inatividade inicia em **60:00**
5. Sidebar desktop → itens com texto (Home, Nova Locação…)
6. Mobile → menu só na barra inferior; sem nome do operador no header
7. Nova locação → 3 passos; SMS boas-vindas
8. Sessão única → trava 409 + liberar balcão ADM

Scripts: `TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1`, `TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1`

---

## Script Properties (SMS)

| Propriedade | Valor produção |
|-------------|----------------|
| `SMS_GATEWAY_USER` | `DJVJRL` |
| `SMS_GATEWAY_PASS` | `t4bh_q2x1favfo` |
| `SMS_GATEWAY_DEVICE_ID` | `wihWegHr4wXaVJQ1R-GZR` |
