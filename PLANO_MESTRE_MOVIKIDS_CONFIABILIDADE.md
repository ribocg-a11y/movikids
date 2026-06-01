# MOVI KIDS - Plano Mestre de Confiabilidade

Data: 01/06/2026

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

Regra especifica de WhatsApp em tablet/PWA:

- Nao usar `window.open(..., '_blank')` como caminho principal para enviar mensagens em tablet, celular ou PWA.
- Nao depender de `wa.me` como rota principal no fluxo operacional.
- Usar `https://api.whatsapp.com/send?phone=...&text=...`.
- Em tablet/celular/PWA, abrir na mesma aba com `window.location.href`.
- No desktop, pode tentar nova aba, mas deve cair para mesma aba se o popup for bloqueado.
- Sempre que possivel, copiar a mensagem para a area de transferencia antes de abrir o WhatsApp.
- Esse aprendizado veio da correcao `v1.6.55`, apos falha de envio somente no tablet.

### 9. Relacionamento e recorrencia

Objetivo:

- reduzir atrito quando um responsavel retorna;
- permitir iniciar nova locacao a partir de um responsavel ja conhecido;
- criar base de relacionamento sem travar a operacao.

Funcionalidade esperada:

- pagina `Relacionamento`;
- busca por nome ou telefone do responsavel;
- card do responsavel com telefone, criancas ja atendidas, ultima visita, total de visitas e historico resumido;
- acao rapida `Nova locacao com este responsavel`;
- reaproveitamento dos dados do responsavel e da crianca;
- possibilidade futura de observacoes e preferencias.

Regra:

- telefone normalizado deve ser o identificador operacional principal;
- cadastro de responsavel nao pode ser obrigatorio para locar;
- se houver duplicidade, o sistema deve sugerir mesclar, nao apagar automaticamente;
- toda edicao futura de cadastro deve ter auditoria.

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

Status em 01/06/2026:

- Existe candidato seguro `v1.5.20` para leitura/diagnostico de configuracao.
- Como a producao ja esta em `v1.5.21`, esse candidato nao deve ser implantado diretamente.
- A proxima versao correta e `v1.5.22`, baseada em `v1.5.21`, incorporando apenas configuracao diagnostica primeiro.

### Fase 5 - Testes automatizados

- Criar suite local.
- Cobrir ciclo completo.
- Cobrir cache e sync.
- Rodar antes de cada deploy.

### Fase 6 - Relacionamento operacional

- Concluido: busca de responsaveis baseada no historico de locacoes.
- Concluido: card do responsavel.
- Concluido: fluxo `Nova locacao` a partir do responsavel.
- Concluido: fluxo `Nova crianca` a partir do responsavel, sem reaproveitar crianca anterior.
- Proximo: criar aba canonica `RESPONSAVEIS`.
- Proximo: auditar edicoes e mesclas.

### Fase 7 - Reforma modular estilo ZapClin

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

Sequencia correta a partir de agora:

1. `v1.5.23` + `v1.6.52` publicados e validados.
2. Primeira versao da pagina `Relacionamento` entregue usando historico existente, sem dependencia obrigatoria.
3. Proximo passo: preparar `v1.5.24` + `v1.6.53` com aba canonica `RESPONSAVEIS`.
4. A aba `RESPONSAVEIS` deve nascer opcional: se falhar, a locacao continua funcionando pelo fluxo atual.

Nada de nova feature fora dessa ordem sem aprovacao explicita.

## Estado Atual Da Producao

Apps Script:

- Producao validada: `v1.5.23`.
- Inclui auditoria ampliada, status canonico, `Triciclo 02`, diagnostico de configuracao e `listarResponsaveis`.

Frontend:

- GitHub Pages: `v1.6.55`.
- Service Worker: `v1.6.55`.
- Inclui `Triciclo 02`, pagina `Relacionamento / Resp.`, atalho `Nova crianca` e WhatsApp seguro para tablet/PWA.

Nao concluido:

- Frota dinamica via CONFIG.
- Precos dinamicos via CONFIG.
- Mensagens dinamicas robustas via CONFIG.
- Cadastro canonico editavel de responsaveis em aba `RESPONSAVEIS`.
- Teste automatizado completo de iniciar/estender/encerrar.

## Historico - Fase 1 Cache/Versionamento

Status: publicado em versoes posteriores.

Achado:

- `index.html` estava em `1.6.44`.
- `sw.js` estava em `1.6.45`.
- Esse desalinhamento pode causar tentativa de atualizacao repetida ou tela presa em estado instavel.

Correcao aplicada em versoes posteriores:

- `CURRENT`, `APP_VERSION` e `SW_VERSION` devem sempre subir juntos.
- Versao atual: `1.6.51`.

Arquivos locais alterados:

- `movikids-github/index.html`
- `movikids-github/sw.js`

Documento criado:

- `FASE1_CACHE_VERSIONAMENTO_v1.6.46.md`

Nao alterado nessa linha de trabalho:

- Apps Script.
- `track.html`.
- Firebase.
- Timer.
- Financeiro.
- WhatsApp.
- Planilha.
- GitHub Pages/producao.
