# Incidente I22 — Home fora do ar por `</div>` extra no Dashboard (FASE 6) — 09/06/2026

**Registrado em:** 09/06/2026  
**Severidade:** **P0 — operação interrompida**  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I22**  
**Pacote:** FASE 6 — Cockpit executivo (FE v1.8.0 → v1.8.1)  
**Correção:** FE **v1.8.2** — remoção de `</div>` extra em `index.html`  
**Commit hotfix:** `f2574da` — `fix: remover div extra no Dashboard que quebrava Home (FE v1.8.2)`

---

## Resumo executivo

| O que o usuário viu | O que o sistema fazia |
|---------------------|------------------------|
| **Home fora do ar** / “sistema parou” | Árvore HTML quebrada: `#page-dashboard` fechava **antes** do conteúdo real |
| Balcão inoperável ou layout destruído | `#mk-leading-row`, KPIs, charts e páginas seguintes ficavam **fora** da estrutura de páginas |
| Operação com **locações ativas** | Push FE em **horário de operação**, sem gate de locações ativas |

**Causa raiz imediata:** um `</div>` **a mais** inserido após `#mk-exec-cockpit` (FASE 6), fechando `#page-dashboard` na linha ~883.

**Causa raiz sistêmica:** publicação de pacote de **feature** (cockpit/leading) que alterava `index.html` (shell global) **sem** (a) validação estrutural de HTML, (b) smoke test da Home no tablet, (c) verificação de **locações ativas** antes do push.

---

## Linha do tempo

| Momento | Evento |
|---------|--------|
| 09/06 | FASE 6 implementada — bloco `#mk-exec-cockpit` adicionado ao Dashboard em `index.html` |
| 09/06 | FASE 7 — `#mk-leading-row` inserido **abaixo** do cockpit; `</div>` extra permanece |
| 09/06 | Commit `6e6f42e` + push FE v1.8.1 para `main` (GitHub Pages) |
| 09/06 | Usuário reporta: **“home fora do ar… sistema parou”** com locações em andamento |
| 09/06 | Hotfix v1.8.2 — remoção do `</div>` extra; push `f2574da` |

---

## Análise de falha (5 porquês)

### 1. Por que a Home parou?

Porque o **shell HTML** (`index.html`) ficou com a árvore DOM inválida — não por bug de JS isolado nem por GAS offline.

### 2. Por que a árvore DOM ficou inválida?

Porque `#page-dashboard` recebeu um **`</div>` a mais** logo após `#mk-exec-cockpit`, fechando a página antes de `#mk-leading-row`, KPIs e demais blocos do Dashboard.

### 3. Por que o `</div>` extra passou?

- Edição manual de bloco HTML grande sem **contagem de abertura/fechamento** por página.
- `pre-push-check.ps1` validava versões, guards I15–I21 e testes HTTP — **não** validava balanceamento de `<div>` por `#page-*`.
- Nenhum smoke test obrigatório de **Home (F0)** antes do push após mudança em `index.html`.

### 4. Por que foi publicado em operação?

- FASE 6–7 foram tratadas como “melhoria admin/Dashboard”, subestimando que **`index.html` é o coração de todas as páginas**, incluindo Home do operador.
- **Não houve gate “locações ativas”** antes do push (Regra 12 inexistente na época).
- Processo priorizou entregar fases do plano sobre **janela segura de operação**.

### 5. Por que isso é grave?

- MOVI KIDS roda em **operação real** (Golden Shopping).
- Com locações ativas, indisponibilidade do balcão afeta **crianças, responsáveis, cobrança e cronômetro** — não é “só um bug visual no admin”.

---

## Mapa de causas (falhas encadeadas)

```
F1 — Escopo mal classificado
  FASE 6 = “Dashboard admin” → na prática alterou index.html (global)

F2 — Erro de markup humano/agente
  </div> extra após mk-exec-cockpit (copy-paste / fechamento duplicado)

F3 — CI cego a estrutura HTML
  pre-push-check: 28 checks, zero balanceamento DOM

F4 — Sem gate operacional
  Nenhuma consulta listarAtivas / carregarInicio antes de push FE

F5 — Validação incompleta pós-deploy
  node --check OK ≠ Home renderizável; tablet F0 não rodado
```

---

## Evidência técnica

**Antes (quebrado):**

```html
      <p class="mk-exec-narrativa" id="mk-exec-narrativa">…</p>
    </div>   <!-- fim mk-exec-cockpit -->

    </div>   <!-- EXTRA — fecha page-dashboard cedo -->

    <!-- FASE 7 — Leading financeiros -->
    <div id="mk-leading-row" …>
```

**Depois (v1.8.2):** um único `</div>` fecha `#mk-exec-cockpit`; `#mk-leading-row` permanece **dentro** de `#page-dashboard`.

**Impacto DOM:** `#page-home`, `#page-nova` e demais `.page` compartilham o mesmo `index.html`. Fechar uma `.page` cedo desloca irmãos e quebra seletores CSS/JS que assumem `.page` como container (`display` por navegação, scroll, overlays).

---

## O que NÃO causou o incidente

| Descartado | Motivo |
|------------|--------|
| Erro de sintaxe JS | `node --check` OK em mk-admin, mk-home, mk-sync |
| GAS v1.5.76 não publicado | Ping prod v1.5.74 OK; Home não depende de cockpit GAS |
| POST browser (I15) | Não reintroduzido |
| Cache PWA sozinho | Bug reproduzível pela estrutura HTML inválida no artefato publicado |

---

## Correções aplicadas

| # | Correção | Artefato |
|---|----------|----------|
| 1 | Remover `</div>` extra | `index.html` → FE **v1.8.2** |
| 2 | Pós-mortem I22 | este documento |
| 3 | Regra 14 — janela operacional | `REGRAS_DE_PUBLICACAO_SEGURA.md` |
| 4 | Guard `guard.html.page-balance` | `pre-push-check.ps1` (I22) |
| 5 | Script `check-operacao-livre.ps1` | consulta `listarAtivas` antes de push FE crítico |
| 6 | Entrada I22 no MAPA | `MAPA_ERROS_FALHAS_BUGS.md` |

---

## Regra operacional nova (Regra 14)

**Nunca publicar mudança que toque `index.html`, Home, sync, sessão ou timer com locações Ativas/Pendentes em produção**, exceto hotfix P0 **aprovado explicitamente** pelo responsável e com rollback pronto.

Ordem obrigatória antes de push FE crítico:

1. `.\scripts\check-operacao-livre.ps1` → **0** locações Ativa/Pendente (ou aprovação explícita)
2. `.\scripts\pre-push-check.ps1` → inclui `guard.html.page-balance`
3. Smoke **F0 Home** + **F1 Nova locação** no tablet (mínimo) — PowerShell **não substitui** (I15)

---

## Lições — nunca repetir

1. **`index.html` = P0 global** — qualquer linha pode derrubar Home, não só Dashboard.
2. **Feature admin ≠ risco baixo** se o arquivo for compartilhado.
3. **pre-push verde ≠ operação segura** — faltavam DOM + tablet + gate locações.
4. **Nunca empurrar fase de roadmap durante operação** sem janela livre ou hotfix declarado.
5. **Agente/autor deve recusar** implementar+publicar pacote impactante se `check-operacao-livre` falhar — perguntar ao usuário ou aguardar janela.

---

## Responsabilidade

| Ator | Falha |
|------|-------|
| Agente (Cursor) | Inseriu markup inválido; publicou sem gate operacional; subestimou impacto de FASE 6 no shell |
| Processo / CI | Ausência de check DOM e ausência de gate locações ativas |
| Usuário | N/A — reporte correto e exigência de registro procedimental |

---

## Referências

- Hotfix: commit `f2574da`
- Deploy FASE 6: `docs/ativos/DEPLOY_v1.5.75_FASE6_COCKPIT.md`
- Regras: `docs/ativos/REGRAS_DE_PUBLICACAO_SEGURA.md` Regra 14
- Protocolo testes F0: `docs/ativos/PROTOCOLO_DIAGNOSTICO_E_TESTES.md`
