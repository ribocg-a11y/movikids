# Incidente I145 — Idle / tela desligada ainda disparava `force=1` (lentidão recorrente)

**Data:** 13/08/2026  
**Camadas:** FE `mk-sync.js` (cirúrgico) · GAS **sem mudança**  
**Família:** I86 · I122 · I125 · I143

## Sintoma

“Lentidão em tudo” de forma **recorrente** no balcão: login, salvar, ▶, sync. Fantasmas de locações antigas no tablet mesmo com planilha sem Pendente/Ativa.

## Prova ao vivo (13/08 ~10:10 BRT)

| Check | Resultado |
|-------|-----------|
| Ping / login | **1,7–4,1 s** — normal |
| `carregarInicio` **warm** | **1,0–2,1 s** — normal |
| `carregarInicio` **force=1** (frio) | **7,6 s** (pode ir a 25–80 s sob fila) |
| `listarAtivas` | **0** abertas · **0** outras datas |
| Histórico | 12/08 ids **2714–2721** Encerradas (operação real OK) |
| `salvarLocacao` TESTE | **5,3 s** · gate &lt;8 s ✅ |
| `iniciarTimer` TESTE | **28,3 s** · gate &lt;5 s ❌ — GAS na fila após schema/histórico |
| Limpeza | ativas=0 · sem residual TESTE |

**Fantasmas na planilha:** não há Pendente/Ativa antiga. O fantasma é **cache PWA** quando o sync frio estoura timeout (I122).

## Os 4 últimos códigos (não foi regressão de salvar/▶)

| Commit | O quê | Zona P0 |
|--------|--------|---------|
| `d66f29c` v1.9.94 | QR portal / moldura · `mk-home.js` só strip QR | Não mexeu timer/`buildCard` |
| `e64c8c2` v1.9.95 | Dashboard custos | `mk-admin.js` — fora P0 cronômetro |
| `ea4cfa2` v1.9.96 **I143** | ▶ 28s keep-optimistic; dedup salvar; GAS `veiculoJaAberto_` | Cirúrgico **correto** em `mk-operacao`/`mk-nova` |
| `234dd52` + docs I143 | só testes/docs | — |

I143 **fechou** `force=1` no catch do ▶, mas **deixou** dois disparos no `mk-sync.js`:

1. Tablet tela desligada **>30 s** → `syncController(true)` → `carregarInicio?force=1`
2. Idle **5 min** → de novo `force=1` se não houver backoff

Isso **reabre** a fila GAS (I86) e o timeout→cache fantasma (I122). Não é App Script “quebrado”.

## Correção (sem Nova versão Web GAS)

FE **v1.9.97**:

- visibility resume → `syncController(false)` (warm, cache `inicio_v4_`)
- idle 5 min → `syncController(false)`
- `force=1` **só** após escrita (BroadcastChannel `invalidate`)

Trava: `guard.i145.sync.warm` no `pre-push-check.ps1`.

## Tablet

`?force=1.9.97` (ou banner Nova versão). Se ainda vir card velho: Settings → limpar dados do site **só nesse PWA** (I33) — planilha já está sem abertas.
