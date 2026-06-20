# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 20/06/2026 (sessão operação — I31–I34 · holerite v1.8.71 · FE **v1.8.71** · GAS repo **v1.5.111** · ping prod. **v1.5.107** — publicar Web)  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main`

---

## Modelo operacional — dois aparelhos (ler sempre)

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor) | **Você** (sócio/dev) | Código, testes `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** (Milena, Eduarda) | Locações, timer, PIN operador, PWA ícone na loja |

**Regras para o agente:**

1. **Você opera sempre do computador** — prints e chats costumam ser do **PC**, não do tablet do balcão.
2. O **tablet fica na operação** — homologação real exige **aparelho na loja**.
3. **Sessão dual (I21):** PC com PIN admin 1416 = **TABLET: Administrador**; tablet operadores = **BALCÃO: Nome**.
4. **UI nova:** consultar **`docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md`** §0 **antes** de codar (I29).

Detalhe: `ACESSOS_E_AUTORIZACOES.md` §7 · incidentes I21 · I29.

---

## Como abrir o Cursor nesta pasta (novo chat)

**Pasta:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`

```powershell
cursor "C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github"
```

Mensagem mínima: *"Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina."*

---

### O que o agente faz sozinho (não pedir autorização)

- Ler docs ativos (ordem abaixo)
- **UI:** consultar `DESIGN_SYSTEM_MOVIKIDS.md` antes de alterar telas
- **FE:** editar → `pre-push-check` → commit → push → `verify-publish-complete`
- Testes, ping GAS, planilha OAuth, docs, incidentes no mapa I*
- Toda resposta: `Mudança no AppScript: sim|não` + link `.gs` canônico (Regra 16)

---

## Produção (20/06/2026)

| Camada | Versão | Verificação |
|--------|--------|-------------|
| **Frontend** | **v1.8.71** | https://ribocg-a11y.github.io/movikids/?force=1.8.71 |
| **Gestão Pessoas** | **v1.8.71** | https://ribocg-a11y.github.io/movikids/gestao-pessoas.html?force=1.8.71 |
| **Service Worker** | **1.8.71** | `sw.js` |
| **Holerite** | **mk-holerite.js** | CNPJ **66.664.255/0001-67** · PDF/imprimir |
| **Apps Script (ping)** | repo **v1.5.111** · ping prod. **v1.5.107** | **Nova versão Web** no deploy `AKfycbwakQ...` (pendente) |
| **Aba FOLHA** | **OK** (I25) | B68 ~5269,96 |
| **Design System** | **v1.0** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |

**Deploy ID GAS:** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**Atalhos teste:**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\verify-gas-deploy.ps1
.\scripts\pre-push-check.ps1
```

---

## Ordem de leitura (obrigatória)

| # | Documento | Para quê |
|---|-----------|----------|
| 1 | **Este arquivo** | Contexto, produção, próximo passo |
| 2 | **`DESIGN_SYSTEM_MOVIKIDS.md`** | Cartilha UI — **antes de qualquer tela** |
| 3 | `PLANO_PRIORIDADES_2026-06.md` | Fases 0–15 |
| 4 | `ESTADO_ATUAL.md` | Versões, entregas |
| 5 | `MAPA_ERROS_FALHAS_BUGS.md` | I29–I34 + travas |
| 6 | `REGRAS_DE_PUBLICACAO_SEGURA.md` | Push/deploy |
| 7 | `../INDICE.md` | Mapa docs |

---

## Próximo passo (20/06/2026)

**FASE 15** homolog + GAS Web pendente · **FASE 16 Premium** ⏸ janela segura

| # | Ação | Quem |
|---|------|------|
| 1 | **Nova versão Web GAS v1.5.111** — Carro 04, CPF admin holerite, jornada | **Você** (janela sem loc) |
| 2 | Tablet loja: **1 locação** pós-I32 + boot `?force=1.8.71` | **Você** |
| 3 | Validar holerite Raykelly (PDF + CNPJ) admin e colaborador | **Você** |
| 4 | Investigar latência `carregarInicio` (~6s) se tablet lento (I33) | **Agente** |
| 5 | Kickoff FASE 16 mock — **só após janela segura** | **Agente/dev** |

Doc: `FASE_15_GESTAO_PESSOAS.md` · fases: **`MAPA_FASES.md`** · incidentes **I31–I34**

---

## Incidentes — sessão 20/06/2026 (registrados)

| ID | Evento | Severidade | Status | Fix / evidência |
|----|--------|------------|--------|-----------------|
| **I31** | Pelúcias fora de operação — encoding CONFIG | P0 | ✅ Fechado | `salvarOperacaoConfigAdmin` UTF-8 · doc `INCIDENTE_I31_*` |
| **I32** | Locação duplicada + SMS legado no Fechar | P0 | ✅ Fechado FE | `4485c09` · upsert + qr_only · doc `INCIDENTE_I32_*` |
| **I33** | Tablet lento / não carrega | P1 | 🟡 Mitigado | Force update v1.8.69–71 · boot ~6s GAS aberto · doc `INCIDENTE_I33_*` |
| **I34** | Holerite apresentação + CNPJ fictício | P2 | ✅ Fechado FE | `740d4ce`/`389552a` · `mk-holerite.js` · CNPJ **66.664.255/0001-67** |
| **I26** | GAS repo v1.5.111 ≠ ping v1.5.107 | P1 | 🟡 Aberto | Nova versão Web pendente (Carro 04, cpf admin) |

**Entregas FE nesta sessão (commits):**

| Commit | Entrega |
|--------|---------|
| `4485c09` | Fix locação duplicada + SMS off no Fechar |
| `f2e58b7` | Force update cache global |
| `740d4ce` | Holerite premium (CPF, refs, VT, PDF) |
| `389552a` | CNPJ real MOVI KIDS |

**Incidentes fechados sessão anterior (18/06):**

| ID | Resumo | Fix |
|----|--------|-----|
| **I29** | Colaboradores fora DNA | FE v1.8.49 + Design System |
| **I30** | Abas RH parciais getRange | GAS v1.5.99 |
| **Frota** | Carro 04 + grid 2x2 | FE v1.8.67+ · CONFIG 10 veículos |

**Últimos commits FE (gestão pessoas + docs):**

| Entrega |
|---------|
| v1.8.49 Design System + `#gp-auth-gate` DNA fixo |
| v1.8.48 auth dropdown + passos separados |
| v1.8.45–47 iterações DNA colaboradores |
| v1.8.44 hub 3 portas FASE 15 |

---

## Arquivos canônicos

| Artefato | Caminho |
|----------|---------|
| **GAS** | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` |
| **Design System** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` |
| Versão FE | `mk-version.js` + `sw.js` + **`index.html ?v=`** |
| CSS | `mk-design.css` + `mk-app.css` |
| Colaboradores | `gestao-pessoas.html` + `mk-gestao-pessoas.css` + **`mk-holerite.js`** |

**GAS PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

---

## Regras invioláveis (P0)

| Regra | Detalhe |
|-------|---------|
| **I15** | Escritas GAS no browser = **GET** |
| **I29** | **`DESIGN_SYSTEM_MOVIKIDS.md`** antes de UI |
| **I22** | `check-operacao-livre.ps1` antes push FE crítico |
| **Versões** | `mk-version.js` = `sw.js` = `index.html ?v=` |
| **Host** | Sempre **`ribocg-a11y`** (I29) |
| **Regra 16** | Resposta termina com Mudança AppScript + link `.gs` |

---

## Validação rápida (início de sessão)

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
Invoke-RestMethod "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping"
.\scripts\pre-push-check.ps1
```

Esperado: ping alinhado ao header `.gs` · Pages **1.8.71** · pre-push verde.

---

## O que NÃO usar

| Caminho | Motivo |
|---------|--------|
| `ponto-mockup.html` em produção | Só protótipo v3.6 |
| `mock-pick` / PIN único em auth | I29 — usar `#mk-auth-gate` |
| `docs/arquivo/planos/HANDOFF_NOVO_CHAT_2026-06-05.md` | Defasado |
| `ribocg.a11y.github.io` | Host errado (I29) |

---

*Próxima revisão: após Nova versão Web GAS v1.5.111 + homologação tablet I32/I33.*
