# I202 — Portal responsável: versão defasada + UX gate/play

**Data:** 05/11/2026 · **FE:** **v1.9.196** · **GAS:** sem mudança

## Achados (ponta a ponta)

| Camada | Achado |
|--------|--------|
| Versão | `acompanhar.html` / `foto-moldura` / `track` em **?v=1.9.158** (balcão em 1.9.195) — cache SW/Pages velho |
| Fluxo API | `buscarPortalResponsavel` OK · retorna só Ativa/Pendente (Encerrada = vazio — correto) |
| Canon timer | `canonLoc_` / `calcStartTimestamp_` presentes (I16) |
| Gate UI | Caixa branca fantasma (`.mk-portal-gate-err` com fundo mesmo vazia) |
| Play UI | “Trocar telefone” só no subtítulo · nome sumia com 2+ crianças · status class na loja |
| Empty | Só erro vermelho no gate — sem tela “ninguém brincando” |

## Correção FE (v1.9.196)

1. Alinhar `?v=` portal + moldura + track ao `MK_VERSION`  
2. `:empty` no status do gate · logo/kicker/sub mais legíveis  
3. Empty state + auto-refresh 15s · sticky **Trocar telefone**  
4. Nome sempre no hero · pill de status · PWA hint 1× · `guard.portal.version`

## Como testar

1. `acompanhar.html?force=1.9.196`  
2. Telefone sem brincadeira ativa → empty state (não caixa vermelha)  
3. Com Ativa no balcão → ring + coach + rodapé Trocar telefone  
4. Design System §9 — superfície §8.2  

Design System §9 checklist aplicado — superfície §8.2
