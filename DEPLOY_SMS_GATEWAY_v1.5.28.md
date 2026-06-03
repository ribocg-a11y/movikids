# MOVI KIDS - SMS Gateway v1.5.28 / frontend v1.6.67

Objetivo: trocar o canal principal de mensagens do responsavel para SMS via SMS Gateway Cloud, enviando o link fixo do Portal do Responsavel.

Portal enviado por SMS:

```text
https://ribocg-a11y.github.io/movikids/acompanhar.html
```

O responsavel acessa o portal e informa o telefone com DDD usado na locacao.

## Arquivos

- Apps Script: `MOVIKIDS_Code_v1.5.28_SMS_GATEWAY_SOBRE_v1.5.27.gs`
- Frontend: `index.html` v1.6.67
- Service Worker: `sw.js` v1.6.67

## Configurar Apps Script

Antes de testar, configure em **Project Settings > Script Properties**:

```text
SMS_GATEWAY_USER=<usuario_cloud_do_sms_gateway>
SMS_GATEWAY_PASS=<senha_cloud_do_sms_gateway>
```

Nao colocar credenciais no `index.html`.

Se o teste de SMS retornar:

```text
Configure SMS_GATEWAY_USER e SMS_GATEWAY_PASS nas Script Properties.
```

o Apps Script foi reimplantado corretamente, mas as credenciais do SMS Gateway ainda nao foram salvas nas propriedades do projeto.

## Reimplantar Apps Script

1. Abrir o projeto Apps Script atual do MOVI KIDS.
2. Substituir o conteudo pelo arquivo `MOVIKIDS_Code_v1.5.28_SMS_GATEWAY_SOBRE_v1.5.27.gs`.
3. Reimplantar no mesmo Web App / Deploy ID.
4. Validar `ping`.

Resposta esperada depois do reimplante:

```json
{
  "ok": true,
  "status": "online",
  "versao": "v1.5.28",
  "sistema": "MOVI KIDS v1.5.28"
}
```

## Teste minimo

Ping, sem enviar SMS:

```text
https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=ping
```

Teste avulso:

```text
action=enviarSmsAvulso
tipo=retorno
telefone=+5598981972432
nome=Teste
crianca=Teste
origem=teste_manual
versao=1.6.67
```

URL de teste avulso. Atencao: ao abrir depois do reimplante, envia SMS real.

```text
https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=enviarSmsAvulso&tipo=retorno&telefone=%2B5598981972432&nome=Teste&crianca=Teste&origem=teste_manual&versao=1.6.67
```

Teste real:

```text
action=enviarSmsResponsavel
rowIndex=<linha_real_da_locacao>
tipo=portal
origem=teste_manual
versao=1.6.67
```

Modelo de URL para uma locacao real. Trocar `<linha_real_da_locacao>` pela linha da locacao na aba LOCACOES:

```text
https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=enviarSmsResponsavel&rowIndex=<linha_real_da_locacao>&tipo=portal&origem=teste_manual&versao=1.6.67
```

Conferir:

- SMS chegou no celular.
- Aba `AUD_SMS` foi criada/preenchida.
- Portal abriu em `acompanhar.html`.
- Busca por telefone com DDD encontrou as locacoes.

## Publicacao frontend

Publicar `index.html` e `sw.js` somente depois dos testes acima.

## Seguranca

As credenciais do SMS Gateway apareceram em print/chat durante a configuracao. Depois de validar em producao, gere nova senha/token no app e atualize as Script Properties.
