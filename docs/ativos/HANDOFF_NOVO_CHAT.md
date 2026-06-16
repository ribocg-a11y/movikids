# MOVI KIDS — Handoff para novo chat (ativo)

**Atualizado:** 16/06/2026 (GAS **v1.5.92** @143 · FE **v1.8.27** · Protocolo Mestre · logo PNG · header DNA)  
**Função:** único ponto de entrada para qualquer assistente Cursor continuar o projeto sem perder contexto.

**Repo local:** `C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github`  
**GitHub:** `ribocg-a11y/movikids` · branch `main` · HEAD **`8cd49c3`**

---

## Modelo operacional — dois aparelhos (ler sempre)

| Papel | Aparelho | Quem | Uso típico |
|-------|----------|------|------------|
| **Gestão / dev** | **Computador** (Windows + Cursor) | **Você** (sócio/dev) | Código, testes `.ps1`, planilha OAuth, browser no PC |
| **Operação balcão** | **Tablet** fixo no shopping | **Operadores** (Milena, Eduarda) | Locações, timer, PIN operador, PWA ícone na loja |

**Regras para o agente:**

1. **Você opera sempre do computador** — prints e chats costumam ser do **PC**, não do tablet do balcão.
2. O **tablet fica na operação** — homologação real (chip Turno, Nova, idle, PWA, alertas F7) exige **aparelho na loja**; agente **não** substitui isso.
3. **Sessão dual (I21):** PC com PIN admin 1416 = **TABLET: Administrador**; tablet operadores = **BALCÃO: Nome**.
4. Ao pedir “testar no tablet”, assumir: **você valida no físico**; agente roda protocolo HTTP + `?force=versão`.

Detalhe: `ACESSOS_E_AUTORIZACOES.md` §7 · incidente I21.

---

## Como abrir um chat novo (você)

### Opção A — mensagem mínima (recomendada)

1. Abra o Cursor **nesta pasta** (`movikids-github`).
2. Novo chat. Digite só:

```
Vamos dar continuidade ao projeto Movi Kids, tem uma pasta no C da minha máquina.
```

A regra `.cursor/rules/handoff-movikids.mdc` manda o agente ler este arquivo **sem pedir mais nada**.

### Opção B — explícita

```
Continuo o MOVI KIDS. Repo: C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
```

### O que o agente faz sozinho (não pedir autorização)

- Ler docs ativos (ordem abaixo)
- Informar: FE **v1.8.27**, GAS **v1.5.92**, comunicação **QR only**
- **FE:** `pre-push-check` → commit → push → `verify-publish-complete` (sem pedir)
- **GAS Web App:** agente **NUNCA** implanta — só `prepare-gas-push.ps1` se pedido; **você** Editor → Editar `AKfycbwakQ...` → Nova versão
- Toda resposta: `Mudança no AppScript: sim|não` + link `.gs` canônico (Regra 16)

---

## Produção (16/06/2026)

| Camada | Versão | Verificação |
|--------|--------|-------------|
| **Frontend** | **v1.8.27** | https://ribocg-a11y.github.io/movikids/?force=1.8.27 |
| **Service Worker** | **1.8.27** | `sw.js` |
| **Apps Script (ping)** | **v1.5.92** | ping JSON 16/06 · `@143` clasp (rótulo desc. `v1.5.95` — só etiqueta, ping = v1.5.92) |
| **Aba FOLHA** | **OK** (I25) | B68 ~5269,96 · `folhaPlanejamento.fonte: FOLHA` |
| **Comunicação** | **QR only** | `OPERACAO_COMUNICACAO_QR_ONLY.md` |

**Deploy ID GAS (único):** `AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y`

**Editor GAS:** https://script.google.com/home/projects/19SIhkX9Tk7FiJA1JXu1OrUwssHdr3H5zc8q3rOjmBvqgWfXuHlk8xyf8/edit

**Atalhos teste (sempre `cd` no repo antes):**

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
.\verify-gas-deploy.ps1
.\protocolo-mestre.ps1
.\scripts\pre-push-check.ps1
```

---

## Ordem de leitura (obrigatória)

| # | Documento | Para quê |
|---|-----------|----------|
| 1 | **Este arquivo** | Contexto, produção, próximo passo |
| 2 | `PLANO_PRIORIDADES_2026-06.md` | Fases 0–15 |
| 3 | `ESTADO_ATUAL.md` | Versões, entregas, testes |
| 4 | `REGRAS_DE_PUBLICACAO_SEGURA.md` | Travas push/deploy |
| 5 | `ACESSOS_E_AUTORIZACOES.md` | Agente vs você §7 |
| 6 | `MAPA_CODIGO_ARQUITETURA.md` | Anatomia código |
| 7 | `../INDICE.md` | Mapa docs |

### Por tarefa

| Tarefa | Ler / rodar |
|--------|-------------|
| Teste completo | **`protocolo-mestre.ps1`** · `PROTOCOLO_DIAGNOSTICO_E_TESTES.md` |
| Atualize tudo | **`PROTOCOLO_ATUALIZAR_TUDO.md`** |
| Folha / CLT | `FASE_9_FOLHA_VIABILIDADE_CLT.md` · `TESTE_FASE9_FOLHA_READONLY.ps1` |
| QA tablet | `CHECKLIST_TABLET_v1.7.85.md` · F5/F7/F10/F11 na loja |
| Bug | `MAPA_ERROS_FALHAS_BUGS.md` |

---

## Próximo passo (16/06/2026)

**Produção:** ✅ GAS v1.5.92 · FE v1.8.27 · FOLHA OK · Protocolo Mestre executado 16/06

| # | Ação | Quem |
|---|------|------|
| 1 | **Tablet loja:** F5 ▶ 10:00 imediato · F7 alertas 5min/expirado · F11 portal ±2s · F10 2 abas PWA | **Você** |
| 2 | Dashboard `?force=1.8.27` — header mobile + logo empty state + metas loc/dia | **Você** (PC ou tablet) |
| 3 | Opcional: corrigir **rótulo** clasp @143 para `v1.5.92` (só organização) | **Você** (Editor, sem Nova versão obrigatória) |

**Protocolo Mestre 16/06:** 18+ suites OK · FASE6/P3/scripts corrigidos · cleanup 0 resíduos · log em `financeiro/logs/` (gitignored).

**Entregas FE recentes (v1.8.23–1.8.27):**

- Header mobile DNA (`mk-mob-header`, sidebar family)
- Banner auto-update 12s
- Logo oficial PNG transparente no empty state Home
- Protocolo Mestre + atalhos raiz `verify-gas-deploy.ps1` / `protocolo-mestre.ps1`

**Últimos commits:**

| Hash | Entrega |
|------|---------|
| `8cd49c3` | Protocolo Mestre + fix scripts teste + atalhos verify-gas |
| `fff8632` | Logo PNG transparente empty state v1.8.27 |
| `c4d902b` | Header mobile DNA v1.8.24 |
| `fff8632` | … (ver `git log -10`) |

---

## Arquivos canônicos

| Artefato | Caminho |
|----------|---------|
| **GAS** | `MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs` |
| Versão FE | `mk-version.js` + `sw.js` + **`index.html ?v=`** |
| CSS | `mk-design.css` + `mk-app.css` |
| Logo | `assets/logo-movi-kids.png` (PNG RGBA) |
| Testes | `scripts/testes/` · **`TESTE_PROTOCOLO_MESTRE.ps1`** |
| Pre-push | `scripts/pre-push-check.ps1` |

**GAS PC:**

```
C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github\MOVIKIDS_Code_v1.5.32_AUTH_OPERADORES_SOBRE_v1.5.31.gs
```

---

## Regras invioláveis (P0)

| Regra | Detalhe |
|-------|---------|
| **I15** | Escritas GAS no browser = **GET** |
| **GAS Web** | **Só você** — Editar `AKfycbwakQ...` · agente **nunca** `deploy-gas-SOCIO.ps1` |
| **FE push** | Agente: pre-push → commit → push **sem pedir** |
| **I22** | `check-operacao-livre.ps1` antes push FE crítico |
| **Versões** | `mk-version.js` = `sw.js` = `index.html ?v=` |
| **QR only** | Sem SMS/WA operacional |
| **Regra 16** | Resposta termina com Mudança AppScript + link `.gs` |

---

## Validação rápida (início de sessão)

```powershell
cd C:\Users\riboc\Documents\Codex\2026-05-30\files-mentioned-by-the-user-movikids\movikids-github
Invoke-RestMethod "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=ping"
.\scripts\pre-push-check.ps1
```

Esperado: ping **v1.5.92** · pre-push verde · Pages **1.8.27**.

---

## O que NÃO usar

| Caminho | Motivo |
|---------|--------|
| `docs/arquivo/planos/HANDOFF_NOVO_CHAT_2026-06-05.md` | Defasado |
| `arquivo-historico/*.gs` | Legado |
| Deploy `AKfycbzc...` | 404 |

---

## Ao encerrar sessão

Atualizar: **este arquivo** · `ESTADO_ATUAL.md` · `README.md` · `AGENTS.md` se versões mudarem.

*Próxima revisão: após homologação tablet v1.8.27 ou deploy GAS.*
