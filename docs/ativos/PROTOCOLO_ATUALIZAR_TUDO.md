# MOVI KIDS — Protocolo "Atualize tudo"

**Criado:** 14/06/2026 · **Última execução:** 29/09/2026 (FE **v1.9.120** · GAS ping **v1.5.221** · **I158** Golden FE ✅ · erros agente registrados no HANDOFF)  
**Função:** quando o usuário pedir **"atualize tudo"**, o agente segue **esta lista** — não só handoff parcial.  
**Regra Cursor:** `.cursor/rules/atualize-tudo-movikids.mdc`

---

## O que significa "atualize tudo"

Sincronizar **documentação + estado operacional** do projeto com a realidade atual (produção, testes, incidentes), incluindo:

| Área | Onde |
|------|------|
| Handoff | `HANDOFF_NOVO_CHAT.md` |
| Estado / versões | `ESTADO_ATUAL.md`, `README.md`, `AGENTS.md` |
| Planejamento | `PLANEJAMENTO_ATUAL_2026-06.md`, `PLANO_PRIORIDADES_2026-06.md`, **`MAPA_FASES.md`**, **`PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`** |
| Deploy atual | **`DEPLOY_ATUAL.md`** |
| Estrutura repo | **`ESTRUTURA_REPO.md`** |
| Mapa de erros | `MAPA_ERROS_FALHAS_BUGS.md` (I* até **I158** Golden + famílias fantasma + confiabilidade sync) |
| **Design System** | **`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`** |
| Protocolos | `PROTOCOLO_DIAGNOSTICO_E_TESTES.md`, **este arquivo** |
| Arquitetura / fluxos / diagramas | `MAPA_CODIGO_ARQUITETURA.md`, `FASE_*.md` ativas |
| Deploy / processos | **`DEPLOY_ATUAL.md`**, `DEPLOY_GAS_v1.5.32_AUTH.md`, histórico `arquivo/deploy/` |
| Histórico | `docs/arquivo/incidentes/`, `docs/ativos/INCIDENTE_*.md` · `EVIDENCIA_*` |
| Planilhas | Memorials `docs/referencia/`, IDs e métricas abas (FOLHA, CONFIG, etc.) |
| Pasta no C | `scripts/sync-pasta-c-pc.ps1` · caminhos PC em HANDOFF, AGENTS, regras `.cursor/rules/` |
| Testes | `scripts/testes/README.md`, versões nos `.ps1` · `teste-estabilidade-pos-i155.cjs` |
| Entregas PDF | `entregas/holerite-mes-2026-07/` |

---

## Repo e planilha (referência fixa)

| Recurso | Valor |
|---------|--------|
| **Repo PC** | `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github` |
| **GitHub** | `ribocg-a11y/movikids` · branch `main` |
| **Planilha** | `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618` |
| **Aba FOLHA** | [gid=179040058](https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit#gid=179040058) |
| **GAS Deploy ID** | `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y` |
| **GAS .gs canônico** | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (raiz do repo) |

---

## Produção atual (29/09/2026)

| Camada | Versão | Evidência |
|--------|--------|-----------|
| GAS | ping **v1.5.221** = repo | I156 ritmo · lookback 600 · **sem** mudança I158 |
| FE | **v1.9.120** | Pages live · `?force=1.9.120` · **I158** Golden via kpiMes |
| Golden set (prévia) | R$ **14.332** · CTO **R$ 1.500** | Admin Relatório · sem Cancelada |
| Homolog tablet | **⏳** | smoke D4 · `?force=1.9.120` |
| Confiabilidade | I153–I158 ✅ | lookback · fila 404 · Golden FE |

```powershell
node scripts\testes\teste-estabilidade-pos-i155.cjs
.\scripts\testes\TESTE_I158_GOLDEN_SEM_CANCELADAS_READONLY.ps1
.\scripts\testes\TESTE_I151_ENCERRAR_FANTASMA_READONLY.ps1
.\scripts\encerramento-sessao.ps1
```

---

## Comandos de validação (PowerShell)

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\sync-pasta-c-pc.ps1
.\scripts\relatorio-versoes.ps1 -Markdown
Invoke-RestMethod "${GAS}?action=ping"
node scripts\testes\teste-estabilidade-pos-i155.cjs
.\scripts\encerramento-sessao.ps1
```

---

## Ordem de execução do agente

1. Ler output recente do usuário (repair, testes, ping) — extrair métricas e data.
2. Atualizar docs **ativos** (handoff, estado, mapa erros, fases, deploy atual).
3. Se incidente ou re-validação — append em `INCIDENTE_*.md` ou criar novo I*.
4. Atualizar **versões de referência** em `MAPA_ERROS` (não deixar prod. defasada).
5. Atualizar `INDICE.md` + `README.md` + `AGENTS.md`.
6. Ajustar scripts de teste se versão mínima GAS/FE mudou.
7. Resumir ao usuário o que foi atualizado (lista de arquivos) + **veredito em ordem?**.

---

## Diagrama — fluxo "atualize tudo"

```mermaid
flowchart TD
  U[Usuario: atualize tudo] --> E[Evidencia: ping / testes / repair]
  E --> H[HANDOFF + ESTADO_ATUAL]
  H --> P[PLANEJAMENTO + PRIORIDADES]
  P --> M[MAPA_ERROS + PROTOCOLOS]
  M --> A[MAPA_CODIGO + FASE + DEPLOY]
  A --> I[INDICE + README + AGENTS]
  I --> T[Testes .ps1 se versao mudou]
  T --> R[Resumo + veredito ao usuario]
```

---

*Revisar quando mudar versão FE/GAS ou fechar incidente.*

### Registro desta execução (29/09/2026)

| I* | Evento | Doc |
|----|--------|-----|
| **I158** | Golden PDF/e-mail contava Cancelada → FE kpiMes | `INCIDENTE_I158_*` · HANDOFF erros agente |
| I156 | Ritmo Dashboard fatMap chaves "01" | `INCIDENTE_I156_*` |
| I155 | Lookback causa raiz full-sheet 404 | `INCIDENTE_I155_*` + `EVIDENCIA_ESTABILIDADE_*` |
| I154/b | Lançamento perdido HTML 404 → fila + retry | `INCIDENTE_I154_*` |
| I153 | Histórico/duplicata Arthur + anular Encerrada | `INCIDENTE_I153_*` |

**Erros do agente (sessão I158 — não repetir):** ver tabela em `HANDOFF_NOVO_CHAT.md` § Erros — especialmente **§7.2/I24** (publicar FE sem pedir).

### Registro anterior (08/09/2026)

- Estudo negócio: `ESTUDO_NEGOCIO_BREAK_EVEN_TICKET_2026-07.md`
- Holerite PDF: `INCIDENTE_I142_*`
- P0 local-first: `INCIDENTE_I146_*`
