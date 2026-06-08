# Checklist tablet — v1.7.87 (Pacote M fechado + FASE 1)

**Data:** 07/06/2026  
**Duração:** ~10–15 min (núcleo M.14/M.15 ~5 min)  
**Versão alvo:** FE **v1.7.87** · GAS **v1.5.66+** (sem deploy GAS)  
*(Arquivo nomeado na M.15; URLs usam v1.7.87 pós-M.17.)*  
**Quando:** fora do pico ou com operador de reserva  
**Automatizado já OK (07/06):** `TESTE_PROTOCOLO_DIAGNOSTICO.ps1 -Foco completo` — I20, portal, KPI, CRM, drawer, HTTP.

---

## Antes de começar

| # | Ação | OK |
|---|------|-----|
| 0.1 | Tablet: abrir **https://ribocg-a11y.github.io/movikids/?force=1.7.87** | [ ] |
| 0.2 | Menu ☰ → rodapé: versão **v1.7.87** | [ ] |
| 0.3 | Header: chip **Turno: Nome** (operador logado) | [ ] |
| 0.4 | Se versão antiga: fechar aba PWA → reabrir pelo link `?force=` (não Ctrl+F5 no pico) | [ ] |

**Regra:** custo e avulso **gravam na planilha**. Use prefixo `TESTE_TABLET_` na descrição/justificativa para identificar depois.

---

## A — M.14 Custos (`mk-custos.js`) · ~3 min

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| A.1 | Menu ☰ → **Registrar Custo** | Página abre sem tela branca / erro no console | [ ] |
| A.2 | Categoria **Manutenção** fica destacada ao tocar | Botão `.sel` na categoria | [ ] |
| A.3 | Descrição: `TESTE_TABLET_M14 custo` · Valor: `0,01` | Campos aceitam entrada | [ ] |
| A.4 | **Salvar Custo** | Toast sucesso; botão volta ao normal | [ ] |
| A.5 | Lista **Custos do dia** | Item aparece com categoria e valor | [ ] |
| A.6 | Voltar Home → reabrir Custos | Item ainda na lista (persistiu) | [ ] |

**Falha típica:** página vazia = `mk-custos.js` não carregou (cache SW) → repetir 0.1.

---

## B — M.15 Lançamento avulso (`mk-avulso.js`) · ~4 min

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| B.1 | Menu ☰ → **Lanç. Avulso** | Formulário completo; aviso amarelo no topo | [ ] |
| B.2 | Sair e voltar à página | Campos **limpos** (tipo/plano reset — `resetAvulsoForm_`) | [ ] |
| B.3 | Justificativa com &lt; 10 chars → Salvar | Toast aviso; **não** salva | [ ] |
| B.4 | Justificativa: `TESTE_TABLET_M15 validacao modulo avulso` | — | [ ] |
| B.5 | Responsável: `Teste Tablet` · Criança: `Crianca Teste` | — | [ ] |
| B.6 | Tipo **Carro** → planos aparecem | Grid de planos visível | [ ] |
| B.7 | Escolher plano (ex. 10 min) → **Registrar** | Toast com `#id`; vai para **Home** | [ ] |
| B.8 | Home atualiza (sync) | Stats/loc encerradas coerentes (sem travar) | [ ] |

**Falha típica:** `resetAvulsoForm_ is not defined` = `mk-avulso.js` ausente no cache → 0.1.

---

## C — Cronômetro rápido (protocolo F5/F6) · ~3 min

*Só se puder criar locação de teste sem cliente real.*

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| C.1 | Nova locação 10 min → **só salvar** | Pendente **10:00** parado | [ ] |
| C.2 | Esperar 20 s sem ▶ | Continua **10:00** | [ ] |
| C.3 | Clicar ▶ | **⏳ Iniciando…** imediato; ativo ~**10:00** (±1 s), não 09:33 | [ ] |
| C.4 | Encerrar locação teste | Sai das ativas | [ ] |

Ref. completa: `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md` seção **H**.

---

## D — Portal + sync (F10/F11) · ~2 min · opcional

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| D.1 | Celular: `acompanhar.html` com tel. de locação ativa | Cronômetro visível | [ ] |
| D.2 | Balcão vs celular | Diferença **≤ 2 s** | [ ] |
| D.3 | Recarregar tablet (ícone PWA) com locação ativa | Mesmo tempo restante (±2 s) | [ ] |

---

## E — CRM K.3 (M.13) · ~2 min · se ainda aberto na FASE 1

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| E.1 | Menu → **Relacionamento** | Busca abre | [ ] |
| E.2 | Buscar cliente conhecido | Card com **badge Cadastro** | [ ] |

Detalhe: `CHECKLIST_PACOTE_K.md` K.3–K.4.

---

## F — Admin payback (PC) · FASE 1 item 1.5 · ~2 min

No **PC** com PIN admin (não no tablet operador):

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| F.1 | Login admin → **Dashboard** | KPIs do mês carregam | [ ] |
| F.2 | Painel payback (roxo) | % e previsão **sem erro** / valores coerentes | [ ] |

---

## Critério de pronto

| Marco | Condição |
|-------|----------|
| **M.14 fechado** | A.1–A.6 ✅ |
| **M.15 fechado** | B.1–B.8 ✅ |
| **FASE 1 parcial** | C + D + E + F conforme aplicável |
| **Pacote M fechado** | M.1–M.17 ✅ (v1.7.87; `mk-globals` + `mk-boot`) |
| **Próximo** | Homologação FASE 1 I.5 |

---

## Se algo falhar

| Sintoma | Provável causa | Ação |
|---------|----------------|------|
| Página em branco / função undefined | Cache PWA / SW antigo | `?force=1.7.87`, reinstalar ícone |
| Cronômetro 09:33 | FE velho no tablet | Mesmo `?force=` |
| Erro ao salvar custo/avulso | GAS / auth | Ver chip Turno; ping v1.5.66 |
| Regressão grave | — | `ROLLBACK_EMERGENCIA.md` |

---

## Limpeza pós-teste (opcional)

- Custos `TESTE_TABLET_M14` e lançamentos avulso `TESTE_TABLET_M15` podem ficar na planilha (valores simbólicos) ou ser removidos manualmente depois.
- Não usar **Liberar sessão** admin durante o teste.

---

*Relacionado: `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` · `PACOTE_M_MODULARIZACAO.md` · `HANDOFF_NOVO_CHAT.md`*
