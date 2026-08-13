# Incidente I144 — Ferramentas de liberação com PIN admin morto (1416)

**Data:** 12/08/2026  
**Camadas:** FE ops (Pages) · GAS auth (sem mudança de código)  
**Sem App Script no celular:** sim — correção só em HTML/docs publicados

## Sintoma relatado

Milena “não consegue entrar” no sistema; dúvida se salvou locação. Sócio via celular, sem condição de abrir Editor App Script.

## Diagnóstico ao vivo (12/08 ~10:53–11:00 BRT)

| Check | Resultado |
|-------|-----------|
| Ping GAS | **ok** · **v1.5.210** |
| FE Pages | **v1.9.96** alinhado (`mk-version` / `sw.js`) |
| `validarSchema` | **schemaOk=true** · 4 operadores ativos · todos com PIN |
| `listarOperadoresLogin` | `sessaoAtiva` = **Milena Nunes** (id 2) desde **10:51** |
| Locação | **id 2714** · Carro 01 · Alcides Neto / Cadu E Carlos · PIX · ciclo **10:54→10:54** encerrada |
| `statsHoje` | `nSessoes=1` · meta turno Milena **emTurno** (10h–14h) |
| Ativas agora | **0** |
| FOLHA_PONTO audit | 2 avisos “OK sem horario” (não bloqueia balcão) |

**Conclusão operacional:** no momento da auditoria o balcão **estava funcionando** — Milena logada e **conseguiu salvar + encerrar** a locação 2714. Não houve necessidade de liberar a sessão dela (isso a derrubaria no meio do turno).

## Anormalidade encontrada (ferramenta de emergência)

Páginas publicadas em GitHub Pages:

- `scripts/ops/liberar-milena-agora.html`
- `scripts/ops/liberar-eduarda-agora.html`

ainda mandavam `adminPin=**1416**` (PIN antigo I64).

Prova nesta sessão:

| Chamada | 1416 | 1421 |
|---------|------|------|
| `listarAuditoriaAdmin` | **403** Acesso negado | **ok** |
| `loginAdmin&adminPin=` | falha / ok conforme PIN | **ok** com 1421 |

Se alguém tentasse “liberar Milena” pelo celular com essas páginas, **a liberação falhava** — reforçando a sensação de sistema travado, **sem precisar mexer no App Script**.

## Correção (sem App Script)

1. **`ops-balcao.html`** na raiz Pages — status (ping / sessão / ativas / hoje) + liberar sessão + reset PIN opcional; PIN digitado (não hardcoded).
2. Atualizar `liberar-milena-agora.html` e `liberar-eduarda-agora.html`: PIN digitado; ações separadas (só liberar vs reset).
3. Docs: este incidente · MAPA I144 · HANDOFF.

URL celular após merge/publish:

https://ribocg-a11y.github.io/movikids/ops-balcao.html

## O que NÃO fazer sem pedido (§7.3)

- `clasp push` / Nova versão Web GAS  
- Liberar sessão **enquanto** Milena está em turno com operação OK  
- Resetar PIN dela sem ela pedir (obriga criar PIN novo no tablet)

## Nota técnica (GAS — backlog, não bloqueia hoje)

`listarAuditoriaAdmin_` usa `getLastRow() - 1` (pula última linha) e ordena data como string `DD/MM/YYYY` — eventos de **hoje** podem não aparecer no topo mesmo existindo em `carregarInicio` / planilha. Corrigir exige App Script (fora do escopo deste incidente).

## Checklist tablet se voltar a travar

1. Abrir `ops-balcao.html` no celular → ver quem está em `sessaoAtiva`
2. Se for **outra** pessoa ou sessão fantasma: **Liberar sessão** com PIN admin atual
3. No tablet: `?force=1.9.96` (ou versão Pages) → Milena → PIN
4. Só resetar PIN se ela confirmar que esqueceu
