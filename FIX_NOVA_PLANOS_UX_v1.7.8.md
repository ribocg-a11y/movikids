# Fix Nova locação — planos visíveis + cache (v1.7.8)

## Problema

Tablets com URL errada (`?force--1.7.6` em vez de `?force=1.7.7`) ficavam em **1.7.6**. Ao escolher o carro, a lista de **planos** ficava longe abaixo (triciclos + pelúcias) e parecia que “não ia”.

## Correções

1. **Cache buster** — reconhece `force--1.7.x` / `force=1.7.x` e força atualização se a versão na URL ≠ `MK_VERSION`.
2. **UX passo 1** — após selecionar veículo: toast, rolagem até `#nova-plano-section`, fundo azul na área de planos, esconde outras categorias de veículo.
3. Versão **1.7.8** em `mk-version.js`, `sw.js`, `gas-endpoint.json`.

## Tablet

Abrir (ou deixar o app redirecionar):

https://ribocg-a11y.github.io/movikids/?force=1.7.8

Sidebar deve mostrar **Online 1.7.8**. Fluxo: carro → plano aparece em destaque → toque no plano → passo **Quem**.
