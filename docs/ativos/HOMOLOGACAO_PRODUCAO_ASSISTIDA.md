# MOVI KIDS - Homologacao em producao assistida

Data sugerida: fora do horario de pico.

Objetivo: validar a correcao de sincronizacao com o sistema online, sem troca brusca e com rollback pronto.

## Regra principal

Nao criar novo Deploy ID do Apps Script.

Atualizar sempre no mesmo deploy existente, mantendo a URL atual do sistema.

## Participantes

- 1 pessoa no caixa/operador.
- 1 pessoa olhando a tela admin.
- 1 pessoa olhando uma segunda tela operacional ou celular.

## Antes de publicar

- Confirmar que o arquivo de rollback existe:
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\index_v1.6.31_PRODUCAO.html`
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\sw_v1.6.31_PRODUCAO.js`
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\rollback\Code_v1.5.11_PRODUCAO.gs`
- Confirmar que o pacote novo existe:
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\frontend\index.html`
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\frontend\sw.js`
  - `RELEASE_CANDIDATE_MOVIKIDS_SYNC_SAFE\gas\Code.gs`
- Rodar validacao local:

```powershell
node TEST_ENV_MOVIKIDS_SYNC_SAFE\tests\analyze_release_candidate.js
```

Resultado esperado:

```text
Status: PASS_WITH_KNOWN_RISKS
```

## Ordem de publicacao

1. Publicar primeiro o Apps Script `v1.5.13_SAFE` no mesmo Deploy ID.
2. Testar `ping`.
3. Testar `diagnosticoSistema`.
4. Testar `validarSchema`.
5. So depois publicar frontend `v1.6.33-sync-safe` e `sw.js`.
6. Abrir o sistema em 3 telas.

## Teste real minimo

1. Em uma tela, criar uma locacao de teste.
2. Conferir se ela aparece nas outras telas.
3. Iniciar o timer.
4. Conferir se todas as telas mostram timer iniciado.
5. Estender a locacao em +10min.
6. Conferir se todas mostram a extensao e o novo total de minutos.
7. Encerrar a locacao.
8. Conferir se todas saem de ativa para encerrada.
9. Conferir historico e faturamento do dia.

## Criterios de aceite

- Todas as telas veem a mesma locacao ativa.
- Timer nao volta para estado antigo quando uma tela e recarregada.
- Extensao aparece em todas as telas.
- Encerramento aparece em todas as telas.
- Nao surgem duplicidades.
- Nao perde locacao.
- Nao muda preco esperado.
- Nao quebra historico.

## Criterios de rollback imediato

- Locacao nao salva.
- Locacao salva duplicada.
- Encerramento nao grava.
- Timer inicia em uma tela e nao aparece nas outras apos recarregar.
- Extensao altera valor errado.
- Tela principal fica inutilizavel para operacao.

Se qualquer item acima acontecer, executar `ROLLBACK_EMERGENCIA.md`.

---

## Checklist I.5 — Operação diária (Pacote I + I19)

**Versão de referência:** FE **v1.7.48** · GAS **v1.5.56**  
**Quando:** fora do pico ou com 1 operador de reserva no balcão  
**Duração:** ~30 min  
**Mapa:** `PLANO_PAUSA_MATURIDADE_2026-06.md` I.5 · `MAPA_ERROS_FALHAS_BUGS.md` I19

### Regras de segurança (ler antes)

- **Não** publicar FE/GAS durante este checklist se o balcão estiver atendendo.
- **Não** usar “Liberar sessão” no admin **a menos que** seja o teste I19.4 — avise o operador antes.
- **Não** pedir Ctrl+F5 no tablet do operador em horário de pico; use o ícone PWA.
- ADM no computador pode validar Caixa/Dashboard em paralelo **sem** mexer no tablet.

### Participantes

| Papel | Onde | Responsável |
|-------|------|-------------|
| Operador | Tablet (ícone PWA) | Ex.: Milena |
| Admin | PC — login PIN admin | Você |
| Observador | Portal no celular (opcional) | — |

### A — Versão e conectividade (só leitura)

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| A.1 | Tablet: Menu ☰ → rodapé mostra versão | ≥ **v1.7.48** | [ ] |
| A.2 | Header tablet: chip **Turno: Nome** | Verde com operador logado | [ ] |
| A.3 | PC: `?action=ping` no GAS | ≥ v1.5.55 | [ ] |
| A.4 | PC: `listarOperadoresLogin` | `sessaoAtiva` = operador do tablet | [ ] |

### B — Home operador (sem R$)

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| B.1 | Login **operador** (não admin) no tablet | Home abre | [ ] |
| B.2 | Home central | **Zero** valores em R$, KPI financeiro | [ ] |
| B.3 | Stats-bar | Só contagem ativas / encerradas hoje | [ ] |
| B.4 | Sidebar rodapé | Nome operador visível | [ ] |

### C — Admin: Caixa vs Dashboard (no PC)

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| C.1 | Login admin no PC | Home sem grid KPI mensal | [ ] |
| C.2 | Abrir **Caixa** | Faturamento do dia completo | [ ] |
| C.3 | Abrir **Dashboard** | KPIs do mês (não duplica fechamento linha a linha) | [ ] |
| C.4 | Comparar total “hoje” Caixa vs chip discreto Home admin | Mesmo valor (±R$ 0) | [ ] |

### D — Portal responsável (±2 s)

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| D.1 | Celular: `acompanhar.html` telefone de locação ativa | Lista crianças | [ ] |
| D.2 | Iniciar timer no tablet | Portal atualiza em **≤ 2 s** | [ ] |
| D.3 | Carrossel 1 ou N crianças | Layout carrossel (v1.7.47+) | [ ] |

### H — Cronômetro I20 (obrigatório após mudança em timer)

**Versão mínima:** FE **v1.7.78** · GAS **v1.5.66** · Doc: `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| H.1 | Nova locação 10 min | Card **Pendente**, display **10:00**, parado | [ ] |
| H.2 | Esperar 30 s **sem** ▶ | Continua **10:00** (não conta sozinho) | [ ] |
| H.3 | Clicar ▶ | Botão **“⏳ Iniciando…”** na hora; card ativo imediato | [ ] |
| H.4 | No instante do ativo | **RESTANTE 10:00** (±1 s) — **não** 09:33 / 09:50 | [ ] |
| H.5 | Após 10 s | ~**09:50** (±2 s) | [ ] |
| H.6 | Portal mesmo telefone | ±2 s do balcão (I16) | [ ] |
| H.7 | PC: `TESTE_I20_COMPLETO_PROD.ps1` | `status: ok` | [ ] |

### E — Sincronização mínima (se houver locação de teste)

Só se a loja autorizar locação de teste **sem cliente real**:

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| E.1 | Criar pendente teste | Aparece no tablet | [ ] |
| E.2 | Iniciar timer | Portal ±2s | [ ] |
| E.3 | Encerrar | Sai de ativas; histórico OK | [ ] |

### F — Auth I19 (cuidado: avisar operador)

| # | Passo | Esperado | OK |
|---|-------|----------|-----|
| F.1 | Com operador logado: chip Turno | Nome correto | [ ] |
| F.2 | PC: `sessaoAtiva` no GAS | Mesmo operador | [ ] |
| F.3 | **Opcional** F.3: ADM “Liberar sessão” **com aviso** | Tablet: chip laranja ou logout em ≤60s | [ ] |
| F.4 | Operador faz login de novo | Chip verde; locações normais | [ ] |

### G — Regressão automatizada (PC, antes de qualquer push)

```powershell
.\pre-push-check.ps1
.\scripts\testes\TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1
```

| # | Script | Esperado | OK |
|---|--------|----------|-----|
| G.1 | `pre-push-check.ps1` | Verde | [ ] |
| G.2 | `TESTE_RELACIONAMENTO_READONLY` | `ok:true` | [ ] |

### Assinatura Sprint 1

| Campo | Valor |
|-------|-------|
| Data | ___/06/2026 |
| Versão FE tablet | v1.7.___ |
| Operador testado | _________________ |
| Admin | _________________ |
| Incidentes abertos | Nenhum P1 [ ] |

**Sprint 1 fechada quando:** A–G marcados + nenhum rollback.

---

*Checklist I.5 não substitui homologação de release (`RELEASE_CANDIDATE_*`); complementa operação diária pós-pausa maturidade.*

