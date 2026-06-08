# Incidente — Auth operadores, sessão travada e cobrança indevida (04/06/2026)

Documento oficial de pós-incidente: o que aconteceu, o que foi corrigido, como operar daqui pra frente e como evitar repetição.

**Relacionados:** `DEPLOY_GAS_v1.5.32_AUTH.md`, `ESTADO_ATUAL.md`, `scripts/ops/liberar-eduarda-agora.html`

---

## 1. Resumo executivo

| Item | Situação |
|------|----------|
| Eduarda sem login | **Resolvido no servidor** — sessão liberada, PIN resetado (`hasPin: false`) |
| ADM resetar PIN / liberar balcão | **Funciona no GAS v1.5.35+** — UI completa em app **v1.6.81** (verificar cache) |
| Locação com tempo extra indevido | **Identificada** — linha **206** (Michele / Daniel). Correção abaixo |
| Causa raiz | Bugs de UI + sessão global + timer seguiu rodando sem operador no balcão |
| Prevenção | Checklist + versões alinhadas + runbook ADM |

---

## 2. Linha do tempo (04/06/2026)

1. **Trava de sessão única** (`MK_SESSAO_OPERADOR_ATIVA`): só um operador “logado” no balcão por vez (TTL 18 h).
2. Eduarda (ou outro operador) **não deslogou** (“Sair”) → sessão ficou presa.
3. **Bugs no frontend** agravaram:
   - **v1.6.79:** dois elementos `id="mk-login-err"` — erros de PIN/sessão **invisíveis**.
   - **v1.6.80:** admin PIN 1416 às vezes não abria o app corretamente.
   - **v1.6.80:** botão “Liberar sessão” chamava `loadOperadores()` em vez de `refreshOperadoresAdmin_()` — parecia que **nada acontecia**.
   - **v1.6.80:** mesmo operador da sessão ativa era **bloqueado** na UI (servidor já permitia relogin em v1.5.35).
4. **ADM** não conseguia resetar PIN na tela (falha silenciosa ou cache) enquanto o card mostrava “PIN definido”.
5. **Atendimento em andamento** (timer ativo no app/tablet): sem operador logado para encerrar no fluxo normal, o **relógio seguiu** até alguém encerrar com `minUsados` alto → **tempo extra** cobrado na planilha.

**Correção emergencial (servidor):** APIs `liberarSessaoOperadorAdmin` + `resetarPinOperadorAdmin` executadas para Eduarda (id 1).

---

## 3. Mapa de erros (causa → efeito → correção)

| # | Erro | Efeito para o balcão | Correção | Versão |
|---|------|----------------------|----------|--------|
| E1 | `mk-login-err` duplicado no HTML | Operador acha que “não entra”; ADM não vê motivo | ID único `mk-login-pin-err` no passo PIN | FE **1.6.79** |
| E2 | `finishLogin_` bloqueava em `init()` longo | Admin 1416 não entrava | Admin não aguarda `init()` | FE **1.6.80** |
| E3 | Liberar sessão não atualizava lista ADM | Botão “não funciona” | `refreshOperadoresAdmin_` + banner sessão | FE **1.6.81** |
| E4 | UI bloqueava mesmo operador com sessão aberta | Eduarda não podia “renovar” login | Mensagem azul + Prosseguir habilitado | FE **1.6.81** + GAS **1.5.35** |
| E5 | Reset PIN sem feedback / lista não atualiza | Card continua “PIN definido” | Alertas + `refreshOperadoresAdmin_` | FE **1.6.81** |
| E6 | Sessão global sem ADM liberar | Outro operador 409; só ADM entra | `liberarSessaoOperadorAdmin` + ⋮ Deslogar balcão | GAS **1.5.33+** |
| E7 | Timer ativo sem operador no app | `minUsados` alto → extra no encerramento | **Processo** + correção financeira ADM | GAS **1.5.36** + planilha |

---

## 4. Estado atual — o que já está resolvido?

### 4.1 Servidor (GAS)

Verificar sempre:  
https://script.google.com/macros/s/AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw/exec?action=ping

| Capacidade | API | Requer |
|------------|-----|--------|
| Resetar PIN de **qualquer** operador | `resetarPinOperadorAdmin` | `adminPin=1416`, `operadorId` |
| Liberar **qualquer** sessão de balcão | `liberarSessaoOperadorAdmin` | `adminPin=1416` |
| Deslogar operador específico do balcão | `liberarSessaoOperador` + `adminPin` | `operadorId` |
| Mesmo operador entrar de novo | `loginOperador` / UI | GAS **1.5.35+** |
| Corrigir locação **Encerrada** (caixa) | `corrigirFinanceiroLocacaoAdmin` | GAS **1.5.36** + motivo ≥10 chars |

**Produção observada em 04/06:** `ping` retornou **v1.5.35** após intervenção; repo local traz **v1.5.36** (correção financeira) — **implantar Nova versão** no Apps Script.

### 4.2 Frontend (GitHub Pages)

| Versão | O que traz |
|--------|------------|
| **1.6.81** | Liberar sessão, reset PIN visível, banner “logado no balcão”, deslogar por operador |
| **1.6.80** | Só admin login — **não** tem fixes de Operadores |

Recarregar: https://ribocg-a11y.github.io/movikids/?force=1.6.81 (Ctrl+F5).

### 4.3 Operadores (dados)

Após reset emergencial:

- **Eduarda:** `hasPin: false` — cria PIN novo no próximo login.
- **Sessão balcão:** `sessaoAtiva: null`.

---

## 5. Runbook ADM — uso diário

### 5.1 Resetar senha (PIN) de qualquer operador

1. Entrar como **administrador** (PIN **1416** no gate ou cadeado na sidebar).
2. **Administração → Operadores**.
3. Card do operador → **⋮ → Resetar PIN** → confirmar.
4. Card deve mostrar **Sem PIN** (laranja). Operador cria PIN de 4 dígitos no próximo login.

**Se falhar:** abrir `scripts/ops/liberar-eduarda-agora.html` (adaptar `operadorId`) ou planilha `OPERADORES_SISTEMA` — apagar colunas **pinHash** e **pinSalt** da linha.

### 5.2 Remover operador “logado” no balcão

| Situação | Ação |
|----------|------|
| Não sabe quem está logado | **Liberar sessão do balcão** (botão na página Operadores) |
| Sabe quem está (badge “Logado no balcão”) | **⋮ → Deslogar do balcão** |
| Emergência | `scripts/ops/liberar-eduarda-agora.html` |

### 5.3 Operador esqueceu “Sair” mas é o **mesmo** operador

- Com app **1.6.81** + GAS **1.5.35+**: pode **Prosseguir** e entrar de novo (sessão renovada).
- ADM **não precisa** liberar nesse caso.

---

## 6. Impacto financeiro — locação 04/06/2026

### 6.1 Registro afetado (identificado via `listarHistorico`)

| Campo | Valor **antes** (incorreto) | Valor **correto** |
|-------|---------------------------|-------------------|
| **rowIndex** | 206 | 206 |
| **id** | 196 | 196 |
| Cliente | Michele / Daniel | — |
| Plano | Carro 10 min (R$ 12) | — |
| horaInicio | 12:22 | 12:22 |
| horaFim | 13:08 | **12:32** (fim do plano) |
| minAdicionais | **36** | **0** |
| valorAdicional | **R$ 36** | **R$ 0** |
| valorTotal | **R$ 48** | **R$ 12** |
| veiculo | Carro 01 | — |

**Motivo:** tempo extra contabilizado enquanto operador não conseguia entrar para encerrar no fluxo normal — **não** é cobrança legítima de permanência do cliente.

**Impacto no caixa do dia:** redução de **R$ 36** de “extras” e **R$ 36** no total dessa locação (de 48 → 12).

### 6.2 Como corrigir na planilha (imediato, sem esperar deploy)

1. Abrir: https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit  
2. Aba **LOCACOES**, **linha 206** (id 196).
3. Alterar:

| Coluna | Campo | Novo valor |
|--------|-------|------------|
| D | horaFim | `12:32` |
| I | minAdicionais | `0` |
| J | valorAdicional | `0` |
| K | valorTotal | `12` |
| R | observacao | acrescentar: `[CORRECAO ADM] Tempo extra por falha login operador 04/06/2026` |

4. Salvar. Recarregar **Caixa do dia** / Dashboard no app.

### 6.3 Como corrigir via API (após implantar GAS v1.5.36)

```
GET .../exec?action=corrigirFinanceiroLocacaoAdmin
  &adminPin=1416
  &rowIndex=206
  &zerarExtra=true
  &motivo=Tempo extra indevido por falha de login operador em 04/06/2026
```

Ou script local: `scripts/corrigir-locacao-admin.html` (se adicionado ao repo).

---

## 7. Lições aprendidas — não repetir

1. **Nunca** duplicar `id` em telas de login/erro.
2. Ações ADM na página **Operadores** devem chamar `refreshOperadoresAdmin_`, não só `loadOperadores`.
3. Sessão global exige **runbook visível**: liberar balcão + deslogar por operador.
4. Timer **Ativa** sem operador logado é risco financeiro — considerar (futuro): pausar cobrança extra se sessão ADM liberada / alerta sonoro prolongado.
5. **Versões:** subir juntos `APP_VERSION`, `SW_VERSION`, `CURRENT` e GAS `ping`; documentar em `ESTADO_ATUAL.md`.
6. Após incidente: registrar em **AUDITORIA** (aba) — `corrigirFinanceiroLocacaoAdmin` faz isso automaticamente.

---

## 8. Checklist pós-deploy (obrigatório)

- [ ] `ping` → `v1.5.36` (ou mínimo `v1.5.35`)
- [ ] App `?force=1.6.81` em todos os tablets
- [ ] Planilha linha **206** corrigida (ou API `corrigirFinanceiroLocacaoAdmin`)
- [ ] Eduarda login + PIN novo OK
- [ ] Teste: operador A logado → B recebe 409 → ADM liberar → B entra
- [ ] Teste: ⋮ reset PIN → card “Sem PIN”
- [ ] Caixa do dia: total extras sem os R$ 36 da linha 206

---

## 9. Matriz de versões canônicas (atualizar a cada release)

| Camada | Versão alvo | Arquivo |
|--------|-------------|---------|
| GAS | **v1.5.36** | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` |
| Frontend | **v1.6.81** | `index.html`, `mk-auth.js`, `sw.js` |
| Deploy ID | `AKfycbzcAfu7c3ESVE4sQT_CA5XL3W1bqDZESZX3nTSAWH0Wzqedm2JTVPJwSfYwEOrxkgnw` | constante no `.gs` |

---

## 10. Histórico de alterações deste documento

| Data | Autor | Nota |
|------|-------|------|
| 04/06/2026 | Cursor / Codex | Investigação pós-incidente + correção linha 206 + GAS 1.5.36 |
