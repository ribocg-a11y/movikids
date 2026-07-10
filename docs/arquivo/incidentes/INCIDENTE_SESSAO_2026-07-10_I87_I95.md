# Incidente sessão 10/07/2026 — I87–I95 (cronômetro, lentidão, testes, erros ocultos)

**Data:** 10/07/2026  
**Contexto:** Usuário reportou cronômetro “louco”, lentidão, falhas salvar/carregar após 4 locações de teste manual (Ana, Ann, Db, Dd). Pedido: remover testes, rodar 10 testes validação, limpar tudo, auditar código vs histórico I*, registrar e “atualize tudo”.

---

## Produção no momento da sessão

| Camada | Versão |
|--------|--------|
| FE Pages | **v1.9.26** |
| GAS ping Web | **v1.5.182** (repo até v1.5.185 — Nova versão Web pendente) |
| PIN admin | 1421 |

---

## O que mudou nesta sessão (melhorias entregues)

### Frontend (v1.9.20 → v1.9.26)

| Versão | ID | Problema | Correção |
|--------|-----|----------|----------|
| v1.9.20 | **I86** | Dashboard/Caixa/Histórico lentos — fila GAS duplicada | Dedupe dashboard, SWR `resumoDia`/caixa, sync defer `mkSyncDeferHeavy_` |
| v1.9.22 | **I87** | Histórico custos admin ilegível | Redesign gerencial `mk-cus-*` (5 capítulos) |
| v1.9.23 | **I88 FE** | Gráfico semanal blocos 1–7 fixos | `mkPorSemanaSegDom_` via `fatPorDia` |
| v1.9.24 | **I89** | Cache `mk_inicio_cache_v2` stale sobrescrevia ▶ | `mkInvalidateInicioCache_` + merge anti-stale 180s |
| v1.9.25 | **I90** | `started` calculado de `canon` **antes** do merge | Recalcular `started` após merge; `skipCache` em operação ativa |
| v1.9.26 | **I91** | Pós-salvar/▶ UI esperava sync GAS (card não atualizava) | `mkRefreshHomeUI_()` imediato; sync adiado (não triplo forçado) |

### GAS (repo v1.5.182 → v1.5.185)

| Versão | ID | Correção |
|--------|-----|----------|
| v1.5.183 | **I88 GAS** | `buildPorSemanaMes_` semanas seg→dom |
| v1.5.184 | **I92** | `anularLocacoesRowAdmin` — anula por `rowIndexes` sem filtro `TESTE_*` |
| v1.5.185 | **I93** | `calcResumoDiaCore_`/`buildKpiMesPayload_` leem `COL_LOC_READ_` (r[25]/r[27]); `encHoje` filtra `isLocacaoTeste_` |

### Testes

- **`scripts/testes/TESTE_VALIDACAO_COMPLETA_10.sh`** — 10 testes curl (Linux): ping, FE, carregarInicio, histórico, schema, salvar→Pendente→iniciar→Ativa, cleanup.

---

## O que os 10 testes pegaram (10/07/2026)

| # | Teste | Resultado | Evidência |
|---|-------|-----------|-----------|
| T1 | Ping GAS | ✅ | v1.5.182 online |
| T2 | FE Pages vs repo | ✅ | v1.9.26 alinhado |
| T3 | carregarInicio admin | ✅ | fat=0, encHoje=4 (4 locações usuário Encerrada R$0) |
| T4 | listarHistorico | ✅ | 4 linhas hoje |
| T5 | validarSchema | ✅ | ~30s (latência GAS normal) |
| T6–T9 | Cronômetro I20/I43 | ✅ | Pendente 3s → iniciar → Ativa com ts |
| T10 | limparLocacoesTesteAdmin | ✅ | TESTE_VAL10 anulado |
| — | anular rows 1272–1275 | ⚠️ | Ação desconhecida — GAS v1.5.184+ não publicada |

**Conclusão:** núcleo operacional (salvar, timer, sync) **OK em prod v1.5.182 + FE v1.9.26**. Lentidão percebida = latência GAS (5–30s/call), não regressão de cronômetro nos testes.

---

## 4 locações manuais do usuário

| row | id | Criança | Status após sessão |
|-----|-----|---------|-------------------|
| 1272 | 1361 | Ana | Encerrada R$0 (caixa zerado) |
| 1273 | 1362 | Ann | Encerrada R$0 |
| 1274 | 1363 | Db | Encerrada R$0 |
| 1275 | 1364 | Dd | Encerrada R$0 |

- **Feito:** `corrigirFinanceiroLocacaoAdmin` com `valorTotal=0` explícito (sem `zerarExtra=1` — ver I94).
- **Pendente:** `anularLocacoesRowAdmin` → Cancelada + tag `[ANULADO TESTE ADM]` — requer **Nova versão Web v1.5.184+**.

---

## Erros ocultos encontrados na auditoria de código (10/07/2026)

| ID | Severidade | Onde | Problema | Status |
|----|------------|------|----------|--------|
| **I93** | P0 | GAS `calcResumoDiaCore_`, `buildKpiMesPayload_` | `getRange(..., COL_CONTA_ID_=19)` mas lê `r[25]`/`r[27]` — dados silenciosamente perdidos | ✅ v1.5.185 repo |
| **I93b** | P1 | GAS `carregarInicio_` encHoje | Encerrada hoje sem filtro `isLocacaoTeste_` — polui UI/caixa | ✅ v1.5.185 repo |
| **I94** | P1 | GAS `corrigirFinanceiroLocacaoAdmin` | `zerarExtra=1` recalcula `valTotal=valorPlano` (R$12), não R$0 | Documentado — usar `valorTotal=0` explícito |
| **I95** | WARN | FE `mk-sync.js:100–112` | Backoff GAS + `skipCache` = retorno silencioso sem dados na Home | Backlog — tentar fetch mesmo em backoff se ops ativa |
| **I95b** | WARN | FE `mk-api.js` | `iniciarTimer` fora de `MK_WRITE_ACTIONS` | Backlog pre-push guard |
| **I95c** | WARN | FE `mk-nova.js:635+` | `confirmarLocacaoEEnviarSmsLegado_` morto — risco I32 se reconectado | Remover ou alinhar |
| **I26 rec** | P1 | Deploy | Repo GAS v1.5.185 vs ping v1.5.182 — fixes não chegam ao tablet | Nova versão Web obrigatória |

---

## Por que os erros “voltam” mesmo com histórico I*

1. **GAS repo ≠ GAS Web** (I26/I14): código corrigido no GitHub/PC mas ping prod fica em versão antiga até Nova versão Web.
2. **FE publicado, GAS não** (ou vice-versa): merge timer depende de ambos — I89/I90 no FE não ajudam se `carregarInicio` GAS ainda trunca col Y (I43).
3. **Testes PowerShell ≠ tablet** (I15): API verde não prova UX no balcão.
4. **Guards estáticos incompletos**: I43 só entrou no pre-push **depois** da regressão — existência de função ≠ largura `getRange`.
5. **Cache localStorage** (I89): nova camada de estado que o mapa I* original não previa — regressão só aparece com ▶ + sync lento.
6. **Testes manuais fora do padrão** (I92): `limparLocacoesTesteAdmin` só pega `TESTE_*` — locações com nomes reais poluem planilha.
7. **Docs defasados** (I76): HANDOFF/ESTADO meses atrás → agente repete diagnóstico ou ignora travas já documentadas.

---

## Como evitar que isso volte

| Ação | Trava |
|------|-------|
| Após mudança timer/sync GAS | `TESTE_I43` + `TESTE_I20` + `TESTE_VALIDACAO_COMPLETA_10.sh` |
| Após mudança FE sync/cache | Guards I89/I90 no pre-push (backlog) + invalidar cache em ▶/salvar/cancel |
| Após bump GAS repo | **Nova versão Web** no mesmo ciclo — ping deve = header |
| Testes manuais na loja | Prefixo `TESTE_` no nome **ou** cleanup `anularLocacoesRowAdmin` |
| Zerar caixa teste Encerrada | `valorTotal=0` explícito — **não** `zerarExtra=1` (I94) |
| Encerrar sessão agente | `encerramento-sessao.ps1` exit 0 + HANDOFF/ESTADO/MAPA |
| “Atualize tudo” | `PROTOCOLO_ATUALIZAR_TUDO.md` checklist completo |

---

## Comandos pós-deploy GAS v1.5.185

```bash
# Linux / cloud agent
ANULAR_ROWS=1272,1273,1274,1275 bash scripts/testes/TESTE_VALIDACAO_COMPLETA_10.sh
```

```powershell
# Windows
.\scripts\testes\TESTE_I20_COMPLETO_PROD.ps1
.\scripts\testes\TESTE_I43_CARREGAR_INICIO_READONLY.ps1
.\scripts\testes\LIMPAR_TESTES_MOVIKIDS.ps1 -SoHoje
```

---

## Referências

- `MAPA_ERROS_FALHAS_BUGS.md` — I87–I95
- `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`
- `INCIDENTE_I43_CARREGAR_INICIO_COL_Y_2026-06-23.md`
- `.cursor/rules/cronometro-i43-carregar-inicio.mdc`
