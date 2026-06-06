# Pacote K.1 — Desenho técnico: import LOCACOES → RESPONSAVEIS

**Data:** 06/06/2026  
**Status:** planejamento (não implementado)  
**Versão alvo:** GAS **v1.5.57** · FE sem mudança obrigatória  
**Referências:** `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` (base), `AUDITORIA_PLANILHA_BASE_2026-06-06.md`

---

## 1. Objetivo

Popular a aba **RESPONSAVEIS** (já existe com header vazio) a partir do histórico de **LOCACOES**, sem:

- alterar linhas de locação;
- bloquear `criarLocacao`, timer, caixa ou auth;
- derrubar sessão de operador no tablet;
- exigir novo Deploy ID.

Hoje `listarResponsaveis` já consolida **~132–137** responsáveis em memória a partir de LOCACOES. K.1 **materializa** esse consolidado na aba canônica para edição manual e auditoria (`AUD_RESPONSAVEIS`).

---

## 2. Estado atual (baseline)

| Item | Situação |
|------|----------|
| Aba RESPONSAVEIS | Header criado 06/06; **0 linhas de dados** |
| `listarResponsaveis` | Lê LOCACOES + merge `lerResponsaveisCanonicos_()` |
| `salvarResponsavel` | Cria/edita 1 linha; grava `AUD_RESPONSAVEIS` |
| `normTel_` / `telPortalKeys_` | Normalização e equivalência 9º dígito BR |
| Import action | **Não existe** — K.1 adiciona |

### Schema RESPONSAVEIS (já no GAS v1.5.24+)

| Col | Campo | Tipo |
|-----|-------|------|
| A | id | número sequencial |
| B | criadoEm | texto `dd/mm/aaaa hh:mm` |
| C | atualizadoEm | idem |
| D | telefone | só dígitos (`normTel_`) |
| E | responsavel | texto |
| F | criancasJson | JSON array de strings |
| G | observacao | texto |
| H | origem | `Manual` \| `Import_LOCACOES` |
| I | status | `Ativo` (default) |

---

## 3. Nova action GAS (proposta)

```
action=importarResponsaveisAdmin
```

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `pin` ou `adminToken` | sim | `isAdminRequest_(p)` |
| `dryRun` | não | `1` = só relatório, **zero escrita** |
| `limite` | não | máx. linhas a importar (default 500, cap 2000) |
| `soNovos` | não | `1` (default) = pula telefone já na aba |
| `motivo` | não | texto em `AUD_RESPONSAVEIS` |

**Resposta (dry-run e real):**

```json
{
  "ok": true,
  "dryRun": true,
  "totalLocacoesLidas": 330,
  "gruposTelefone": 137,
  "aInserir": 137,
  "ignoradosJaExistem": 0,
  "ignoradosSemTelefone": 12,
  "amostra": [{ "telefone": "98992428208", "responsavel": "...", "criancas": 2 }]
}
```

---

## 4. Algoritmo de consolidação

Reutilizar a **mesma lógica** de `listarResponsaveis_` (mapa por telefone), com ajustes para escrita:

### 4.1 Chave canônica de telefone

1. `normTel_(coluna N telefone LOCACOES)` → só dígitos.
2. Se 10 dígitos celular BR (`^[1-9]{2}[6-9]…`), preferir variante **com 9º dígito** (11 dígitos).
3. Ignorar grupos com `< 8` dígitos ou vazios.
4. **Não** fundir chaves diferentes de `telPortalKeys_` em uma só linha RESPONSAVEIS — escolher a chave **mais frequente** no histórico; registrar a outra em `observacao` se divergir (opcional K.1b).

### 4.2 Por grupo (telefone)

| Campo destino | Regra |
|---------------|-------|
| `responsavel` | Nome da locação com **maior `rowIndex`** (mais recente) |
| `criancasJson` | União de crianças (trim, case-insensitive dedup), ordenar por frequência |
| `origem` | `Import_LOCACOES` |
| `observacao` | `Import K.1 em dd/mm/aaaa — N locações, R$ total` (opcional) |
| `status` | `Ativo` |

### 4.3 Linhas LOCACOES excluídas

- `status === 'Cancelada'`
- Sem telefone válido
- Linhas de teste conhecidas (opcional: filtro `DRAWER_E` / `TESTE_CODEX` — **só se flag `excluirTestes=1`**)

### 4.4 Escrita

```
LockService.getScriptLock() — waitLock 30s
responsaveisSheet_() — garante header
Para cada grupo:
  se soNovos && telefone já em lerResponsaveisCanonicos_() → skip
  senão appendRow([id, agora, agora, tel, nome, JSON.stringify(criancas), obs, 'Import_LOCACOES', 'Ativo'])
  responsaveisAuditoria_('importResponsavel', null, depois, motivo)
```

**Nunca:** `setValues` em massa sobre linhas existentes sem `soNovos=0` explícito (modo merge fica para K.1b).

---

## 5. Segurança operacional (não derrubar balcão)

| Risco | Mitigação |
|-------|-----------|
| Lock longo na planilha | Import em lote ≤500; rodar **fora do pico** |
| Sessão operador | Action **não** mexe em `MK_SESSAO_OPERADOR_*`, `OPERADORES_SISTEMA`, `AUD_TURNO` logout |
| Locação ativa | Só leitura LOCACOES; sem `appendRow` em LOCACOES |
| Tablet em uso | **Não** publicar GAS durante turno sem dry-run prévio |
| Admin no PC | ADM pode rodar dry-run pelo browser; import real só com 0 ativas ou após fechamento |

### Ordem de deploy K.1 (quando implementar)

1. Colar GAS v1.5.57 no **mesmo** Deploy ID.
2. `?action=ping` — versão nova.
3. `importarResponsaveisAdmin&dryRun=1` — conferir contagens (~137).
4. **Fora do horário** ou com loja fechada: `dryRun=0&soNovos=1`.
5. `listarResponsaveis&limite=5` — `cadastroCanonico: true` nos retornos.
6. FE **não precisa** de deploy para K.1 puro.

---

## 6. Script auxiliar (opcional, PC admin)

Localização proposta: `scripts/import-responsaveis-dry-run.ps1`

- Chama GAS com `dryRun=1` via GET (admin).
- Compara `gruposTelefone` com `TESTE_RELACIONAMENTO_MOVIKIDS_READONLY.ps1`.
- **Não** chama `liberarSessaoOperadorAdmin`.

Alternativa planilha (já existe em outro repo):

```powershell
# C:\Users\riboc\Projects\google-drive-sheets-auth
node scripts/organizar-planilha-movikids.js --dry-run
```

K.1 GAS é preferível — mesma `normTel_` do runtime.

---

## 7. Testes (K.5)

| Teste | Tipo | Critério |
|-------|------|----------|
| `TESTE_RELACIONAMENTO_READONLY` | readonly | `ok:true` antes e depois |
| `importarResponsaveisAdmin dryRun=1` | admin GET | `aInserir` ≈ total `listarResponsaveis` |
| Import real em cópia planilha | staging | 0 duplicata col D |
| `salvarResponsavel` após import | manual | Edição grava `AUD_RESPONSAVEIS` |
| Balcão com Milena logada | smoke | `carregarInicio` + `listarAtivas` inalterados |

Novo guard em `pre-push-check.ps1` (futuro): `guard.k1.import` — função existe, `dryRun` documentado.

---

## 8. Critérios de pronto K.1

- [ ] Dry-run retorna ~137 grupos (±5 vs readonly atual).
- [ ] Import real preenche RESPONSAVEIS sem duplicar telefone.
- [ ] `listarResponsaveis` mostra `cadastroCanonico: true`.
- [ ] Nenhuma locação ativa afetada; ping e auth OK.
- [ ] `AUD_RESPONSAVEIS` com 1 linha `importResponsavel` por lote.
- [ ] Documentado em `DEPLOY_v1.5.57_IMPORT_RESPONSAVEIS.md`.

---

## 9. Fora de escopo K.1

- Merge de telefones duplicados pós-import (K.1b).
- UI de “Importar” no app (só admin via URL ou menu Sistema futuro).
- WhatsApp / SMS / portal.
- Reimport incremental automático (trigger) — avaliar K.2.

---

*Implementação só após Sprint 1 fechada e janela sem operação no balcão.*
