# I194 — Admin não vê operadoras logadas (holding)

**Data:** 04/11/2026 (America/Fortaleza)  
**FE:** **v1.9.188** · **GAS:** **v1.5.237** (sem mudança)

## Sintoma

Sócio/admin: “nenhuma operadora aparece logada”.

## Evidência servidor (live)

`listarOperadoresLogin` (sem unidade / `all`):

- `sessaoAtiva`: **null** (esperado no holding)
- `sessoesAtivas.golden`: **Karen**
- `sessoesAtivas.laville`: **Jennifer**

Login no servidor **OK**. UI lia só `sessaoAtiva`.

## Causa

Pós-I171 (sessão por loja), o FE admin/holding usava apenas `d.sessaoAtiva`. Com `unidadeId=all` isso é sempre `null`. Banner escondido + badge “Logado no balcão” nunca acendia.

`mkAuthRefreshSessaoTurno_` chamava `listarOperadoresLogin` **sem** unidade → mesmo buraco + risco de reconcile fantasma.

## Correção

- `mkAuthPickSessaoFromApi_` + `sessoesAtivasRemotas`
- Banner: `Golden: Karen · La Ville: Jennifer`
- Cards admin: badge por id em qualquer loja
- Refresh turno com `mkAuthOpsListParams_()`
- Reconcile fantasma olha `sessoesAtivas[loja]`

## Tablet / PC

https://ribocg-a11y.github.io/movikids/?force=1.9.188  
Abrir Administração → Operadores (ou banner de sessão).
