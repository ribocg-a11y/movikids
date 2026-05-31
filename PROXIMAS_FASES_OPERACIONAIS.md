# MOVI KIDS - Proximas fases operacionais

Estado atual:

- Apps Script em producao: `v1.5.18`
- Frontend em producao: `v1.6.48`
- Service Worker em producao: `v1.6.48`
- Candidato backend pronto: `v1.5.19`

## Fase 1 - Status canonico e timer

Status: publicado.

- `Pendente` antes do cronometro.
- `Ativa` somente apos iniciar.
- Cancelamento sem iniciar nao gera timer.
- Teste automatizado passou.

## Fase 2 - Auditoria ampliada

Status: pronto para deploy manual.

Arquivo:

`MOVIKIDS_Code_v1.5.19_AUDITORIA_AMPLIADA.gs`

Inclui auditoria para:

- cadastro;
- inicio de timer;
- edicao;
- cancelamento;
- extensao;
- encerramento.

## Fase 3 - Configuracao operacional

Status: proxima implementacao.

Objetivo:

- mover veiculos, precos, mensagens e regras para camada de configuracao com fallback seguro;
- manter constantes atuais como reserva;
- impedir que erro de CONFIG derrube operacao.

## Fase 4 - Regras de WhatsApp

Status: pendente.

Objetivo:

- separar mensagens obrigatorias e opcionais;
- registrar envio local;
- impedir pular aviso de minuto extra;
- reduzir risco de link suspeito usando texto mais limpo e link curto consistente.

## Fase 5 - Testes permanentes

Status: iniciado.

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
