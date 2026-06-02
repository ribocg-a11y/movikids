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

- Nao usar `window.open(..., '_blank')` como unico caminho para enviar mensagens em tablet, celular ou PWA.
- Nao assumir que `wa.me`, `api.whatsapp.com`, `window.open` ou `window.location` funcionam igual em todos os dispositivos.
- Qualquer troca de rota ou metodo de abertura exige validacao em desktop, celular, tablet e PWA.
- Nao enviar telefone cru para WhatsApp.
- Todo telefone brasileiro deve ser normalizado para `55 + DDD + numero`.
- Celular antigo com DDD + 8 digitos iniciando por `9`, exemplo `98 9242-8208`, deve ser corrigido para DDD + nono digito, exemplo `98 99242-8208`, antes do envio.
- Numero invalido deve bloquear o envio antes de abrir WhatsApp.
- Sempre manter fallback de abertura.
- Sempre que possivel, copiar a mensagem para a area de transferencia antes de abrir o WhatsApp.
- Se o tablet falhar, a correcao deve ser cirurgica no disparo do WhatsApp, sem mexer em timer, financeiro, Apps Script ou status.
- Esse aprendizado veio das correcoes `v1.6.55`, `v1.6.60` e `v1.6.61`, apos falha de envio somente no tablet e falha por telefone sem nono digito.

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

### 10. Login por operador e rastreabilidade

Objetivo:

- cada operador deve entrar no sistema com seu proprio acesso;
- nenhuma acao operacional importante deve ficar sem responsavel identificado;
- auditoria deve registrar qual operador fez cadastro, inicio, edicao, cancelamento, extensao, encerramento e envio obrigatorio de WhatsApp.

Funcionalidade esperada:

- cadastro de operadores;
- login individual;
- perfil de permissao;
- sessao com expiracao;
- troca de operador sem recarregar o sistema inteiro;
- bloqueio de acoes administrativas para operador comum.

Perfis minimos:

- `Operador`: cadastrar, iniciar, avisar, encerrar e registrar custo simples;
- `Supervisor`: editar/cancelar com motivo, corrigir pagamento, reconciliar sessoes;
- `Admin`: configurar sistema, ver auditoria, ajustar precos/frota/mensagens e relatorios sensiveis.

Regra:

- senha/admin compartilhado e apenas uma etapa provisoria;
- a meta correta e todo movimento operacional ter operador identificado.

### 11. Seguranca ADM

Objetivo:

- proteger configuracoes, relatorios financeiros, auditoria e correcoes sensiveis;
- reduzir risco de erro operacional ou acesso indevido.

Funcionalidade esperada:

- area ADM separada;
- permissao por perfil;
- reautenticacao para acoes criticas;
- registro de tentativas de acesso;
- bloqueio de sessoes expiradas;
- logs de mudanca de configuracao;
- painel de auditoria.

Acoes criticas que exigem seguranca maior:

- alterar precos;
- alterar frota;
- alterar mensagens;
- cancelar locacao ativa;
- corrigir pagamento;
- editar responsavel canonico;
- mesclar responsaveis;
- apagar/arquivar dados;
- gerar relatorios financeiros sensiveis;
- reconciliar Firebase/Sheets.

### 12. Relatorios e KPIs modernos

Objetivo:

- transformar os dados operacionais em painel gerencial claro;
- permitir decisao rapida sobre faturamento, frota, horarios, operadores, retorno de clientes e custos.

KPIs esperados:

- faturamento diario, semanal, mensal e por periodo;
- ticket medio;
- numero de locacoes;
- locacoes por tipo de veiculo;
- locacoes por veiculo individual;
- ocupacao da frota;
- horarios de pico;
- plano mais vendido;
- forma de pagamento;
- receita extra por minutos adicionais;
- custos por categoria;
- resultado operacional;
- CTO;
- clientes recorrentes;
- ranking de responsaveis/criancas por retorno;
- desempenho por operador;
- cancelamentos por motivo;
- edicoes/correcoes por operador;
- alertas de inconsistencia.

Relatorios esperados:

- fechamento diario;
- relatorio mensal financeiro;
- relatorio de frota;
- relatorio de operadores;
- relatorio de relacionamento/retorno;
- relatorio de auditoria;
- relatorio de divergencias.

Regra:

- relatorio gerencial nao deve depender de edicao manual na planilha;
- todo numero sensivel deve ser rastreavel ate as locacoes de origem.

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

### Fase 8 - Login, seguranca e ADM

- Criar cadastro de operadores.
- Criar login por operador.
- Separar permissao de operador, supervisor e admin.
- Vincular auditoria ao operador logado.
- Proteger acoes criticas com permissao e motivo.

### Fase 9 - Relatorios e KPIs gerenciais

- Modernizar dashboard.
- Criar KPIs por periodo, veiculo, operador e forma de pagamento.
- Criar relatorios de fechamento, frota, relacionamento, auditoria e divergencias.
- Permitir exportacao/compartilhamento controlado.

## Regra De Trabalho Daqui Em Diante

Documento obrigatorio:

- `REGRAS_DE_PUBLICACAO_SEGURA.md`

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

Regra adicional:

- Qualquer mudanca em WhatsApp, tablet, PWA, cache, service worker ou link do responsavel deve seguir a matriz de validacao do documento de publicacao segura.

## Proxima Acao Correta

Sequencia correta a partir de agora:

1. `v1.5.25` + `v1.6.58` publicados e validados.
2. Primeira versao da pagina `Relacionamento` entregue usando historico existente, sem dependencia obrigatoria.
3. `v1.5.25` implantada com auditoria de WhatsApp obrigatorio na aba `AUD_WHATSAPP`.
4. A aba `RESPONSAVEIS` deve nascer opcional: se falhar, a locacao continua funcionando pelo fluxo atual.

Nada de nova feature fora dessa ordem sem aprovacao explicita.

## Estado Atual Da Producao

Apps Script:

- Producao validada: `v1.5.25`.
- Inclui auditoria ampliada, status canonico, `Triciclo 02`, diagnostico de configuracao, `listarResponsaveis`, cadastro canonico opcional de responsaveis e auditoria de eventos WhatsApp obrigatorios em `AUD_WHATSAPP`.

Frontend:

- Service Worker: `v1.6.60`.
- GitHub Pages: `v1.6.60`.
- Inclui `Triciclo 02`, pagina `Relacionamento / Resp.`, atalho `Nova crianca`, hotfix de abertura WhatsApp em tablet/PWA com fallback, rascunho protegido ao sair da tela Nova, rastreio local/remoto de WhatsApp de tempo extra e operador local enviado para auditoria.

Nao concluido:

- Frota dinamica via CONFIG.
- Precos dinamicos via CONFIG.
- Mensagens dinamicas robustas via CONFIG.
- Cadastro canonico editavel de responsaveis em aba `RESPONSAVEIS`.
- Teste automatizado completo de iniciar/estender/encerrar.
- Login individual por operador.
- Permissoes reais de operador/supervisor/admin.
- Seguranca ADM com reautenticacao para acoes criticas.
- Relatorios e KPIs modernos por operador, frota, periodo, relacionamento e divergencias.

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

## P1 - Operadores e seguranca ADM

Primeira entrega segura:

- Frontend `v1.6.59` adiciona identificacao local de operador por dispositivo.
- O operador e enviado nas acoes criticas de locacao.
- Apps Script candidato `v1.5.26` grava esse operador na aba `AUDITORIA`.
- A operacao permanece liberada se o operador nao estiver definido, para nao travar o balcao.

Proximas entregas:

- cadastro canonico de operadores;
- login individual por operador;
- admin com permissao separada;
- remocao gradual do PIN unico;
- dashboard de auditoria por operador.
