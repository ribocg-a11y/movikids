# Protótipos MOVI KIDS — não produção

**Nunca copiar mock para `gestao-pessoas.html` ou `index.html`.** Ver I29 · `DESIGN_SYSTEM_MOVIKIDS.md` §9.

## URL canônica (Pages)

| Protótipo | URL |
|-----------|-----|
| **RH mock v3.6** | https://ribocg-a11y.github.io/movikids/ponto-mockup.html?v=3.6 |
| **Colaboradores prod** | https://ribocg-a11y.github.io/movikids/gestao-pessoas.html |

## Redirects na raiz (URLs legadas)

| Arquivo | Destino |
|---------|---------|
| `ponto_mockup.html` | `ponto-mockup.html?v=3.6` (ou `gestao-pessoas.html?prod=1`) |
| `assets/mock-ponto.html` | redirect para mock canônico |

(`mock-ponto.html` na raiz removido — usar `ponto_mockup.html`.)

## Cópias nesta pasta

HTML estático para revisão no repo — **não** servidos pelo Pages salvo link explícito.

| Arquivo | Nota |
|---------|------|
| `gestao-pessoas-mockup*.html` | Iterações colaborador/gestor |
| `gestao-pessoas-mockup.html` | Hub antigo |

## Mock ADM na raiz

`gestao-adm-operadores-mockup.html` — proposta UI ADM; corpo em **`docs/prototipos/gestao-adm-operadores-mockup.html`** (redirect na raiz).

## Produção

Auth colaboradores = `#gp-auth-gate` idêntico a `#mk-auth-gate` · holerite = `mk-holerite.js`.
