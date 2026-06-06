# Incidente I19 — Sessão fantasma PWA, turno invisível e idle Milena (06/06/2026)

**Registrado em:** 06/06/2026 (resolução confirmada login Milena **13:05**)  
**Mapa:** `MAPA_ERROS_FALHAS_BUGS.md` → **I19**  
**Correção:** FE **v1.7.48** (`2ee8dc5`)  
**Operadora:** Milena Nunes (id 2)

---

## Resumo executivo

| Fase | O que parecia | O que era de fato |
|------|---------------|-------------------|
| Manhã | “Milena não entra” | Servidor OK; provável PIN/cache/tablet |
| Meio-dia | “Logada mas não aparece” | **Acesso fantasma** — app aberto, servidor sem turno |
| Tarde | “Agora sim, vejo Milena 13:05” | Login real + **v1.7.48** (chip Turno + reconcile) |

**Causa raiz:** PWA (ícone na tela) persiste login em `localStorage` **24h** (`mk_auth_session_persist_v1`) **sem validar** `sessaoAtiva` no GAS. Liberar sessão no servidor (admin/API) **não** limpa o tablet. A Home **não exibia** o nome da operadora — só locações.

---

## Linha do tempo (AUD_TURNO + investigação)

| Hora (06/06) | Evento | Evidência |
|--------------|--------|-----------|
| **10:20** | `logout_admin` — sessão Milena liberada (sessão anterior 05/06 17:15) | `AUD_TURNO` |
| **11:22** | Milena **login** balcão (servidor) | `AUD_TURNO`, `loggedAt` GAS |
| **~12:22** | Idle 1h deveria deslogar — **não ocorreu** no servidor | `sessaoAtiva` ainda Milena às 12:25 |
| **12:28** | `logout_admin` — liberação via API (investigação agente) | `AUD_TURNO` |
| **12:30–13:00** | Tablet aberto na Home — **0 ativas**, sem nome Milena; versões **1.7.41** e **1.7.47** em aparelhos diferentes | Fotos balcão |
| **13:05** | Milena **login válido** — usuário vê turno no sistema | `sessaoAtiva` GAS, chip Turno v1.7.48 |

**Resolução confirmada (GAS após 13:05):** `sessaoAtiva.operadorId: 2`, `nome: Milena Nunes`, `loggedAt` → **06/06/2026 13:05**.

---

## Mapa de causas (por que “é possível”)

### C1 — Sessão fantasma PWA (principal)

```
Tablet: sessionStorage/localStorage → "Milena logada"
Servidor: PropertiesService MK_SESSAO_OPERADOR_ATIVA → null (após liberar)
Home: mostra locações, NÃO mostra operador
```

- `mkRestoreAuthSession()` restaura login ao abrir o **ícone** sem perguntar ao GAS.
- `mkPersistAuthSession()` copia sessão para `localStorage` a cada 15s.
- **Liberar no servidor ≠ deslogar no tablet.**

### C2 — Turno invisível na Home (UX)

- Nome do operador ficava só no **Menu ☰ → rodapé** da sidebar.
- Na Home central: só **0 ativas / encerradas** — parecia “ninguém logado”.

### C3 — Idle 1h só no tablet; servidor 18h

- `checkAuthIdle_()` roda no JS (precisa app aberto + intervalo).
- GAS `MK_SESSAO_OPERADOR_TTL_MS` = **18 horas** — não expira em 1h.
- `mousemove` renovava atividade (removido em v1.7.48).
- PWA em segundo plano: `setInterval` pode atrasar.

### C4 — Admin vs operador na mesma tela

- PIN **1416** → rodapé “Administrador” + “Nenhum turno no balcão”.
- Confundido com “Milena logada”.

### C5 — Cache de versão no PWA

- Tablets com **1.7.41** e **1.7.47** no mesmo dia.
- Ícone instalado não faz Ctrl+F5; depende de `mk-update.js` + SW.

---

## Correções aplicadas (v1.7.48)

| # | Correção | Arquivo |
|---|----------|---------|
| 1 | `mkAuthReconcileSessaoFantasma_()` — tablet operador sem `sessaoAtiva` igual → logout forçado | `mk-auth.js` |
| 2 | Reconcile no **boot**, poll 60s e **visibilitychange** | `mk-auth.js` |
| 3 | Chip **Turno:** no header mobile (ok / fantasma / admin) | `index.html` |
| 4 | PWA: verificação de versão **25s**, reload mais rápido | `mk-update.js` |
| 5 | Idle sem `mousemove` | `mk-auth.js` |
| 6 | Guard `guard.auth.fantasma` no pre-push | `scripts/pre-push-check.ps1` |
| 7 | Regra design PWA em `.cursor/rules/design-visual-movikids.mdc` | Cursor |

**Commits:** `864b42d` (portal/DNA), `2ee8dc5` (anti-fantasma).

---

## O que NÃO fazer de novo

1. Liberar sessão no admin/API e assumir que o **tablet** deslogou.
2. Diagnosticar “operador logado” olhando só a **Home** (ver chip Turno ou `listarOperadoresLogin`).
3. Confiar em idle 1h para limpar **servidor** — não limpa.
4. Testar auth só com PowerShell — validar no **tablet ícone PWA**.
5. Deixar operador trabalhar com `sessaoAtiva: null` no GAS (auditoria de turno quebrada).

---

## Checklist de validação (tablet PWA)

Após deploy `?force=1.7.48`:

- [ ] Header mostra **Turno: Milena Nunes · desde HH:MM** (chip verde/amarelo).
- [ ] `listarOperadoresLogin` → `sessaoAtiva.nome` = Milena.
- [ ] ADM libera sessão → em até 60s tablet desloga ou chip **laranja** → login.
- [ ] Fechar ícone e reabrir com turno válido → chip continua sincronizado.
- [ ] Versão canto: **1.7.48** (não 1.7.41).

```powershell
# Servidor (readonly)
Invoke-RestMethod "https://script.google.com/macros/s/AKfycbwakQ-_aWsF5lFGLsiwB5UvJ4AlpW88krSv8daPeMvULwX5FOIdMhGVgdGd0G35270Y/exec?action=listarOperadoresLogin"
# sessaoAtiva deve bater com chip do tablet
```

---

## Travas permanentes

| Trava | Onde |
|-------|------|
| Reconcile fantasma | `mkAuthReconcileSessaoFantasma_` |
| Chip turno visível | `#hd-turno-chip` + `atualizarOperadorUI_` |
| Pre-push estático | `guard.auth.fantasma` |
| PWA auto-update | `mk-update.js` `IS_PWA` |
| Regra publicação | `REGRAS_DE_PUBLICACAO_SEGURA.md` Regra 12 |

---

## Melhorias futuras (opcional)

- **Idle no GAS:** expirar `sessaoAtiva` se `loggedAt` + 1h sem heartbeat do tablet.
- **AUD_TURNO:** ação `logout_inatividade` / `logout_fantasma` distinta de `logout`.
- **GAS `assertOperadorEscrita_`:** exigir `sessaoAtiva` coerente com `operadorId` nas escritas.

---

## Histórico

| Data | Ação |
|------|------|
| 06/06 manhã | Reporte login Milena; servidor sem trava |
| 06/06 12:28 | `logout_admin` investigação |
| 06/06 tarde | v1.7.48 deploy; Milena login **13:05** OK |
| 06/06 | Documento I19 + mapa atualizado |
