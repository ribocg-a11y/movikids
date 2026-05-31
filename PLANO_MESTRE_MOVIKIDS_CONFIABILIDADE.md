# MOVI KIDS - Plano Mestre de Confiabilidade

Data: 31/05/2026

Este e o plano-mestre atual do projeto. Ele substitui desvios pontuais e reorganiza o trabalho para transformar o MOVI KIDS de um app operacional que funciona em um sistema confiavel, auditavel e seguro para operacao diaria.

## Leitura Geral

O MOVI KIDS resolve uma dor real: controlar uma operacao fisica de locacao infantil com varias telas, timers, caixa, mensagens e historico.

O sistema nasceu simples e virou essencial. Agora precisa deixar de ser apenas "um app que funciona" e passar a ser um sistema confiavel:

- previsivel;
- auditavel;
- resiliente;
- seguro contra cache velho;
- consistente entre telas;
- protegido contra erro financeiro;
- facil de operar em hora de movimento.

## Escopo Que Ja Entendemos Com Seguranca

Ja ha entendimento suficiente para mexer com cuidado em:

- frontend principal;
- service worker/cache;
- fluxo de nova locacao;
- cards e timers;
- edicao/cancelamento;
- Apps Script de locacoes;
- schema da planilha;
- Firebase sync;
- deploy GitHub Pages;
- documentacao e rollback.

## Prioridades Altas

### 1. Remover dependencia perigosa de cache

Objetivo:

- Evitar tela presa em versao antiga.
- Evitar app aberto mostrando estado velho.
- Garantir atualizacao controlada como se fosse hard refresh.

Regra:

- Toda versao de frontend deve atualizar `index.html`, `sw.js` e numero de versao juntos.
- Service worker nao pode servir HTML operacional velho sem checar versao.

Status:

- Hotfix `v1.6.36` ja foi nessa direcao.
- Ainda precisa consolidar regra permanente.

### 2. Padronizar sincronizacao

Objetivo:

- Todas as telas devem ver o mesmo estado.

Regra oficial:

- Firebase deve ser o espelho em tempo real.
- Google Sheets deve ser o registro financeiro/canonico.
- Apps Script deve ser a API de reconciliacao.

Modo seguro:

- Se Firebase falhar, o sistema continua via Apps Script/polling.
- Se Apps Script falhar, mostrar erro claro e nao inventar estado.
- Se cache estiver velho, forcar atualizacao controlada.

### 3. Criar auditoria seria

Objetivo:

- Toda alteracao importante precisa deixar rastro.

Registrar:

- antes;
- depois;
- operador;
- motivo;
- horario;
- rowIndex/id;
- tipo da acao.

Fluxos auditaveis:

- edicao;
- cancelamento;
- alteracao de pagamento;
- troca de veiculo;
- extensao;
- encerramento critico;
- correcao administrativa.

### 4. Separar status operacionais

Status oficiais:

- `Pendente`: locacao cadastrada, timer ainda nao iniciou.
- `Ativa`: timer iniciado.
- `Encerrada`: fechamento confirmado.
- `Cancelada`: cancelada com motivo/auditoria.

Motivo:

- Hoje isso e essencial para caixa, historico, dashboard e operacao.
- `Ativa` nao pode significar ao mesmo tempo "aguardando inicio" e "tempo correndo".

### 5. Melhorar backend

Objetivo:

- Parar de confiar no frontend para regras criticas.

Melhorias:

- Trocar acoes criticas de `GET` para `POST` quando possivel.
- Validar mais no servidor.
- Usar locks em toda escrita.
- Recalcular valores financeiros no servidor.
- Rejeitar minutos absurdos.
- Rejeitar transicoes de status invalidas.
- Retornar mensagens de erro claras.

### 6. Criar camada de configuracao

Objetivo:

- Tirar regras operacionais do codigo fixo.

Itens configuraveis:

- veiculos;
- precos;
- mensagens;
- regras de alerta;
- formas de pagamento;
- limites operacionais;
- textos de WhatsApp;
- parametros de sincronizacao.

Regra:

- O codigo deve validar configuracao antes de usar.
- Mudancas operacionais simples nao devem exigir deploy.

### 7. Testes automatizados minimos

Fluxos obrigatorios:

- criar locacao;
- iniciar;
- editar;
- cancelar;
- estender;
- encerrar;
- listar ativas;
- listar historico;
- validar link do responsavel;
- validar tela aberta/cache;
- validar sincronizacao entre duas fontes.

Objetivo:

- Nenhum deploy sem passar nesses testes.

### 8. Modo operacao segura

O sistema deve degradar com clareza:

- Firebase falhou: usa Apps Script/polling.
- Apps Script falhou: mostra erro operacional claro.
- Cache velho: atualiza versao.
- Internet ruim: operador recebe aviso real.
- WhatsApp nao abriu: mostrar acao manual.
- Dados inconsistentes: bloquear fechamento critico e pedir verificacao.

## Ordem Correta De Execucao

### Fase 1 - Confiabilidade imediata

- Consolidar regra de cache/versionamento.
- Validar sincronizacao com tela ja aberta.
- Garantir fallback Apps Script quando Firebase falhar.
- Garantir erro claro se Apps Script falhar.

### Fase 2 - Status e auditoria

- Separar `Pendente`, `Ativa`, `Encerrada`, `Cancelada`.
- Criar auditoria para edicao/cancelamento.
- Bloquear exclusao fisica.
- Implementar transicoes validas.

### Fase 3 - Backend robusto

- Validar todas as escritas no Apps Script.
- Usar locks em toda escrita.
- Recalcular financeiro no servidor.
- Criar rotas novas com menor risco.
- Comecar migracao gradual para POST.

### Fase 4 - Configuracao sem codigo

- Mover veiculos para CONFIG.
- Mover precos para CONFIG.
- Mover mensagens para CONFIG.
- Criar validacao de configuracao.

### Fase 5 - Testes automatizados

- Criar suite local.
- Cobrir ciclo completo.
- Cobrir cache e sync.
- Rodar antes de cada deploy.

### Fase 6 - Reforma modular estilo ZapClin

- Separar API.
- Separar sync.
- Separar timers.
- Separar financeiro.
- Separar mensagens.
- Separar UI.
- Modernizar sem reescrever tudo de uma vez.

## Regra De Trabalho Daqui Em Diante

Antes de qualquer mudanca:

1. Dizer qual prioridade do plano ela atende.
2. Dizer quais arquivos mudam.
3. Dizer se afeta producao.
4. Dizer como testar.
5. Dizer como voltar atras.

Depois de qualquer mudanca:

1. Informar se Apps Script mudou.
2. Informar se `index.html` mudou.
3. Informar se `track.html` mudou.
4. Informar se `sw.js` mudou.
5. Informar se GitHub Pages/documentacao publicada mudou.
6. Informar o que foi testado.

## Proxima Acao Correta

A proxima acao deve voltar para a Fase 1:

- consolidar cache/versionamento;
- verificar sync tela aberta;
- validar fallback Firebase -> Apps Script;
- documentar e testar o modo operacao segura.

Nada de nova feature fora dessa ordem sem aprovacao explicita.

## Andamento - Fase 1 Cache/Versionamento

Status: correcao local preparada, nao publicada.

Achado:

- `index.html` estava em `1.6.44`.
- `sw.js` estava em `1.6.45`.
- Esse desalinhamento pode causar tentativa de atualizacao repetida ou tela presa em estado instavel.

Correcao local preparada:

- `CURRENT = 1.6.46`
- `APP_VERSION = 1.6.46`
- `SW_VERSION = 1.6.46`

Arquivos locais alterados:

- `movikids-github/index.html`
- `movikids-github/sw.js`

Documento criado:

- `FASE1_CACHE_VERSIONAMENTO_v1.6.46.md`

Nao alterado:

- Apps Script.
- `track.html`.
- Firebase.
- Timer.
- Financeiro.
- WhatsApp.
- Planilha.
- GitHub Pages/producao.
