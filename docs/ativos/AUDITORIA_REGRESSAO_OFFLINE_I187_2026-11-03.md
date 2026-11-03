# Auditoria MAPA + Offline — I187 (03/11/2026)

**Escopo:** varredura regressão MAPA (exceto SMS/WhatsApp/`qr_only`) + capacidade de operar sem internet.  
**FE:** **v1.9.182** · **GAS:** ping/repo **v1.5.237** (sem mudança AppScript nesta entrega)

---

## 1. Varredura MAPA (P0 operacional)

| ID | Status | Nota |
|----|--------|------|
| I15 POST browser | OK | `mkGuardEscritaBrowser_` + GET only |
| I20 / I43 cronômetro | OK | `COL_LOC_READ_=29` · `effectiveStartTs_` |
| I143 / I145 sync | OK | timeout não enfileira salvar; idle sem `force=1` |
| I151 encerrar fantasma | OK | purge 409 + reconcile; **risco residual** Firebase rehydrate |
| I154 / I155 | OK | gas-unstable + lookback 600 |
| I170–I186 isolamento / Holding / Receita | OK | I183b `unidadeId:'all'` após auth |
| I24 / I3 versão | OK | triad 1.9.181 |
| PIN 1416 (I64) | OK | UI prod limpa; mockups/docs históricos ainda citam |
| SMS / WhatsApp / F4 | **Ignorado** | `MK_COMUNICACAO_MODO=qr_only` |

### Brechas residuais (não regressão de fix)

| Gap | Severidade | Ação |
|-----|------------|------|
| PIN admin em Script Property / fallback repo | Alta se property vazia | Só sócio; não expor em FE |
| Auth escrita = nome operador + URL pública | Média | Backlog token sessão |
| `authRole=gestor` confiado no client | Média | Backlog |
| Firebase listener → `aplicarDadosInicio` | Média | Monitorar vs I151 |

Nenhuma regressão P0 de fix conhecido voltou no código auditado.

---

## 2. Offline — estado antes × I187

### Antes (parcial)
- Fila: só `salvarLocacao` + `iniciarTimer`
- Offline real: `api()` esperava timeout (~25s) antes de enfileirar
- Encerrar/cancelar: exigiam rede
- Bug: `rowIndexFromSalvar_` virava **NaN** com id `off-…`
- Sync/`listarAtivas=0` podia **apagar** card temp da fila
- SW: network-first **sem** cache de shell

### Depois (I187 · FE 1.9.181)
- Short-circuit: sem `navigator.onLine` → fila imediata
- Fila: salvar · ▶ · **encerrar** · **cancelar** (FIFO + remap row temp)
- Flush: 409 encerrar/cancelar = OK; não reenfileira durante flush
- Orphans offline preservados no sync
- SW: precache shell `mk-shell-1.9.181` + put em GET ok
- Fora da fila (ainda precisam rede): estender, editar, multi-atômico, login, admin/KPIs nuvem

### Veredito

**Parcial → operacional balcão core.**  
Tablet pode cadastrar, ▶, encerrar e cancelar sem internet; ao voltar a rede, flush sobe a fila e sync puxa nuvem.  
Não é offline-first total (admin/holding/folha/login frio ainda dependem de rede).

---

## 3. Como validar no tablet

1. `?force=1.9.181` · abrir balcão online uma vez (preenche shell cache)
2. Modo avião → Nova 1 veículo → card Pendente + badge fila
3. ▶ → cronômetro local
4. Encerrar → card some; toast fila
5. Ligar rede → toast “sincronizando” → nuvem/planilha confirma
6. Regression: ▶ online ainda 10:00 imediato (I20)

---

## 4. Guards

`guard.i187.api.shortcircuit` · `guard.i187.fila.encerrar` · `guard.i187.sync.orphans` · `guard.i187.nova.rowtemp`
