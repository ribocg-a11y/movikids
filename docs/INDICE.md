# MOVI KIDS — Índice de documentação

**Atualizado:** 08/06/2026 (FASE 3 — Pacote L v1.7.88)

## Comece aqui

| Documento | Para quê |
|-----------|----------|
| [**HANDOFF_NOVO_CHAT.md**](ativos/HANDOFF_NOVO_CHAT.md) | **Novo chat Cursor** — contexto, próximo passo, bloco para colar |
| [AGENTS.md](../AGENTS.md) | Instruções resumidas para agentes (raiz do repo) |
| [PLANO_PRIORIDADES_2026-06.md](ativos/PLANO_PRIORIDADES_2026-06.md) | **O que fazer agora** (fases P0–P4) |
| [ESTADO_ATUAL.md](ativos/ESTADO_ATUAL.md) | Versões em produção, links, pacotes |
| [PLANO_CONTINUIDADE_2026-06.md](ativos/PLANO_CONTINUIDADE_2026-06.md) | Sprints e roadmap 90 dias |
| [ACESSOS_E_AUTORIZACOES.md](ativos/ACESSOS_E_AUTORIZACOES.md) | Papéis, PIN admin, agente vs humano, **planilha OAuth** §7.8 |
| [MAPA_CODIGO_ARQUITETURA.md](ativos/MAPA_CODIGO_ARQUITETURA.md) | **Anatomia do código** — partes, conexões, chaves mestras |
| [PACOTE_M_MODULARIZACAO.md](ativos/PACOTE_M_MODULARIZACAO.md) | Modularização FE — **M.1–M.17 ✅ fechado** (v1.7.87) |
| [PACOTE_L_UX_POLISH.md](ativos/PACOTE_L_UX_POLISH.md) | **FASE 3** Pacote L (v1.7.91) |
| [CHECKLIST_PACOTE_L.md](ativos/CHECKLIST_PACOTE_L.md) | Homologação tablet Pacote L |
| [FASE_4_CONFIG_PLANILHA.md](ativos/FASE_4_CONFIG_PLANILHA.md) | Próxima fase — CONFIG JSON |
| [CHECKLIST_TABLET_v1.7.85.md](ativos/CHECKLIST_TABLET_v1.7.85.md) | Homologação tablet FASE 1 (A–F) |

## Operação e deploy

| Documento | Para quê |
|-----------|----------|
| [REGRAS_DE_PUBLICACAO_SEGURA.md](ativos/REGRAS_DE_PUBLICACAO_SEGURA.md) | Regras de publicação (P0) |
| [DEPLOY_GAS_v1.5.32_AUTH.md](ativos/DEPLOY_GAS_v1.5.32_AUTH.md) | Deploy GAS mestre |
| [DEPLOY_v1.5.69_GOLDEN_RELATORIO.md](ativos/DEPLOY_v1.5.69_GOLDEN_RELATORIO.md) | Relatório Golden v1.5.69 (em prod) |
| [DEPLOY_v1.5.63_PAYBACK.md](ativos/DEPLOY_v1.5.63_PAYBACK.md) | Payback |
| [HOMOLOGACAO_PRODUCAO_ASSISTIDA.md](ativos/HOMOLOGACAO_PRODUCAO_ASSISTIDA.md) | Checklist operação |
| [CHECKLIST_PACOTE_K.md](ativos/CHECKLIST_PACOTE_K.md) | QA tablet Pacote K |

## Negócio e decisões

| Documento | Para quê |
|-----------|----------|
| [MEMORIAL_PAYBACK_INVESTIMENTO.md](ativos/MEMORIAL_PAYBACK_INVESTIMENTO.md) | Fórmulas payback |
| [DECISAO_PAYBACK_FASE2_2026-06.md](ativos/DECISAO_PAYBACK_FASE2_2026-06.md) | Decisões §10 + relatório Golden |
| [INVESTIMENTO_PAYBACK_TABELA.md](ativos/INVESTIMENTO_PAYBACK_TABELA.md) | Template planilha |
| [DECISAO_COMUNICACAO_QR_CODE_2026-06.md](ativos/DECISAO_COMUNICACAO_QR_CODE_2026-06.md) | QR portal; F4 pausado |
| [MAPA_ERROS_FALHAS_BUGS.md](ativos/MAPA_ERROS_FALHAS_BUGS.md) | Índice incidentes I1–I20 |
| [**INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md**](ativos/INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md) | **I20 resolvido** — cronologia, causa raiz, travas |
| [**PROTOCOLO_DIAGNOSTICO_E_TESTES.md**](ativos/PROTOCOLO_DIAGNOSTICO_E_TESTES.md) | **Protocolo mestre** — fluxos F0–F14, maturidade, como rodar testes |

## Referência técnica

| Pasta | Conteúdo |
|-------|----------|
| [referencia/](referencia/) | CTO, DNA visual, auditorias, SMS, GAS legados |
| [arquivo/incidentes/](arquivo/incidentes/) | Pós-mortems fechados |
| [arquivo/deploy/](arquivo/deploy/) | Deploy notes históricos (v1.5.19–v1.5.61, SMS) |
| [arquivo/pacotes/](arquivo/pacotes/) | Pacotes e fixes entregues |
| [arquivo/planos/](arquivo/planos/) | Planos mestres e handoffs antigos |
| [arquivo/obsoleto/](arquivo/obsoleto/) | Rollback/CHANGELOG — **não usar** |
| [../arquivo-historico/](../arquivo-historico/) | Arquivos `.gs` legados |

## App (raiz do repo)

**Raiz (app + GAS canônico):** `index.html` (só HTML), `mk-globals.js`, `mk-core.js` … `mk-boot.js`, `mk-auth.js`, `mk-app.css`, `mk-design.css`, `sw.js`, `mk-version.js`, `acompanhar.html`, `foto-moldura.html`, `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (único `.gs`).

**Arquivo:** `arquivo-historico/` (GAS legados) · **Testes:** `scripts/testes/`
