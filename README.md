# MOVI KIDS

Sistema operacional para controle de locacoes da MOVI KIDS.

## Versao preparada

- Frontend: `v1.7.46` (ver `ESTADO_ATUAL.md`)
- Apps Script: `v1.5.56` repo (confirmar ping; ver `DEPLOY_GAS_v1.5.32_AUTH.md`)
- Mapa de erros/bugs: `MAPA_ERROS_FALHAS_BUGS.md`
- Incidentes recentes: `INCIDENTE_CRONOMETRO_PORTAL_AUTH_2026-06-05_06.md`, `INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md`
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


