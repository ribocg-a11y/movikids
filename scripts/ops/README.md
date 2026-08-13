# Scripts de operação — emergência

Ferramentas pontuais para suporte em loja (não fazem parte do app tablet).

| Arquivo | Uso |
|---------|-----|
| **`/ops-balcao.html`** (raiz Pages) | **Preferido no celular** — status + liberar sessão + reset PIN (PIN digitado) |
| `liberar-eduarda-agora.html` | Liberar / reset Eduarda — PIN digitado (I144) |
| `liberar-milena-agora.html` | Liberar / reset Milena — PIN digitado (I144) |
| `mock-idle-tablet.html` | Homologação B8/I21 — simula 61 min idle e recarrega o app |

**I144 (12/08/2026):** páginas antigas com `adminPin=1416` **não liberam mais** o balcão. Use o PIN admin atual digitado no formulário — nunca hardcode no HTML.

URL celular: https://ribocg-a11y.github.io/movikids/ops-balcao.html  

Documentação: `docs/ativos/ACESSOS_E_AUTORIZACOES.md` · `INCIDENTE_I144_OPS_PIN_1416_LIBERAR_BALCAO_2026-08-12.md`.
