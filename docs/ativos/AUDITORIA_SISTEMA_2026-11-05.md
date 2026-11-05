# Auditoria de sistema — 05/11/2026 (noite Fortaleza)

**Agente:** varredura profissional sem escopo estreito · FE **v1.9.195** · GAS **v1.5.237**  
**Método:** F0 versões → matriz dual-loja → fluxos P0 readonly → além (folha I200 live, tooling, consistência caixa)

## Veredito

| Camada | Status | Nota |
|-------|--------|------|
| Produção FE/GAS/Pages | ✅ | 1.9.195 alinhado · ping v1.5.237 |
| Operação balcão | ✅ | 0 Ativa/Pendente · I22 livre |
| Isolamento dual | ✅ | Golden nHoje=7 fat=163 · La Ville 0 |
| Cronômetro / I43 | ✅ | salvar→▶→carregarInicio ts bate |
| Fantasma I151 | ✅ | |
| Folha Out/2026 | ✅ | full ~70s · 5 linhas · I200 live sem ensureFull no paint |
| Holding / portal / HTTP | ✅ | |
| Dashboard / custos / GP | ✅ | |
| Tooling orquestrador | ✅ corrigido (I201) | `powershell`→`pwsh` · versões de teste defasadas |

## Por que olhei o que olhei

| Alvo | Por quê (risco se falhar) | Como |
|------|---------------------------|------|
| F0 versões | FE velho = bug “fantasma” de versão (I24/I20) | ping + Pages + relatorio-versoes |
| `listarAtivas` / `carregarInicio` | Autoridade de Ativa + Encerradas (I191–I192) | dual golden/laville + shape |
| `resumoDia` × `kpiMes` × hist | Caixa do dia mentindo | paridade n/fat |
| Folha `painelGestaoPessoasAdmin` | Incidente vivo I199/I200 | full 10/2026 + JS live Pages |
| Isolamento + audit-família | Dual-loja regressão silenciosa | `TESTE_ISOLAMENTO_*` + `audit-familia` |
| I43 / paridade HTTP | Timer e POST browser | scripts readonly |
| Orquestrador diagnóstico | “Rodar teste” quebra no CI Linux | falhou → **consertei** |

## Consistência do dia (Golden 05/11)

- **10** linhas Encerrada · fat **163** · `resumoDia.n=7` (= contas, não linhas) — alinhado com `kpiMes` / hist / `encHoje`
- Sem resíduos de teste I43 na planilha

## Achados tratados nesta sessão

1. **I201** — `TESTE_PROTOCOLO_*` / regressão chamavam `powershell` (inexistente no agente Linux) → `pwsh` com fallback  
2. **I201** — `TESTE_GESTAO_PESSOAS` / `TESTE_RESUMO_DIA` alertavam versão “inesperada” em **v1.5.237** → regex atualizado  

## Fora de escopo / residual (não P0)

| Item | Severidade | Nota |
|------|------------|------|
| Folha cold ~60–70s | UX | Cache I168 + elapsed I200; GAS §7.3 se quiser acelerar |
| Portal `n=0` com telefone do dia | OK | Só Ativas “brincando”; hoje tudo Encerrada |
| `validarSchema.CUSTOS` warn | Baixo | Sem registros no mês; schema memorial a revisar depois |
| Homologação tablet físico | Humano | PC ≠ tablet (A7) — F5/F10 no balcão |
| PIX memorial Karen/Milena Out | Dados | Fora do “sistema down”; conferir quinzena se sócio pedir |

## Evidência scripts (exit 0)

`audit-familia` · isolamento · I151 · I43 · paridade HTTP · holding smoke · folha · portal · cronômetro · dashboard · custos · GP · protocolo `-Foco http` · pre-push OK  
