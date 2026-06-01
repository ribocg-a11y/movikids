# MOVI KIDS - Proximas fases operacionais

Estado atual em 01/06/2026:

- Apps Script em producao: `v1.5.21`
- Frontend em producao: `v1.6.51`
- Service Worker em producao: `v1.6.51`
- Ultima mudanca publicada: `Triciclo 02`
- Proximo candidato backend correto: `v1.5.22`, sempre baseado em `v1.5.21`

## Fase 1 - Status canonico e timer

Status: publicado.

- `Pendente` antes do cronometro.
- `Ativa` somente apos iniciar.
- Cancelamento sem iniciar nao gera timer.
- Teste automatizado passou.

## Fase 2 - Auditoria ampliada

Status: publicado.

Arquivo:

`MOVIKIDS_Code_v1.5.21_TRICICLO_02.gs`

Inclui auditoria para:

- cadastro;
- inicio de timer;
- edicao;
- cancelamento;
- extensao;
- encerramento.

## Fase 3 - Configuracao operacional

Status: candidato antigo preparado, ainda nao incorporado na producao atual.

Observacao importante:

- Existe `MOVIKIDS_Code_v1.5.20_CONFIG_OPERACIONAL_SAFE.gs`.
- Ele nao deve ser implantado agora por cima da producao, porque a producao ja avancou para `v1.5.21`.
- A proxima versao correta deve ser `v1.5.22`, mesclando a camada de configuracao com a base `v1.5.21`.

Objetivo:

- mover veiculos, precos, mensagens e regras para camada de configuracao com fallback seguro;
- manter constantes atuais como reserva;
- impedir que erro de CONFIG derrube operacao.

Primeiro passo seguro:

- criar `MOVIKIDS_Code_v1.5.22_CONFIG_SOBRE_v1.5.21.gs`;
- adicionar apenas leitura/diagnostico de configuracao;
- nao trocar ainda a origem real de precos/veiculos;
- testar `ping`, `validarSchema`, `diagnosticoSistema`, `carregarOperacaoConfig` e `diagnosticoConfigOperacional`.

## Fase 4 - Regras de WhatsApp

Status: pendente.

Objetivo:

- separar mensagens obrigatorias e opcionais;
- registrar envio local;
- impedir pular aviso de minuto extra;
- reduzir risco de link suspeito usando texto mais limpo e link curto consistente.

## Fase 5 - Testes permanentes

Status: iniciado e precisa virar rotina obrigatoria antes de cada deploy.

Script atual:

`TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1`

Cobertura atual:

- ping;
- carregar inicio;
- listar ativas;
- criar pendente;
- editar pendente;
- cancelar;
- limpar teste.

Proxima cobertura:

- iniciar timer;
- estender;
- encerrar;
- validar auditoria.
- validar `Triciclo 02`;
- validar que locacao nasce `Pendente`;
- validar que veiculo so fica ocupado quando a sessao esta `Pendente` ou `Ativa`;
- validar que a tela aberta recebe atualizacao de versao.

Esses testes devem ser executados em janela controlada, porque iniciar/encerrar gera movimento real na planilha.

## Fase 6 - Modo seguro

Status: parcialmente publicado.

Ja existe:

- service worker sem cache persistente;
- versionamento forcando atualizacao;
- fallback Apps Script/polling quando Firebase nao cobre tudo.

Proximo:

- tela de diagnostico operacional;
- aviso claro quando Firebase ou Apps Script falhar;
- botao administrativo de reconciliacao manual.

## Fase 7 - Frota e configuracao dinamica

Status: ajuste pontual publicado.

Concluido:

- `Triciclo 02` adicionado no frontend `v1.6.51`;
- `Triciclo 02` aceito no backend `v1.5.21`;
- mesmo tipo `Triciclo`;
- mesma tabela de precos dos carros, conforme regra existente.

Ponto de atencao:

- A frota ainda esta hardcoded no frontend e no Apps Script.
- A solucao definitiva e mover a frota para CONFIG validada, com fallback seguro.
