# MOVI KIDS — Estado atual (05/06/2026)

Referência única para alinhamento local × produção.

**Roadmap mestre:** `PLANO_MESTRE_REORGANIZADO_2026-06.md`  
**Handoff:** `HANDOFF_NOVO_CHAT_2026-06-05.md`  
**Incidentes:** `INCIDENTE_AUTH_OPERADORES_2026-06-04.md`, `INCIDENTE_DEPLOY_E_EXTRAS_2026-06-04.md`  
**SMS gateway:** `TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md`  
**Deploy GAS:** `DEPLOY_GAS_v1.5.32_AUTH.md`

---

## Produção (verificar após cada deploy)

| Camada | Versão alvo | URL / ID |
|--------|-------------|----------|
| **Frontend** | **v1.7.27** | https://ribocg-a11y.github.io/movikids/?force=1.7.27 |
| **Apps Script** | **v1.5.46** (clasp push + **Nova versão Web**) | Deploy `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |
| SMS Gateway Cloud | **DJVJRL** / device `wihWegHr4wXaVJQ1R-GZR` | Aparelho remoto ONLINE |
| Pacote SMS P0 | **FECHADO** | `PACOTE_SMS_P0_UNIFICADO_v1.5.38_v1.7.11.md` |
| Planilha | MOVIKIDS_Planilha_Base | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| Portal responsável | acompanhar.html | mesma base GitHub Pages |
| Cronômetro curto | track.html | URL GAS alinhada (v1.7.6+) |

**Editor Apps Script:** https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit

**Teste rápido GAS (ping):**  
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping  
→ deve retornar `versao: v1.5.46` e `postWriteActions` com as 5 escritas críticas

**URL morta (não usar):** `AKfycbzc...` → 404

---

## Arquivos canônicos

| Artefato | Arquivo |
|----------|---------|
| GAS | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (header **v1.5.46**) |
| Clasp | `gas/Code.gs` (gerado por `scripts/sync-gas-to-clasp.ps1` — não editar à mão) |
| Login | `mk-auth.js` + gate em `index.html` |
| Versão FE | `mk-version.js`, `sw.js` |
| Deploy | `DEPLOY_GAS_v1.5.32_AUTH.md`, `scripts/deploy-gas.ps1` |
| Limpeza testes | `LIMPAR_TESTES_MOVIKIDS.ps1`, action `limparLocacoesTesteAdmin` |
| Emergência | `scripts/corrigir-locacao-206.html`, `scripts/corrigir-locacoes-extras-lote.html` |

---

## Entregas recentes

| Versão | Entrega |
|--------|---------|
| **v1.7.24** | Pacote D — drawer unificado Encerrar / Estender / Editar / Cancelar |
| **v1.7.25** | Fix busca cliente passo Quem + checkbox ADM offline encerrar |
| **v1.7.26** | Pacote E — escritas críticas via POST JSON + operador obrigatório no GAS |
| **GAS v1.5.44** | `doPost` JSON; operador obrigatório nas 5 escritas |
| **GAS v1.5.45** | `limparLocacoesTesteAdmin` — anula locações de teste |
| **v1.7.27** + **GAS v1.5.46** | **Pacote F (início)** — KPIs operador, cancelamentos, ocupação frota no Dashboard |

Commits de referência: `3d9d106` (v1.7.25), `e1a56db` (Pacote E), `1454bc8` (fix scripts teste).

---

## Proteções pós-incidente (v1.7.5+)

| Proteção | Onde |
|----------|------|
| ADM encerra sem SMS de extra | frontend v1.7.5+ |
| Sem extras fantasmas com GAS offline | frontend v1.7.6 + `somentePlano` no GAS |
| Nunca `clasp deploy` | `REGRAS_DE_PUBLICACAO_SEGURA.md` Regra 8 |
| Cache / URL GAS | `mk-version.js`, `gas-endpoint.json` |
| Dados financeiros só ADM | GAS v1.5.43 + frontend v1.7.18+ |
| Testes não poluem caixa | `limparLocacoesTesteAdmin` + cleanup scripts |

---

## Auth operadores — ADM (GAS 1.5.35+)

| Ação | API |
|------|-----|
| Resetar PIN | `resetarPinOperadorAdmin` + `adminPin=1416` |
| Liberar balcão | `liberarSessaoOperadorAdmin` |
| Corrigir locação encerrada | `corrigirFinanceiroLocacaoAdmin` + `zerarExtra` (v1.5.36+) |
| Limpar locações de teste | `limparLocacoesTesteAdmin` + `motivo` ≥10 chars |
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
- [x] **Pacote D — Drawer sessão** — **v1.7.24**
- [x] **Pacote E — POST + auditoria plena** — **v1.7.26** + GAS **v1.5.44**
- [x] **Limpeza testes** — planilha + auto-cleanup nos scripts
- [x] **Pacote F — KPIs avançados (início)** — **v1.7.27** + GAS **v1.5.46**
- [ ] Fase 4 WhatsApp, Fase 8 config dinâmica, Fase 9 supervisor

---

## Ordem de retomada do planejamento (ativa)

| # | Frente | Status | Alvo |
|---|--------|--------|------|
| 1 | Publicar GAS v1.5.45+ (Nova versão Web) | **pendente manual** | ping v1.5.46 |
| 2 | Pacote F — KPIs avançados | **em andamento** | v1.7.27 + v1.5.46 |
| 3 | Validação tablet drawer 4 abas | pendente | admin logado pode bloquear |
| 4 | Fases abertas | pendente | supervisor (F9), config frota (F8), WhatsApp (F4) |

### Pacote F — escopo entregue (v1.7.27)

- Dashboard: desempenho por operador (AUDITORIA `encerrarLocacao`)
- Dashboard: cancelamentos do mês + motivos (AUDITORIA `cancelarLocacao`)
- Dashboard: ocupação da frota (% capacidade 12h/dia por veículo)
- Tile “Caixa de hoje” linka para Caixa (sem duplicar conferência)
- Horários de pico, ranking veículo, planos e pagamento — já existentes

### Pacote F — próximo incremento

- Recorrência de clientes; custos por categoria no Dashboard
- Relatório PDF alinhado aos novos KPIs
- Regressão automatizada dos campos `porOperador` / `cancelamentos` / `ocupacaoFrota`

---

## Validação rápida (pós-deploy)

1. Ping GAS → `ok:true`, `versao:v1.5.46`
2. Tablet → `?force=1.7.27`, rodapé **Online v1.7.27**
3. Login operador → Home **sem** KPIs financeiros
4. Login admin → Dashboard → seção **Gestão avançada do mês** com 3 blocos
5. `buscarKPIsAdmin` retorna `porOperador`, `cancelamentos`, `ocupacaoFrota`
6. Caixa de hoje no Dashboard abre página Caixa ao toque

Scripts: `TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1`, `TESTE_DRAWER_E_PACOTE_E.ps1`, `LIMPAR_TESTES_MOVIKIDS.ps1`

---

## Script Properties (SMS)

| Propriedade | Valor produção |
|-------------|----------------|
| `SMS_GATEWAY_USER` | `DJVJRL` |
| `SMS_GATEWAY_PASS` | `t4bh_q2x1favfo` |
| `SMS_GATEWAY_DEVICE_ID` | `wihWegHr4wXaVJQ1R-GZR` |
