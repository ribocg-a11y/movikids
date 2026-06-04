# Deploy GAS v1.5.32 — Auth operadores + lançamento avulso

## Arquivo

Colar no projeto Apps Script (mesmo projeto, **mesmo Deploy ID**):

`MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

## Passos

1. Abrir o script vinculado à planilha MOVIKIDS.
2. Substituir o código principal pelo conteúdo do arquivo v1.5.32 (ou mesclar se usar vários arquivos `.gs`).
3. **Implantar → Gerenciar implantações → Editar** a implantação web existente (`AKfycbz...`).
4. **Nova versão** (não criar novo deploy).
5. Confirmar `ping?action=ping` retorna `versao: v1.5.32`.

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

## Planilha

Cria automaticamente a aba `OPERADORES_SISTEMA` com seeds:

- Eduarda
- Milena Nunes

(Nomes legados `Operador Balcao 1/2` são renomeados automaticamente na primeira listagem.)

## Frontend

Publicar GitHub Pages **v1.6.72** (`index.html`, `mk-auth.js`, `sw.js`) após GAS v1.5.32 estar no ar.
