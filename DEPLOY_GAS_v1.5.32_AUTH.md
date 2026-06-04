# Deploy GAS v1.5.32+ — Auth operadores + lançamento avulso

## Links diretos (use estes)

| O quê | Link |
|--------|------|
| **Planilha MOVIKIDS** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| **Editor Apps Script** | Na planilha: menu **Extensões → Apps Script** (ou aba do Chrome *MoviKids - Editor do projeto*) |
| **Testar se o GAS está no ar** | https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=ping |
| **App (GitHub Pages)** | https://ribocg-a11y.github.io/movikids/?force=1.7.1 |

No editor Apps Script: **Implantar → Gerenciar implantações → Editar** a implantação Web existente (ID `AKfycbzc...`) → **Nova versão** → Implantar. **Não** crie um deploy novo (mantém a mesma URL).

Após implantar, o `ping` deve mostrar `versao` **v1.5.37** (extras por dia, histórico em cache, mês de contrato por aniversário). Mínimo **v1.5.36** para correção financeira ADM.

**Pós-incidente 04/06/2026:** leia `INCIDENTE_AUTH_OPERADORES_2026-06-04.md`.

## Arquivo para colar

`MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (cabeçalho atual **v1.5.35**)

Caminho no PC:

`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

## Passos

1. Abrir a **planilha** (link acima) → **Extensões → Apps Script**.
2. Abrir o arquivo principal (`Código.gs` ou equivalente) e **substituir todo o conteúdo** pelo `.gs` da pasta `movikids-github` (v1.5.35).
3. Salvar (Ctrl+S).
4. **Implantar → Gerenciar implantações → Editar** → versão **Nova versão** → Implantar.
5. Abrir o link do `ping` e confirmar `versao: v1.5.35` (hoje em produção pode aparecer v1.5.34 — ainda funciona reset, mas vale atualizar).

## Novas actions

| Action | Uso |
|--------|-----|
| `listarOperadoresLogin` | Lista operadores ativos no gate de login |
| `verificarOperadorLogin` | Verifica se operador tem PIN |
| `definirPinOperador` | Primeiro PIN (4 dígitos) |
| `loginOperador` | Login operador |
| `loginAdmin` | PIN admin **1416** |
| `cadastrarOperadorSistema` | ADM cadastra operador (requer `adminPin`) |
| `listarOperadoresAdmin` | Lista para painel admin |
| `salvarLancamentoAvulso` | Locação exceção + `motivo` obrigatório |
| `editarOperadorSistema` | Renomear operador (ADM + `adminPin`) |
| `excluirOperadorSistema` | Desativa operador (ADM) |
| `resetarPinOperadorAdmin` | Limpa PIN para recriar no login (ADM) |
| `corrigirFinanceiroLocacaoAdmin` | Ajusta locação **Encerrada** (hora fim, extras, total) — auditoria + caixa (v1.5.36) |
| `liberarSessaoOperador` | Operador encerra sessão global ao usar Sair (`operadorId`) |
| `liberarSessaoOperadorAdmin` | ADM força liberação da trava de balcão (`adminPin` 1416) |
| `verificarSmsDisparo` | Consulta se tipo ja foi enviado na janela de dedup |

## v1.5.33 — Sessão única de operador

- Trava global em `PropertiesService` (TTL 18h).
- `loginOperador` / `definirPinOperador` registram sessão; outro operador recebe HTTP 409.
- `loginAdmin` **não** usa a trava (ADM entra com outro operador logado).
- `listarOperadoresLogin` retorna `sessaoAtiva: { operadorId, nome }` para o alerta no frontend.
- Confirmar `ping` retorna `versao: v1.5.33` após implantar.

## SMS v1.5.32b (mesmo arquivo GAS)

- Dedup por locacao/tipo e campanha por telefone.
- Status de entrega atualiza linha de envio na aba `AUD_SMS`.
- Ver `AUDITORIA_SMS_MELHORIAS_v1.6.76.md`.

## Planilha

Cria automaticamente a aba `OPERADORES_SISTEMA` com seeds:

- Eduarda
- Milena Nunes

(Nomes legados `Operador Balcao 1/2` são renomeados automaticamente na primeira listagem.)

## Frontend

Publicar GitHub Pages **v1.6.81** (`index.html`, `mk-auth.js`, `sw.js`) após GAS no ar.  
`?force=1.6.81` em todos os tablets.
