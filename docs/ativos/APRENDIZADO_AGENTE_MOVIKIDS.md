# Aprendizado do agente — MOVI KIDS

**Criado:** 04/11/2026 · **Origem:** sessão I191→I198 (fantasma → família → evolução estratégica)  
**Uso:** ler na **Fase A** de todo chat · atualizar quando um padrão novo se repetir 2×  
**Companheiro:** `EVOLUCAO_ESTRATEGICA_POS_I197.md` (ir além do fix)  
**Não substitui:** `ROTEIRO_AGENTE_OBRIGATORIO.md` · `MAPA_ERROS_FALHAS_BUGS.md` · `ACESSOS_E_AUTORIZACOES.md`

---

## 0. Por que este arquivo existe

O usuário pediu evolução **visível**: não só “consertar o sintoma pedido”, mas **perceber omissões**, **agir sem pedido**, **comparar com outros sistemas**, **prever modernização**, e transformar cada erro em **proteção definitiva**.

Hoje (04/11) a cadeia I191→I197 mostrou o padrão reativo (fechar 1 if, deixar irmãos). O mandato seguinte foi explícito: **não ficar bitolado esperando comando** — proteger e modernizar sempre; o fix pontual é o mínimo, não a entrega.

Este doc é a memória operacional do que o agente **já deveria saber sozinho**.

---

## 1. O que aprendi com o dia (I191–I197)

### 1.1 Arquitetura — verdades duras

| # | Verdade | Consequência se ignorar |
|---|---------|-------------------------|
| A1 | **Autoridade de Ativa/Pendente = `listarAtivas` (GAS)** | Firebase, `mk_inicio_cache`, snapshot IDB/LS, `carregarInicio` ScriptCache **não** podem reidratar Ativa |
| A2 | **Holding `unidadeId=all` → `sessaoAtiva=null` + `sessoesAtivas` mapa** | Qualquer UI que leia só singular mente “ninguém logado” (I194/I195/I197 GP) |
| A3 | **Parcial sobrescreve rico** | `listarAtivas` sem `encHoje` gravando `[]` apaga Encerradas (I192) |
| A4 | **`all→golden` é veneno** | Deslogar/liberar/auth/login fallback derruba loja errada ou as duas |
| A5 | **Auth depois de `unidadeId` explícito engole a loja** | Custos/relatório/hist viram loja do tablet (I196) |
| A6 | **Parse JS quebrado = FE morto no tablet** | Comentário `*/` dentro de bloco = SyntaxError (I193) — pior que bug de lógica |
| A7 | **PC ≠ tablet** | Sync “ok” no PowerShell não prova balcão; fantasma vive no PWA/LS/IDB |
| A8 | **FE sem push = banner nunca aparece** | I24 — bump local sem Pages é entrega falsa |
| A9 | **Paint/render NUNCA dispara rede** | `renderX` que chama `ensure*`/`load` após falha = “Carregando…” eterno (I200). Rede só por intenção: tab, select, botão retry |
| A10 | **Paridade de preços ≠ copiar frota** | Golden=LV em **valores/tempos**; quantidades são por loja (Golden **4 pelúcias**, LV 3). Mudar tabela = varrer CONFIG + `mk-globals` + admin OPCFG + fallbacks + schema CUSTOS |
| A11 | **CONFIG/admin pode reverter o live** | Editor OPCFG que só conhece Carro/Triciclo/Pelúcia+3h **apaga Dino** e **recria 3h** no save — strip vazios + tipos completos no mesmo commit |
| A12 | **Toda superfície que vende plano** | Nova · **Avulso** · Estender · Admin OPCFG · fallbacks — protocolo `PROTOCOLO_MUDANCA_TABELA_PRECOS_FROTA.md` |
| A13 | **Virada de preço no meio do dia** | Locações já cobradas no real → corrigir **valorPlano + valorTotal** na planilha na mesma sessão (não só CONFIG) |

### 1.2 Família de falha (como eu erro)

```
pedido do usuário (sintoma)
        ↓
corrigir 1 arquivo / 1 if
        ↓
FE sobe
        ↓
irmão no mesmo fluxo (cache, Firebase, GP, offline, holding)
        ↓
usuário reclama de NOVO sintoma = mesma família
```

**Evolução = quebrar esse loop:** a cada P0, varrer a **família** antes de declarar concluído.

### 1.3 O que eu deixei passar (omissões próprias — admitir)

| Omissão | Por que aconteceu | Correção de comportamento |
|---------|------------------|----------------------------|
| I191: comentário quebrou parse | Foco no “fantasma”, zero `node --check` na cabeça | **Sempre** `guard-js-syntax` / `--check` antes de push |
| I192: Encerradas vazias após “fix fantasma” | Tratei só Ativa; ignorei que parcial grava snapshot | Após mudar sync → perguntar: **o que o parcial apaga?** |
| I194: “ninguém logado” | Considerei `sessaoAtiva` suficiente | Dual-loja → **sempre** procurar mapa |
| I195: deslogar holding | Fallback “seguro” all→golden | **Nunca** inventar golden; loja viva ou tentar as 2 |
| I196: unidadeId engolido | Object.assign/spread sem olhar ordem | Auth **primeiro**, unidade **por último** |
| I197: Firebase/IDB/GP/cache ainda latentes | Auditei só depois do usuário pedir “veja o que deixou passar” | **Audit da família deve ser meu**, não pedido |
| I199→I200: Folha ainda “Carregando…” | Fixei race de mês; **não** varri o paint que re-pedia full após `!ok` | Após fix de loading: perguntar **quem re-dispara load?** Render pode? Se sim → loop |
| Usuário: **“nada”** pós-entrega | Tratei I199 como fechado sem provar UI fora do loading | “nada” / print stuck = **família incompleta** — abrir imediatamente, não defender o fix |

---

## 2. Como eu me auto-regulo (checklist interno)

Antes de dizer “concluído” / “pode testar”, o agente **obrigatoriamente** percorre:

### 2.1 Gate de família (após qualquer fix P0)

1. **Que camada é autoridade?** (GAS action X vs cache vs Firebase vs LS)
2. **Existe payload parcial?** Se sim → o que **não** vem no payload e não pode ser zerado?
3. **Existe campo singular + mapa?** Holding lê o mapa?
4. **Existe fallback `all` / default `golden`?** É seguro nas 2 lojas?
5. **Ordem de `Object.assign` / spread?** Quem ganha no conflito?
6. **Boot / timeout / backoff / offline** ainda podem reidratar o estado velho?
7. **Mesmo padrão em outro arquivo?** (admin, GP, hist, custos, ops-balcao, firebase)
8. **Guard + teste** que impede regressão? Se não existe → criar no mesmo commit
9. **Paint/render chama `load`/`ensure*`?** (I200) → proibido; só tab/select/retry/boot explícito

### 2.2 Gate de honestidade

- [ ] Eu **pedi** ao usuário algo que está em §7.2? → **proibido**; executar
- [ ] Eu transferi “rode o script X” sendo que eu posso rodar? → **proibido**
- [ ] Eu fechei o sintoma sem varrer irmãos? → **não é concluído**
- [ ] Working tree / Pages / versão alinhados (I24)? → senão não encerra
- [ ] JS parse OK (I193)? → senão não pusha

### 2.3 Gate de proatividade (fazer sem pedido)

Quando a arquitetura **exige**, o agente age sozinho:

| Situação detectada | Ação sem pedir |
|--------------------|----------------|
| Mudou FE | Bump I3 + commit + push main + verify + encerramento |
| Fixou fantasma / sync | Varrer Firebase, cache, snapshot, offline prune, boot |
| Fixou sessão/login holding | Varrer banner, chip, GP badges, deslogar, lock UI, ops-balcao |
| Fixou `unidadeId` | Grep `apiParamsComAuth_` / `Object.assign` / `all→golden` |
| Mudou preços/frota | Planilha CONFIG via API · `mk-globals` · admin OPCFG · fallbacks home/nova/operacao · `validarSchema` abas · teste I203 |
| Novo incidente I* | Entrada no MAPA + guard no pre-push + HANDOFF |
| Audit achou P0/P1 FE | Implementar na mesma sessão (não só relatório) |
| `encerramento-sessao` exit ≠ 0 | Push / alinhar Pages — não explicar e parar |
| Comentário perto de `*/` | Reescrever comentário + `node --check` |

**Não fazer sem §7.3:** `clasp push`, editar `.gs`, Nova versão Web, mudar `api()`/PIN/auth core, reativar F4/F9.

---

## 3. Decisões que já tomo sozinho (nível atual)

Com o aprendizado até I197, o agente **não precisa perguntar** para:

1. Publicar FE (bump + push + verify) quando o código FE mudou  
2. Escolher `listarAtivas` como autoridade de cards Ativa e **strip** Ativa de cache/Firebase/snapshot  
3. Preferir `sessoesAtivas` (mapa) em qualquer UI de “quem está logado”  
4. Preservar `encHoje` / stats / config quando o payload é `parcial`  
5. Recusar fallback `unidadeId: 'all'` → `'golden'` em liberar/deslogar  
6. Forçar `unidadeId` **depois** do auth em custos/relatório/hist  
7. Criar `guard.iNNN.*` no `pre-push-check` junto com o fix  
8. Rodar audit paralelo (session / sync / offline) e **implementar** P0/P1 FE achados  
9. Atualizar HANDOFF + MAPA + incidente na mesma entrega  
10. Encerrar só com `encerramento-sessao.ps1` exit 0  

Se eu ainda perguntar “quer que eu faça push?” ou “quer que eu olhe o Firebase também?” — **regredi**.

---

## 4. Como perceber falha própria (sinais)

| Sinal | Interpretação | Ação |
|-------|---------------|------|
| Usuário reclama de **outro** sintoma no **mesmo** fluxo ≤24h | Eu fechei sintoma, não família | Abrir audit da família imediatamente |
| “Ninguém logado” / Encerradas vazias / fantasma de novo | Dual-loja ou parcial — clássicos | Grep `sessaoAtiva` sem mapa; grep `encHoje:[]`; grep Firebase `ativos` |
| Tablet morto após push | Parse / SW / versão | `node --check` + Pages `?force=` |
| Banner Nova versão não aparece | I24 | verify-publish / push main |
| Eu escrevi “mitigação / monitorar” para P0 FE | Covardia / transferência | Implementar agora |
| Relatório de audit sem código | Entrega incompleta | Codar P0/P1 na mesma sessão |

---

## 5. Evolução — métrica (para o usuário perceber)

O agente evoluiu **se**, na próxima reclamação dual-loja / fantasma / holding:

1. Corrige o sintoma **e**  
2. Varre a família (lista §2.1) **sem** o usuário pedir “veja o que deixou passar” **e**  
3. Sobe FE + guards + docs **e**  
4. No encerramento, lista **o que fez sem pedido** (1–3 bullets)

Se o usuário ainda precisar dizer “veja outras coisas que você deixou passar” — a evolução **falhou** nesta sessão.

### Histórico curto de evolução

| Data | Marco | O que passou a ser automático |
|------|-------|-------------------------------|
| 26–27/06 | I24 / roteiro | Push FE sem pedir; encerramento exit 0 |
| 02–03/09 | I148→I151b | `listarAtivas` autoridade; reconcile pós-inicio |
| 03–04/11 | I187→I193 | Offline + **nunca** push com SyntaxError |
| 04/11 | I194→I197 | Holding = mapa; parcial ≠ apagar rico; audit→código na mesma sessão |
| 04/11 | Este doc | Família obrigatória + proatividade explícita |
| 04/11 | **I198 + mandato §9** | Comparar/prever/modernizar; helper + audit-família; não esperar comando |
| 05/11 | **I200** | Render **nunca** re-dispara load (ensureFull no paint = loop eterno) |
| 05/11 | **A9 + guard.i200** | Contrato paint-only + trava pre-push; “nada” do usuário = gatilho de família |

---

## 6. Template — o que reportar ao usuário (prova de evolução)

No fim de entrega P0, incluir bloco curto:

```markdown
### Feito sem pedido (arquitetura)
- …
### Além do fix (definitivo / modernização)
- política nomeada / guard / movimento E* ou P*
### Família varrida
- [ ] autoridade · [ ] parcial · [ ] mapa · [ ] all/golden · [ ] assign · [ ] boot/cache/offline
### Comparativo / próximo estratégico
- o que sistemas maduros fazem · próximo E*/G*/P* (ver EVOLUCAO_ESTRATEGICA)
### Ainda §7.3 / só humano
- …
```

---

## 7. Ligação com outros docs

| Doc | Papel |
|-----|-------|
| `ROTEIRO_AGENTE_OBRIGATORIO.md` | Ordem commit/push (como publicar) |
| Este arquivo | **Como pensar** e o que fazer além do pedido |
| `EVOLUCAO_ESTRATEGICA_POS_I197.md` | Comparar · movimentos E*/G*/P* · critério “fomos além” |
| `MAPA_ERROS_FALHAS_BUGS.md` | Incidentes e travas |
| `AUDITORIA_LATENTE_POS_I194_I195_2026-11-04.md` | Achados vivos dual-loja |
| `INCIDENTE_I197_*` | Família FE |
| `.cursor/rules/agente-aprendizado-movikids.mdc` | Lembrete always-apply |

---

## 8. Atualização deste arquivo

Quando:

- O mesmo padrão falhar 2×, **ou**
- Nascer I* novo da família dual-loja / fantasma / parcial / parse, **ou**
- O usuário cobrar evolução / modernização de novo

→ acrescentar linha na §1 / §5 / §9 **na mesma sessão**. Não deixar só no chat.

---

## 9. Mandato — ir além do erro (04/11/2026)

Pedido do usuário (essência): decisões baseadas nos **próprios erros**; **comparar** com outros sistemas; **prever** mudanças estratégicas; **modernizar**; **não esperar comando**; cada erro = crescimento, não só correção.

### 9.1 Ciclo obrigatório por P0

```
erro / sintoma
  → fix mínimo (parar o sangramento)
  → família (§2.1)
  → política nomeada no código (helper/contrato)
  → trava automática (guard / audit-familia)
  → 1 movimento de modernização (E* FE ou propor G*/P*)
  → publicar + reportar “além do fix”
```

Parar no primeiro passo = **regredir**.

### 9.2 Comparar (sempre)

Perguntas mínimas:

1. Como um app multi-loja maduro modelaria isso (tenant explícito, sem default store)?
2. Como offline-first serio faria outbox (idempotência + escopo)?
3. Como sync maduro faria merge parcial (campo a campo, não replace cego)?
4. O que podemos **importar como contrato** sem reinventar moda?

Respostas alimentam `EVOLUCAO_ESTRATEGICA_POS_I197.md`.

### 9.3 Prever e modernizar (sem pedido)

O agente **age** quando vê:

| Sinal | Ação autônoma |
|-------|----------------|
| 3+ patches no mesmo fluxo | Extrair política/helper (ex. I198 `mkInicioCacheSafeForApply_`) |
| Anti-padrão grepável | Script/guard no pre-push |
| Dual-loja + campo singular | Migrar UI para mapa na mesma sessão |
| Fonte secundária escrevendo estado crítico | Rebaixar a read-only / hint |
| Documento só “monitorar” P0 | Virar E* com código ou G* com texto §7.3 |

### 9.4 O que NÃO é evolução

- Esperar “pode olhar o Firebase?”  
- Entregar só relatório de audit  
- “Mitigação / monitorar” em P0 FE  
- Patch sem guard  
- Guard sem política nomeada quando o padrão já repetiu 2×  

### 9.5 Auto-regulação emocional-operacional

Bitolado = só obedece o último comando.  
Evoluído = usa o comando como **gatilho** para proteger o sistema inteiro e deixar o próximo chat mais forte (código + trava + próximo passo estratégico).

### 9.6 Exemplo claro — decisão sozinha (04/11/2026)

**Falhou:** após I198 (código + Pages) o agente **não** rodou `PROTOCOLO_ATUALIZAR_TUDO` — docs ESTADO/DEPLOY/AGENTS/planejamento ficaram em **1.9.179**. O usuário precisou cobrar.

**Decisão correta (agora regra):** ao fechar I* / bump FE / P0 publicado → na **mesma sessão**, executar o protocolo completo (HANDOFF → ESTADO → planejamento → MAPA → protocolos → DEPLOY → INDICE/README/AGENTS → testes README) e commit/push docs **sem pedir** “atualize tudo”.

### 9.7 Exemplo claro — I199→I200 (05/11/2026)

**Falhou de novo no mesmo mandato:** GAS já devolvia Outubro (~62s). I199 fechou a **race de competência**, subi 1.9.193 e tratei como feito. O paint da Folha ainda chamava `ensureFull` após `!ok` → loop “Carregando…”. O usuário só precisou dizer **“nada”** + print.

**O que eu deveria ter feito sozinho antes de declarar I199 ok:**

1. Simular mismatch (want=Out, got=Nov, inFlight=false) no caminho `renderFolha` — ver se re-dispara rede  
2. Perguntar: após timeout/`!ok`, a UI mostra **retry** ou **loading**? Loading sem botão = loop  
3. Comparar com UI madura: *render is pure; effects are intentional*  
4. Guard + watchdog **na mesma entrega** do I199 — não na do “nada”

**Decisão agora:** todo fix de “não carrega / Carregando eterno” **inclui** varredura paint→load + guard. Usuário dizer “nada”/colar print stuck = **reabrir família**, não insistir que o fix anterior bastou.

Isso **é** tomar decisão sozinho: a arquitetura do projeto exige docs alinhados; esperar comando é omissão.
