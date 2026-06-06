# Deploy GAS v1.5.57 — Import RESPONSAVEIS (Pacote K.1)

**Arquivo:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (conteúdo v1.5.57)

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
4. Dry-run (PC admin):

```text
?action=importarResponsaveisAdmin&adminPin=1416&dryRun=1
```

Esperado: `gruposTelefone` ≈ total `listarResponsaveis` (~130–140).

5. Conferir `aInserir` e `amostra`.
6. Import real (só após loja fechada):

```text
?action=importarResponsaveisAdmin&adminPin=1416&dryRun=0&soNovos=1&limite=500
```

7. `?action=listarResponsaveis&limite=5` — alguns com `cadastroCanonico: true`.
8. `TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1` — verde.

## Script local

```powershell
.\scripts\import-responsaveis-dry-run.ps1
```

## Rollback

Voltar para GAS **v1.5.56** (última versão estável em produção antes de K.1).

A aba RESPONSAVEIS populada **não** quebra rollback — v1.5.56 ignora linhas extras e continua merge em `listarResponsaveis`.
