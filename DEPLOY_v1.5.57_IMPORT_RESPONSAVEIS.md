# Deploy GAS v1.5.57 — Import RESPONSAVEIS (Pacote K.1)

## Regra de ouro

**v1.5.57 no seu PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Como colar:** Explorer → cole o caminho na barra → Enter → duplo clique → Ctrl+A → Ctrl+C → colar em **Código.gs** no editor → **Implantar → Gerenciar implantações → Editar Web `AKfycbwakQ...` → Nova versão**. **Nunca** `clasp deploy` nem novo Deploy ID.

### Links diretos GAS

| O quê | Link |
|--------|------|
| **Editor Apps Script** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Web app (exec)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec |
| **Ping (deve retornar v1.5.57 após deploy)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **K.1 dry-run (sem escrita)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=importarResponsaveisAdmin&adminPin=1416&dryRun=1 |
| **K.1 import real (só fora pico)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=importarResponsaveisAdmin&adminPin=1416&dryRun=0&soNovos=1&limite=500 |
| **listarResponsaveis (readonly)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=listarResponsaveis&limite=5 |

**URL morta (não usar):** `AKfycbzc...` → 404

**Produção hoje:** ping ainda pode retornar **v1.5.56** até você aplicar Nova versão no painel.

---

## O que muda

- Nova action `importarResponsaveisAdmin` (somente admin).
- `dryRun=1` — relatório sem escrita na planilha.
- `dryRun=0` — preenche aba **RESPONSAVEIS** a partir de **LOCACOES** (somente novos telefones por padrão).
- Auditoria em `AUD_RESPONSAVEIS` (`importResponsavel`).

## O que NÃO muda

- LOCACOES, timer, caixa, auth, sessão operador.
- WhatsApp, SMS, portal.
- Frontend (nenhum deploy FE obrigatório).
- **Novo Deploy ID** — proibido.

## Quando publicar

- **Fora do horário de pico** ou com loja fechada.
- Milena (ou outro operador) pode continuar no tablet — mas evite import real (`dryRun=0`) com locações ativas (lock na planilha).
- **Nunca** usar `liberarSessaoOperadorAdmin` como passo deste deploy.

## Ordem

1. Colar GAS v1.5.57 no Apps Script (mesmo projeto).
2. Salvar → Implantar nova versão no **mesmo** Deploy ID.
3. `?action=ping` → deve retornar `v1.5.57`.
4. Dry-run — abrir no navegador o link **K.1 dry-run** da tabela acima (ou `.\scripts\import-responsaveis-dry-run.ps1`).

Esperado: `gruposTelefone` ≈ total `listarResponsaveis` (~240 em jun/2026).

5. Conferir `aInserir` e `amostra`.
6. Import real (só após loja fechada) — link **K.1 import real** da tabela acima.

7. `?action=listarResponsaveis&limite=5` — alguns com `cadastroCanonico: true`.
8. `TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1` — verde.

## Script local

```powershell
.\scripts\import-responsaveis-dry-run.ps1
```

## Rollback

Voltar para GAS **v1.5.56** (última versão estável em produção antes de K.1).

A aba RESPONSAVEIS populada **não** quebra rollback — v1.5.56 ignora linhas extras e continua merge em `listarResponsaveis`.
