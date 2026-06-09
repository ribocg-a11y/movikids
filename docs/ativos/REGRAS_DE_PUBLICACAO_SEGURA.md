# MOVI KIDS - Regras de Publicacao Segura

Data: 02/06/2026 (alerta P0 atualizado 05/06/2026)

Este documento e uma trava operacional. Nenhuma mudanca futura deve ser publicada sem passar por estas regras, principalmente porque o sistema roda em operacao real e pequenos ajustes de frontend, cache ou WhatsApp podem derrubar o balcao.

---

## ALERTA P0 — Incidente 05/06/2026 (lancamento quebrado)

**O que aconteceu:** Pacote E (FE v1.7.26–v1.7.33) usou **POST JSON** no `api()` do browser. No tablet isso **nao funciona** com a Web App GAS (redirect 302 + CORS). Resultado: *"Erro de conexao"* em **Nova locacao**, encerrar, editar, cancelar, estender.

**Regra absoluta (nao negociavel):**

1. No **browser/tablet**, escritas criticas ao GAS = **GET** com query string (FE **v1.7.34+**).
2. **Nunca** reativar POST no `index.html` porque `ping.postWriteActions` existe.
3. **Nunca** declarar testes OK so com `Invoke-RestMethod POST` — rodar `scripts/testes/TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` e validar **lancamento no tablet**.
4. Tablets devem mostrar **Online v1.7.35+** — `?force=1.7.31` ou anterior = versao quebrada.

**Documentacao completa:** `../arquivo/incidentes/INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md`

## Regra 1 - Declarar Escopo Antes de Mexer

Antes de qualquer pacote, declarar:

- prioridade do planejamento: `P0`, `P1`, `P2` ou `P3`;
- problema exato que sera resolvido;
- arquivos que podem ser alterados;
- arquivos que nao podem ser alterados;
- impacto esperado na operacao;
- rollback previsto.

Se o pacote nao precisa mexer em `track.html`, Apps Script, Firebase ou planilha, esses itens devem permanecer intocados.

## Regra 2 - Checklist Obrigatorio Antes de Publicar

Antes de commit/push:

- se mexeu em `api()` / lancamento: `scripts/testes/TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` ok + checklist tablet (Regra 6 / incidente I15);
- `index.html` passou por checagem de versao;
- `sw.js` passou por checagem de versao;
- `CURRENT`, `APP_VERSION` e `SW_VERSION` estao alinhados;
- `track.html` foi declarado como alterado ou nao alterado;
- Apps Script foi declarado como alterado ou nao alterado;
- WhatsApp foi declarado como alterado ou nao alterado;
- cache-buster foi incrementado quando frontend mudou;
- rollback e arquivo anterior estao claros;
- teste sintatico local foi executado quando aplicavel.

## Regra 3 - WhatsApp E Fluxo De Tablet Sao Zona Critica

Qualquer alteracao que encoste em:

- `enviarWaTel`;
- `abrirWhatsApp`;
- `abrirWhatsAppCard`;
- `waBoasVindas`;
- `waAlertaTempo`;
- `waTempoEsgotado`;
- mensagens de extensao;
- link do responsavel;
- abertura por `window.open`, `window.location`, `<a>`, `wa.me` ou `api.whatsapp.com`;

deve ser tratada como risco operacional alto.

### Regras obrigatorias do WhatsApp

- Nunca mudar o metodo de abertura do WhatsApp sem declarar isso no resumo.
- Nunca enviar telefone cru para o WhatsApp sem normalizacao e validacao.
- Para numeros do Brasil, todo envio deve sair em formato internacional `55 + DDD + numero`.
- Se o numero nacional vier com 10 digitos e o terceiro digito for `9`, exemplo `98 9242-8208`, tratar como celular antigo e completar o nono digito: `98 99242-8208`.
- Se o numero ja vier com 11 digitos nacionais, exemplo `98 99242-8208`, nao duplicar o `9`.
- Se o numero ja vier com `55`, remover o prefixo apenas para validar e remontar no formato final correto.
- Bloquear envio quando o telefone nao tiver 10 ou 11 digitos nacionais apos normalizacao.
- Sempre copiar a mensagem para a area de transferencia antes de tentar abrir o WhatsApp, quando o navegador permitir.
- Sempre manter fallback de abertura.
- Sempre preservar o link curto do responsavel.
- Nao alongar URL com dados pessoais.
- Nao usar pop-up como unico caminho.
- Nao assumir que desktop, celular e tablet se comportam igual.
- Se tablet falhar, a correcao deve ser cirurgica na funcao de abertura, sem mexer em timer, financeiro ou Apps Script.

### Matriz minima de validacao do WhatsApp

Antes de considerar fechado:

- Telefone `98 9242-8208` deve virar `5598992428208`.
- Telefone `55 98 9242-8208` deve virar `5598992428208`.
- Telefone `98 99242-8208` deve continuar `5598992428208`.
- Telefone `55 98 99242-8208` deve continuar `5598992428208`.
- Telefone claramente invalido deve bloquear envio.
- Desktop: botao abre WhatsApp Web ou tela de envio.
- Celular: botao abre WhatsApp/WhatsApp Business ou permite envio.
- Tablet: botao abre WhatsApp/WhatsApp Business ou deixa mensagem copiada com instrucao clara.
- PWA/app instalado: nao pode perder a tela operacional sem fallback.
- Mensagem obrigatoria de tempo extra: nao pode ser pulada quando o tempo estiver esgotado (**exceto administrador**, v1.7.5+).

## Regra 4 - Cache E Atualizacao Automatica

Toda mudanca de frontend deve:

- subir versao de `CURRENT`;
- subir versao de `APP_VERSION`;
- subir versao de `SW_VERSION`;
- forcar atualizacao controlada em telas abertas;
- evitar cache persistente de HTML operacional;
- informar ao usuario a URL com `?force=VERSAO`.

Nunca publicar `index.html` novo com `sw.js` antigo.

## Regra 5 - Separar Frontend De Backend

Quando o pacote for apenas frontend:

- nao mexer no Apps Script;
- nao pedir reimplantacao;
- nao alterar planilha;
- nao alterar manifest.

Quando o pacote for Apps Script:

- gerar arquivo `.gs` candidato separado;
- informar claramente que nao esta implantado ate o usuario colar/reimplantar;
- preservar o mesmo Deploy ID;
- validar `ping` apos reimplantacao;
- evitar escrita de teste em operacao, salvo janela aprovada.

## Regra 6 - Paridade HTTP Browser vs Scripts (GAS Web App)

O Apps Script Web App publicado em `script.google.com/macros/s/.../exec` responde **302** em requisicoes **POST**. No **tablet/navegador** (`fetch` com `redirect: follow`):

- o corpo JSON do POST se perde ou a preflight CORS falha (`Failed to fetch`);
- **GET** com query string continua funcionando.

### Regras obrigatorias da camada `api()` no frontend

- Escritas criticas no balcao (`salvarLocacao`, `editarLocacao`, `cancelarLocacao`, `encerrarLocacao`, `estenderLocacao`) devem usar **GET** no browser ate existir endpoint POST compativel com CORS sem redirect 302.
- Nunca ativar POST no FE apenas porque `ping.postWriteActions` existe no GAS (Pacote E backend).
- `Invoke-RestMethod -Method Post` nos scripts `.ps1` **nao prova** o tablet — cliente HTTP diferente.

### Matriz minima antes de publicar mudanca em `api()`

- Rodar `scripts/testes/TESTE_PARIDADE_HTTP_BROWSER_GAS.ps1` (readonly).
- Se alterou lancamento/encerrar: validar no tablet real ou emulador **Nova locacao → salvar** (nao so regressao PowerShell).
- Mensagem de erro no balcao deve distinguir: sem operador logado vs falha de rede vs resposta nao-JSON.

## Regra 7 - Auditoria Dos Meus Proprios Erros

Erros cometidos neste projeto que nao devem se repetir:

- publicar pacote sem deixar claro todos os arquivos alterados;
- tratar tablet como igual ao desktop no fluxo de WhatsApp;
- enviar telefone para WhatsApp sem normalizacao brasileira completa;
- aceitar DDD + 8 digitos de celular sem completar o nono digito;
- mexer em cache/versionamento sem validar efeito em tela ja aberta;
- deixar documento antigo contradizer hotfix novo;
- entregar mudanca sem regra de rollback curta;
- fazer verificacao parcial e chamar de validacao completa;
- validar POST ao GAS so com PowerShell e declarar tablet OK (incidente 05/06/2026, Pacote E — ver `docs/arquivo/incidentes/INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md`);
- reintroduzir POST no `api()` do browser sem validacao tablet (incidente I15);
- devolver `startTimestamp` bruto no portal sem `timestampCanonico_` (incidente I16 — ver `docs/arquivo/incidentes/INCIDENTE_CRONOMETRO_PORTAL_AUTH_2026-06-05_06.md`);
- calcular tempo do portal sem `canonLoc_` / paridade com `mergeSessaoCanonica` do balcao (I16);
- liberar sessao operador sem `cache: 'no-store'` e sem atualizar UI do balcao (I17);
- deslogar por inatividade com locacao Ativa/Pendente no tablet (I18);
- gravar Hora Inicio (col C) no cadastro ou inferir startTimestamp por data+hora sem col Y (I20).

## Regra 10 - Cronometro portal x balcao (I16)

- **GAS** `buscarPortalResponsavel` e `carregarInicio` (ativas) devem usar **`timestampCanonico_`** e `mins = originalMins + extendedMins`.
- **Portal** (`acompanhar.html`) deve usar **`canonLoc_`** / **`calcStartTimestamp_`** — mesma regra que `mergeSessaoCanonica` + `calcStartTimestamp` em `index.html`.
- Antes de push que mexa em timer/portal: rodar `scripts/testes/TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1`.
- Checklist manual: balcao e celular na mesma locacao — diferenca maxima **2 segundos**, nao minutos.
- Mapa completo: `MAPA_ERROS_FALHAS_BUGS.md`.

## Regra 11 - Auth sessao e idle com locacao (I17, I18, I21)

- Leituras de sessao no tablet: **`cache: 'no-store'`** + bust `_t` em `api()`.
- Apos liberar sessao: **`mkAuthSyncSessaoBalcaoUI_`** deve atualizar banner sem Ctrl+F5.
- Idle 1h: **nao** deslogar se `window.sessions` tiver status **Ativa** ou **Pendente** (`mkHasLocacaoAbertaNoTablet_` — prioriza sync sobre cache).
- Idle por **relógio real** (`mk_auth_last_activity`); **nunca** só `setInterval` countdown para segurança (I21).
- Logout por inatividade: **`mkAuthReleaseBalcaoServer_`** deve liberar balcão no GAS (`liberarSessaoOperadorAdmin`).
- PIN admin 1416: **overlay** (`isAdmin`) — não substitui sessão operador no servidor sem logout explícito.
- Travas: `guard.idle.locacao`, `guard.idle.wallclock`, `guard.idle.gas.release` em `pre-push-check.ps1`.
- Doc: `INCIDENTE_I21_SESSAO_IDLE_DUAL_2026-06-09.md`.

## Regra 12 - PWA sessao fantasma e turno visivel (I19)

- App **instalado (icone)** persiste login 24h em `localStorage` — **liberar sessao no GAS nao desloga o tablet**.
- Obrigatorio: `mkAuthReconcileSessaoFantasma_` no boot, poll e ao voltar do segundo plano.
- Obrigatorio: chip **Turno** (`#hd-turno-chip`) visivel no header mobile — Home sozinha **nao** prova operador logado.
- Validar: `listarOperadoresLogin.sessaoAtiva` = chip do tablet; apos `liberarSessaoOperadorAdmin`, tablet desloga em <=60s.
- Doc: `docs/arquivo/incidentes/INCIDENTE_AUTH_SESSAO_FANTASMA_PWA_2026-06-06.md`; mapa I19.
- PWA: `verificarNovaVersao` acelerado; tablet com `?force=VERSAO_ATUAL` ou reinstalar icone apos mudanca grande.

## Regra 13 - Coluna C/Y + instante do clique + inicio otimista — I20

- **Cadastro (`salvarLocacao_`):** col **C vazia**, col **Y = 0**, status **Pendente**. Nunca `fmtHoraLocal_` na col C no cadastro.
- **Inicio (`iniciarTimer_`):** col **Y = `clientTs`** (instante do clique no tablet) quando `drift ≤ 2 min`; senão `serverTs`. Col **C = HH:mm** do mesmo instante canonico; status **Ativa**.
- **`timestampCanonico_`:** so col Y valida (>= 1e12). **Sem fallback** por data + hora do cadastro.
- **FE (`iniciarContagem`):** inicio **otimista** no clique (`clickTs`, `_localTimerStart`); card ativo e RESTANTE 10:00 **antes** da resposta API; revert se GAS falhar.
- **FE (`mergeSessaoCanonica`):** nao reverter Ativa→Pendente durante `_iniciandoTimer`; preservar `_localTimerStart` se servidor trouxer ts mais tardio (≤2 min).
- **FE (`calcRemaining`):** usar `effectiveStartTs_` — nao perder segundos na latencia nem no sync.
- GAS minimo **v1.5.66**; FE **v1.7.78+**. Teste tablet: ▶ responde na hora; ativo com 10:00 ±1 s.
- Testes: `TESTE_I20_COMPLETO_PROD.ps1` + checklist tablet em `INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`.
- Doc mestre: **`INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`**; mapa **I20**.

## Regra 14 - Janela operacional — locacoes ativas (I22)

**Incidente 09/06/2026:** FASE 6 alterou `index.html` com `</div>` extra; Home/balcao pararam **com locacoes Ativa/Pendente em andamento**.

**Regra absoluta (nao negociavel em feature work):**

1. **Antes** de commit/push que altere `index.html`, `mk-home.js`, `mk-sync.js`, `mk-sessao.js` ou `mk-core.js`: rodar `.\scripts\check-operacao-livre.ps1`.
2. Se houver locacao **Ativa** ou **Pendente** em producao: **NAO publicar** feature, refactor ou pacote de fase — aguardar janela livre ou operacao encerrada.
3. **Hotfix P0** (sistema fora do ar): so com **aprovacao explicita** do responsavel; repetir check com `-Force`; rollback e versao anterior prontos.
4. `pre-push-check.ps1` inclui `guard.html.page-balance` (balanceamento `<div>` em `#page-home`, `#page-nova`, `#page-dashboard`) e `guard.operacao.livre` quando FE critico mudou.
5. Apos push FE: smoke **F0 Home** + **F1 Nova locacao** no **tablet do balcao** — PowerShell nao substitui (I15).

**Documentacao completa:** `../arquivo/incidentes/INCIDENTE_I22_HOME_FORA_DO_AR_FASE6_HTML_2026-06-09.md`

Toda regressao deve gerar:

- causa provavel;
- arquivo/funcoes tocadas;
- o que foi corrigido;
- o que nao foi mexido;
- como validar;
- como voltar atras.

## Regra 8 - Resumo Obrigatorio Depois De Cada Pacote

Toda resposta depois de publicar deve conter:

- `index.html`: sim/nao;
- `sw.js`: sim/nao;
- `track.html`: sim/nao;
- Apps Script: sim/nao;
- documentacao: sim/nao;
- commit publicado;
- versao publicada;
- teste executado;
- proximo passo.

Se algum desses itens faltar, a entrega nao esta completa.

## Regra 9 - GAS: proibido `clasp deploy`

Em 04/06/2026 o comando **`clasp deploy`** (feito pelo agente Cursor) quebrou a URL Web antiga e gerou **404 / Failed to fetch** + cobrança de “tempo extra” fantasma no caixa.

- **Nunca** usar `clasp deploy` na implantacao Web.
- **Sempre:** `.\scripts\deploy-gas.ps1` (apenas `clasp push`) + **Implantar → Gerenciar implantacoes → Editar Web `AKfycbwakQ...` → Nova versao**.
- Correcao financeira de locacao encerrada: `corrigirFinanceiroLocacaoAdmin` (ver `docs/arquivo/incidentes/INCIDENTE_DEPLOY_E_EXTRAS_2026-06-04.md`).
