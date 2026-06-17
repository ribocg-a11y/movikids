# Incidente I28 — Liberar sessão / deslogar balcão falhou no tablet (17/06/2026)

**Registrado em:** 17/06/2026  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I28**  
**Operadora citada:** Milena Nunes (id 2)  
**Correção:** FE **v1.8.29** (PIN modal + persist) + **v1.8.30** (travas I28 + banner dual)  
**GAS:** **v1.5.92** — API `liberarSessaoOperadorAdmin` OK; bug era **frontend/tablet**

---

## Resumo executivo

| O que o usuário viu | O que o sistema fazia (bug) |
|---------------------|-----------------------------|
| **BALCÃO: Milena** + **TABLET: Administrador** | Sessão dual I21 — admin local sem liberar GAS |
| ADM não conseguia “Deslogar do balcão” / Liberar sessão | `mkAuthEnsureAdminPin_` usava **`prompt()`** — falha silenciosa no tablet/PWA |
| Milena também não conseguia sair | Fluxo exigia PIN admin **antes** da API em alguns caminhos |
| PIN 1416 digitado no PC | PIN admin só em `sessionStorage` — sumia ao restaurar PWA |

**Causa raiz:** regressão de UX auth no tablet (prompt + ordem API/PIN) em cenário **dual admin × operador servidor**, não falha do GAS.

---

## Linha do tempo

| Momento | Evidência | Interpretação |
|---------|-----------|---------------|
| **17/06** | Screenshot sidebar dual (Balcão Milena / Tablet Admin) | I21 ainda visível — operador preso no GAS |
| **17/06** | Botões Liberar / Deslogar sem efeito aparente | `prompt()` bloqueado ou ignorado no PWA |
| **17/06** | Teste PowerShell `liberarSessaoOperadorAdmin` + PIN 1416 | GAS libera — confirma bug FE |
| **17/06** | Commit FE v1.8.29 | Modal PIN + persist 24h + API antes do PIN |
| **17/06** | Pacote v1.8.30 | Banner dual + guards `pre-push-check` + doc I28 |

---

## Mapa de causas

### C1 — `prompt()` para PIN admin (tablet/PWA)

```
mkAuthEnsureAdminPin_ → prompt('Digite PIN...')
Tablet/PWA → prompt não aparece ou retorna null → return false
liberarSessaoOperadorAdmin nunca chamado
```

### C2 — PIN admin não persistia

- Só `sessionStorage` — perdido ao background/PWA restore.
- Admin reabria app sem PIN → loop em EnsureAdminPin.

### C3 — Deslogar exigia PIN antes da API

- `mkOpDeslogarBalcao` pedia PIN **antes** de tentar `liberarSessaoOperador` (operador com PIN próprio deveria bastar).

### C4 — Dual session sem alerta persistente

- Sidebar mostrava dual (I21) mas **sem faixa de urgência** com ação Liberar no topo das telas admin.

---

## Correções aplicadas

| # | Correção | Versão | Arquivo |
|---|----------|--------|---------|
| 1 | `mkAdminPinModalAsk_()` — teclado numérico no tablet | v1.8.29 | `mk-admin.js` |
| 2 | `mkAuthEnsureAdminPin_` usa modal, não `prompt()` | v1.8.29 | `mk-auth.js` |
| 3 | PIN admin persist 24h (`mk_admin_pin_persist_v1`) | v1.8.29 | `mk-auth.js`, `mk-update.js` |
| 4 | `mkOpDeslogarBalcao` tenta API **antes** do PIN admin | v1.8.29 | `mk-auth.js` |
| 5 | `sbSairSessaoClick_` confirma liberar turno GAS se admin + sessão remota | v1.8.29 | `mk-nav.js` |
| 6 | Faixa `#mk-dual-sessao-banner` + `mkAuthDualSessaoBanner_` | v1.8.30 | `index.html`, `mk-auth.js`, `mk-app.css` |
| 7 | Toast ao `adminLogin()` se balcão ocupado | v1.8.30 | `mk-admin.js` |
| 8 | Guards I28 em `pre-push-check.ps1` | v1.8.30 | `scripts/pre-push-check.ps1` |
| 9 | `TESTE_SESSAO_LIBERAR_READONLY.ps1` | v1.8.30 | `scripts/testes/` |

---

## Travas anti-regressão (pre-push)

| Guard | O que bloqueia |
|-------|----------------|
| `guard.auth.no-prompt-pin` | `prompt()` dentro de `mkAuthEnsureAdminPin_` |
| `guard.auth.pin-modal` | ausência de `mkAdminPinModalAsk_` |
| `guard.auth.pin-persist` | ausência de `mkAuthRestoreAdminPin_` / persist key |
| `guard.auth.deslogar-api-first` | `mkOpDeslogarBalcao` sem tentativa API antes do PIN |
| `guard.auth.dual-banner` | ausência de `mkAuthDualSessaoBanner_` + `#mk-dual-sessao-banner` |

Regras: `REGRAS_DE_PUBLICACAO_SEGURA.md` **Regra 17–19**.

---

## Checklist tablet (I28)

- [ ] `?force=1.8.30` no tablet físico
- [ ] Cenário dual: PIN admin + Milena no GAS → faixa laranja **Liberar balcão** visível
- [ ] Operadores → **Deslogar do balcão** abre modal PIN (não prompt nativo)
- [ ] Liberar sessão → teclado numérico → banner some + `listarOperadoresLogin` livre
- [ ] PWA: fechar app, reabrir → Liberar ainda funciona sem redigitar PIN (24h)
- [ ] `.\scripts\testes\TESTE_SESSAO_LIBERAR_READONLY.ps1` verde

---

## Relação com I21

I28 **não substitui** I21 (idle/dual model). I28 corrige **regressão de liberar** quando dual já existe. Continuar validando idle 1h + `mkAuthReleaseBalcaoServer_` (I21).

---

## Comandos úteis

```powershell
.\scripts\pre-push-check.ps1
.\scripts\testes\TESTE_SESSAO_LIBERAR_READONLY.ps1
.\scripts\testes\TESTE_SESSAO_IDLE_READONLY.ps1
```

Ping GAS: `action=ping` · liberar: `action=liberarSessaoOperadorAdmin&adminPin=1416`
