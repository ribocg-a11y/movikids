# MOVI KIDS — Estado atual (04/06/2026)

Referencia unica para alinhamento local x producao.

## Producao

| Camada | Versao | URL / ID |
|--------|--------|----------|
| Apps Script | v1.5.31 | Deploy `AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw` |
| Frontend | v1.6.71 | https://ribocg-a11y.github.io/movikids/ |
| Portal | publicado | https://ribocg-a11y.github.io/movikids/acompanhar.html |
| Planilha | MOVIKIDS_Planilha_Base | `1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618` |

## Arquivo canonico no repositorio

- **GAS producao:** `MOVIKIDS_Code_v1.5.31_PRODUCAO.gs`
- **Nao implantar:** `arquivo-historico/` e versoes antigas `MOVIKIDS_Code_v1.5.2x` salvo deploy documentado

## Validacao (04/06/2026)

- `ping`, `validarSchema`, `diagnosticoConfigOperacional`: OK
- `TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1`: OK
- Portal: 0 locacoes Pendente/Ativa no momento (teste API OK; retorno vazio esperado)
- `TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1 -RunWriteTests`: OK em 04/06/2026 (id teste 191 cancelado)

## QR Code portal

- PNG: `assets/qr-portal-acompanhar.png`
- SVG: `assets/qr-portal-acompanhar.svg`
