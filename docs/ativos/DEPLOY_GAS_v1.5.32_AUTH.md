# Deploy GAS v1.5.32+ — Auth operadores + lançamento avulso

## Regra de ouro

Toda vez que o assistente alterar o `.gs`, deve informar este caminho (versão atual no header do arquivo):

**Copiar deste arquivo (header = versão atual, ex. v1.5.80):**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

**Toda resposta do agente** termina com: `Mudança no AppScript: sim | não` + link acima se sim (**Regra 16** · `.cursor/rules/gas-deploy-caminho-pc.mdc`).

Pacote atual: **`DEPLOY_ATUAL.md`** · histórico **`../arquivo/deploy/DEPLOY_v1.5.91_FOLHA_REPAIR_USER_ENTERED.md`**

**Publicar em produção (obrigatório — I26):**

**Canônico (sócio):** Editor Apps Script → Implantar → **Editar** Web `AKfycbwakQ...` → **Nova versão** → ping `versao: v1.5.111`.

Alternativa com pedido explícito: `scripts/deploy-gas.ps1` (`clasp push` + `clasp deploy -i` + verify). Agente **não** republica Web sem §7.3.

## Código GAS no PC (copiar daqui → colar no script)

**Arquivo canônico (header = versão atual, ex. v1.5.111):**

`C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs`

Abrir no Explorer: cole o caminho na barra de endereço → Enter → duplo clique → Ctrl+A → Ctrl+C → colar em **Código.gs** no Apps Script → **Implantar → Nova versão**.

## Links diretos (use estes)

| O quê | Link |
|--------|------|
| **Editor Apps Script (GAS)** | https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit |
| **Web app em produção (exec)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec |
| **Testar se o GAS está no ar (ping)** | https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping |
| **Planilha MOVIKIDS** | https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit |
| **App (GitHub Pages)** | https://ribocg-a11y.github.io/movikids/?force=1.8.71 |

**Nunca** `clasp deploy` **sem `-i`** (I1). Republicar Nova versão no **mesmo** Deploy ID (I26) — ver **`DEPLOY_ATUAL.md`**.

Após implantar, o `ping` deve mostrar `versao` **v1.5.111** (header do `.gs`) e `postWriteActions`.

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

### Colunas C e Y + clientTs — cronômetro (I20) — GAS mínimo v1.5.66

> **Não inferir início pela hora do cadastro.** > **Não gravar só `serverTs` no fim da API** — usar **`clientTs`** (clique) quando drift ≤ 2 min.

| Coluna | Planilha LOCACOES | Quando gravar | Conteúdo |
|--------|-------------------|---------------|----------|
| **C** | Hora Início | **Somente** em `iniciarTimer_` (botão ▶) | `HH:mm` do **clique** |
| **Y (25)** | `startTimestamp` | **Somente** em `iniciarTimer_` | **`clientTs`** (ms do clique) se drift ≤ 2 min; senão `serverTs` |
| — | — | Em `salvarLocacao_` (cadastro) | Col C = **vazia**; col Y = `0`; status = `Pendente` |

| Ping | Problema se menor |
|------|-------------------|
| &lt; **v1.5.64** | Timer sozinho/adiantado (col C no cadastro) |
| &lt; **v1.5.66** | Ao ▶ perde Δt da API (~3–27 s) — `serverTs` no fim da requisição |

**FE mínimo:** **v1.7.78** — início otimista + `_localTimerStart` + `effectiveStartTs_`.

**Teste tablet obrigatório após deploy:**

1. Nova locação → **Pendente**, **10:00**, parado.
2. Esperar 30 s sem ▶ → continua 10:00.
3. ▶ → botão responde na hora; ativo com **10:00** ±1 s (não 09:33).
4. Portal ±2 s (I16).

Mapa: `MAPA_ERROS_FALHAS_BUGS.md` **I20** · Doc mestre: **`INCIDENTE_I20_CRONOMETRO_RESOLUCAO_2026-06-07.md`**

## Deploy seguro (PC)

```powershell
cd movikids-github
.\scripts\deploy-gas.ps1
```

O script: sync → `clasp push` → **`clasp deploy -i AKfycbwakQ...`** → **`verify-gas-deploy.ps1`** (Regra 9 / I26).

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
| `importarResponsaveisAdmin` | K.1 — import LOCACOES→RESPONSAVEIS (`dryRun=1` primeiro) — ver `../arquivo/deploy/DEPLOY_v1.5.57_IMPORT_RESPONSAVEIS.md` |
| `encerrarLocacao` | Aceita `somentePlano=true` (sem extras — GAS instável) |

## Frontend

Publicar **v1.7.27** no GitHub (`git push`). Tablets: `?force=1.7.27`. Escritas críticas usam **POST** — exige GAS **v1.5.44+** implantado. Pacote F Dashboard exige GAS **v1.5.46**.

Ver também: `ESTADO_ATUAL.md`, `REGRAS_DE_PUBLICACAO_SEGURA.md`, índice `../INDICE.md`.
