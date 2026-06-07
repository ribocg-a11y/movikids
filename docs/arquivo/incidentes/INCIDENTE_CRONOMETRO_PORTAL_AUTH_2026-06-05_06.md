# Incidentes 05–06/06/2026 — Cronômetro portal, auth balcão e idle com locação

**Registrado em:** 06/06/2026 10:34 · **I20** 05/06/2026  
**Objetivo:** documentar causas, correções, travas e testes para **não repetir** e **passar na regressão**.

**Mapa vivo (consulta rápida):** `MAPA_ERROS_FALHAS_BUGS.md`  
**Handoff:** `HANDOFF_NOVO_CHAT_2026-06-05.md` (seção mapa)

---

## Resumo executivo

| # | Incidente | Data | Severidade | Status código | Deploy pendente |
|---|-----------|------|------------|---------------|-----------------|
| **I16** | Cronômetro portal ≠ balcão | 05/06 | P1 | **Corrigido** FE + GAS repo | GAS **v1.5.55+** Nova versão Web se ping &lt; 55 |
| **I17** | Liberar sessão operador — UI não atualiza | 05/06 | P1 | **Corrigido** v1.7.45 | FE v1.7.45+ no tablet |
| **I18** | Logout 1h com locação ativa no tablet | 06/06 | P1 | **Corrigido** v1.7.46 | FE v1.7.46+ no tablet |
| **I20** | Timer inicia sozinho / adiantado — hora do cadastro em col C | 05/06 | **P0** | **Corrigido** GAS v1.5.64 + FE v1.7.74 | GAS **v1.5.64** Nova versão Web; FE `?force=1.7.74` |

Incidentes já documentados (mesma janela): **I15** POST browser (`INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md`).

---

## I16 — Cronômetro do responsável diferente do balcão

### O que o operador viu (05/06)

- Celular em `acompanhar.html` mostrava **um tempo** (anel / MM:SS).
- Tablet no balcão mostrava **outro tempo** para a **mesma locação**.
- Diferença podia ser de vários minutos, não só latência de rede.

### Causa raiz

1. **GAS `buscarPortalResponsavel`** devolvia `startTimestamp` **bruto** da coluna Y (planilha), sem `timestampCanonico_`.
2. **Balcão** (`carregarInicio` + `mergeSessaoCanonica`) já usava `timestampCanonico_(data, hora, ts)` e recalculava relógio adiantado (&gt; now + 5 min).
3. **Portal** calculava restante a partir do timestamp errado; `mins` às vezes sem `originalMins` + `extendedMins` alinhados ao balcão.
4. Portal **não** re-sincronizava com a mesma cadência do balcão.

### Correção aplicada

| Camada | Versão | O quê |
|--------|--------|-------|
| GAS | **v1.5.55** | `buscarPortalResponsavel_` e `carregarInicio_` ativas: `timestampCanonico_`, `mins = minContrat + extendedMins`, `originalMins`, `extendedMins` |
| FE | **v1.7.41+** (portal) | `acompanhar.html`: `calcStartTimestamp_`, `canonLoc_`, `restante()` espelham `mergeSessaoCanonica` + `calcStartTimestamp` do `index.html` |
| FE | portal | Auto-refresh **15s** + `cache: 'no-store'` + tick 1s só na UI |

### Verificação — está realmente solucionado?

**No repositório:** sim — lógica alinhada em GAS (header v1.5.55+) e `acompanhar.html` (`canonLoc_`).

**Em produção:** confirmar ping ≥ **v1.5.55** e FE portal com `canonLoc_`:

```text
https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping
```

Se ping &lt; v1.5.55 → **Nova versão Web** no editor (não basta `clasp push`).

**Teste automatizado obrigatório:**

```powershell
.\TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1
```

Compara, para cada locação ativa com telefone, campos `startTimestamp`, `mins`, `originalMins`, `extendedMins` entre `carregarInicio.ativos` e `buscarPortalResponsavel.locacoes`.

### Travas de segurança (não repetir)

| Trava | Onde |
|-------|------|
| Portal **só** calcula tempo via `canonLoc_()` / `restante()` | `acompanhar.html` |
| GAS portal **obrigado** `timestampCanonico_` em Ativa | `buscarPortalResponsavel_` |
| Balcão **obrigado** `mergeSessaoCanonica` | `index.html` |
| Teste paridade cronômetro no pre-push | `scripts/pre-push-check.ps1` + `TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` |
| Check estático: `canonLoc_` + `calcStartTimestamp_` no portal | `pre-push-check.ps1` |

### Checklist manual (tablet + celular)

1. Iniciar locação no balcão; anotar MM:SS do card.
2. Abrir `acompanhar.html` com o telefone do responsável.
3. Tempos devem coincidir ± **2 s** (não minutos).
4. Estender +10 min no balcão; em até 15 s o portal deve refletir.
5. Recarregar portal (Ctrl+F5) — tempo continua alinhado ao balcão.

---

## I20 — Cronômetro inicia sozinho e já adiantado (col C = hora do cadastro)

### O que o operador viu (05/06)

- Nova locação cadastrada (ex. plano **10 min**) aparecia no card com **9:30** ou outro valor **sem ter apertado ▶**.
- O cronômetro **contava sozinho** desde o momento do cadastro, não desde o botão iniciar.
- Em alguns casos o status ficava `Ativa` sem `iniciarTimer`, piorando o efeito.

### Causa raiz — regra de ouro violada

> **Não inferir início pela hora do cadastro.**

| Coluna | Nome na planilha | Papel correto |
|--------|------------------|---------------|
| **B** | Data | Data do cadastro (`dd/MM/yyyy`) |
| **C** | Hora Início | Hora **legível** (HH:mm) — **somente** quando o operador aperta **▶** |
| **Y (25)** | `startTimestamp` | Instantâneo **em ms** (relógio servidor GAS) — **fonte do cronômetro** |
| **O (15)** | Status | `Pendente` no cadastro; `Ativa` **só** após `iniciarTimer` |

**O que estava errado:**

1. `salvarLocacao_` gravava **col C** com `fmtHoraLocal_(agora)` no cadastro.
2. FE/GAS usavam `timestampCanonico_(data, horaInicio, ts)` com **fallback** para `data + horaInicio` quando col Y estava vazia ou `0`.
3. Resultado: countdown = `agora - horaCadastro`, não `agora - horaDoBotao`.

**Não precisa de coluna nova** para corrigir o bug: col **Y** já existia como “hora do botão” técnica. Col **C** passa a ser só exibição/relatório preenchida no mesmo instante do ▶.

### Correção aplicada

| Camada | Versão | O quê |
|--------|--------|-------|
| GAS | **v1.5.64** | `salvarLocacao_`: col C = `''`, status `Pendente`, col Y = `0` |
| GAS | **v1.5.64** | `iniciarTimer_`: col Y = `serverTs`; col C = `fmtHoraLocal_(agora)`; status `Ativa` |
| GAS | **v1.5.64** | `timestampCanonico_`: **sem fallback** por data/hora cadastro — retorna `0` se Y inválida |
| FE | **v1.7.73–74** | `canonSessao_`, `sessaoTimerIniciado_`: timer só se col Y ≥ 1e12 |
| FE | **v1.7.74** | `iniciarContagem`: `started=true` **após** GAS confirmar |
| Portal | **v1.7.73+** | `canonLoc_` alinhado — sem inferir por hora cadastro |

### Verificação — está realmente solucionado?

**No repositório:** sim — ver trechos em `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (`salvarLocacao_`, `iniciarTimer_`, `timestampCanonico_`) e `mk-sessao.js` (`canonSessao_`).

**Em produção:** ping GAS ≥ **v1.5.64** + tablet com FE **v1.7.74** (`?force=1.7.74`).

**Teste manual obrigatório (tablet):**

1. Encerrar locações antigas de teste.
2. Nova locação plano 10 min → card **Pendente**, display **10:00**, timer **parado**.
3. Aguardar 1–2 min **sem** apertar ▶ → display continua **10:00**.
4. Apertar ▶ → timer começa em **10:00** e conta normalmente.
5. Portal (`acompanhar.html`) alinhado ao balcão ±2 s (I16).

### Travas de segurança (não repetir)

| Trava | Onde |
|-------|------|
| Col C vazia no cadastro | `salvarLocacao_` → `row[2] = ''` |
| Col Y só em `iniciarTimer_` | `iniciarTimer_` → `setValue(serverTs)` col 25 |
| Sem fallback data+hora | `timestampCanonico_` → `return 0` |
| FE não inicia sem Y válida | `mk-sessao.js` → `sessaoTimerIniciado_` |
| Check estático GAS | `pre-push-check.ps1` → `guard.gas.salvar.horaVazia`, `guard.gas.timestamp.noFallback` |

### O que NÃO fazer de novo (I20)

1. Preencher **Hora Início (C)** em `salvarLocacao` ou em qualquer fluxo que não seja `iniciarTimer`.
2. Calcular `startTimestamp` a partir de `data + horaInicio` quando col Y estiver vazia.
3. Marcar `started=true` no FE antes do GAS confirmar `iniciarTimer`.
4. Assumir que “Hora Início” na planilha significa “hora do cadastro” — significa **hora do ▶**.

### Relação com I16

- **I16** = paridade portal × balcão (`timestampCanonico_` no portal GAS + `canonLoc_`).
- **I20** = semântica das colunas C/Y — **quando** o relógio começa a contar.
- Ambos precisam estar corretos; corrigir só I16 **não** resolve timer adiantado se C ainda for preenchida no cadastro.

---

## I17 — ADM libera sessão do operador mas UI não muda

### O que aconteceu (05/06)

- ADM clicava **Liberar sessão** no GAS (sessão ficava `null` no servidor).
- Banner do balcão **continuava** mostrando operador logado.
- Causa dupla: `atualizarOperadorUI_()` não era chamada após liberar; GET ao GAS **sem** `cache: 'no-store'` (tablet/PWA servia resposta antiga).

### Correção

| Versão | O quê |
|--------|-------|
| v1.7.44 | `mkAuthSyncSessaoBalcaoUI_()` após liberar sessão |
| v1.7.45 | `api()` GET com `cache: 'no-store'` + `_t` anti-cache; feedback verde/vermelho no banner; alerta se servidor ainda mostra operador |

### Travas

| Trava | Onde |
|-------|------|
| Sync UI após mutação de sessão | `mk-auth.js` → `mkAuthSyncSessaoBalcaoUI_` |
| GET sem cache em leituras críticas de sessão | `index.html` `api()` |
| Check estático `cache: 'no-store'` em mk-auth paths | revisão em PR / handoff |

### Teste manual

1. Operador A logado no tablet.
2. ADM → Liberar sessão.
3. Banner deve limpar em &lt; 5 s sem Ctrl+F5.
4. Operador B consegue logar sem 409.

---

## I18 — Logout por inatividade (1 h) com locação ativa

### O que aconteceu (06/06)

- Após 1 h sem toque, `trocarOperador('inatividade')` e `tickAdmin` deslogavam **mesmo com locação Pendente/Ativa** no balcão — risco operacional (perda de contexto, escritas bloqueadas).

### Correção — v1.7.46

- `mkHasLocacaoAbertaNoTablet_()` — lê `window.sessions` e `localStorage.mk_sessions`.
- `checkAuthIdle_()` e `mkAuthBoot` **não** deslogam se houver locação aberta.
- `tickAdmin()` **pausa** countdown admin enquanto houver locação aberta.

### Travas

| Trava | Onde |
|-------|------|
| Guarda idle + locação | `mk-auth.js` |
| Guarda admin timer | `index.html` `tickAdmin` |
| Check estático `mkHasLocacaoAbertaNoTablet_` | `pre-push-check.ps1` |

### Teste manual

1. Locação Ativa rodando; simular idle (&gt;1 h ou mock `mk_auth_last_activity` antigo).
2. Operador **permanece** logado.
3. Encerrar locação; se idle já expirou → logout em até 60 s.

---

## Matriz de testes (rodar antes de push)

```powershell
.\scripts\pre-push-check.ps1
# inclui: versões, guard POST, paridade HTTP, portal readonly, paridade cronômetro, guards auth/portal
```

| Teste | Cobre |
|-------|--------|
| `TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` | I15 — GET no browser |
| `TESTE_PORTAL_READONLY.ps1` | Portal responde + HTML local |
| `TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1` | **I16** |
| `pre-push-check.ps1` (estático) | I16, I17, I18 guards no código |

---

## O que NÃO fazer de novo

1. Expor `startTimestamp` bruto da planilha no portal sem `timestampCanonico_`.
2. Calcular restante no portal sem passar por `canonLoc_` (espelho do balcão).
3. Declarar portal OK sem comparar com `carregarInicio` na mesma locação.
4. Liberar sessão sem atualizar UI e sem `cache: 'no-store'`.
5. Deslogar por idle com `mk_sessions` contendo Ativa/Pendente.
6. Gravar hora na col C no cadastro ou inferir início por data+hora sem col Y (I20).

---

## Referências de código

- GAS: `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` — `timestampCanonico_`, `buscarPortalResponsavel_`, `carregarInicio_`
- Portal: `acompanhar.html` — `canonLoc_`, `restante`, refresh 15s
- Balcão: `index.html` — `mergeSessaoCanonica`, `calcStartTimestamp`
- Auth: `mk-auth.js` — idle, `mkHasLocacaoAbertaNoTablet_`, `mkAuthSyncSessaoBalcaoUI_`

---

## Histórico

| Data | Ação |
|------|------|
| 05/06/2026 | I16 identificado; fix GAS v1.5.55 + portal |
| 05/06/2026 | I17 fix v1.7.44–45 |
| 06/06/2026 10:34 | I18 fix v1.7.46; documentação + teste paridade cronômetro |
| 05/06/2026 | I20 identificado; fix GAS v1.5.64 + FE v1.7.73–74; regra col C/Y documentada |
