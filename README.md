# MOVI KIDS

Sistema operacional para controle de locacoes da MOVI KIDS.

## Versao preparada

- Frontend: `v1.6.81` (ver `ESTADO_ATUAL.md`)
- Apps Script: `v1.5.36` (ver `DEPLOY_GAS_v1.5.32_AUTH.md`)
- Incidente auth/sessao 04/06/2026: `INCIDENTE_AUTH_OPERADORES_2026-06-04.md`
- Objetivo desta versao: corrigir divergencia entre multiplas telas sem tirar o sistema do ar.

## Problema tratado

Antes, cada tela podia manter estado local antigo e mostrar informacoes diferentes sobre a mesma locacao.

Esta versao usa reconciliacao canonica:

- Firebase/GAS vencem para status, timer, extensao, minutos e valores.
- Estado local da tela preserva somente flags visuais.

## Publicacao segura

Leia antes de trocar:

- `HOMOLOGACAO_PRODUCAO_ASSISTIDA.md`
- `ROLLBACK_EMERGENCIA.md`
- `COMPARATIVO_ANTIGO_NOVO.md`
- `DEPLOY_SEGURO_PUBLICAVEL.md`

## Status dos testes

Resultado local:

```text
PASS_WITH_KNOWN_RISKS
```

Nao ha bloqueador novo encontrado no pacote de sincronizacao.

Riscos herdados continuam e devem ser tratados na proxima fase:

- Escrita via GET no Apps Script.
- Webapp anonimo.
- Uso alto de innerHTML.
- Muitos onclick inline.
- Frontend monolitico.


