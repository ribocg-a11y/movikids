# I65 — Resíduo TESTE_I43 no Histórico (25/06/2026)

## Sintoma
Locações `TESTE_I43_*` (pre-push / `TESTE_I43_CARREGAR_INICIO_READONLY.ps1`) apareciam no **Histórico** admin como Cancelada R$ 0,00 — poluindo ranking do período.

## Causa
1. `isLocacaoTeste_` no GAS **não** reconhecia prefixo `TESTE_I43` na coluna criança (só `TESTE_CODEX`, `[TESTE]` na obs).
2. `anularLinhaTesteAdmin_` ignorava linhas já `Cancelada` + R$ 0 (`ja_anulada`) sem tag `[ANULADO TESTE ADM]`.
3. `listarHistorico_` listava **todas** as linhas do período, inclusive teste.

## Correção
| Camada | Versão | Entrega |
|--------|--------|---------|
| GAS | **v1.5.164** | `^TESTE_` / `^TESTE ` · tag em cancelada zerada · histórico filtra teste |
| FE | **v1.8.121** | `mk-historico.js` filtra `TESTE_*` no cliente (até Web GAS) |
| Planilha | OAuth | `limpar-testes-movikids.js` taga canceladas zeradas (requer `npm run auth` se expirado) |

## Pós-deploy
```powershell
.\scripts\testes\LIMPAR_TESTES_MOVIKIDS.ps1
```
Socio: Nova versão Web **v1.5.164** (mesmo Deploy ID).

## Prevenção
- `TESTE_I43` já chama `Invoke-MoviTestCleanup` no `finally`.
- Guards: ampliar `isLocacaoTeste_` cobre todos os prefixos `TESTE_`.
