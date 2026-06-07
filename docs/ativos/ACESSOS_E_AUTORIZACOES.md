# MOVI KIDS — Acessos e autorizações

**Atualizado:** 07/06/2026  
**Função:** mapa único de **quem pode o quê** — app, infraestrutura e agente Cursor.  
**Complementa:** `ESTADO_ATUAL.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`, `DEPLOY_GAS_v1.5.32_AUTH.md`

---

## 1. Papéis no aplicativo (produção)

| Papel | Como entra | O que pode | O que não pode |
|-------|------------|------------|----------------|
| **Operador** | Nome + PIN na tela de login | Nova locação, encerrar, estender, editar, cancelar, drawer, SMS manual | KPIs financeiros do mês, Dashboard admin, custos, config frota, import CRM |
| **Administrador** | PIN **1416** (gate ou cadeado na sidebar) | Tudo do operador + Dashboard, Caixa detalhado, KPIs, payback, reset PIN, liberar sessão, corrigir financeiro, limpar testes, import RESPONSAVEIS | — |
| **Supervisor** | Perfil em `OPERADORES_SISTEMA` col. `perfil` | Código existe (v1.5.50) | **F9 PAUSADA** — em produção operadores têm autonomia total (v1.5.52 reverteu restrições) |
| **Portal responsável** | Telefone em `acompanhar.html` | Ver cronômetro, foto moldura | Sem PIN; sem dados de outros responsáveis |

**Sessão balcão:** uma sessão ativa por vez no GAS. Outro operador → 409 até ADM liberar (`liberarSessaoOperadorAdmin`).

**Chip Turno:** prova visual de operador logado — Home sozinha não basta (I19).

---

## 2. Dados financeiros e gestão (GAS v1.5.43+)

Exigem `adminPin=1416` ou `authRole=admin` no request:

| API / área | Restrição |
|------------|-----------|
| `buscarKPIsAdmin` | Só admin — payback, Pacote F, fatAno |
| `listarCustos` / custos | Só admin |
| `criarAnalise` / relatório PDF | Só admin |
| `salvarOperacaoConfigAdmin` | Só admin |
| `importarResponsaveisAdmin` | Só admin |
| Home operador | **Sem** grid KPI mensal (Pacote I) — só chip “Hoje → Caixa” |

Operador nas 5 escritas críticas: deve enviar `operador` / `operadorId` (GET no browser — I15).

---

## 3. APIs administrativas (PIN 1416)

| Ação | API GAS | Parâmetros chave |
|------|---------|------------------|
| Resetar PIN operador | `resetarPinOperadorAdmin` | `adminPin`, `operadorId` |
| Liberar sessão balcão | `liberarSessaoOperadorAdmin` | `adminPin` |
| Deslogar operador específico | `liberarSessaoOperador` | `adminPin`, `operadorId` |
| Corrigir locação encerrada | `corrigirFinanceiroLocacaoAdmin` | `adminPin`, `zerarExtra` opcional |
| Limpar locações de teste | `limparLocacoesTesteAdmin` | `adminPin`, `motivo` ≥10 chars, `soHoje` opcional |
| Import CRM (K.1) | `importarResponsaveisAdmin` | `adminPin`, `dryRun` |

**No app:** menu Administrador (PIN 1416) → Operadores → reset / liberar sessão.

**Emergência (browser local):** `scripts/liberar-eduarda-agora.html`, `scripts/liberar-milena-agora.html` — adaptar `operadorId`.

**Incidente completo:** `docs/arquivo/incidentes/INCIDENTE_AUTH_OPERADORES_2026-06-04.md`

---

## 4. Infraestrutura — quem executa cada ação

| Ação | Quem executa | Agente Cursor pode? | Notas |
|------|--------------|---------------------|-------|
| `git push` (FE → GitHub Pages) | Dev / agente | ✅ Sim | Após `pre-push-check.ps1` |
| Editar código local | Dev / agente | ✅ Sim | `.gs` canônico na raiz |
| `clasp push` | Dev / agente | ✅ Sim | Via `scripts/deploy-gas.ps1` |
| **Nova versão Web GAS** | **Só humano** | ❌ Não | Editor Google → mesmo Deploy ID `AKfycbwakQ...` |
| `clasp deploy` | **Proibido** | ❌ Nunca | Quebrou produção 04/06 (I1) |
| Atualizar tablet `?force=` | **Ops balcão** | ❌ Não | Físico no shopping |
| Editar planilha base | Dono conta Google | ⚠️ Agente orienta | Link em `ESTADO_ATUAL.md` |
| Script Properties SMS | Dono projeto GAS | ⚠️ Agente orienta | Valores em `ESTADO_ATUAL.md` § Script Properties |
| Gateway SMS envio | Ops manual / GAS | Parcial | F4 auto **pausado** — QR portal é canal oficial |
| Commit com segredos | — | ❌ Nunca | Sem `.env`, tokens, senhas novas no git |

---

## 5. Contas e URLs (sem senhas neste doc)

| Recurso | Onde está |
|---------|-----------|
| **GitHub** | `ribocg-a11y/movikids` · branch `main` · Pages automático no push |
| **Repo local** | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` |
| **Apps Script** | Projeto `19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8` — link em `DEPLOY_GAS_v1.5.32_AUTH.md` |
| **Web App exec** | Deploy `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |
| **Planilha** | `MOVIKIDS_Planilha_Base` — link em `ESTADO_ATUAL.md` |
| **SMS gateway** | DJVJRL — credenciais nas **Script Properties** do GAS (ver `ESTADO_ATUAL.md`) |
| **URL morta** | `AKfycbzc...` — **não usar** (404) |

**Conta Google:** o humano dono do projeto GAS e da planilha é quem autoriza deploy Web e compartilhamento. O agente **não tem** login Google — só prepara código e instrui.

---

## 6. Portal do responsável

| Item | Regra |
|------|-------|
| Autenticação | Telefone cadastrado — sem PIN |
| Rate limit GAS | 20 req/min por telefone, 150/min global (v1.5.54) |
| Dados expostos | Só locações daquele telefone |
| QR balcão | Canal oficial (F4 WhatsApp auto pausado) |

---

## 7. O que o agente Cursor deve assumir

**Pode fazer sem pedir autorização extra:**

- Ler docs em `docs/ativos/`
- Editar código, rodar testes locais, `pre-push-check`
- `git commit` / `git push` **se o usuário pedir**
- `clasp push` (nunca deploy)

**Deve pedir confirmação explícita do usuário:**

- Deploy GAS (**Nova versão** — lembrar que é passo manual no editor)
- Mudanças em auth, PIN, perfis, `api()`
- Reativar F4 (WhatsApp auto) ou F9 (supervisor)
- Operações destrutivas na planilha ou limpeza em produção
- `git push` para `main` se o usuário não pediu

**Nunca fazer:**

- `clasp deploy` ou novo Deploy ID GAS
- POST JSON no `api()` do browser (I15)
- Commitar senhas, PINs novos ou credenciais
- Inventar versão ou caminho do `.gs`

---

## 8. Checklist rápido para novo chat

Quando o usuário pedir continuidade, o agente deve saber:

1. **Operação balcão** = operador + PIN; **gestão** = admin 1416.
2. **Publicar FE** = agente; **publicar GAS** = humano no editor.
3. **Tablet** = Ops; agente só documenta `?force=versão`.
4. **Supervisor e WhatsApp auto** = pausados.
5. Detalhe de incidentes auth → `INCIDENTE_AUTH_OPERADORES_2026-06-04.md`.

---

*Revisar ao mudar auth, deploy ou papéis de operador.*
