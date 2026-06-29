# I69 — Ponto colaborador: mock com falso sucesso (Raykelly)

**Registrado:** 27/06/2026  
**Status:** fix FE **v1.9.3** (commit local · push pendente)  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` I69 · relacionado **I45** (cadastro)

## Sintoma

Raykelly relatou dificuldade para bater ponto. Investigação mostrou **entrada registrada** (10:39, status `dentro`) — problema era **UX/confusão**, não ausência no GAS.

## Investigação (27/06)

| Campo | Valor |
|-------|--------|
| Operador | Raykelly id **3** |
| `cadastroOk` | **true** (100%) |
| Ponto hoje | entrada **10:39**, saída null |
| PIN mock `1111` | **incorreto** em produção (esperado) |

## Causas

1. **PIN real ≠ mock** — hint dev `1111` no mockup; produção valida hash na planilha.
2. **Entrada duplicada** — após entrada, nova tentativa retorna **409** (“Já existe entrada hoje sem saída”).
3. **Bug FE P0** — `confirmarPonto()` sem `gpSessionPin` em `MK_GP_PROD` caía no **mock local** e exibia “✓ Entrada registrada” **sem gravar** no GAS (mesmo padrão I45 em `salvarCadastro`).

`gpSessionPin` vive só em memória; `colabSairProd()` zera ao sair.

## Fix

| Camada | Versão | Mudança |
|--------|--------|---------|
| FE | **v1.9.3** | `confirmarPonto`: em produção sem PIN → erro + volta à tela PIN; **não** usa mock |
| FE | **v1.9.3** | Hint PIN em prod: mensagem genérica (sem “ex.: 1111”) |
| GAS | — | **Sem alteração** — `registrarPontoColaborador_` OK |

## Ops

- Usar **PIN real** definido no balcão; reset via Admin se esquecido.
- Se já entrou hoje: registrar **saída**, não repetir entrada.
- Após publicar v1.9.3: colaborador deve **sair e entrar de novo** com PIN se sessão expirou.

## Testes

- `TESTE_CADASTRO_RH_READONLY -OperadorId 3` ✅
- `TESTE_RH_CAMADA5_READONLY` ✅
- Homolog manual: gestao-pessoas.html → entrar → Sair → tentar ponto sem re-login → deve pedir PIN (não mock)
