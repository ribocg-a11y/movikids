# Incidente — Sessão 09/07/2026 (I70–I76)

**Data:** 09/07/2026  
**Escopo:** varredura sistema · Dashboard · Gestão Pessoas · deploy GAS · documentação agente  
**Versões finais:** FE **v1.9.9** · GAS **v1.5.173** · commit `341386b`

---

## Resumo executivo

Sessão corrigiu **6 bugs de produção** (I70–I75) e expôs **fricção operacional do agente** (I76) ao orientar deploy GAS. Código FE+GAS mergeados em `main` e publicados; GAS Web confirmado via ping **v1.5.173**; Pages **v1.9.9**.

---

## Bugs corrigidos (prod)

| ID | Sintoma | Causa raiz | Fix | Versão |
|----|---------|------------|-----|--------|
| **I70** | Strings versão GAS defasadas; FOLHA_PONTO 5× OK sem horário | `carregarInicio` etc. com versão antiga; linhas ponto sem timestamp | `MK_GAS_VERSAO_` unificado; `repairFolhaPontoOkSemHorarioCore_` | GAS v1.5.169 |
| **I71** | Holerite mês anterior com bonus/meta do mês corrente | `gpEnrichContextAudit_` ignorava competência filtrada | Usar `compNorm` da competência selecionada | GAS v1.5.169 |
| **I72** | Gráfico projeção: linha meta ~R$372 (R$12/dia) vs real ~R$13k | Meta travada no dia 1 via Script Property | `metaProjecaoStale_`; trava só após 3 dias | GAS v1.5.170 · FE v1.9.6 |
| **I73** | Dashboard lento após I72 | `kpiMes` lite+full sequencial; lite ainda rodava `alertasInteligentes_` | Lite sem alertas pesados; full em background no FE | GAS v1.5.171 · FE v1.9.7 |
| **I74** | Dropdown Colaborador vazio ~23s | Prefetch GP competia com Dashboard; painel duplicava alertas | Sem prefetch GP no admin warm; `gpIntelRhAlertasFromCtx_`; loading UX | GAS v1.5.172 · FE v1.9.8 |
| **I75** | Julia (operador nova) não aparece em Colaboradores | Cadastro só em OPERADORES_SISTEMA; lista exige COLABORADORES_RH | `gpSyncOperadoresAtivosToRh_` no cadastro + listar | GAS v1.5.173 · FE v1.9.9 |

---

## Reparos planilha (API)

- `repararFolhaPontoPlanilhaAdmin` — 5 linhas FOLHA_PONTO “OK sem horário” corrigidas (I70)
- Após I72: `metaProjecaoMes` ~**R$13.055** (~R$421/dia) — gráfico normalizado

---

## Fricção operacional (I76 — processo agente)

| Erro do agente | Efeito no usuário | Correção permanente |
|----------------|-------------------|---------------------|
| Passou `C:\Users\riboc\...` como “link” para colar GAS | Código errado/desatualizado no Editor | **Sempre** URL raw GitHub (aba abaixo) |
| Usuário colou linhas `// v1.5.xxx` no PowerShell/Explorer | Erros de parser / caminho inválido | Instrução: copiar **só** do raw URL, não comentários |
| Deploy parcial (só ping atualizou) | Endpoints antigos (I26) | Confirmar ping **e** action afetada (ex. `listarColaboradoresGestao`) |
| `git pull` bloqueado por alterações locais | PC desalinhado do repo | `git checkout -- .` + `git pull origin main` |
| Docs HANDOFF/ESTADO defasados ao encerrar | Próximo chat repete diagnóstico | Fase D roteiro: atualizar docs na mesma sessão |

**URL raw GAS (deploy sócio):**

https://raw.githubusercontent.com/ribocg-a11y/movikids/main/MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs

**Passos:** Editor → Code.gs → Ctrl+A → colar do raw → Salvar → Implantar → Editar `AKfycbwakQ...` → Nova versão → ping = header.

---

## Commits (main)

| Commit | Escopo |
|--------|--------|
| `6b192b2` | I70+I71 GAS v1.5.169 |
| `e55b335` | I72 GAS v1.5.170 + FE v1.9.6 |
| `3c0ff86` | I73 GAS v1.5.171 + FE v1.9.7 |
| `05790f2` | I74 GAS v1.5.172 + FE v1.9.8 |
| `341386b` | I75 GAS v1.5.173 + FE v1.9.9 |

---

## Validação pós-deploy (checklist)

- [ ] Ping GAS = **v1.5.173**
- [ ] Pages `mk-version.js` = **1.9.9**
- [ ] Dashboard `?force=1.9.9` — gráfico projeção meta ~R$13k; abre rápido (lite)
- [ ] `gestao-pessoas.html?force=1.9.9` — dropdown Colaborador lista Julia + demais com PIN
- [ ] Holerite competência mês anterior — bonus/meta corretos (I71)

---

## Referências

- `docs/ativos/MAPA_ERROS_FALHAS_BUGS.md` — I70–I76
- `docs/ativos/ROTEIRO_AGENTE_OBRIGATORIO.md` — Fase F deploy GAS (I76)
- `INCIDENTE_I26_GAS_EDITOR_VS_EXEC_2026-06-14.md` — deploy parcial
