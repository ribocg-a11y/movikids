# Deploy GAS v1.5.32+ — Auth operadores + lançamento avulso

## Regra de ouro

Toda vez que o assistente alterar o `.gs`, deve informar este caminho (versão atual no header do arquivo):

**v1.5.64 no seu PC (regra de ouro — copiar deste arquivo):**

`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

Payback: `DEPLOY_v1.5.63_PAYBACK.md` · KPI fatAno: `DEPLOY_v1.5.58_FAT_ANO_KPI.md` (v1.5.59) · K.1: `DEPLOY_v1.5.57_IMPORT_RESPONSAVEIS.md` · Prioridades: `PLANO_PRIORIDADES_2026-06.md`

**Como colar no Apps Script:** Explorer → cole o caminho acima na barra → Enter → duplo clique no `.gs` → Ctrl+A → Ctrl+C → colar em **Código.gs** no editor → **Implantar → Nova versão**.

## Código GAS no PC (copiar daqui → colar no script)

**Arquivo canônico v1.5.63 (Payback projetado + INVESTIMENTO + histórico v1.5.32–62):**

`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

Abrir no Explorer: cole o caminho na barra de endereço → Enter → duplo clique → Ctrl+A → Ctrl+C → colar em **Código.gs** no Apps Script → **Implantar → Nova versão**.

## Links diretos (use estes)

| O quê | Link |
|--------|------|
| **Editor Apps Script (GAS)** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Web app em produção (exec)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec |
| **Testar se o GAS está no ar (ping)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **Planilha MOVIKIDS** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| **App (GitHub Pages)** | https://ribocg-a11y.github.io/movikids/?force=1.7.64 |

No **editor GAS** (link acima): **Implantar → Gerenciar implantações → Editar** a implantação Web (**ID `AKfycbwakQ...`**) → **Nova versão** → Implantar. **Não** crie um deploy novo. **Nunca** use `clasp deploy`.

Após implantar, o `ping` deve mostrar `versao` **v1.5.63** (ou header do `.gs`) e `postWriteActions` (Pacote E). `buscarKPIsAdmin` inclui **`payback`** projetado (v1.5.63) + **`investimento`**, **`fatAno`/`nAno`** (v1.5.59) + Pacote F. SMS: **v1.5.41** — ver `TROCA_SMS_GATEWAY_DJVJRL_2026-06-04.md`. Payback: **`DEPLOY_v1.5.63_PAYBACK.md`**.

### Propriedades do script (SMS — producao)

| Propriedade | Valor |
|-------------|--------|
| `SMS_GATEWAY_USER` | `DJVJRL` |
| `SMS_GATEWAY_PASS` | `t4bh_q2x1favfo` |
| `SMS_GATEWAY_DEVICE_ID` | `wihWegHr4wXaVJQ1R-GZR` |

**Pós-incidente 04/06/2026:** `../arquivo/incidentes/INCIDENTE_DEPLOY_E_EXTRAS_2026-06-04.md`, `../arquivo/incidentes/INCIDENTE_AUTH_OPERADORES_2026-06-04.md`.

### ALERTA P0 — 05/06/2026 (frontend, não GAS)

`postWriteActions` no ping **não** significa que o **tablet** pode usar POST. Isso quebrou o lançamento (Pacote E v1.7.26–v1.7.33).  
**Frontend v1.7.35+** usa GET no browser. Ver `../arquivo/incidentes/INCIDENTE_POST_BROWSER_LANCAMENTO_2026-06-05.md` e Regra 6 em `REGRAS_DE_PUBLICACAO_SEGURA.md`.

### Cronômetro portal (I16) — GAS mínimo v1.5.55

Se o ping &lt; **v1.5.55**, o celular (`acompanhar.html`) pode mostrar tempo **diferente** do balcão.  
Após Nova versão Web, rodar: `.\scripts\testes\TESTE_PARIDADE_CRONOMETRO_PORTAL_BALCAO.ps1`  
Doc: `../arquivo/incidentes/INCIDENTE_CRONOMETRO_PORTAL_AUTH_2026-06-05_06.md`, mapa `MAPA_ERROS_FALHAS_BUGS.md`.

### Colunas C e Y — regra do cronômetro (I20) — GAS mínimo v1.5.64

> **Não inferir início pela hora do cadastro.**

| Coluna | Planilha LOCACOES | Quando gravar | Conteúdo |
|--------|-------------------|---------------|----------|
| **C** | Hora Início | **Somente** em `iniciarTimer_` (botão ▶) | `HH:mm` legível para relatório |
| **Y (25)** | `startTimestamp` | **Somente** em `iniciarTimer_` | ms do servidor GAS — **fonte do countdown** |
| — | — | Em `salvarLocacao_` (cadastro) | Col C = **vazia**; col Y = `0`; status = `Pendente` |

Se o ping &lt; **v1.5.64**, o tablet pode mostrar timer **sozinho e adiantado** (ex. 9:30 em plano 10 min) porque a col C ainda era preenchida no cadastro.

**`timestampCanonico_`** não usa fallback `data + horaInicio` — só col Y ≥ 1e12.

**Teste tablet obrigatório após deploy:**

1. Nova locação → card **Pendente**, **10:00**, timer parado.
2. Esperar 1–2 min sem ▶ → continua 10:00.
3. Apertar ▶ → começa em 10:00.

Mapa: `MAPA_ERROS_FALHAS_BUGS.md` **I20** · Incidente: `../arquivo/incidentes/INCIDENTE_CRONOMETRO_PORTAL_AUTH_2026-06-05_06.md` § I20.

## Deploy seguro (PC)

```powershell
cd movikids-github
.\scripts\deploy-gas.ps1
```

O script: copia o `.gs` canônico → `gas/Code.gs` → valida `DEPLOY_ID` → `clasp push` → lembrete de **Nova versão** no painel.

## Arquivo canônico

`MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (header **v1.5.46**)

`const DEPLOY_ID` no arquivo deve ser **`AKfycbwakQ...`** (não `AKfycbzc...`).

## Novas actions (resumo)

| Action | Uso |
|--------|-----|
| `loginOperador` / `loginAdmin` | Auth balcão (ADM PIN **1416**) |
| `corrigirFinanceiroLocacaoAdmin` | Ajuste locação encerrada + `zerarExtra` |
| `limparLocacoesTesteAdmin` | Anula locações de teste (`adminPin=1416`, `motivo` ≥10 chars; opcional `soHoje=1`) |
| `liberarSessaoOperadorAdmin` | ADM libera trava de sessão |
| `importarResponsaveisAdmin` | K.1 — import LOCACOES→RESPONSAVEIS (`dryRun=1` primeiro) — ver `DEPLOY_v1.5.57_IMPORT_RESPONSAVEIS.md` |
| `encerrarLocacao` | Aceita `somentePlano=true` (sem extras — GAS instável) |

## Frontend

Publicar **v1.7.27** no GitHub (`git push`). Tablets: `?force=1.7.27`. Escritas críticas usam **POST** — exige GAS **v1.5.44+** implantado. Pacote F Dashboard exige GAS **v1.5.46**.

Ver também: `ESTADO_ATUAL.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`, índice `../INDICE.md`.
