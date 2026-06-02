# MOVI KIDS - Proximas fases operacionais

Estado atual em 01/06/2026:

- Apps Script em producao: `v1.5.25`
- Frontend em producao: `v1.6.59`
- Service Worker em producao: `v1.6.59`
- Ultima mudanca publicada: `P1 - operador local enviado para auditoria`
- Backend validado: `v1.5.25`, baseado em `v1.5.24`
- Proximo candidato backend: `v1.5.26`, operador nas auditorias operacionais

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

Status: diagnostico seguro publicado na `v1.5.22` e preservado na `v1.5.23`.

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

Status: parcialmente publicado.

Correcao ja publicada:

- `v1.6.55` corrigiu o envio em tablet/PWA.
- `v1.6.57` passou a registrar localmente tentativas de WhatsApp de tempo extra.
- `v1.6.57` salva rascunho da nova locacao ao sair da tela Nova.
- `v1.6.58` tenta registrar o evento tambem no Apps Script, sem bloquear a operacao se houver falha de rede.
- Backend `v1.5.25` cria a aba `AUD_WHATSAPP` e a action `registrarWhatsAppEvento`.
- Teste pos-deploy em 02/06/2026 registrou `ok:true`, `registrado:true`, `id:1`.
- Em dispositivos touch ou PWA, nao usar `window.open(..., '_blank')` para WhatsApp.
- Em tablet/PWA, abrir WhatsApp por `window.location.href`.
- Usar `https://api.whatsapp.com/send?phone=...&text=...` como rota padrao.
- Nao voltar para `wa.me` como solucao principal em fluxo operacional.
- Copiar a mensagem para a area de transferencia como fallback quando possivel.

Motivo:

- Alguns tablets/PWAs bloqueiam popup, nao transferem corretamente para WhatsApp/WhatsApp Business ou falham silenciosamente com `window.open`.
- O problema pode parecer internet, mas pode ser associacao de link/popup no dispositivo.

Objetivo:

- separar mensagens obrigatorias e opcionais;
- registrar envio local;
- impedir pular aviso de minuto extra;
- reduzir risco de link suspeito usando texto mais limpo e link curto consistente.

## Fase 5 - Relacionamento / Responsaveis

Status: primeira entrega publicada e validada em producao.

Objetivo:

- criar uma pagina de relacionamento para consultar responsaveis recorrentes;
- localizar responsavel por nome ou telefone;
- abrir um card do responsavel com historico resumido;
- iniciar uma nova locacao a partir do card, preenchendo responsavel/telefone/criancas conhecidas;
- reduzir tempo de cadastro quando o cliente volta no mesmo dia, horas depois ou no dia seguinte.

Primeira entrega segura:

- concluido em `v1.5.23` + `v1.6.52`;
- busca usando o historico atual da aba `LOCACOES`;
- consolidacao de responsaveis por telefone normalizado;
- card com ultimo atendimento, criancas vinculadas, total de visitas e total gasto;
- botao `Nova locacao` a partir do responsavel;
- botao `Nova crianca` a partir do responsavel, mantendo nome/telefone e deixando crianca em branco;
- sem nova aba obrigatoria.

Validacao de producao:

- `ping` retornou `v1.5.25`;
- `listarResponsaveis&limite=5` retornou `ok:true`;
- total inicial consolidado: `132` responsaveis.
- teste read-only `TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1` passou em 01/06/2026;
- total consolidado no teste: `137` responsaveis;
- contrato atual do retorno usa `responsavel`, `telefone`, `criancas`, `totalLocacoes` e `faturamento`.

Segunda entrega:

- criar cadastro canonico de responsaveis em aba propria, exemplo `RESPONSAVEIS`;

## Fase 6 - Operadores e seguranca ADM

Status: iniciado.

Entrega segura inicial:

- `v1.6.59` adiciona operador local por dispositivo.
- O operador aparece no rodape lateral e pode ser trocado sem entrar no admin.
- Acoes criticas enviam `operador` para o backend.
- Candidato backend `v1.5.26` grava esse operador na coluna `Usuario` da aba `AUDITORIA`.
- A operacao nao bloqueia se o operador ainda nao estiver definido.

Proxima etapa:

- criar cadastro real de operadores;
- substituir PIN unico por login de operador/admin;
- separar permissoes: operador, supervisor, admin;
- registrar operador tambem em custos, configuracoes e relatorios.
- permitir editar nome, telefone, observacao e criancas vinculadas;
- registrar auditoria em alteracoes de cadastro;
- permitir vincular locacoes antigas ao responsavel.
- preparar importacao inicial a partir de `LOCACOES`, sem travar locacao se houver erro nessa aba.

Cuidados:

- telefone deve ser tratado como identificador operacional principal;
- nao duplicar responsaveis por diferenca de espaco, mascara ou DDD;
- nao bloquear locacao se responsavel nao existir no cadastro;
- relacionamento deve acelerar o cadastro, nao virar etapa obrigatoria.

## Fase 6 - Testes permanentes

Status: iniciado e precisa virar rotina obrigatoria antes de cada deploy.

Script atual:

`TESTE_REGRESSAO_MOVIKIDS_PROD_SAFE.ps1`

Teste read-only de relacionamento:

`TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1`

Cobertura atual:

- ping;
- carregar inicio;
- listar ativas;
- criar pendente;
- editar pendente;
- cancelar;
- limpar teste.

Proxima cobertura:

- validar `listarResponsaveis` sem escrita;
- validar campos minimos do card de responsavel;
- iniciar timer;
- estender;
- encerrar;
- validar auditoria.
- validar `Triciclo 02`;
- validar que locacao nasce `Pendente`;
- validar que veiculo so fica ocupado quando a sessao esta `Pendente` ou `Ativa`;
- validar que a tela aberta recebe atualizacao de versao.

Esses testes devem ser executados em janela controlada, porque iniciar/encerrar gera movimento real na planilha.

## Fase 7 - Modo seguro

Status: parcialmente publicado.

Ja existe:

- service worker sem cache persistente;
- versionamento forcando atualizacao;
- fallback Apps Script/polling quando Firebase nao cobre tudo.

Proximo:

- tela de diagnostico operacional;
- aviso claro quando Firebase ou Apps Script falhar;
- botao administrativo de reconciliacao manual.

## Fase 8 - Frota e configuracao dinamica

Status: ajuste pontual publicado.

Concluido:

- `Triciclo 02` adicionado no frontend `v1.6.51`;
- `Triciclo 02` aceito no backend `v1.5.21`;
- preservado na producao atual `v1.5.23` + `v1.6.52`;
- mesmo tipo `Triciclo`;
- mesma tabela de precos dos carros, conforme regra existente.

Ponto de atencao:

- A frota ainda esta hardcoded no frontend e no Apps Script.
- A solucao definitiva e mover a frota para CONFIG validada, com fallback seguro.

## Fase 9 - Login por operador e seguranca ADM

Status: planejado, ainda nao publicado.

Objetivo:

- cada operador deve ter seu proprio login;
- toda acao operacional deve registrar operador;
- area ADM deve ser protegida por permissao real;
- acoes sensiveis devem exigir perfil correto e motivo.

Perfis minimos:

- `Operador`: cadastrar, iniciar, avisar, encerrar e registrar custo simples;
- `Supervisor`: editar/cancelar, corrigir pagamento e reconciliar sessoes;
- `Admin`: configurar frota, precos, mensagens, usuarios, auditoria e relatorios sensiveis.

Primeira entrega segura:

- criar camada de sessao local sem quebrar o fluxo atual;
- registrar `operador` nas auditorias novas;
- manter fallback para o modo atual enquanto os usuarios sao cadastrados;
- nao bloquear locacao se o modulo de usuarios ainda nao estiver pronto.

Cuidados:

- nao usar senha unica de admin como solucao definitiva;
- nao expor relatorios financeiros para operador comum;
- nao permitir alterar preco/frota/mensagem sem admin;
- toda acao critica precisa de motivo.

## Fase 10 - Relatorios e KPIs modernos

Status: planejado, ainda nao publicado.

Objetivo:

- modernizar painel gerencial;
- transformar dados da planilha em decisao operacional;
- permitir fechamento e acompanhamento sem edicao manual.

KPIs obrigatorios:

- faturamento por dia, semana, mes e periodo;
- ticket medio;
- locacoes por veiculo e tipo;
- ocupacao da frota;
- horarios de pico;
- planos mais vendidos;
- formas de pagamento;
- receita extra;
- custos por categoria;
- resultado operacional e CTO;
- recorrencia de clientes;
- desempenho por operador;
- cancelamentos e edicoes por motivo;
- divergencias e inconsistencias.

Relatorios:

- fechamento diario;
- mensal financeiro;
- frota;
- operadores;
- relacionamento/retorno;
- auditoria;
- divergencias.

Primeira entrega segura:

- criar diagnostico de KPIs usando dados existentes;
- nao alterar caixa;
- nao alterar formulas da planilha;
- depois criar dashboard visual no app.
