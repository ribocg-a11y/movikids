# Auditoria latente pós-I191–I194 (04/11/2026)

Varredura ponta a ponta após reclamações (fantasma, Encerradas LV, “ninguém logado”).  
**FE:** **v1.9.189** · **GAS:** **v1.5.237**

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

## Achados remanescentes (não bloqueiam; monitorar)

| Sev | Achado | Mitigação / próximo |
|-----|--------|---------------------|
| **P2** | GAS `liberarSessaoOperador_` não devolve `sessoesAtivas` | FE já reconsulta; Nova versão Web GAS se quiser payload completo (§7.3) |
| **P2** | Scripts `scripts/ops/liberar-*-agora.html` legado | Só ops; alinhar se ainda usados |
| **P2** | `carregarInicio` ~5–10s sob carga | I192 repair encHoje já cobre timeout |
| **P3** | Histórico ADM exige admin (403) | Esperado; Encerradas do dia = `encHoje` no balcão |

## Fluxos revalidados (live 04/11)

- `listarAtivas` all/golden/laville → 0 ativas (sem fantasma no servidor)
- `sessoesAtivas` → Karen Golden + Jennifer La Ville
- `carregarInicio` laville → encHoje 2 (Augusto, Luisa)
- Pages FE **v1.9.189** + `guard.i193` + `guard.i194` + `guard.i195`

## Regra operacional

Antes de push FE: `guard-js-syntax.ps1` + `pre-push-check`.  
Código base **não** sobe com parse quebrado nem com holding lendo só campo singular.
