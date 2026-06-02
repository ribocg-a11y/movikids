# MOVI KIDS - Regras de Publicacao Segura

Data: 02/06/2026

Este documento e uma trava operacional. Nenhuma mudanca futura deve ser publicada sem passar por estas regras, principalmente porque o sistema roda em operacao real e pequenos ajustes de frontend, cache ou WhatsApp podem derrubar o balcao.

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
- Sempre copiar a mensagem para a area de transferencia antes de tentar abrir o WhatsApp, quando o navegador permitir.
- Sempre manter fallback de abertura.
- Sempre preservar o link curto do responsavel.
- Nao alongar URL com dados pessoais.
- Nao usar pop-up como unico caminho.
- Nao assumir que desktop, celular e tablet se comportam igual.
- Se tablet falhar, a correcao deve ser cirurgica na funcao de abertura, sem mexer em timer, financeiro ou Apps Script.

### Matriz minima de validacao do WhatsApp

Antes de considerar fechado:

- Desktop: botao abre WhatsApp Web ou tela de envio.
- Celular: botao abre WhatsApp/WhatsApp Business ou permite envio.
- Tablet: botao abre WhatsApp/WhatsApp Business ou deixa mensagem copiada com instrucao clara.
- PWA/app instalado: nao pode perder a tela operacional sem fallback.
- Mensagem obrigatoria de tempo extra: nao pode ser pulada quando o tempo estiver esgotado.

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

## Regra 6 - Auditoria Dos Meus Proprios Erros

Erros cometidos neste projeto que nao devem se repetir:

- publicar pacote sem deixar claro todos os arquivos alterados;
- tratar tablet como igual ao desktop no fluxo de WhatsApp;
- mexer em cache/versionamento sem validar efeito em tela ja aberta;
- deixar documento antigo contradizer hotfix novo;
- entregar mudanca sem regra de rollback curta;
- fazer verificacao parcial e chamar de validacao completa.

Toda regressao deve gerar:

- causa provavel;
- arquivo/funcoes tocadas;
- o que foi corrigido;
- o que nao foi mexido;
- como validar;
- como voltar atras.

## Regra 7 - Resumo Obrigatorio Depois De Cada Pacote

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

