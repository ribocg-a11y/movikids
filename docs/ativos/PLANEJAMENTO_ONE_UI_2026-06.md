# MOVI KIDS — Planejamento ativo: Premium One UI (jun/2026)

**Atualizado:** 27/06/2026 · FE **v1.9.2** · GAS **v1.5.167** · **Sprints A–C ✅ FECHADOS**  
**Ciclo ativo:** → **`PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`**  
**Documento mestre:** `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md`  
**Cartilha obrigatória:** `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` §0 · §3 widgets · §8 admin  
**Handoff:** `HANDOFF_NOVO_CHAT.md`

---

## 1. Contexto — fundação fechada

| Área | Status | Nota |
|------|--------|------|
| Planilha I52–I63 + auditoria célula | ✅ 23/23 | `DIAGNOSTICO_SISTEMA_6_CAMADAS_2026-06.md` |
| GAS Web + FE Pages | ✅ v1.5.167 / **v1.9.2** | publicado 27/06 |
| Homolog tablet (I43, I42, I47, Gestor) | ✅ 23/06 | smoke v1.9.2 ⏳ Sprint D |
| FASE 15b RH | ✅ 100% repo | |
| FASE 16 Centro Comando | ✅ **~98%** | Sprint D assinatura |
| FASE 17 Alertas + Gestor | 🟡 **~95%** | Sprint D + decisão F9 |
| FASE 18 Financeiro UI | ✅ Sprint B | complemento Sprint H |
| Raykelly cadastro | ✅ **100%** | 26/06 |

**Novo chat deve codar UI** — não repetir repair planilha, homolog balcão nem schema.

---

## 2. Frase guia One UI

> *Um hero por dobra · número + contexto · Fredoka só marca/timer · Nunito nos dados · cards widget 16px · sem parede de KPIs iguais.*

Tokens existentes em `mk-design.css`: `--mk-widget-*`, `.mk-widget`, `.mk-command-center`.

---

## 3. Backlog UI — ordem de execução

### Sprint A — Fechar FASE 16 visual (P1)

| ID | Entrega | Arquivos principais | Critério pronto |
|----|---------|-------------------|-----------------|
| **UI-A1** | **16.6** Sidebar admin **mobile** read-only — KPIs comando + link balcão | `mk-nav.js`, `mk-design.css`, `index.html` | ✅ v1.9.0 |
| **UI-A2** Página **Caixa** — KPIs em `.mk-widget` + linha contexto | `mk-admin.js`, `mk-design.css` | ✅ v1.9.0 |
| **UI-A3** **Relatório** + **Histórico** — cards widget, tipografia Nunito 600/800 | `mk-admin.js`, seções HTML admin | ✅ v1.9.0 |
| **UI-A4** **Presença** operadores — badges inteligentes + cards widget | `mk-gestao-pessoas-admin.js` | ✅ v1.9.0 |
| **UI-A5** **Frota compacto** no comando — status disponível/em uso/manutenção | `mk-admin.js` | ✅ v1.9.0 |
| **UI-A6** Teste + bump FE **v1.9.0** | `mk-version.js`, `sw.js`, `?v=`, `TESTE_FASE16_COMANDO_READONLY.ps1` | ✅ 27/06 |

### Sprint B — FASE 18 financeiro (UI primeiro) (P2)

| ID | Entrega | Arquivos | Critério |
|----|---------|----------|----------|
| **UI-B1** Widget **previsão fim de mês** no Dashboard | `mk-admin.js`, `index.html` | ✅ v1.9.1 |
| **UI-B2** Insight **comparativo 30d** em fat/custo | Dashboard `#mk-previsao-mes` | ✅ v1.9.1 |
| **UI-B3** Doc `FASE_18_FINANCEIRO_PREVISAO.md` + Design System §8.4 | `docs/ativos/` | ✅ 27/06 |

### Sprint C — RH One UI polish (paralelo, baixo risco)

| ID | Entrega | Arquivos |
|----|---------|----------|
| **UI-C1** Hub colaborador — hero jornada + spacing One UI | `gestao-pessoas.html`, `mk-gestao-pessoas.css` | ✅ v1.9.2 |
| **UI-C2** Holerite quinzena — card widget, não tabela crua | `mk-gestao-pessoas-ui.js`, `mk-holerite.js` | ✅ v1.9.2 |

### Não iniciar neste ciclo UI

- FASE 22 IA · F4 SMS · mudanças `api()` auth · POST browser · CONFIG write Gestor

---

## 4. Fluxo de trabalho UI (agente)

```
1. LER DESIGN_SYSTEM_MOVIKIDS.md §0 + §8.x da superfície
2. Mock mental / inspecionar acompanhar.html + Dashboard atual
3. Editar FE (mk-design.css → mk-admin.js → HTML se necessário)
4. Bump v1.9.x nos 4 artefatos (I3) se mudou FE
5. **`git commit`** → `pre-push-check.ps1` → **`git push`** → `verify-publish-complete.ps1` → **`encerramento-sessao.ps1` exit 0**
6. Homolog PC admin (PIN 1421) — NÃO exige tablet se só admin CSS
7. Encerrar com relatorio-versoes.ps1 + Regra 16
```

**GAS:** preferir **só leitura** neste ciclo. Se precisar campo novo em `comandoOperacional`/`kpiMes` → pedido explícito sócio + Nova versão Web.

---

## 5. Referências vivas (copiar padrão)

| Padrão | Onde |
|--------|------|
| Command center widgets | `index.html` `#mk-command-center` |
| Portal hero + pills | `acompanhar.html` |
| Admin glass | `mk-design.css` `--mk-admin-*` |
| RH hub | `gestao-pessoas.html` |
| Teste F16 | `scripts/testes/TESTE_FASE16_COMANDO_READONLY.ps1` |
| Teste F17 | `scripts/testes/TESTE_FASE17_ALERTAS_READONLY.ps1` |

---

## 6. Versão alvo do ciclo

| Camada | Atual | Alvo ciclo UI |
|--------|-------|---------------|
| FE | v1.8.121 | **v1.9.2** (Sprints A–C fechados) |
| GAS | v1.5.165 | manter (só leitura) salvo UI-B exigir campo |
| Design System doc | v1.1 | v1.2 ao nascer componente novo |

---

## 7. Paralelo operação (não misturar com UI)

| Item | Quem | Doc |
|------|------|-----|
| Raykelly cadastro 100% | Colaborador | `GUIA_RAYKELLY_CADASTRO_P0.md` |
| Assinar FASE 17 | Ops + sócio | `CHECKLIST_FASE17_FECHAMENTO.md` |
| Decisão 17.5 F9 | Sócio | `MATRIZ_PERMISSOES_PERFIS_2026-06.md` |
| Ponto RH diário | Ops | `FOLHA_PONTO` |

---

## 8. Próximo passo único (novo chat)

**Ciclo One UI fechado** — ver **`PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`**

**Sprint D1:** homolog PC admin v1.9.2 (pills + badges FASE 17) → assinar checklist F17

---

*Revisar ao fechar Sprint A (FASE 16 visual 100%).*
