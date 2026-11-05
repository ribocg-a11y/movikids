# Evolução estratégica — além do fix (pós I191–I198)

**Atualizado:** 05/11/2026 · **FE:** v1.9.194 · **Mandato:** `APRENDIZADO_AGENTE_MOVIKIDS.md` §9  
**Princípio:** cada erro deve gerar **proteção definitiva** + **modernização**, não só patch.

---

## 1. Comparar o nosso sistema com o que funciona lá fora

| Problema nosso | Como sistemas maduros lidam | Gap MOVI KIDS | Movimento definitivo |
|----------------|----------------------------|---------------|----------------------|
| Várias fontes de verdade (GAS / Firebase / LS / IDB / cache) | **Uma** autoridade de domínio + caches só leitura | Firebase e cache ainda podiam escrever Ativa | Autoridade = `listarAtivas`; cache via `mkInicioCacheSafeForApply_` (I198) |
| Payload parcial sobrescreve estado rico | Merge **por campo** / event sourcing / “patch JSON” | `listarAtivas` apagava `encHoje` | Política: parcial nunca zera campos ausentes (I192+) |
| Holding = campo singular | Multi-tenant session **map** desde o dia 1 | UI lia `sessaoAtiva` | Mapa `sessoesAtivas` em toda UI (I194–I197) |
| Default store “golden” | Fail-closed / exigir tenant | `all→golden` | Proibido em liberar/deslogar; audit família |
| Regressão só descoberta pelo usuário | Contract tests + lint de anti-padrão | Guards pontuais | `audit-familia-dual-loja.ps1` no pre-push (I198) |
| Offline fila frágil | Outbox pattern + idempotência + escopo tenant | Prune cross-loja | Escopo por `unidadeId` (I197) |
| Tablet ≠ PC | Device lab / smoke PWA | Testes API ≠ balcão | Homologação tablet obrigatória em P0 cronômetro/fantasma |
| Loading eterno em admin RH | UI = paint puro; fetch só em eventos (React Query / SWR / “request ≠ render”) | `renderFolha` → `ensureFull` (I200) | Contrato paint-only + `guard.i200` · retry explícito |

Não copiar moda: **importar o contrato** (uma autoridade, merge por campo, multi-tenant explícito, outbox, gates, **render sem side-effect**).

---

## 2. Movimentos estratégicos (ordem)

### Já feito (proteção)

| ID | Movimento | Status |
|----|-----------|--------|
| I193 | Parse JS no pre-push | ✅ |
| I194–I197 | Mapa holding + família FE | ✅ |
| **I198** | Helper único cache-safe + `audit-familia-dual-loja.ps1` | ✅ FE v1.9.192 |
| **I199–I200** | Folha competência + paint-only + watchdog + `guard.i200` | ✅ FE v1.9.194 |

### Próximos (FE — agente sozinho §7.2)

| # | Movimento | Por quê | Como |
|---|-----------|---------|------|
| E1 | `mkMergeInicioPayload_(prev, next)` central | Um lugar para parcial/rico | Extrair de `aplicarDadosInicio` — campos ausentes em parcial = keep |
| E2 | Deprecar leitura Firebase de sessões (flag off) | RTDB não é autoridade | Manter listen só métrica/`_fbAtivasHint` (já quase) |
| E3 | Contract test JSON: `listarAtivas` / `carregarInicio` / `sessoesAtivas` | Quebra de contrato GAS detectada no CI local | Fixture + schema no `scripts/testes/` |
| E4 | Banner holding sempre de `mkAuthGetSessoesAtivas_` | Uma API UI | Grep residual `sessaoAtivaRemota` em render |
| E5 | Skeleton Folha com progresso (~62s cold) | “Carregando” sem feedback = abandono | Barra/tempo estimado + cache I168 já ajuda; UI honesta |

### Com pedido §7.3 (GAS / produto)

| # | Movimento | Por quê |
|---|-----------|---------|
| G1 | Toda action de sessão devolve `sessoesAtivas` | FE para de reconsultar |
| G2 | `liberarSessaoOperador_` por loja + mapa no response | Fecha I195 no servidor |
| G3 | ScriptCache de `carregarInicio` tagueado por unidade + geração | Menos fantasma ScriptCache |
| G4 | Evento “sessão mudou” leve (poll curto só mapa) | Admin holding em tempo quase real |

### Modernização de produto (estratégia)

| # | Ideia | Valor |
|---|-------|-------|
| P1 | Modo “observabilidade balcão”: chip fonte = listarAtivas \| cache \| snapshot | Operador/sócio vê se está em fallback |
| P2 | Diagnóstico → “saúde dual-loja” (Karen/Jennifer + encHoje LV/G) 1 toque | Substitui ping manual |
| P3 | Filas offline com tenant obrigatório no item | Nunca orphan cross-loja |
| P4 | Design System: estado vazio Encerradas ≠ “zero” se repair pendente | UX honesta sob sync lento |

---

## 3. Como o agente deve usar este doc

1. Em **todo P0**, além do fix: marcar 1 linha “movimento definitivo” (helper, guard, audit, merge).  
2. Se o erro repetir família dual-loja → rodar `audit-familia-dual-loja.ps1` e **não** só o sintoma.  
3. Se houver gap E1–E4 viável em FE → **implementar na sessão** sem pedir.  
4. G1–G4: preparar repo + texto §7.3; não publicar Web sozinho.  
5. Atualizar esta tabela quando um E*/G*/P* fechar.

---

## 4. Critério de “fomos além”

Não basta “bug sumiu”. Conta como evolução se:

- Existe **política nomeada** no código (ex. `mkInicioCacheSafeForApply_`), não só comentário  
- Existe **trava automática** (guard/audit) que falha o push se regredir  
- Existe **próximo passo estratégico** escrito (E*/G*/P*) — não “monitorar”  
- Usuário **não** precisou pedir a varredura da família
