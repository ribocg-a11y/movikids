# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 21/06/2026 (noite) · FASE **15b.6** ✅ · FE **v1.8.106** · GAS **v1.5.127** Web implantada  
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

## Produção (21/06/2026)

| Camada | Versão | Verificação |
|--------|--------|-------------|
| **Frontend** | **v1.8.106** | https://ribocg-a11y.github.io/movikids/?force=1.8.106 |
| **Gestão Pessoas** | **v1.8.106** | `gestao-pessoas.html?force=1.8.106` |
| **Service Worker** | **1.8.106** | `sw.js` · GAS fora do intercept |
| **Holerite** | **mk-holerite.js** | CNPJ **66.664.255/0001-67** · PDF/imprimir |
| **Apps Script** | repo **v1.5.127** · Web implantada (sócio 21/06) · ping string **v1.5.107** | ✅ operação cadastro RH |
| **Aba FOLHA** | **OK** (I25) | B68 ~5269,96 |
| **Design System** | **v1.1** | `docs/referencia/DESIGN_SYSTEM_MOVIKIDS.md` (tokens `--mk-widget-*`) |

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
| 7 | `MAPA_FASES.md` · `DEPLOY_ATUAL.md` · `ESTRUTURA_REPO.md` | Fases · deploy · layout repo |
| 8 | `../INDICE.md` | Mapa docs |

---

## Documentação — alinhamento (20/06/2026) ✅

| Entrega | Doc |
|---------|-----|
| Versão única deploy | `DEPLOY_ATUAL.md` |
| Tradução fases 15/16 | `MAPA_FASES.md` |
| Layout GitHub / raiz | `ESTRUTURA_REPO.md` |
| Deploy histórico | `docs/arquivo/deploy/` (26 movidos) |
| Protocolo F15–F17 | `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` |
| Teste RH readonly | `TESTE_GESTAO_PESSOAS_READONLY.ps1` |
| Homolog v1.6 obsoleto | `docs/arquivo/HOMOLOGACAO_*_OBSOLETO.md` |

**Fonte de verdade versão:** `mk-version.js` → ping GAS → `DEPLOY_ATUAL.md` → este handoff.

## Próximo passo (21/06/2026 — tarde)

**Janela segura** — cadastro Raykelly **100%** na planilha · GAS **v1.5.127** no ar

| # | Ação | Quem | Status |
|---|------|------|--------|
| 1 | **FASE 15b.5** cadastro RH + gate balcão + Meus dados + ficha ADM | Agente | ✅ v1.8.97+ / GAS v1.5.126 |
| 2 | Fix **salvarCadastro** (getRange) | Agente + sócio | ✅ **v1.5.127** |
| 3 | Admin **Operadores** responsivo (desktop + mobile) | Agente | ✅ v1.8.100–103 |
| 4 | **Safari iPhone** colaborador (stale-sync, SW, PIN) | Agente | ✅ **v1.8.105** |
| 5 | Raykelly validar Safari `?force=1.8.106` — hub + benefícios + ponto | **Ops loja** | ⏳ |
| 6 | Milena completar cadastro (25%) | Colaborador | ⏳ |
| 7 | Aba **COMUNICADOS_RH** na planilha | Agente | ✅ 21/06 |
| 8 | Homolog tablet F5/F7/F10/F11 | **Ops loja** | ⏳ |
| 9 | **15b.6** benefícios no hub · **15b.5b** avaliações | Agente | ✅ 15b.6 **v1.8.106** · 📋 15b.5b |

**Nota ping:** string `v1.5.107` é cosmética — validar por `salvarCadastro` + `listarColaboradoresGestao` + cadastro Raykelly 100%.

Doc: `PLANO_PREMIUM_ONEUI_FASES_16_22_2026-06.md` · `PLANEJAMENTO_ATUAL_2026-06.md` §8

---

## Incidentes — sessão 21/06/2026 (tarde)

| ID | Evento | Fix |
|----|--------|-----|
| **I35** | PWA SW intercepta GAS → `FetchEvent respondWith null` no iPhone | SW não intercepta Google · FE **v1.8.104** |
| **I36** | `salvarCadastro` getRange(linha,col,linha,10) — 2 linhas vs 1 dado | GAS **v1.5.127** · Raykelly 100% |
| **I37** | `gestao-pessoas.html` sem stale-sync/SW boot — Safari cache antigo | `mk-stale-sync` + `mk-gp-boot.js` · **v1.8.105** |

---

## Incidentes — sessão 20/06/2026 (registrados)

| ID | Evento | Severidade | Status | Fix / evidência |
|----|--------|------------|--------|-----------------|
| **I31** | Pelúcias fora de operação — encoding CONFIG | P0 | ✅ Fechado | `salvarOperacaoConfigAdmin` UTF-8 · doc `INCIDENTE_I31_*` |
| **I32** | Locação duplicada + SMS legado no Fechar | P0 | ✅ Fechado | FE `4485c09` · **re-validado tablet** 20/06 |
| **I33** | Tablet lento / não carrega | P1 | ✅ Fechado homolog | Force update v1.8.71 · boot OK loja 20/06 |
| **I34** | Holerite apresentação + CNPJ fictício | P2 | ✅ Fechado | `mk-holerite.js` · CNPJ **66.664.255/0001-67** · **homolog tablet** 20/06 |
| **I26** | GAS repo v1.5.111 ≠ ping v1.5.107 | P1 | ✅ Fechado | Nova versão Web **165** 20/06 · funcional OK · ping string cosmética |

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

Esperado: ping alinhado após Nova versão Web · Pages **1.8.83** · pre-push verde · operação livre.

---

## O que NÃO usar

| Caminho | Motivo |
|---------|--------|
| `ponto-mockup.html` em produção | Só protótipo v3.6 |
| `mock-pick` / PIN único em auth | I29 — usar `#mk-auth-gate` |
| `docs/arquivo/planos/HANDOFF_NOVO_CHAT_2026-06-05.md` | Defasado |
| `ribocg.a11y.github.io` | Host errado (I29) |

---

*Próxima revisão: após Nova versão Web v1.5.116 · kickoff FASE 16.*
