# Auditoria latente pós-I191–I196 (04/11/2026)

Varredura ponta a ponta após reclamações (fantasma, Encerradas LV, “ninguém logado”).  
**FE:** **v1.9.191** (I197) · **GAS:** **v1.5.237**

## Padrão que se repete

| Padrão | Incidente | Lição |
|--------|-----------|--------|
| Parcial sobrescreve estado rico | I192 | `listarAtivas` ≠ `carregarInicio` |
| Campo singular vs mapa multi-loja | I194/I195 | `sessaoAtiva` null quando `unidadeId=all` |
| Comentário quebra parse | I193 | `node --check` obrigatório |
| Fallback “all → golden” | I195 | Deslogar Jennifer virava liberar Golden / as duas |

## Achados corrigidos nesta entrega (I195)

| Sev | Achado | Correção |
|-----|--------|----------|
| **P0** | `mkOpDeslogarBalcao` com holding usava `mkAuthUnidadeLoginParams_` (all→golden) e fallback `unidadeId:all` (derruba as 2 lojas) | Loja do operador via mapa; admin libera **só** essa loja |
| **P0** | Após liberar, `mkAuthSyncSessaoBalcaoUI_(null)` **não** zerava `sessoesAtivasRemotas` → banner mentia | `applySessaoAposLiberar_` + refresh mapa |
| **P1** | Boot `__mkLoginOpsPromise` sem unidade | `mkAuthOpsListParams_()` |
| **P1** | Chip admin “sem turno” no holding com Karen+Jennifer | Chip lê `mkAuthGetSessoesAtivas_` |
| **P2** | `ops-balcao.html` só `sessaoAtiva` | Mostra mapa das 2 lojas |

## Achados I197 (FE v1.9.191 — fechados)

| Sev | Achado | Correção |
|-----|--------|----------|
| **P0** | Firebase aplicava Ativa stale | Só dispara `listarAtivas` |
| **P0** | GP badges só `sessaoAtiva` | Mapa `sessoesAtivas` + export auth |
| **P0** | Fantasma reconcile unit-scoped | Map-wide |
| **P0** | Cache/backoff reidratava Ativa | Strip + encHoje repair |
| **P1** | IDB snapshot global | Por `unidadeId` |
| **P1** | Prune offline cross-loja / deslogar all→golden / lock UI | Escopo + mapa |
| **P1** | Holding refresh apagava loja irmã | `unidadeId:all` + merge |

Doc: `INCIDENTE_I197_AUDIT_FOLLOWUP_DUAL_LOJA_2026-11-04.md`

## Achados remanescentes (não bloqueiam; monitorar)

| Sev | Achado | Mitigação / próximo |
|-----|--------|---------------------|
| **P2** | GAS `liberarSessaoOperador_` / painel RH sem `sessoesAtivas` | FE já reconsulta; Nova versão Web GAS (§7.3) |
| **P2** | Scripts `scripts/ops/liberar-*-agora.html` legado | Só ops; alinhar se ainda usados |
| **P2** | `carregarInicio` ~5–10s sob carga | I192/I197 repair encHoje |
| **P3** | Histórico ADM exige admin (403) | Esperado; Encerradas do dia = `encHoje` no balcão |

## Fluxos revalidados (live 04/11)

- `listarAtivas` all/golden/laville → 0 ativas (sem fantasma no servidor)
- `sessoesAtivas` → Karen Golden + Jennifer La Ville
- `carregarInicio` laville → encHoje 2 (Augusto, Luisa)
- Pages FE **v1.9.191** + `guard.i193`–`i197`

## Regra operacional

Antes de push FE: `guard-js-syntax.ps1` + `pre-push-check`.  
Código base **não** sobe com parse quebrado nem com holding lendo só campo singular.
