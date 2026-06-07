# Fix cache travado em 1.7.0 (Failed to fetch)

## Causa

O bloco no topo de `index.html` usava `CURRENT = '1.7.0'`. Tablets que já tinham `mk_loaded_version = 1.7.0` **não** recebiam nova recarga, e os scripts `mk-auth.js?v=1.7.0` mantinham JS antigo com URL GAS **404** (`AKfycbzc...`).

## Correção v1.7.4

- `mk-version.js` — versão + URL GAS (carrega antes do cache buster)
- `gas-endpoint.json` — override da URL mesmo com HTML em cache
- Cache buster usa `MK_VERSION` (agora **1.7.4**)
- Scripts sem `?v=1.7.0` fixo; SW network-first
- `api()` resolve URL via `gas-endpoint.json` + fallback

## No tablet (uma vez)

1. Abrir: https://ribocg-a11y.github.io/movikids/?force=1.7.4
2. Se ainda falhar: Chrome → Configurações do site → Limpar dados → recarregar
3. Confirmar canto: **Online v1.7.4** e operadores/SMS OK

## GAS

Não usar `clasp deploy`. Só `clasp push` + **Nova versão** na implantação:

`https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec`
