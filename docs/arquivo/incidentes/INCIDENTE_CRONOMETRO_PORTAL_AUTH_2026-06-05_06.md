# Incidentes 05–06/06/2026 — Cronômetro portal, auth balcão e idle com locação

**Registrado em:** 06/06/2026 10:34  
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
