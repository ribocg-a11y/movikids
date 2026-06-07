# Changelog

## v1.6.33-sync-safe / GAS v1.5.13_SAFE

Data: 30/05/2026

### Adicionado

- Reconciliacao canonica de sessoes no frontend.
- Diagnostico somente leitura no Apps Script.
- Validacao de schema somente leitura no Apps Script.
- Sincronizacao Firebase apos extensao de locacao.
- Cache novo do service worker.
- Pacote de rollback.
- Ambiente local de testes.
- Mockup de sincronizacao com tres telas simuladas.

### Corrigido

- Reduzido risco de uma tela sobrescrever estado real com dados locais antigos.
- Extensao de locacao passa a refletir no canal vivo.
- Cache do frontend foi separado da versao anterior.

### Mantido

- Mesmo Deploy ID.
- Mesma planilha.
- Mesma URL publica.
- Mesma tabela de precos.
- Mesmo fluxo operacional principal.

### Riscos conhecidos

- Apps Script ainda aceita escrita via GET.
- Webapp ainda esta anonimo.
- Frontend ainda possui muitos `innerHTML`.
- Frontend ainda possui muitos `onclick` inline.
- Monolito deve ser modularizado em fase posterior.


