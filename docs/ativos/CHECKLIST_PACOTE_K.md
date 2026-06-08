# Checklist Pacote K — CRM / RESPONSAVEIS

**Data:** 08/06/2026  
**GAS:** v1.5.66+ · **FE:** v1.7.87  
**Nota:** `TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1` corrigido (T1 em-dash) — rodar antes de marcar K.A1.  
**Referência:** `PLANO_CONTINUIDADE_2026-06.md` Sprint 2

---

## Automatizado (PC)

| # | Teste | Comando | Esperado |
|---|-------|---------|----------|
| K.A1 | Relacionamento readonly | `.\scripts\testes\TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1` | `k1.total` ok, `cadastroCanonico` ok |
| K.A2 | Import dry-run pós-K.1 | `.\scripts\import-responsaveis-dry-run.ps1` | `aInserir: 0`, `ignoradosJaExistem: 240` |
| K.A3 | pre-push-check | `.\scripts\pre-push-check.ps1` | Verde |

---

## K.1 — Import (concluído)

- [x] GAS v1.5.57 implantado
- [x] 240 cadastros em RESPONSAVEIS
- [x] `listarResponsaveis` com `cadastroCanonico: true`

---

## K.2 — GAS merge canônico

- [x] `lerResponsaveisCanonicos_` + merge em `listarResponsaveis_`
- [x] Fallback LOCACOES se telefone sem linha canônica

---

## K.3 — Card Relacionamento (tablet/PC)

| # | Passo | OK |
|---|-------|-----|
| K.3.1 | Menu → **Relacionamento** | [ ] |
| K.3.2 | Buscar cliente conhecido (nome ou telefone) | [ ] |
| K.3.3 | Card mostra **badge Cadastro** (v1.7.49+) | [ ] |
| K.3.4 | Métricas: locações, encerradas, **total R$** | [ ] |
| K.3.5 | Última visita + veículo/plano/pagamento | [ ] |

---

## K.4 — Nova locação a partir do card

| # | Passo | OK |
|---|-------|-----|
| K.4.1 | **Nova locação** → preenche responsável/telefone | [ ] |
| K.4.2 | Fluxo 3 passos (veículo → plano → quem) intacto | [ ] |
| K.4.3 | **Nova criança** → nome/telefone ok, criança em branco | [ ] |
| K.4.4 | **Editar** → salvar → `AUD_RESPONSAVEIS` (planilha) | [ ] |

---

## Critério Sprint 2 fechada

- [ ] K.3 + K.4 marcados no tablet (operador)
- [ ] Checklist I.5 (`HOMOLOGACAO_PRODUCAO_ASSISTIDA.md`) fechado
- [ ] Tablet em **v1.7.49** (`?force=1.7.49` ou ícone PWA atualizado)

→ Então: iniciar **Pacote L** (Sprint 3). **F4 WhatsApp pausado** — comunicação via **QR** (`DECISAO_COMUNICACAO_QR_CODE_2026-06.md`).

---

*Não usar Liberar sessão durante teste sem avisar operador (I19).*
