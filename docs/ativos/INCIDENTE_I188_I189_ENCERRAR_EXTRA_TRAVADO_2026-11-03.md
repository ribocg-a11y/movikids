# I188 / I189 — Encerrar com EXTRA “travado” (03/11/2026)

## Sintoma (produção Golden ~19:28 Fortaleza)

Quatro cards vermelhos (Helena, Pedro, João…) com **+37–43 min EXTRA**. Operador/admin tocava **Encerrar** e a locação **não desligava**. Banner: *“toque como pagou antes de encerrar”*. Sensação: sistema fora / botão quebrado.

Também: *Nenhum turno no balcão* (só Administrador no tablet) — correlato, não causa raiz do bloqueio de pagamento.

## Causa raiz (diagnóstico)

Não foi queda de GAS/Pages (online, v1.9.182, sync ok). Foi **desenho de UX da trava I85** + **buraco de UI**:

1. **I85** exige informar pagamento dos minutos extras (ou justificativa de não cobrar) antes de `encerrarLocacao` — correto para caixa.
2. O **card** só mostrava o **aviso** (`mkEncExtraCardBannerHtml_`), **sem botões** PIX/Crédito/Débito/Dinheiro.
3. Os botões existiam **só no drawer** (`#enc-extra-wrap`). Encerrar abria o drawer, mas no balcão o fluxo parecia “travou” (2º passo invisível / mal sinalizado).
4. Mesmo com pagamento do **plano** já conhecido (ex.: Débito), o FE **não herdava** automaticamente para o extra → exigia toque extra sem necessidade operacional.
5. Botão do card chamava `abrirSessaoDrawer(...,'encerrar')` em vez de um caminho “desligar agora se já estiver pronto”.

**Não foi:** POST browser (I15), fantasma I151, offline I187, PIN, isolamento loja.

## Correção

| ID | FE | O quê |
|----|-----|--------|
| **I188** | **v1.9.183** | Pagamento do extra **no card** + autofill “mesmo do plano” ao abrir drawer |
| **I189** | **v1.9.184** | `pedirEncerrar(row)`: se respostas OK (ou herdáveis) → **`confirmarEncerrar()` na hora**; drawer só se faltar dado |

## Como impedir de novo (camadas)

1. **Regra produto:** Encerrar no card = desligar se validação OK; nunca só avisar sem controle na mesma superfície.
2. **Autofill:** se `session.pagamento` válido → pré-preencher extra (operador pode mudar no drawer).
3. **Guard pre-push:** `guard.i188.card.pag` + `guard.i189.pedir.direto` (botões no card + `pedirEncerrar` → `confirmarEncerrar`).
4. **MAPA:** família encerrar/extra I85 → I188/I189.
5. **Tablet:** após EXTRA longo, preferir turno operador logado (não só Admin) — operação + auditoria.

## Validação tablet

`?force=1.9.184` → card EXTRA com pagamento do plano → um toque **Encerrar** → card some. Sem pagamento no plano e sem escolha → aparece grade no card / drawer.

## Arquivos

`mk-enc-extra.js` · `mk-drawer.js` · `mk-home.js` · `mk-app.css` · `scripts/pre-push-check.ps1`
