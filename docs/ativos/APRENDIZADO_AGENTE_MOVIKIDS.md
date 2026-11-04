# Aprendizado do agente — MOVI KIDS

**Criado:** 04/11/2026 · **Origem:** sessão I191→I197 (fantasma, Encerradas LV, “ninguém logado”, audit dual-loja)  
**Uso:** ler na **Fase A** de todo chat · atualizar quando um padrão novo se repetir 2×  
**Não substitui:** `ROTEIRO_AGENTE_OBRIGATORIO.md` · `MAPA_ERROS_FALHAS_BUGS.md` · `ACESSOS_E_AUTORIZACOES.md`

---

## 0. Por que este arquivo existe

O usuário pediu evolução **visível**: não só “consertar o sintoma pedido”, mas **perceber omissões**, **agir sem pedido** quando a arquitetura exige, e **auto-regular** falhas próprias.

Hoje (04/11) a cadeia I191→I197 mostrou o mesmo padrão: o agente fechava o bug apontado e **deixava irmãos latentes** no mesmo fluxo (parcial vs rico, singular vs mapa, all→golden, cache/Firebase reidratando Ativa). Isso **não é evolução** — é reativo.

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

---

## 6. Template — o que reportar ao usuário (prova de evolução)

No fim de entrega P0, incluir bloco curto:

```markdown
### Feito sem pedido (arquitetura)
- …
- …
### Família varrida
- [ ] autoridade · [ ] parcial · [ ] mapa · [ ] all/golden · [ ] assign order · [ ] boot/cache/offline
### Ainda §7.3 / só humano
- …
```

---

## 7. Ligação com outros docs

| Doc | Papel |
|-----|-------|
| `ROTEIRO_AGENTE_OBRIGATORIO.md` | Ordem commit/push (como publicar) |
| Este arquivo | **Como pensar** e o que fazer além do pedido |
| `MAPA_ERROS_FALHAS_BUGS.md` | Incidentes e travas |
| `AUDITORIA_LATENTE_POS_I194_I195_2026-11-04.md` | Achados vivos dual-loja |
| `INCIDENTE_I197_*` | Última leva FE de família |
| `.cursor/rules/agente-aprendizado-movikids.mdc` | Lembrete always-apply |

---

## 8. Atualização deste arquivo

Quando:

- O mesmo padrão falhar 2×, **ou**
- Nascer I* novo da família dual-loja / fantasma / parcial / parse, **ou**
- O usuário cobrar evolução de novo

→ acrescentar linha na §1 / §5 **na mesma sessão** do fix. Não deixar só no chat.
