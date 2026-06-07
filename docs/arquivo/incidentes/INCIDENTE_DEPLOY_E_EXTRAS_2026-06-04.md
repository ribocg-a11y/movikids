# Incidente 04/06/2026 — Deploy errado + extras indevidos

## Resumo executivo

| O quê | Quem / o quê causou |
|-------|---------------------|
| App parou de falar com o GAS (404 / Failed to fetch) | Comando **`clasp deploy`** executado pelo **agente Cursor** no PC, atualizando a implantação Web de forma inadequada |
| Tablets presos em JS antigo (`?force=1.7.0`) | Cache buster fixo em `1.7.0` no `index.html` (corrigido em **v1.7.4**) |
| “Tempo extra” cobrado sem brincadeira extra | Sessões **Ativas** no tablet com timer local em negativo enquanto o GAS estava offline; ao encerrar, `minUsados` inflado foi enviado ao servidor |

**Não foi** falha do gateway SMS. **Foi** perda de comunicação frontend ↔ GAS + timer local continuando.

---

## Linha do tempo (quem fez o quê)

| Horário (aprox.) | Ação | Responsável |
|------------------|------|-------------|
| Manhã 04/06 | Commits frontend `v1.7.0` → `v1.7.2` (Pacotes A/B) | `ribocg-a11y` via GitHub |
| Tarde 04/06 | Setup **clasp** + `clasp push` (correto) | Agente + usuário (`ribocg@gmail.com` login) |
| Tarde 04/06 | **`clasp deploy -i AKfycbzc...`** (“sync clasp 04-06”) | **Agente Cursor** (transcript `606c1505…`, linha de deploy) |
| Tarde 04/06 | URL antiga `AKfycbzc.../exec` passa a **404**; app em cache continua apontando para ela | Efeito do deploy acima |
| Tarde 04/06 | Operadores não listam / SMS “Failed to fetch” | Sintoma |
| Tarde 04/06 | Sessões 14:45–15:30 encerradas com **minAdicionais** altos | Timer local + encerramento com GAS instável |
| Noite 04/06 | Usuário cria implantação Web **v78** (`AKfycbwakQ...`) | **Usuário** no painel Google (correto) |
| Noite 04/06 | Git `v1.7.3` / `v1.7.4` + URL nova no código | Agente + push usuário |

**Conclusão:** a troca de versão “que quebrou produção” foi o **`clasp deploy` automático do agente**, não um “Nova versão” manual na mesma URL que vocês já usavam.

---

## Últimas 5 locações com extra cobrado (04/06/2026) — alvo da correção

| rowIndex | id | Criança | Plano | Antes (total) | Depois (só plano) |
|----------|-----|---------|-------|---------------|-------------------|
| 218 | 208 | Livia | 10min R$15 | R$ 29,40 | R$ 15,00 |
| 217 | 207 | Helena | 10min R$12 | R$ 27,00 | R$ 12,00 |
| 216 | 206 | Lívia E Malu | 10min R$15 | R$ 36,60 | R$ 15,00 |
| 215 | 205 | Inae | 20min R$22 | R$ 35,00 | R$ 22,00 |
| 213 | 203 | Duda | 10min R$15 | R$ 24,60 | R$ 15,00 |

Ação GAS: `corrigirFinanceiroLocacaoAdmin` + `zerarExtra=true` + `adminPin=1416`.

Ferramenta: `scripts/corrigir-locacoes-extras-lote.html` (abrir no Chrome após publicar no GitHub, ou rodar o script PowerShell abaixo).

---

## Regra de ouro — publicação GAS (obrigatória)

```text
NUNCA: clasp deploy
SEMPRE:  clasp push  →  Apps Script  →  Implantar  →  Editar a Web AKfycbwakQ...
         →  Nova versão  →  Implantar  (mesma URL)
```

Arquivo: `scripts/deploy-gas.ps1` (já sem `clasp deploy`).

---

## Regra de ouro — frontend

Subir **juntos**: `mk-version.js` / `MK_VERSION`, cache buster, `APP_VERSION`, `SW_VERSION`.

Tablets: `https://ribocg-a11y.github.io/movikids/?force=1.7.4`

---

## Auditoria

Cada correção grava linha na aba **AUDITORIA** (`corrigirFinanceiroLocacaoAdmin`) com motivo ≥ 10 caracteres.
