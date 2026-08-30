# MOVI KIDS — Plano: fechar pontas de sinergia

**Criado:** 30/08/2026 · **Origem:** varredura ponta a ponta (só leitura, sem teste no balcão)  
**Produção ao abrir o plano:** FE **v1.9.106** Pages · GAS ping **v1.5.211**  
**30/08 tarde:** código S0+S1+S2+I149 feito em **v1.9.107** local · **push bloqueado I22** (2 Ativa)  
**Não substitui:** Sprint D (`PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md`) · smoke tablet D4 continua válido  
**Mapa:** `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` F0–F17 · `MAPA_CODIGO_ARQUITETURA.md`

---

## 1. Objetivo

O núcleo (salvar → ▶ → timer → encerrar → caixa) está modelado certo. Este plano fecha **bordas** para o mapa e o código dizerem a mesma coisa — sem reabrir zona P0 do cronômetro.

**Pronto quando:**

1. Tablet e pasta C rodam o **mesmo** I148 (sync `listarAtivas` **e** purge 409 no Encerrar).
2. Portal pais usa o mesmo `?v=` do balcão.
3. Docs/mapa não prometem Firebase tempo-real no salvar/▶, nem “offline na operação inteira”.
4. F9 Encerrar ≠ F9 Supervisor (nomes separados).
5. Fase 3 offline (encerrar/multi) **não** começou — só nomeada, com porta §7.3.

---

## 2. Fora de escopo (não fazer neste plano)

| Tentação | Por que não |
|----------|-------------|
| Religar Firebase em `salvarLocacao` / `iniciarTimer` | I125b tirou de propósito (UrlFetch 2–6s). Religar = timer lento. |
| Apagar SMS / WhatsApp do FE/GAS | Reativação é §7.3. `qr_only` já corta envio. |
| Fila offline em encerrar/estender/editar/cancelar/multi | Toca caixa. Exige `clientRequestId` no GAS (**pedido §7.3**). Vira **Fase 3**, plano à parte. |
| Reativar Supervisor (produto F9) | §7.3 + decisão 17.5 do sócio. |
| Apagar `track.html`, mockups, `financeiro/`, `reparar*` | Não estão no grafo oficial. Marcar legado, não deletar. |
| Nova versão Web GAS | Só com pedido explícito. Origin já tem `.gs` I148 (1.5.213 no histórico); ping ainda **v1.5.211**. |
| Push FE com locação Ativa/Pendente | I22. |

**Zona congelada:** `iniciarTimer_`, `carregarInicio_` col Y, `api()` GET, `mergeSessaoCanonica` / `_localTimerStart`.

---

## 3. Trava de entrada (todo lote que publica FE)

```
check-operacao-livre.ps1     → 0 Ativa + 0 Pendente
git pull --rebase origin main
pre-push-check.ps1
git push origin main
verify-publish-complete.ps1
encerramento-sessao.ps1      → exit 0
tablet ?force= da versão nova
```

Sem operação livre: **só docs** (lote S3 isolado, sem bump I3).

---

## 4. Lotes

### S0 — Git: um único I148  (P0 deste plano · 1 sessão)

**Problema:** origin tem fallback `listarAtivas` (`63a8ccc`). Pasta C tem purge 409 (`1d61229` + teste `ef096e1`). Pages ≠ drawer local.

**Fazer:**

1. Operação livre (I22).
2. `git pull --rebase origin main` — **nunca** force-push.
3. Resolver conflito se `mk-sync.js` / `mk-drawer.js` / `.gs` cruzarem.
4. Critério de merge: os **dois** remendos no mesmo tree:
   - `mk-sync.js` → `mkSyncListarAtivasFallback_` (ou nome equivalente do origin)
   - `mk-drawer.js` → `mkEncerrarPurgeLocal_` no 409 **e** no encerrar OK
5. O `.gs` do origin (`minUsados let`, `corrigirCanceladaParaEncerradaAdmin`) entra no repo. **Não** implantar Web.
6. Segue S1 (bump) na mesma sessão.

**Pronto:** `git status` limpo vs `origin/main` após S1. Sem `ahead`/`behind`.

**Risco:** rebase com loja aberta → I22. Se conflito no timer/sync, parar e não “resolver no feeling”.

---

### S1 — FE v1.9.107: I148 unificado + portal  (P0 · mesma sessão que S0)

**Problema:** tablet sem purge 409; portal em `?v=1.9.95`.

**Fazer:**

1. Bump I3 **1.9.107** — `mk-version.js`, `sw.js`, `index.html`, `gestao-pessoas.html`.
2. `acompanhar.html` + `foto-moldura.html` → `?v=1.9.107` (todos os assets da página).
3. Não alterar lógica de `track.html` (legado).
4. Publicar (fluxo §3).
5. Tablet `?force=1.9.107`.

**Pronto:**

- Pages `mk-version.js` = 1.9.107.
- Encerrar em locação já Encerrada some o card (sem segundo fantasma).
- Sync lento ainda some card via `listarAtivas`.
- Portal raw/`?v=` = 1.9.107.

**Teste:** nenhum write na planilha neste lote. Homolog = 1 Encerrar real **já existente** ou card que o sócio escolher — não criar locação de teste se a loja estiver operando.

---

### S2 — Docs e mapa honestos  (P1 · pode ser a mesma sessão)

**Arquivos:**

| Arquivo | Correção |
|---------|----------|
| `HANDOFF_NOVO_CHAT.md` | Versões 1.9.107; bloco “retomar” sem 1.9.105; HEAD real; apontar este plano |
| `ESTADO_ATUAL.md` | FE/GAS atuais |
| `AGENTS.md` | ciclo + versões |
| `MAPA_CODIGO_ARQUITETURA.md` | F10: poll = verdade no salvar/▶; Firebase só encerrar/editar/estender/cancelar (I125b) |
| `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` | F9 Encerrar permanece F9; Supervisor = **17.5 / F9-produto** (não reusar F9) |
| `PLANEJAMENTO_CICLO_POS_ONEUI_2026-06.md` | Idem F9-produto; D4 versão alvo 1.9.107 |
| `MAPA_ERROS_FALHAS_BUGS.md` | I148 = **os dois** remendos (sync + 409), FE 1.9.107 |
| `INCIDENTE_I147_*` / Fase 2 | Texto: fila = só `salvarLocacao` + `iniciarTimer` |
| `docs/INDICE.md` | Link deste plano |

**Pronto:** nenhum doc ativo promete “offline na operação” ou “Firebase no ▶”.

---

### S3 — Nome F9  (P2 · docs only, dentro de S2)

| ID antigo | Nome novo | Onde |
|-----------|-----------|------|
| F9 (protocolo) | **F9 Encerrar / cancelar** | `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` — manter número |
| F9 (planejamento / Supervisor) | **17.5 Supervisor** (produto pausado) | ciclo One UI, checklist FASE 17 |

Não reativar Supervisor neste plano.

---

### S4 — Fase 3 offline (P1 futuro · **não executar agora**)

**Porta:** pedido explícito §7.3 para editar `.gs`.

**Escopo futuro (rascunho, outro doc):**

1. GAS: `clientRequestId` + Cache 6h em `encerrarLocacao`, `estenderLocacao`, `editarLocacao`, `cancelarLocacao`, `salvarLocacoesMulti`.
2. FE: crescer `MK_OFFLINE_QUEUE_ACTIONS`.
3. Homolog avião **depois** do código + Nova versão Web.
4. Guard: replay não duplica extra nem conta (I103).

Até S4 assinado: badge “Fila offline” = só cadastro + ▶.

---

### S5 — Legado (P2 · só classificar)

| Artefato | Ação neste plano |
|----------|------------------|
| `track.html` | Nota no MAPA: “não é F11”. Oficial = `acompanhar.html` |
| mockups / `ponto-mockup.html` | Já são protótipo. Não apagar |
| `financeiro/` | Mini-app fora de F0–F17. Uma linha no MAPA “dedos” |
| `reparar*` GAS | Continuam script-only. Sem tela |
| SMS/WA dormindo | Sem change de código |

---

## 5. Sequência

```
S0 rebase (loja vazia)
    → S1 bump 1.9.107 + portal + I148 único + push
        → S2+S3 docs (mesma sessão ou imediatamente após)
            → tablet ?force=1.9.107
                → D4 / T2 offline (Ops) — já estava no Sprint D
                    → S4 só com pedido §7.3
S5 não bloqueia ninguém
```

**Não inverter:** docs honestos **depois** do número 1.9.107 existir no Pages (senão HANDOFF mente de novo).  
**Exceção:** se I22 bloquear S0/S1, pode-se escrever S2 **parcial** (Firebase/Fase 2/F9 nomes) sem citar 1.9.107 como live.

---

## 6. Quem faz o quê

| Lote | Agente sozinho (§7.2) | Sócio / Ops | §7.3 |
|------|----------------------|-------------|------|
| S0–S1 | rebase, merge, bump, push | tablet `?force=` · loja vazia | não |
| S2–S3 | docs | — | não |
| S4 | — | pedir “editar GAS Fase 3 offline” | **sim** |
| D4 / T2 | — | smoke + avião | não |
| Nova versão Web do `.gs` I148 origin | preparar raw | colar + Editar implantação | **sim** (fora deste plano) |

---

## 7. Critério de aceite (checklist)

- [ ] `git status` = sync com `origin/main`
- [ ] Pages + local + `?v=` index/gestão = **1.9.107**
- [ ] `acompanhar.html` + `foto-moldura.html` = **1.9.107**
- [ ] `mk-sync.js` tem fallback `listarAtivas`
- [ ] `mk-drawer.js` tem `mkEncerrarPurgeLocal_`
- [ ] GAS ping continua **v1.5.211** até alguém pedir Nova versão
- [ ] MAPA F10 descreve I125b
- [ ] Fase 2 docs = só salvar + ▶
- [ ] Supervisor documentado como **17.5**, não F9
- [ ] Nenhuma locação de teste deixada na planilha

---

## 8. Primeiro comando da sessão de execução

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\scripts\check-operacao-livre.ps1
```

Se **não** livre: parar S0/S1. Sócio zera o balcão ou espera o turno. Não “empurrar FE crítico”.
